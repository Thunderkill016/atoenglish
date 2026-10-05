-- encode() lives in pg_catalog (implicitly searched even with
-- search_path=''), while gen_random_bytes/crypt/gen_salt are pgcrypto
-- objects in public. Qualify only the pgcrypto calls.

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
  v_secret := encode(public.gen_random_bytes(24), 'hex');
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
