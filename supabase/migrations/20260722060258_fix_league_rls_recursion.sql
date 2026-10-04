create or replace function private.current_user_league_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $function$
  select lm.league_id
  from public.league_memberships as lm
  where lm.user_id = (select public.auth_uid());
$function$;

revoke all on function private.current_user_league_ids()
  from public, anon, authenticated, service_role;
grant execute on function private.current_user_league_ids()
  to authenticated, service_role;

drop policy if exists "league_memberships: read own league"
  on public.league_memberships;
create policy "league_memberships: read own league"
  on public.league_memberships
  for select
  to authenticated
  using (
    league_id in (select private.current_user_league_ids())
  );

drop policy if exists "leagues: members can read own league"
  on public.leagues;
create policy "leagues: members can read own league"
  on public.leagues
  for select
  to authenticated
  using (
    id in (select private.current_user_league_ids())
  );
