-- =============================================================================
-- challenge_results — daily vocab challenge (one completion per user per VN day)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.challenge_results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES neon_auth.user (id) ON DELETE CASCADE,
  score           integer NOT NULL CHECK (score >= 0),
  total           integer NOT NULL CHECK (total >= 1 AND total <= 10),
  xp_earned       integer NOT NULL CHECK (xp_earned >= 0),
  challenge_date  date NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT challenge_results_user_date_key UNIQUE (user_id, challenge_date)
);

CREATE INDEX IF NOT EXISTS challenge_results_user_date_idx
  ON public.challenge_results (user_id, challenge_date DESC);

ALTER TABLE public.challenge_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "challenge_results_select_own" ON public.challenge_results;
CREATE POLICY "challenge_results_select_own"
  ON public.challenge_results FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "challenge_results_insert_own" ON public.challenge_results;
CREATE POLICY "challenge_results_insert_own"
  ON public.challenge_results FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

COMMENT ON TABLE public.challenge_results IS
  'Daily challenge completion per user/VN-day. XP awarded once per day.';