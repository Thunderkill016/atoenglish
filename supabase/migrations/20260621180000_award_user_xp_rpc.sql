-- =============================================================================
-- Atomic XP + streak updates (fixes read-then-write race on user_progress)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.award_user_xp(
  p_user_id uuid,
  p_xp_amount integer,
  p_today date,
  p_yesterday date
)
RETURNS TABLE (
  total_xp integer,
  streak integer,
  last_active_date date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.auth_uid() IS NOT NULL AND p_user_id IS DISTINCT FROM public.auth_uid() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF p_xp_amount < 0 THEN
    RAISE EXCEPTION 'xp_amount must be non-negative';
  END IF;

  RETURN QUERY
  INSERT INTO public.user_progress (
    user_id,
    current_level,
    streak,
    total_xp,
    last_active_date,
    daily_xp_goal
  )
  VALUES (
    p_user_id,
    'A0',
    1,
    p_xp_amount,
    p_today,
    50
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = public.user_progress.total_xp + GREATEST(p_xp_amount, 0),
    streak = CASE
      WHEN public.user_progress.last_active_date = p_today THEN public.user_progress.streak
      WHEN public.user_progress.last_active_date = p_yesterday THEN public.user_progress.streak + 1
      WHEN public.user_progress.last_active_date IS NULL THEN 1
      ELSE 1
    END,
    last_active_date = p_today,
    updated_at = now()
  RETURNING
    public.user_progress.total_xp,
    public.user_progress.streak,
    public.user_progress.last_active_date;
END;
$$;

REVOKE ALL ON FUNCTION public.award_user_xp(uuid, integer, date, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_user_xp(uuid, integer, date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_user_xp(uuid, integer, date, date) TO service_role;

COMMENT ON FUNCTION public.award_user_xp IS
  'Atomically increment total_xp and update streak/last_active_date for a user.';