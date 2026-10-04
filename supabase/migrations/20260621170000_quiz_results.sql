-- =============================================================================
-- quiz_results — persist vocab quiz attempts (XP + history per VN day)
-- One row per (user_id, unit_id, quiz_date); retries can improve score/XP.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.quiz_results (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES neon_auth.user (id) ON DELETE CASCADE,
  unit_id     text NOT NULL,
  score       integer NOT NULL CHECK (score >= 0),
  total       integer NOT NULL CHECK (total >= 1 AND total <= 50),
  pct         integer NOT NULL CHECK (pct >= 0 AND pct <= 100),
  xp_earned   integer NOT NULL CHECK (xp_earned >= 0),
  quiz_date   date NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quiz_results_user_unit_date_key UNIQUE (user_id, unit_id, quiz_date)
);

CREATE INDEX IF NOT EXISTS quiz_results_user_quiz_date_idx
  ON public.quiz_results (user_id, quiz_date DESC);

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quiz_results_select_own" ON public.quiz_results;
CREATE POLICY "quiz_results_select_own"
  ON public.quiz_results FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "quiz_results_insert_own" ON public.quiz_results;
CREATE POLICY "quiz_results_insert_own"
  ON public.quiz_results FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "quiz_results_update_own" ON public.quiz_results;
CREATE POLICY "quiz_results_update_own"
  ON public.quiz_results FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

COMMENT ON TABLE public.quiz_results IS
  'Vocab quiz results per user/unit/VN-day. xp_earned stores best XP awarded that day.';