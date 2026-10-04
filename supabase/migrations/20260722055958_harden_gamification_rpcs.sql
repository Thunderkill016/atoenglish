-- League assignment remains privileged internally but is exposed through a self-scoped invoker wrapper.
create or replace function private.assign_league_for_user_internal(p_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_week date := pg_catalog.date_trunc('week', pg_catalog.now())::date;
  v_tier public.league_tier;
  v_league_id uuid;
  v_xp integer;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_user_id::text || ':' || v_week::text, 0)
  );

  select lm.league_id
    into v_league_id
  from public.league_memberships as lm
  join public.leagues as l on l.id = lm.league_id
  where lm.user_id = p_user_id
    and l.week_start = v_week
  limit 1;

  if v_league_id is not null then
    return v_league_id;
  end if;

  select coalesce(up.total_xp, 0)
    into v_xp
  from public.user_progress as up
  where up.user_id = p_user_id;

  v_xp := coalesce(v_xp, 0);
  v_tier := case
    when v_xp >= 10000 then 'diamond'::public.league_tier
    when v_xp >= 4000 then 'emerald'::public.league_tier
    when v_xp >= 1500 then 'gold'::public.league_tier
    when v_xp >= 400 then 'silver'::public.league_tier
    else 'bronze'::public.league_tier
  end;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_week::text || ':' || v_tier::text, 0)
  );

  select l.id
    into v_league_id
  from public.leagues as l
  left join public.league_memberships as lm on lm.league_id = l.id
  where l.week_start = v_week
    and l.tier = v_tier
  group by l.id
  having count(lm.user_id) < 30
  order by count(lm.user_id) desc
  limit 1;

  if v_league_id is null then
    insert into public.leagues (week_start, tier)
    values (v_week, v_tier)
    returning id into v_league_id;
  end if;

  insert into public.league_memberships (user_id, league_id, xp_this_week)
  values (p_user_id, v_league_id, 0)
  on conflict do nothing;

  return v_league_id;
end;
$function$;

revoke all on function private.assign_league_for_user_internal(uuid)
  from public, anon, authenticated, service_role;
grant execute on function private.assign_league_for_user_internal(uuid)
  to authenticated, service_role;

create or replace function public.assign_league_for_user(p_user_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_uid uuid := (select public.auth_uid());
begin
  if current_user not in ('postgres', 'service_role', 'neondb_owner')
     and (v_uid is null or p_user_id is distinct from v_uid) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return private.assign_league_for_user_internal(p_user_id);
end;
$function$;

revoke all on function public.assign_league_for_user(uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.assign_league_for_user(uuid)
  to authenticated, service_role;

create or replace function public.bump_league_xp(p_user_id uuid, p_xp_delta integer)
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_uid uuid := (select public.auth_uid());
  v_week date := pg_catalog.date_trunc('week', pg_catalog.now())::date;
begin
  if current_user not in ('postgres', 'service_role', 'neondb_owner')
     and (v_uid is null or p_user_id is distinct from v_uid) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if p_xp_delta < 0 or p_xp_delta > 500 then
    raise exception 'invalid league XP delta' using errcode = '22023';
  end if;

  update public.league_memberships as lm
  set xp_this_week = lm.xp_this_week + p_xp_delta
  from public.leagues as l
  where lm.league_id = l.id
    and lm.user_id = p_user_id
    and l.week_start = v_week;
end;
$function$;

revoke all on function public.bump_league_xp(uuid, integer)
  from public, anon, authenticated, service_role;
grant execute on function public.bump_league_xp(uuid, integer)
  to authenticated, service_role;

-- Streak freeze grants are recorded once per milestone to prevent repeated claims.
create table if not exists private.streak_freeze_grants (
  user_id uuid not null references neon_auth.user(id) on delete cascade,
  milestone integer not null check (milestone in (7, 14, 30)),
  granted_at timestamptz not null default now(),
  primary key (user_id, milestone)
);
revoke all on table private.streak_freeze_grants from public, anon, authenticated;
grant select, insert on table private.streak_freeze_grants to service_role;

create or replace function private.grant_streak_freeze_internal(
  p_user_id uuid,
  p_count integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_streak integer;
  v_granted integer;
begin
  if p_count <> 1 then
    raise exception 'freeze grant count must be 1' using errcode = '22023';
  end if;

  select up.streak
    into v_streak
  from public.user_progress as up
  where up.user_id = p_user_id
  for update;

  if v_streak not in (7, 14, 30) then
    return;
  end if;

  insert into private.streak_freeze_grants (user_id, milestone)
  values (p_user_id, v_streak)
  on conflict do nothing
  returning milestone into v_granted;

  if v_granted is not null then
    update public.user_progress
    set streak_freeze_count = least(streak_freeze_count + 1, 5),
        updated_at = pg_catalog.now()
    where user_id = p_user_id;
  end if;
end;
$function$;

revoke all on function private.grant_streak_freeze_internal(uuid, integer)
  from public, anon, authenticated, service_role;
grant execute on function private.grant_streak_freeze_internal(uuid, integer)
  to authenticated, service_role;

create or replace function public.grant_streak_freeze(
  p_user_id uuid,
  p_count integer default 1
)
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_uid uuid := (select public.auth_uid());
begin
  if current_user not in ('postgres', 'service_role', 'neondb_owner')
     and (v_uid is null or p_user_id is distinct from v_uid) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  perform private.grant_streak_freeze_internal(p_user_id, p_count);
end;
$function$;

revoke all on function public.grant_streak_freeze(uuid, integer)
  from public, anon, authenticated, service_role;
grant execute on function public.grant_streak_freeze(uuid, integer)
  to authenticated, service_role;

create or replace function public.use_streak_freeze(p_user_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_uid uuid := (select public.auth_uid());
  v_freeze_count integer;
  v_streak integer;
begin
  if current_user not in ('postgres', 'service_role', 'neondb_owner')
     and (v_uid is null or p_user_id is distinct from v_uid) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  update public.user_progress
  set streak_freeze_count = streak_freeze_count - 1,
      last_active_date = (pg_catalog.now() at time zone 'Asia/Ho_Chi_Minh')::date,
      updated_at = pg_catalog.now()
  where user_id = p_user_id
    and streak_freeze_count > 0
  returning streak_freeze_count, streak
    into v_freeze_count, v_streak;

  if not found then
    return pg_catalog.jsonb_build_object(
      'success', false,
      'error', 'No streak freezes available'
    );
  end if;

  return pg_catalog.jsonb_build_object(
    'success', true,
    'freezes_remaining', v_freeze_count,
    'streak', v_streak
  );
end;
$function$;

revoke all on function public.use_streak_freeze(uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.use_streak_freeze(uuid)
  to authenticated, service_role;
