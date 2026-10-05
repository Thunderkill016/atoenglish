-- Fix record-variable/table-alias collision: `into s` never populated
-- because the plpgsql variable `s` shadowed the table alias `s`.

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
  sess record;
begin
  select zs.user_id, zs.access_secret_hash
    into sess
    from public.zero_path_sessions zs
   where zs.id = p_session_id;
  if not found then
    return false;
  end if;
  if sess.user_id is not null and sess.user_id = public.auth_uid() then
    return true;
  end if;
  if sess.access_secret_hash is not null
     and p_access_secret is not null
     and public.crypt(p_access_secret, sess.access_secret_hash) =
         sess.access_secret_hash
  then
    return true;
  end if;
  return false;
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
  sess record;
begin
  select zs.status, zs.expires_at
    into sess
    from public.zero_path_sessions zs
   where zs.id = p_session_id
     and public.zero_path_session_accessible(zs.id, p_access_secret);
  if not found or sess.status <> 'open' or sess.expires_at <= now() then
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
