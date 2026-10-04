-- Self-scoped XP award. Dates are derived server-side, not trusted from callers.
create or replace function public.award_user_xp(
  p_user_id uuid,
  p_xp_amount integer,
  p_today date,
  p_yesterday date
)
returns table (
  total_xp integer,
  streak integer,
  last_active_date date
)
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_uid uuid := (select public.auth_uid());
  v_today date := (pg_catalog.now() at time zone 'Asia/Ho_Chi_Minh')::date;
  v_yesterday date := ((pg_catalog.now() at time zone 'Asia/Ho_Chi_Minh')::date - 1);
begin
  if current_user not in ('postgres', 'service_role', 'neondb_owner')
     and (v_uid is null or p_user_id is distinct from v_uid) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if p_xp_amount < 0 or p_xp_amount > 1900 then
    raise exception 'xp amount is outside the allowed range' using errcode = '22023';
  end if;

  return query
  insert into public.user_progress (
    user_id,
    total_xp,
    streak,
    last_active_date,
    daily_xp_goal
  )
  values (
    p_user_id,
    p_xp_amount,
    1,
    v_today,
    50
  )
  on conflict (user_id) do update set
    total_xp = public.user_progress.total_xp + greatest(p_xp_amount, 0),
    streak = case
      when public.user_progress.last_active_date = v_today then public.user_progress.streak
      when public.user_progress.last_active_date = v_yesterday then public.user_progress.streak + 1
      when public.user_progress.last_active_date is null then 1
      else 1
    end,
    last_active_date = v_today,
    best_streak = greatest(
      public.user_progress.best_streak,
      case
        when public.user_progress.last_active_date = v_today then public.user_progress.streak
        when public.user_progress.last_active_date = v_yesterday then public.user_progress.streak + 1
        else 1
      end
    ),
    updated_at = pg_catalog.now()
  returning
    public.user_progress.total_xp,
    public.user_progress.streak,
    public.user_progress.last_active_date;
end;
$function$;

revoke all on function public.award_user_xp(uuid, integer, date, date)
  from public, anon, authenticated, service_role;
grant execute on function public.award_user_xp(uuid, integer, date, date)
  to authenticated, service_role;

-- Atomic unit completion. The database validates unit reward data itself.
create or replace function public.complete_unit_transaction(
  p_user_id uuid,
  p_unit_id text,
  p_xp_earned integer,
  p_stars integer,
  p_today text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_uid uuid := (select public.auth_uid());
  v_base_xp integer;
  v_expected_xp integer;
  v_progress_id uuid;
  v_new_xp integer;
  v_new_streak integer;
  v_current_level text;
  v_new_level text;
  v_streak_last_active date;
  v_today date := (pg_catalog.now() at time zone 'Asia/Ho_Chi_Minh')::date;
  v_yesterday date := ((pg_catalog.now() at time zone 'Asia/Ho_Chi_Minh')::date - 1);
  v_completed_count integer;
begin
  if current_user not in ('postgres', 'service_role', 'neondb_owner')
     and (v_uid is null or p_user_id is distinct from v_uid) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if p_stars not between 1 and 3 then
    raise exception 'invalid star count' using errcode = '22023';
  end if;

  v_base_xp := case
    when p_unit_id in (
      'unit-a0-1','unit-a0-2','unit-a0-3','unit-a0-4',
      'unit-a0-5','unit-a0-6','unit-a0-7'
    ) then 60
    when p_unit_id in (
      'unit-a0-8','unit-1','unit-2','unit-3','unit-4','unit-5','unit-6',
      'unit-8','unit-9','unit-10','unit-11'
    ) then 80
    when p_unit_id = 'unit-7' then 85
    when p_unit_id = 'unit-12' then 120
    else null
  end;

  if v_base_xp is null then
    raise exception 'unit is not configured for completion' using errcode = '22023';
  end if;

  v_expected_xp := case p_stars
    when 3 then v_base_xp
    when 2 then round(v_base_xp * 0.85)::integer
    when 1 then round(v_base_xp * 0.70)::integer
  end;

  if p_xp_earned is distinct from v_expected_xp then
    raise exception 'invalid XP reward for unit and star count' using errcode = '22023';
  end if;

  insert into public.user_lesson_progress (
    user_id,
    unit_id,
    xp_earned,
    completed_at,
    created_at
  )
  values (
    p_user_id,
    p_unit_id,
    v_expected_xp,
    pg_catalog.now(),
    pg_catalog.now()
  )
  on conflict (user_id, unit_id) do nothing
  returning id into v_progress_id;

  if v_progress_id is null then
    return pg_catalog.jsonb_build_object(
      'success', true,
      'already_completed', true
    );
  end if;

  select count(distinct ulp.unit_id)::integer
    into v_completed_count
  from public.user_lesson_progress as ulp
  where ulp.user_id = p_user_id;

  v_new_level := case
    when v_completed_count >= 40 then 'B2'
    when v_completed_count >= 26 then 'B1'
    when v_completed_count >= 20 then 'A2'
    when v_completed_count >= 8 then 'A1'
    else 'A0'
  end;

  select up.streak, up.total_xp, up.last_active_date, up.current_level
    into v_new_streak, v_new_xp, v_streak_last_active, v_current_level
  from public.user_progress as up
  where up.user_id = p_user_id
  for update;

  if not found then
    -- Bootstrap only the default row. XP is added exactly once in the UPDATE below.
    insert into public.user_progress (user_id)
    values (p_user_id)
    on conflict (user_id) do nothing;

    select up.streak, up.total_xp, up.last_active_date, up.current_level
      into v_new_streak, v_new_xp, v_streak_last_active, v_current_level
    from public.user_progress as up
    where up.user_id = p_user_id
    for update;
  end if;

  if v_streak_last_active = v_today then
    v_new_streak := v_new_streak;
  elsif v_streak_last_active = v_yesterday then
    v_new_streak := v_new_streak + 1;
  else
    v_new_streak := 1;
  end if;

  if (
    case v_new_level
      when 'C1' then 6 when 'B2' then 5 when 'B1' then 4
      when 'A2' then 3 when 'A1' then 2 when 'A0' then 1 else 0
    end
  ) <= (
    case coalesce(v_current_level, 'A0')
      when 'C1' then 6 when 'B2' then 5 when 'B1' then 4
      when 'A2' then 3 when 'A1' then 2 when 'A0' then 1 else 0
    end
  ) then
    v_new_level := coalesce(v_current_level, 'A0');
  end if;

  update public.user_progress
  set total_xp = total_xp + v_expected_xp,
      streak = v_new_streak,
      best_streak = greatest(best_streak, v_new_streak),
      last_active_date = v_today,
      current_level = v_new_level,
      updated_at = pg_catalog.now()
  where user_id = p_user_id
  returning total_xp into v_new_xp;

  return pg_catalog.jsonb_build_object(
    'success', true,
    'xp_earned', v_expected_xp,
    'new_streak', v_new_streak,
    'new_total_xp', v_new_xp,
    'current_level', v_new_level,
    'completed_count', v_completed_count,
    'leveled_up', (v_new_level is distinct from coalesce(v_current_level, 'A0'))
  );
end;
$function$;

revoke all on function public.complete_unit_transaction(uuid, text, integer, integer, text)
  from public, anon, authenticated, service_role;
grant execute on function public.complete_unit_transaction(uuid, text, integer, integer, text)
  to authenticated, service_role;
