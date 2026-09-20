-- Harden XP mutation boundaries.
-- Authenticated clients must not be able to choose arbitrary XP deltas.

REVOKE ALL ON FUNCTION public.award_user_xp(uuid, integer, date, date)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.award_user_xp(uuid, integer, date, date)
  TO service_role;

REVOKE ALL ON FUNCTION public.bump_league_xp(uuid, integer)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.bump_league_xp(uuid, integer)
  TO service_role;

-- Unit completion remains callable by authenticated learners, but the database
-- derives the only XP amount that can affect both total XP and weekly league XP.
CREATE OR REPLACE FUNCTION public.complete_unit_transaction(
  p_user_id uuid,
  p_unit_id text,
  p_xp_earned integer,
  p_stars integer,
  p_today text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_base_xp integer;
  v_expected_xp integer;
  v_progress_id uuid;
  v_new_xp integer;
  v_new_streak integer;
  v_current_level text;
  v_new_level text;
  v_streak_last_active date;
  v_today date := (pg_catalog.now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
  v_yesterday date := ((pg_catalog.now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date - 1);
  v_completed_count integer;
  v_league_id uuid;
  v_week date := pg_catalog.date_trunc('week', pg_catalog.now())::date;
BEGIN
  IF current_user NOT IN ('postgres', 'service_role')
     AND (v_uid IS NULL OR p_user_id IS DISTINCT FROM v_uid) THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  IF p_stars NOT BETWEEN 1 AND 3 THEN
    RAISE EXCEPTION 'invalid star count' USING ERRCODE = '22023';
  END IF;

  v_base_xp := CASE
    WHEN p_unit_id IN (
      'unit-a0-1','unit-a0-2','unit-a0-3','unit-a0-4',
      'unit-a0-5','unit-a0-6','unit-a0-7'
    ) THEN 60
    WHEN p_unit_id IN (
      'unit-a0-8','unit-1','unit-2','unit-3','unit-4','unit-5','unit-6',
      'unit-8','unit-9','unit-10','unit-11'
    ) THEN 80
    WHEN p_unit_id = 'unit-7' THEN 85
    WHEN p_unit_id = 'unit-12' THEN 120
    ELSE NULL
  END;

  IF v_base_xp IS NULL THEN
    RAISE EXCEPTION 'unit is not configured for completion' USING ERRCODE = '22023';
  END IF;

  v_expected_xp := CASE p_stars
    WHEN 3 THEN v_base_xp
    WHEN 2 THEN round(v_base_xp * 0.85)::integer
    WHEN 1 THEN round(v_base_xp * 0.70)::integer
  END;

  IF p_xp_earned IS DISTINCT FROM v_expected_xp THEN
    RAISE EXCEPTION 'invalid XP reward for unit and star count' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.user_lesson_progress (
    user_id,
    unit_id,
    xp_earned,
    completed_at,
    created_at
  )
  VALUES (
    p_user_id,
    p_unit_id,
    v_expected_xp,
    pg_catalog.now(),
    pg_catalog.now()
  )
  ON CONFLICT (user_id, unit_id) DO NOTHING
  RETURNING id INTO v_progress_id;

  IF v_progress_id IS NULL THEN
    RETURN pg_catalog.jsonb_build_object(
      'success', true,
      'already_completed', true
    );
  END IF;

  SELECT count(DISTINCT ulp.unit_id)::integer
    INTO v_completed_count
  FROM public.user_lesson_progress AS ulp
  WHERE ulp.user_id = p_user_id;

  v_new_level := CASE
    WHEN v_completed_count >= 40 THEN 'B2'
    WHEN v_completed_count >= 26 THEN 'B1'
    WHEN v_completed_count >= 20 THEN 'A2'
    WHEN v_completed_count >= 8 THEN 'A1'
    ELSE 'A0'
  END;

  SELECT up.streak, up.total_xp, up.last_active_date, up.current_level
    INTO v_new_streak, v_new_xp, v_streak_last_active, v_current_level
  FROM public.user_progress AS up
  WHERE up.user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.user_progress (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    SELECT up.streak, up.total_xp, up.last_active_date, up.current_level
      INTO v_new_streak, v_new_xp, v_streak_last_active, v_current_level
    FROM public.user_progress AS up
    WHERE up.user_id = p_user_id
    FOR UPDATE;
  END IF;

  IF v_streak_last_active = v_today THEN
    v_new_streak := v_new_streak;
  ELSIF v_streak_last_active = v_yesterday THEN
    v_new_streak := v_new_streak + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  IF (
    CASE v_new_level
      WHEN 'C1' THEN 6 WHEN 'B2' THEN 5 WHEN 'B1' THEN 4
      WHEN 'A2' THEN 3 WHEN 'A1' THEN 2 WHEN 'A0' THEN 1 ELSE 0
    END
  ) <= (
    CASE coalesce(v_current_level, 'A0')
      WHEN 'C1' THEN 6 WHEN 'B2' THEN 5 WHEN 'B1' THEN 4
      WHEN 'A2' THEN 3 WHEN 'A1' THEN 2 WHEN 'A0' THEN 1 ELSE 0
    END
  ) THEN
    v_new_level := coalesce(v_current_level, 'A0');
  END IF;

  UPDATE public.user_progress
  SET total_xp = total_xp + v_expected_xp,
      streak = v_new_streak,
      best_streak = greatest(best_streak, v_new_streak),
      last_active_date = v_today,
      current_level = v_new_level,
      updated_at = pg_catalog.now()
  WHERE user_id = p_user_id
  RETURNING total_xp INTO v_new_xp;

  -- Weekly league XP is derived from the same validated unit reward and is
  -- updated in the same transaction. No client-provided league delta is used.
  v_league_id := private.assign_league_for_user_internal(p_user_id);

  UPDATE public.league_memberships AS lm
  SET xp_this_week = lm.xp_this_week + v_expected_xp
  FROM public.leagues AS l
  WHERE lm.league_id = l.id
    AND lm.user_id = p_user_id
    AND lm.league_id = v_league_id
    AND l.week_start = v_week;

  RETURN pg_catalog.jsonb_build_object(
    'success', true,
    'xp_earned', v_expected_xp,
    'new_streak', v_new_streak,
    'new_total_xp', v_new_xp,
    'current_level', v_new_level,
    'completed_count', v_completed_count,
    'leveled_up', (v_new_level IS DISTINCT FROM coalesce(v_current_level, 'A0'))
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.complete_unit_transaction(uuid, text, integer, integer, text)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.complete_unit_transaction(uuid, text, integer, integer, text)
  TO authenticated, service_role;

COMMENT ON FUNCTION public.award_user_xp(uuid, integer, date, date)
  IS 'Privileged compatibility RPC. Arbitrary XP amounts are not executable by authenticated clients.';
COMMENT ON FUNCTION public.bump_league_xp(uuid, integer)
  IS 'Privileged compatibility RPC. Weekly league XP for unit completion is derived inside complete_unit_transaction.';
