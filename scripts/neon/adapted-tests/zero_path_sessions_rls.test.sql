begin;

create extension if not exists pgtap;
set local search_path = public;

select plan(7);

-- Schema/RLS surface
select ok(
  (select relrowsecurity from pg_class where relname = 'zero_path_sessions' and relnamespace = 'public'::regnamespace),
  'zero_path_sessions has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'zero_path_session_submissions' and relnamespace = 'public'::regnamespace),
  'zero_path_session_submissions has RLS enabled'
);

insert into neon_auth."user" (id, name, email, "emailVerified")
values
  ('44444444-4444-4444-8444-444444444444', 'pgtap', 'zp-owner@atoenglish.test', true),
  ('55555555-5555-5555-8555-555555555555', 'pgtap', 'zp-other@atoenglish.test', true);
-- Neon: no on_auth_user_created trigger — seed user_progress
insert into public.user_progress (user_id)
values ('44444444-4444-4444-8444-444444444444'), ('55555555-5555-5555-8555-555555555555')
on conflict (user_id) do nothing;


-- Owner inserts + reads own session
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

insert into public.zero_path_session_submissions (session_id, seq, action_id, idempotency_key, outcome_kind, outcome)
values ('aaaaaaaa-0000-0000-0000-000000000001', 0, 'produce', 'key-1', 'self-report', '{"kind":"self-report"}');

select is(
  (select count(*)::int from public.zero_path_session_submissions where session_id = 'aaaaaaaa-0000-0000-0000-000000000001'),
  1,
  'owner can insert and read submission rows'
);

-- Other user sees nothing and cannot write into the session
select set_config(
  'request.jwt.claims',
  '{"sub":"55555555-5555-5555-8555-555555555555","role":"authenticated"}',
  true
);
select is(
  (select count(*)::int from public.zero_path_sessions where id = 'aaaaaaaa-0000-0000-0000-000000000001'),
  0,
  'non-owner cannot read another user''s session row'
);

select throws_ok(
  $$
    insert into public.zero_path_session_submissions (session_id, seq, action_id, idempotency_key, outcome_kind, outcome)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 1, 'produce', 'key-2', 'self-report', '{}')
  $$,
  '42501',
  null,
  'non-owner cannot insert submissions into another user''s session'
);

-- Anonymous holder-of-id session: readable by id, but never writable post-insert
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
insert into public.zero_path_sessions (id, user_id, lesson_id, lesson_version, mode, expires_at)
values ('bbbbbbbb-0000-0000-0000-000000000002', null, 'LESSON-TEST', 1, 'learn', now() + interval '1 hour');

select is(
  (select count(*)::int
     from public.zero_path_sessions
     where id = 'bbbbbbbb-0000-0000-0000-000000000002'),
  1,
  'anonymous session row is readable by holder-of-id'
);

select * from finish();
rollback;
