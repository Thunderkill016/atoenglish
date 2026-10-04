-- =============================================================================
-- Schema consolidation — idempotent bridge from initial_schema → production
-- Safe to run on existing DBs and fresh installs mid-migration.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. user_progress: last_active → last_active_date
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_progress' AND column_name = 'last_active'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_progress' AND column_name = 'last_active_date'
  ) THEN
    ALTER TABLE public.user_progress ADD COLUMN last_active_date DATE;
    UPDATE public.user_progress
      SET last_active_date = (last_active AT TIME ZONE 'UTC')::date
      WHERE last_active_date IS NULL;
    ALTER TABLE public.user_progress DROP COLUMN last_active;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_progress' AND column_name = 'last_active_date'
  ) THEN
    ALTER TABLE public.user_progress ADD COLUMN last_active_date DATE;
  END IF;
END $$;

-- current_level: enum → text (supports A0, A1, …)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns c
    JOIN pg_type t ON t.typname = c.udt_name
    WHERE c.table_schema = 'public'
      AND c.table_name = 'user_progress'
      AND c.column_name = 'current_level'
      AND t.typtype = 'e'
  ) THEN
    ALTER TABLE public.user_progress
      ALTER COLUMN current_level TYPE text USING current_level::text;
  END IF;
END $$;

ALTER TABLE public.user_progress
  ALTER COLUMN current_level SET DEFAULT 'A0';

-- ---------------------------------------------------------------------------
-- 2. user_lesson_progress (missing from early migrations)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  unit_id      text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  xp_earned    integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_lesson_progress_user_id_unit_id_key UNIQUE (user_id, unit_id)
);

CREATE INDEX IF NOT EXISTS user_lesson_progress_user_id_idx
  ON public.user_lesson_progress (user_id);

ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own lesson progress" ON public.user_lesson_progress;
CREATE POLICY "Users can view their own lesson progress"
  ON public.user_lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own lesson progress" ON public.user_lesson_progress;
CREATE POLICY "Users can insert their own lesson progress"
  ON public.user_lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own lesson progress" ON public.user_lesson_progress;
CREATE POLICY "Users can update their own lesson progress"
  ON public.user_lesson_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- `check_cefr_progression()` is defined by an earlier migration, which historically ran before
-- this table existed on a clean database. Ensure the trigger is present once the dependency has
-- actually been created. This is idempotent for environments that already attached it earlier.
DO $$
BEGIN
  IF to_regprocedure('public.check_cefr_progression()') IS NOT NULL THEN
    EXECUTE 'DROP TRIGGER IF EXISTS on_unit_complete_check_cefr ON public.user_lesson_progress';
    EXECUTE 'CREATE TRIGGER on_unit_complete_check_cefr AFTER INSERT ON public.user_lesson_progress FOR EACH ROW EXECUTE FUNCTION public.check_cefr_progression()';
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- 3. speaking_sessions (was only in manual schema_v6.sql)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.speaking_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES neon_auth.user (id) ON DELETE CASCADE,
  practice_type   text NOT NULL,
  duration        integer NOT NULL,
  transcript      text,
  accuracy_score  integer,
  scenario_id     text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS speaking_sessions_user_created_idx
  ON public.speaking_sessions (user_id, created_at DESC);

ALTER TABLE public.speaking_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own speaking sessions" ON public.speaking_sessions;
CREATE POLICY "Users can view their own speaking sessions"
  ON public.speaking_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own speaking sessions" ON public.speaking_sessions;
CREATE POLICY "Users can insert their own speaking sessions"
  ON public.speaking_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users cannot delete speaking sessions" ON public.speaking_sessions;
CREATE POLICY "Users cannot delete speaking sessions"
  ON public.speaking_sessions FOR DELETE
  USING (false);

-- ---------------------------------------------------------------------------
-- 4. cards: FSRS upgrade + cleanup legacy SM-2 columns
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns c
    JOIN pg_type t ON t.typname = c.udt_name
    WHERE c.table_schema = 'public'
      AND c.table_name = 'cards'
      AND c.column_name = 'level'
      AND t.typtype = 'e'
  ) THEN
    ALTER TABLE public.cards
      ALTER COLUMN level TYPE text USING level::text;
  END IF;
END $$;

ALTER TABLE public.cards
  ADD COLUMN IF NOT EXISTS state integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS difficulty double precision NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS stability double precision NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS last_review timestamptz,
  ADD COLUMN IF NOT EXISTS next_review timestamptz;

ALTER TABLE public.cards DROP COLUMN IF EXISTS ease_factor;
ALTER TABLE public.cards DROP COLUMN IF EXISTS last_reviewed;

UPDATE public.cards
SET
  state = 2,
  stability = COALESCE(interval, 1.0),
  difficulty = 5.0,
  last_review = COALESCE(last_review, created_at),
  next_review = COALESCE(next_review, due_date, now())
WHERE repetitions > 0 AND next_review IS NULL;

UPDATE public.cards
SET
  state = 0,
  stability = 0.0,
  difficulty = 0.0,
  next_review = COALESCE(next_review, due_date, now())
WHERE repetitions = 0 AND next_review IS NULL;

ALTER TABLE public.cards DROP CONSTRAINT IF EXISTS cards_user_word_unique;
ALTER TABLE public.cards
  ADD CONSTRAINT cards_user_word_unique UNIQUE (user_id, word);