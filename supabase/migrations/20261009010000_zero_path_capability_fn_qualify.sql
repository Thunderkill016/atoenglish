-- Qualify pgcrypto calls in the capability functions: they run with
-- search_path='' so unqualified gen_random_bytes/crypt/gen_salt/encode
-- resolution fails. Recreates the same function signatures — no behavior
-- change beyond the fix.

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
     and public.crypt(p_access_secret, s.access_secret_hash) =
         s.access_secret_hash
  then
    return true;
  end if;
  return false;
end;
$$;

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
  v_secret := public.encode(public.gen_random_bytes(24), 'hex');
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
    public.crypt(v_secret, public.gen_salt('bf'))
  )
  returning id into v_id;
  return query select v_id, v_secret;
end;
$$;

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
