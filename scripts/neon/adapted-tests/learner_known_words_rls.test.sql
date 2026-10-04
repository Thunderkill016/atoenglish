begin;

create extension if not exists pgtap;
set local search_path = public;

select plan(6);

select ok(
  (select relrowsecurity from pg_class where relname = 'learner_known_words' and relnamespace = 'public'::regnamespace),
  'learner_known_words has RLS enabled'
);

insert into neon_auth."user" (id, name, email, "emailVerified")
values
  ('66666666-6666-4666-8666-666666666666', 'pgtap', 'kw-owner@atoenglish.test', true),
  ('77777777-7777-4777-8777-777777777777', 'pgtap', 'kw-other@atoenglish.test', true);
-- Neon: no on_auth_user_created trigger — seed user_progress
insert into public.user_progress (user_id)
values ('66666666-6666-4666-8666-666666666666'), ('77777777-7777-4777-8777-777777777777')
on conflict (user_id) do nothing;


select set_config(
  'request.jwt.claims',
  '{"sub":"66666666-6666-4666-8666-666666666666","role":"authenticated"}',
  true
);
set local role authenticated;

insert into public.learner_known_words (user_id, word, status)
values ('66666666-6666-4666-8666-666666666666', 'apple', 'known');

select is(
  (select count(*)::int from public.learner_known_words where word = 'apple'),
  1,
  'owner can read own word state'
);

-- Duplicate (user, word) is rejected — one row per normalized word per learner
select throws_ok(
  $$
    insert into public.learner_known_words (user_id, word, status)
    values ('66666666-6666-4666-8666-666666666666', 'apple', 'learning')
  $$,
  '23505',
  null,
  'duplicate (user_id, word) insert violates the unique constraint'
);

-- Non-owner sees nothing and cannot insert for someone else
select set_config(
  'request.jwt.claims',
  '{"sub":"77777777-7777-4777-8777-777777777777","role":"authenticated"}',
  true
);
select is(
  (select count(*)::int from public.learner_known_words where word = 'apple'),
  0,
  'non-owner cannot read another learner''s word state'
);

select throws_ok(
  $$
    insert into public.learner_known_words (user_id, word, status)
    values ('66666666-6666-4666-8666-666666666666', 'banana', 'known')
  $$,
  '42501',
  null,
  'non-owner cannot insert a word state under another user_id'
);

-- Anon role cannot read word state at all
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select is(
  (select count(*)::int from public.learner_known_words),
  0,
  'anonymous role sees no word state'
);

select * from finish();
rollback;
