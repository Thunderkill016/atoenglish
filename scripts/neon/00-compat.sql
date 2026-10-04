-- Neon compatibility bootstrap for Supabase-shaped migrations.
-- Run ONCE per branch after enabling the Data API (requires the
-- pg_session_jwt extension's `auth` schema), BEFORE replaying migrations.
--
-- What this provides:
--   * `anon`, `service_role`, `supabase_auth_admin` stub roles so Supabase-era
--     GRANT/REVOKE/policy statements apply verbatim. `anon` is granted to the
--     Data API's `anonymous` role to preserve "public may insert" semantics.
--   * `auth.role()` — Supabase compat over pg_session_jwt's auth.session(),
--     with connection-role fallback so direct service connections
--     (neondb_owner) read as 'service_role'.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    create role supabase_auth_admin nologin;
  end if;
end
$$;

-- Anonymous Data API requests inherit anon's grants (pilot_events, zero_path
-- anonymous inserts, etc.).
grant anon to anonymous;

-- Supabase default privileges: PostgREST-facing roles get DML on new public
-- tables/sequences and EXECUTE on new functions at CREATE time; migrations
-- then REVOKE the specifics they want to keep private. We mirror that
-- mechanism with ALTER DEFAULT PRIVILEGES only — no blanket grants on
-- existing objects — so this file stays safe to re-run without re-opening
-- privileges that migrations deliberately revoked.
-- `private` schema is intentionally excluded — its objects stay internal.
alter default privileges in schema public
  grant select, insert, update, delete on tables
  to anon, authenticated, service_role, anonymous;
alter default privileges in schema public
  grant usage, select on sequences
  to anon, authenticated, service_role, anonymous;
alter default privileges in schema public
  grant execute on functions
  to anon, authenticated, service_role, anonymous;

-- auth.role() equivalent. The `auth` schema is owned by cloud_admin (extension
-- schema) and does not accept user objects, so the compat function lives in
-- public and migrations are rewritten to call public.auth_role().
-- SECURITY DEFINER: `authenticated`/`anonymous` lack USAGE on the `auth`
-- schema, so auth.session() must be evaluated as the owning role
-- (neondb_owner, which inherits the needed privileges).
create or replace function public.auth_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when (auth.session() ->> 'role') is not null then auth.session() ->> 'role'
    when (auth.session() ->> 'sub') is not null then 'authenticated'
    when current_user in ('neondb_owner', 'postgres', 'neon_service', 'service_role')
      then 'service_role'
    else 'anonymous'
  end
$$;

-- auth.uid() equivalent for SECURITY INVOKER contexts. RLS policies are
-- evaluated with the table owner's privileges so `auth.uid()` still resolves
-- there, but invoker functions run as `authenticated` which cannot access the
-- `auth` schema. This definer wrapper evaluates auth.uid() as neondb_owner;
-- the JWT claims GUC is session-local and unaffected by the role switch.
create or replace function public.auth_uid()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid()
$$;

grant execute on function public.auth_role() to authenticated, anonymous;
grant execute on function public.auth_uid() to authenticated, anonymous;

-- NOTE: `authenticated` must NOT get EXECUTE on private.* functions. The
-- hardened trust boundary (supabase/tests/database/private_gamification_
-- internals.test.sql) requires zero private-schema EXECUTE for
-- authenticated; private helpers are only reachable through SECURITY DEFINER
-- public wrappers or the service path (neondb_owner / service_role).
