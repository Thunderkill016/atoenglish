-- Close the cross-guest Zero Path boundary.
--
-- Previous policies treated every user_id IS NULL session as visible to every
-- anonymous caller ("holder-of-id"). The SELECT policy enumerated all guest
-- session UUIDs, so the unguessable-id assumption collapsed: any anonymous
-- Data API caller could list every guest session and inject submissions into
-- them. Holder-of-id is only sound when ids cannot be enumerated.
--
-- New model: capability secret per session.
--   * Anonymous callers lose ALL direct table access (grants revoked).
--   * All session IO — guest or signed-in — goes through SECURITY DEFINER
--     functions that require either row ownership (auth.uid()) or the
--     per-session access secret issued at creation time.
--   * The secret is stored as a bcrypt hash; the plaintext is returned once
--     at session creation and delivered to the browser via HttpOnly cookie,
--     so it is never enumerable, never in URLs, and never JS-readable.

alter table public.zero_path_sessions
  add column if not exists access_secret_hash text;

-- ─── Revoke anonymous table access ────────────────────────────────────────────

revoke all on table public.zero_path_sessions from anon;
revoke all on table public.zero_path_session_submissions from anon;
revoke usage, select on sequence public.zero_path_session_submissions_id_seq
  from anon;

-- ─── Rebuild policies: authenticated owner-only (no more "user_id is null") ──

drop policy if exists "Sessions insert own or anonymous"
  on public.zero_path_sessions;
drop policy if exists "Sessions read own or anonymous"
  on public.zero_path_sessions;
drop policy if exists "Submissions insert via visible session"
  on public.zero_path_session_submissions;
drop policy if exists "Submissions read via visible session"
  on public.zero_path_session_submissions;

create policy "Sessions insert own"
  on public.zero_path_sessions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Sessions read own"
  on public.zero_path_sessions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Submissions insert own session"
  on public.zero_path_session_submissions
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.zero_path_sessions s
      where s.id = session_id
        and (select auth.uid()) = s.user_id
    )
  );

create policy "Submissions read own session"
  on public.zero_path_session_submissions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.zero_path_sessions s
      where s.id = session_id
        and (select auth.uid()) = s.user_id
    )
  );

-- ─── Capability check helper (not exposed: no EXECUTE grant below) ───────────
-- A row is reachable iff the caller owns it (authenticated path) or presents
-- the session's access secret (holder-of-secret path). bcrypt comparison via
-- crypt() is constant-time and salt-bound, so hashes are useless to a reader
-- who somehow sees them.

create or replace function public.zero_path_session_accessible(
  p_session_id uuid,
  p_access_secret text
) returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  s record;
begin
  select s.user_id, s.access_secret_hash
    into s
    from public.zero_path_sessions s
   where s.id = p_session_id;
  if not found then
    return false;
  end if;
  if s.user_id is not null and s.user_id = public.auth_uid() then
    return true;
  end if;
  if s.access_secret_hash is not null
     and p_access_secret is not null
     and crypt(p_access_secret, s.access_secret_hash) = s.access_secret_hash
  then
    return true;
  end if;
  return false;
end;
$$;

-- ─── Session creation: mints the capability, binds owner or guest ────────────
-- user_id comes from the JWT (auth.uid()), never from caller input — a signed
-- in learner's sessions are owner-bound automatically, a guest's are
-- secret-bound. The plaintext secret is returned exactly once, here.

create or replace function public.zero_path_open_session(
  p_lesson_id text,
  p_lesson_version integer,
  p_mode text
) returns table(session_id uuid, access_secret text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_secret text;
  v_id uuid;
begin
  if p_mode not in ('learn', 'review') then
    raise exception 'invalid mode';
  end if;
  if p_lesson_id is null or char_length(p_lesson_id) not between 1 and 120 then
    raise exception 'invalid lesson_id';
  end if;
  if p_lesson_version is null or p_lesson_version <= 0 then
    raise exception 'invalid lesson_version';
  end if;
  v_secret := encode(gen_random_bytes(24), 'hex');
  insert into public.zero_path_sessions (
    user_id,
    lesson_id,
    lesson_version,
    mode,
    expires_at,
    access_secret_hash
  ) values (
    public.auth_uid(),
    p_lesson_id,
    p_lesson_version,
    p_mode,
    now() + interval '4 hours',
    crypt(v_secret, gen_salt('bf'))
  )
  returning id into v_id;
  return query select v_id, v_secret;
end;
$$;

-- ─── Capability-gated reads/writes ────────────────────────────────────────────
-- Each mirrors one old table operation. Returning the row unconditionally
-- (open/expired/closed) keeps status evaluation in the app layer exactly as
-- before; the capability gate is the only new boundary.

-- Column list is explicit: access_secret_hash must never leave the database.
create or replace function public.zero_path_get_session(
  p_session_id uuid,
  p_access_secret text
) returns table(
  id uuid,
  user_id uuid,
  lesson_id text,
  lesson_version integer,
  mode text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  expires_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return query
    select s.id, s.user_id, s.lesson_id, s.lesson_version, s.mode, s.status,
           s.created_at, s.updated_at, s.expires_at
      from public.zero_path_sessions s
     where s.id = p_session_id
       and public.zero_path_session_accessible(s.id, p_access_secret);
end;
$$;

create or replace function public.zero_path_list_submissions(
  p_session_id uuid,
  p_access_secret text
) returns setof public.zero_path_session_submissions
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return query
    select r.*
      from public.zero_path_session_submissions r
     where r.session_id = p_session_id
       and public.zero_path_session_accessible(r.session_id, p_access_secret)
     order by r.seq asc;
end;
$$;

-- Append is additionally gated on the session being live — a holder of an
-- expired or closed session's secret cannot resurrect it.
create or replace function public.zero_path_append_submission(
  p_session_id uuid,
  p_access_secret text,
  p_seq integer,
  p_action_id text,
  p_idempotency_key text,
  p_outcome_kind text,
  p_outcome jsonb
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  s record;
begin
  select s.status, s.expires_at
    into s
    from public.zero_path_sessions s
   where s.id = p_session_id
     and public.zero_path_session_accessible(s.id, p_access_secret);
  if not found or s.status <> 'open' or s.expires_at <= now() then
    return false;
  end if;
  insert into public.zero_path_session_submissions (
    session_id, seq, action_id, idempotency_key, outcome_kind, outcome
  ) values (
    p_session_id, p_seq, p_action_id, p_idempotency_key, p_outcome_kind,
    p_outcome
  )
  on conflict (session_id, idempotency_key) do nothing;
  return true;
end;
$$;

-- Signed-in resume index: caller's own open sessions. No secret required —
-- ownership is the capability here.
create or replace function public.zero_path_list_own_open_sessions()
returns table(
  id uuid,
  user_id uuid,
  lesson_id text,
  lesson_version integer,
  mode text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  expires_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return query
    select s.id, s.user_id, s.lesson_id, s.lesson_version, s.mode, s.status,
           s.created_at, s.updated_at, s.expires_at
      from public.zero_path_sessions s
     where s.user_id = public.auth_uid()
       and s.status = 'open'
     order by s.updated_at desc;
end;
$$;

-- ─── Grants ───────────────────────────────────────────────────────────────────
-- Default privileges grant EXECUTE on new public functions to anon et al.;
-- revoke the helper explicitly so the capability check cannot be probed
-- independently of the guarded operations.

revoke all on function public.zero_path_session_accessible(uuid, text)
  from public, anon, authenticated;
grant execute on function public.zero_path_session_accessible(uuid, text)
  to service_role;

grant execute on function public.zero_path_open_session(text, integer, text)
  to anon, authenticated;
grant execute on function public.zero_path_get_session(uuid, text)
  to anon, authenticated;
grant execute on function public.zero_path_list_submissions(uuid, text)
  to anon, authenticated;
grant execute on function public.zero_path_append_submission(
  uuid, text, integer, text, text, text, jsonb
) to anon, authenticated;
grant execute on function public.zero_path_list_own_open_sessions()
  to authenticated;
