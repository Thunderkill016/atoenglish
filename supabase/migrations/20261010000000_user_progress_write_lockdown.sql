-- =============================================================================
-- ATO-003: user_progress write lockdown
--
-- The authenticated-role UPDATE/INSERT grants let any signed-in user PATCH or
-- INSERT arbitrary stat values (reproduced: total_xp=999999, current_level=C1,
-- streak=9999 via a direct Data API PATCH — bypassing every server-side
-- invariant). Progress stats are evidence the product relies on; they must only
-- move through guarded SECURITY DEFINER functions.
--
-- Fix:
--   1. Revoke table-level UPDATE from authenticated; re-grant UPDATE on the
--      preference columns only (daily_xp_goal, notification_hour,
--      email_notifications). Stat columns become immutable to callers.
--   2. Bound the INSERT policy: first rows must carry plausible provisioning
--      values so the initial write cannot pre-forge a profile.
--   3. Add apply_placement_result() — the placement flow's UPDATE/INSERT path
--      (level + starting_unit_index + placement_completed_at) moves behind a
--      SECURITY DEFINER function with server-side validation.
--
-- award_user_xp() (hardened 20260907043000) remains the only path that mutates
-- total_xp/streak/last_active_date. complete_unit_transaction() remains the
-- only path that advances current_level legitimately.
-- =============================================================================

-- ── 1. Column lockdown ────────────────────────────────────────────────────────

revoke update on public.user_progress from authenticated;
grant update (daily_xp_goal, notification_hour, email_notifications)
  on public.user_progress to authenticated;

-- ── 2. Bound initial provisioning ─────────────────────────────────────────────
-- Legit first rows: onboarding (xp=0, streak=0, level A0..B2) and first-day
-- activity (xp <= quiz/placement seed of <=500, streak=1). Any richer stats on
-- day one are forged.

drop policy if exists "Users can insert own progress" on public.user_progress;
create policy "Users can insert own progress"
  on public.user_progress for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and coalesce(total_xp, 0) between 0 and 500
    and coalesce(streak, 0) <= 1
    and coalesce(best_streak, 0) <= 1
    and coalesce(streak_freeze_count, 0) = 0
    and current_level in ('A0', 'A1', 'A2', 'B1', 'B2')
    and coalesce(starting_unit_index, 0) between 0 and 500
  );

-- ── 3. Placement write path ───────────────────────────────────────────────────
-- Replaces the client-authority update/insert in the placement action. Row is
-- keyed to auth_uid() internally; the caller cannot pick another user_id.

create or replace function public.apply_placement_result(
  p_level text,
  p_starting_unit_index integer,
  p_seed_xp integer default 0,
  p_today date default current_date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.auth_uid();
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  if p_level not in ('A0', 'A1', 'A2', 'B1', 'B2') then
    raise exception 'invalid level';
  end if;
  if p_starting_unit_index is null
     or p_starting_unit_index < 0
     or p_starting_unit_index > 500 then
    raise exception 'invalid starting unit index';
  end if;

  insert into public.user_progress (
    user_id,
    current_level,
    starting_unit_index,
    placement_completed_at,
    last_active_date,
    total_xp,
    streak
  )
  values (
    v_uid,
    p_level,
    p_starting_unit_index,
    now(),
    p_today,
    greatest(0, least(coalesce(p_seed_xp, 0), 500)),
    0
  )
  on conflict (user_id) do update set
    current_level = excluded.current_level,
    starting_unit_index = excluded.starting_unit_index,
    placement_completed_at = excluded.placement_completed_at,
    last_active_date = excluded.last_active_date,
    updated_at = now();
  -- Seed XP applies only on first provisioning (matches prior app behavior);
  -- a re-placement on an existing row never rewrites earned stats.
end;
$$;

revoke all on function public.apply_placement_result(text, integer, integer, date)
  from public, anon, anonymous;
grant execute on function public.apply_placement_result(text, integer, integer, date)
  to authenticated;
grant execute on function public.apply_placement_result(text, integer, integer, date)
  to service_role;
