begin;

create extension if not exists pgtap;
set local search_path = public;

select plan(15);

-- Schema/RLS surface
select ok(
  (select relrowsecurity from pg_class where relname = 'zero_path_sessions' and relnamespace = 'public'::regnamespace),
  'zero_path_sessions has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'zero_path_session_submissions' and relnamespace = 'public'::regnamespace),
  'zero_path_session_submissions has RLS enabled'
);
select ok(
  (select attname is not null from pg_attribute
    where attrelid = 'public.zero_path_sessions'::regclass
      and attname = 'access_secret_hash'),
  'zero_path_sessions carries access_secret_hash'
);

insert into neon_auth."user" (id, name, email, "emailVerified")
values
  ('44444444-4444-4444-8444-444444444444', 'pgtap', 'zp-owner@atoenglish.test', true),
  ('55555555-5555-5555-8555-555555555555', 'pgtap', 'zp-other@atoenglish.test', true);
-- Neon: no on_auth_user_created trigger — seed user_progress
insert into public.user_progress (user_id)
values ('44444444-4444-4444-8444-444444444444'), ('55555555-5555-5555-8555-555555555555')
on conflict (user_id) do nothing;


-- ─── Anonymous boundary: no direct table access at all ────────────────────────
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok(
  $$
    insert into public.zero_path_sessions (id, user_id, lesson_id, lesson_version, mode, expires_at)
    values ('bbbbbbbb-0000-0000-0000-000000000099', null, 'LESSON-TEST', 1, 'learn', now() + interval '1 hour')
  $$,
  '42501',
  null,
  'anonymous caller cannot insert session rows directly'
);

select throws_ok(
  $$ select count(*)::int from public.zero_path_sessions $$,
  '42501',
  null,
  'anonymous caller cannot enumerate session rows'
);

select throws_ok(
  $$
    insert into public.zero_path_session_submissions (session_id, seq, action_id, idempotency_key, outcome_kind, outcome)
    values ('bbbbbbbb-0000-0000-0000-000000000099', 0, 'produce', 'key-x', 'self-report', '{}')
  $$,
  '42501',
  null,
  'anonymous caller cannot insert submission rows directly'
);

-- ─── Capability path: open → secret works, wrong/secretless fails ─────────────
create temp table _open_result as
  select * from public.zero_path_open_session('LESSON-TEST', 1, 'learn');

select is(
  (select count(*)::int from _open_result),
  1,
  'anonymous caller can open a session through the capability function'
);

select is(
  (select count(*)::int
     from public.zero_path_get_session(
       (select session_id from _open_result),
       (select access_secret from _open_result))),
  1,
  'holder-of-secret can read the guest session'
);

select is(
  (select count(*)::int
     from public.zero_path_get_session(
       (select session_id from _open_result),
       'wrong-secret')),
  0,
  'wrong secret does not reach the guest session'
);

select is(
  (select count(*)::int
     from public.zero_path_get_session(
       (select session_id from _open_result),
       null)),
  0,
  'missing secret does not reach the guest session'
);

select is(
  public.zero_path_append_submission(
    (select session_id from _open_result),
    (select access_secret from _open_result),
    0, 'produce', 'key-1', 'self-report', '{"kind":"self-report"}'::jsonb),
  true,
  'holder-of-secret can append a submission'
);

select is(
  public.zero_path_append_submission(
    (select session_id from _open_result),
    'wrong-secret',
    1, 'produce', 'key-2', 'self-report', '{}'::jsonb),
  false,
  'wrong secret cannot append a submission'
);

select is(
  (select count(*)::int
     from public.zero_path_list_submissions(
       (select session_id from _open_result),
       (select access_secret from _open_result))),
  1,
  'holder-of-secret can list submissions'
);

-- ─── Authenticated owner path unchanged ───────────────────────────────────────
reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"44444444-4444-4444-8444-444444444444","role":"authenticated"}',
  true
);
set local role authenticated;

insert into public.zero_path_sessions (id, user_id, lesson_id, lesson_version, mode, expires_at)
values ('aaaaaaaa-0000-0000-0000-000000000001', '44444444-4444-4444-8444-444444444444', 'LESSON-TEST', 1, 'learn', now() + interval '1 hour');

select is(
  (select count(*)::int from public.zero_path_sessions where id = 'aaaaaaaa-0000-0000-0000-000000000001'),
  1,
  'owner can read own session row'
);

select is(
  (select count(*)::int from public.zero_path_list_own_open_sessions()),
  1,
  'owner can list own open sessions through the function'
);

select * from finish();
rollback;
