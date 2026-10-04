-- =============================================================================
-- user_onboarding_profile — persist Q2–Q4 from signup survey (goal, obstacle, daily time)
-- One row per user (1:1). Written at first signup. Read for personalization later.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_onboarding_profile (
  user_id        uuid PRIMARY KEY REFERENCES neon_auth.user(id) ON DELETE CASCADE,
  goal           text NOT NULL,
  obstacle       text NOT NULL,
  daily_minutes  integer NOT NULL CHECK (daily_minutes IN (5, 15, 30, 60)),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_onboarding_profile_user_id_idx
  ON public.user_onboarding_profile (user_id);

ALTER TABLE public.user_onboarding_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_onboarding_profile_select_own" ON public.user_onboarding_profile;
CREATE POLICY "user_onboarding_profile_select_own"
  ON public.user_onboarding_profile FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_onboarding_profile_insert_own" ON public.user_onboarding_profile;
CREATE POLICY "user_onboarding_profile_insert_own"
  ON public.user_onboarding_profile FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_onboarding_profile_update_own" ON public.user_onboarding_profile;
CREATE POLICY "user_onboarding_profile_update_own"
  ON public.user_onboarding_profile FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

COMMENT ON TABLE public.user_onboarding_profile IS
  'Onboarding survey answers (Q2 goal, Q3 obstacle, Q4 daily_minutes) captured at signup. Complements user_progress (level + daily_xp_goal).';