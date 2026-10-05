-- =============================================================================
-- ATO-004: user_lesson_progress write lockdown
--
-- INSERT/UPDATE/DELETE were granted to authenticated with only row-ownership
-- policies — reproduced live: forged unit completion rows carrying arbitrary
-- xp_earned, in-place stat rewriting, and evidence erasure via DELETE. These
-- rows drive CEFR progression (check_cefr_progression trigger counts them) and
-- are learner-facing evidence; they must only be written by the validated
-- completion transaction.
--
-- Fix:
--   1. Revoke INSERT/UPDATE/DELETE from authenticated (+ dead anon grants).
--      complete_unit_transaction() remains the sole writer via owner context.
--   2. reset_unit_progress() — SECURITY DEFINER delete bound to auth_uid()
--      replaces the client-authority delete in the reset action.
--   3. SELECT stays: progress reads are legitimate.
-- =============================================================================

revoke insert, update, delete on public.user_lesson_progress
  from authenticated, anon;

create or replace function public.reset_unit_progress(
  p_unit_id text
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
  if p_unit_id is null or char_length(p_unit_id) > 100 then
    raise exception 'invalid unit id';
  end if;

  delete from public.user_lesson_progress
  where user_id = v_uid
    and unit_id = p_unit_id;
end;
$$;

revoke all on function public.reset_unit_progress(text)
  from public, anon, anonymous;
grant execute on function public.reset_unit_progress(text) to authenticated;
grant execute on function public.reset_unit_progress(text) to service_role;
