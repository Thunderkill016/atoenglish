-- FSRS state integrity foundation for ts-fsrs v5.4.1.
-- Persist the native card fields required across reloads and make card-state + review-log
-- writes atomic. Legacy compatibility fields stay synchronized for existing UI/query paths.

ALTER TABLE public.cards
  ADD COLUMN IF NOT EXISTS elapsed_days integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS scheduled_days integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lapses integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS learning_steps integer NOT NULL DEFAULT 0;

ALTER TABLE public.card_review_logs
  ADD COLUMN IF NOT EXISTS last_elapsed_days integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS learning_steps integer NOT NULL DEFAULT 0;

-- scheduled_days maps directly to the legacy interval field for already-scheduled cards.
UPDATE public.cards
SET scheduled_days = GREATEST(COALESCE(interval, 0), 0)
WHERE scheduled_days = 0;

-- Legacy card_review_logs.elapsed_days was previously derived from next_review-last_review,
-- so it cannot be trusted as historical elapsed time. Reconstruct Card.elapsed_days from
-- accurate review timestamps instead. In ts-fsrs v5.4.1 this is the interval between the
-- two most recent completed reviews, not `now() - last_review`.
WITH ordered_reviews AS (
  SELECT
    card_id,
    review,
    LAG(review) OVER (PARTITION BY card_id ORDER BY review, created_at) AS previous_review,
    ROW_NUMBER() OVER (PARTITION BY card_id ORDER BY review DESC, created_at DESC) AS newest_rank
  FROM public.card_review_logs
), latest_intervals AS (
  SELECT
    card_id,
    CASE
      WHEN previous_review IS NULL THEN 0
      ELSE GREATEST(
        FLOOR(EXTRACT(EPOCH FROM (review - previous_review)) / 86400)::integer,
        0
      )
    END AS elapsed_days
  FROM ordered_reviews
  WHERE newest_rank = 1
)
UPDATE public.cards AS c
SET elapsed_days = latest_intervals.elapsed_days
FROM latest_intervals
WHERE c.id = latest_intervals.card_id;

-- Cards without sufficient history stay neutral rather than receiving fabricated history.
UPDATE public.cards AS c
SET elapsed_days = 0
WHERE NOT EXISTS (
  SELECT 1
  FROM public.card_review_logs AS l
  WHERE l.card_id = c.id
);

-- Legacy logs stored post-review card state. The state before a review is therefore the
-- previous log's state. Count only recoverable Again events whose prior state was Review.
WITH review_sequence AS (
  SELECT
    card_id,
    rating,
    LAG(state) OVER (PARTITION BY card_id ORDER BY review, created_at) AS previous_state
  FROM public.card_review_logs
), lapse_counts AS (
  SELECT
    card_id,
    COUNT(*) FILTER (WHERE rating = 1 AND previous_state = 2)::integer AS lapses
  FROM review_sequence
  GROUP BY card_id
)
UPDATE public.cards AS c
SET lapses = GREATEST(COALESCE(lapse_counts.lapses, 0), 0)
FROM lapse_counts
WHERE c.id = lapse_counts.card_id;

-- learning_steps cannot be reconstructed safely because legacy logs did not persist it.
-- Existing Learning/Relearning cards restart from step 0 once; all future steps are durable.

COMMENT ON COLUMN public.cards.elapsed_days IS
  'ts-fsrs v5 field: days between the two most recent reviews; current elapsed time is recalculated from last_review.';
COMMENT ON COLUMN public.cards.scheduled_days IS
  'Days scheduled by FSRS at the previous review.';
COMMENT ON COLUMN public.cards.lapses IS
  'Count of recoverable Again reviews from Review state; fully durable after the learning-core migration.';
COMMENT ON COLUMN public.cards.learning_steps IS
  'Current short-term (re)learning step index used by ts-fsrs; fully durable after the learning-core migration.';
COMMENT ON COLUMN public.card_review_logs.last_elapsed_days IS
  'Native ts-fsrs ReviewLog.last_elapsed_days value.';
COMMENT ON COLUMN public.card_review_logs.learning_steps IS
  'Native ts-fsrs ReviewLog.learning_steps value before the review transition.';

CREATE SCHEMA IF NOT EXISTS private;

-- Privileged implementation: authenticated callers can only modify a card they own.
-- The public wrapper remains SECURITY INVOKER so auth.uid() is the caller identity.
CREATE OR REPLACE FUNCTION private.apply_fsrs_card_review_core(
  p_card_id uuid,
  p_state integer,
  p_difficulty double precision,
  p_stability double precision,
  p_elapsed_days integer,
  p_scheduled_days integer,
  p_lapses integer,
  p_learning_steps integer,
  p_last_review timestamptz,
  p_next_review timestamptz,
  p_repetitions integer,
  p_log_rating smallint,
  p_log_state smallint,
  p_log_due timestamptz,
  p_log_stability double precision,
  p_log_difficulty double precision,
  p_log_elapsed_days integer,
  p_log_scheduled_days integer,
  p_log_review timestamptz
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := public.auth_uid();
  v_previous_elapsed_days integer;
  v_previous_learning_steps integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated';
  END IF;

  IF p_state NOT BETWEEN 0 AND 3 OR p_log_state NOT BETWEEN 0 AND 3 THEN
    RAISE EXCEPTION 'Invalid FSRS state';
  END IF;
  IF p_log_rating NOT BETWEEN 1 AND 4 THEN
    RAISE EXCEPTION 'Invalid FSRS rating';
  END IF;
  IF p_difficulty < 0 OR p_stability < 0 OR p_log_difficulty < 0 OR p_log_stability < 0 THEN
    RAISE EXCEPTION 'FSRS difficulty/stability cannot be negative';
  END IF;
  IF p_last_review IS NULL OR p_next_review IS NULL OR p_log_due IS NULL OR p_log_review IS NULL THEN
    RAISE EXCEPTION 'FSRS review timestamps are required';
  END IF;

  SELECT elapsed_days, learning_steps
  INTO v_previous_elapsed_days, v_previous_learning_steps
  FROM public.cards
  WHERE id = p_card_id AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Card not found or not owned by current user';
  END IF;

  UPDATE public.cards
  SET
    state = p_state,
    difficulty = p_difficulty,
    stability = p_stability,
    elapsed_days = GREATEST(p_elapsed_days, 0),
    scheduled_days = GREATEST(p_scheduled_days, 0),
    lapses = GREATEST(p_lapses, 0),
    learning_steps = GREATEST(p_learning_steps, 0),
    last_review = p_last_review,
    next_review = p_next_review,
    interval = GREATEST(p_scheduled_days, 0),
    repetitions = GREATEST(p_repetitions, 0),
    due_date = p_next_review,
    updated_at = now()
  WHERE id = p_card_id AND user_id = v_user_id;

  INSERT INTO public.card_review_logs (
    user_id,
    card_id,
    rating,
    state,
    due,
    stability,
    difficulty,
    elapsed_days,
    last_elapsed_days,
    scheduled_days,
    learning_steps,
    review
  ) VALUES (
    v_user_id,
    p_card_id,
    p_log_rating,
    p_log_state,
    p_log_due,
    p_log_stability,
    p_log_difficulty,
    GREATEST(p_log_elapsed_days, 0),
    GREATEST(COALESCE(v_previous_elapsed_days, 0), 0),
    GREATEST(p_log_scheduled_days, 0),
    GREATEST(COALESCE(v_previous_learning_steps, 0), 0),
    p_log_review
  );
END;
$$;

REVOKE ALL ON FUNCTION private.apply_fsrs_card_review_core(
  uuid, integer, double precision, double precision, integer, integer, integer, integer,
  timestamptz, timestamptz, integer, smallint, smallint, timestamptz, double precision,
  double precision, integer, integer, timestamptz
) FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.apply_fsrs_card_review_core(
  uuid, integer, double precision, double precision, integer, integer, integer, integer,
  timestamptz, timestamptz, integer, smallint, smallint, timestamptz, double precision,
  double precision, integer, integer, timestamptz
) TO authenticated;

CREATE OR REPLACE FUNCTION public.apply_fsrs_card_review(
  p_card_id uuid,
  p_state integer,
  p_difficulty double precision,
  p_stability double precision,
  p_elapsed_days integer,
  p_scheduled_days integer,
  p_lapses integer,
  p_learning_steps integer,
  p_last_review timestamptz,
  p_next_review timestamptz,
  p_repetitions integer,
  p_log_rating smallint,
  p_log_state smallint,
  p_log_due timestamptz,
  p_log_stability double precision,
  p_log_difficulty double precision,
  p_log_elapsed_days integer,
  p_log_scheduled_days integer,
  p_log_review timestamptz
) RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.apply_fsrs_card_review_core(
    p_card_id,
    p_state,
    p_difficulty,
    p_stability,
    p_elapsed_days,
    p_scheduled_days,
    p_lapses,
    p_learning_steps,
    p_last_review,
    p_next_review,
    p_repetitions,
    p_log_rating,
    p_log_state,
    p_log_due,
    p_log_stability,
    p_log_difficulty,
    p_log_elapsed_days,
    p_log_scheduled_days,
    p_log_review
  );
$$;

REVOKE ALL ON FUNCTION public.apply_fsrs_card_review(
  uuid, integer, double precision, double precision, integer, integer, integer, integer,
  timestamptz, timestamptz, integer, smallint, smallint, timestamptz, double precision,
  double precision, integer, integer, timestamptz
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_fsrs_card_review(
  uuid, integer, double precision, double precision, integer, integer, integer, integer,
  timestamptz, timestamptz, integer, smallint, smallint, timestamptz, double precision,
  double precision, integer, integer, timestamptz
) TO authenticated;
