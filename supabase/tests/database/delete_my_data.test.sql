begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(19);

-- delete_my_data() must erase EVERY user-keyed row atomically — including
-- tables whose ACL deliberately denies authenticated DELETE (user_progress,
-- user_lesson_progress, the legacy archive, capability-gated zero_path_*)
-- — while leaving other learners' rows untouched.

insert into auth.users (id, aud, role, email, created_at, updated_at)
values
  ('66666666-6666-4666-8666-666666666666', 'authenticated', 'authenticated', 'wipe-owner@atoenglish.test', now(), now()),
  ('77777777-7777-4777-8777-777777777777', 'authenticated', 'authenticated', 'wipe-other@atoenglish.test', now(), now());

-- Seed a representative spread for both users: ordinary tables, ACL-locked
-- tables and a non-user-keyed child (zero_path_session_submissions).
create temp table _wipe_cards as
  with ins as (
    insert into public.study_cards (user_id, kind, key, display, meaning_vi, meaning_origin)
    values
      ('66666666-6666-4666-8666-666666666666', 'word', 'resilience', 'resilience', 'khả năng phục hồi', 'dictionary'),
      ('77777777-7777-4777-8777-777777777777', 'word', 'serendipity', 'serendipity', 'sự tình cờ', 'dictionary')
    returning id, user_id
  )
  select id, user_id from ins;

create temp table _wipe_sources as
  with ins as (
    insert into public.content_sources (user_id, kind, external_id, title)
    values
      ('66666666-6666-4666-8666-666666666666', 'youtube', 'dQw4w9WgXcQ', 't'),
      ('77777777-7777-4777-8777-777777777777', 'youtube', 'abc123def45', 't2')
    returning id, user_id
  )
  select id, user_id from ins;

insert into public.content_transcripts
  (source_id, user_id, origin, language, segmentation_version, sentences)
select id, user_id, 'youtube_asr', 'en', 1, '[]'::jsonb from _wipe_sources;

insert into public.subtitle_translations
  (user_id, video_id, profile, line_i, text_hash, vi)
values
  ('66666666-6666-4666-8666-666666666666', 'dQw4w9WgXcQ', 'gemini-2.5-flash', 0, repeat('a', 64), 'xin chào'),
  ('77777777-7777-4777-8777-777777777777', 'abc123def45', 'gemini-2.5-flash', 0, repeat('b', 64), 'chào');

insert into public.ai_results (user_id, kind, input_hash, model, output)
values
  ('66666666-6666-4666-8666-666666666666', 'sentence_analysis', repeat('a', 64), 'gemini-2.5-flash', '{}'::jsonb),
  ('77777777-7777-4777-8777-777777777777', 'sentence_analysis', repeat('b', 64), 'gemini-2.5-flash', '{}'::jsonb);

insert into public.practice_attempts (user_id, card_id, mode, rating)
select user_id, id, 'write_reuse', 2 from _wipe_cards;

insert into public.user_lesson_progress (user_id, unit_id, xp_earned)
values
  ('66666666-6666-4666-8666-666666666666', 'unit-wipe', 10),
  ('77777777-7777-4777-8777-777777777777', 'unit-wipe', 20);

insert into public.learning_attempts_legacy_202607
  (id, user_id, session_id, lesson_id, activity_id, modality, status, evaluator, evaluator_version)
overriding system value
values
  (1, '66666666-6666-4666-8666-666666666666', gen_random_uuid(), 'L', 'A', 'reading', 'unscored', 'e', '1'),
  (2, '77777777-7777-4777-8777-777777777777', gen_random_uuid(), 'L', 'A', 'reading', 'unscored', 'e', '1');

insert into public.zero_path_sessions
  (id, user_id, lesson_id, lesson_version, mode, expires_at)
values
  ('aaaaaaaa-0000-4000-8000-000000000001', '66666666-6666-4666-8666-666666666666', 'ZL', 1, 'learn', now() + interval '1 hour'),
  ('aaaaaaaa-0000-4000-8000-000000000002', '77777777-7777-4777-8777-777777777777', 'ZL', 1, 'learn', now() + interval '1 hour');

insert into public.zero_path_session_submissions
  (id, session_id, seq, action_id, idempotency_key, outcome_kind, outcome)
overriding system value
values
  (1, 'aaaaaaaa-0000-4000-8000-000000000001', 1, 'a', 'k1', 'evidence', '{}'::jsonb),
  (2, 'aaaaaaaa-0000-4000-8000-000000000002', 1, 'a', 'k2', 'evidence', '{}'::jsonb);

-- Owner calls the erasure RPC.
select set_config(
  'request.jwt.claims',
  '{"sub":"66666666-6666-4666-8666-666666666666","role":"authenticated"}',
  true
);
set local role authenticated;

select lives_ok(
  $$select public.delete_my_data()$$,
  'owner can execute delete_my_data'
);

-- Owner-side reads (authenticated SELECT is granted on these tables).
select is(
  (select count(*) from public.study_cards),
  0::bigint,
  'owner study_cards erased'
);
select is(
  (select count(*) from public.subtitle_translations),
  0::bigint,
  'owner subtitle_translations erased'
);
select is(
  (select count(*) from public.ai_results),
  0::bigint,
  'owner ai_results erased'
);
select is(
  (select count(*) from public.practice_attempts),
  0::bigint,
  'owner practice_attempts erased'
);
select is(
  (select count(*) from public.content_sources),
  0::bigint,
  'owner content_sources erased'
);
select is(
  (select count(*) from public.user_lesson_progress),
  0::bigint,
  'owner user_lesson_progress erased despite ACL lockdown'
);
select is(
  (select count(*) from public.zero_path_sessions),
  0::bigint,
  'owner zero_path_sessions erased'
);
select is(
  (select count(*) from public.user_progress),
  0::bigint,
  'owner user_progress erased'
);

-- Idempotent: a second call succeeds on an already-empty account.
select lives_ok(
  $$select public.delete_my_data()$$,
  'delete_my_data is idempotent'
);

-- Full truth check as table owner (bypasses RLS): every owner row gone,
-- every foreign row still present — including tables authenticated cannot
-- even read (legacy archive) or that carry no user_id (submissions).
reset role;
select is(
  (select count(*) from public.study_cards where user_id = '66666666-6666-4666-8666-666666666666'),
  0::bigint,
  'owner study_cards gone (definer view)'
);
select is(
  (select count(*) from public.learning_attempts_legacy_202607 where user_id = '66666666-6666-4666-8666-666666666666'),
  0::bigint,
  'owner legacy archive rows gone'
);
select is(
  (select count(*) from public.zero_path_session_submissions where session_id = 'aaaaaaaa-0000-4000-8000-000000000001'),
  0::bigint,
  'owner session submissions gone'
);
select is(
  (select count(*) from public.study_cards where user_id = '77777777-7777-4777-8777-777777777777'),
  1::bigint,
  'other learner study_cards untouched'
);
select is(
  (select count(*) from public.user_progress where user_id = '77777777-7777-4777-8777-777777777777'),
  1::bigint,
  'other learner user_progress untouched'
);
select is(
  (select count(*) from public.zero_path_session_submissions where session_id = 'aaaaaaaa-0000-4000-8000-000000000002'),
  1::bigint,
  'other learner session submissions untouched'
);
select is(
  (select count(*) from public.learning_attempts_legacy_202607 where user_id = '77777777-7777-4777-8777-777777777777'),
  1::bigint,
  'other learner legacy rows untouched'
);

-- Boundary: authenticated JWT without a sub claim is rejected inside the
-- function and anon never holds EXECUTE.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"role":"authenticated"}',
  true
);
select throws_ok(
  $$select public.delete_my_data()$$,
  'P0001',
  'not authenticated',
  'authenticated claim without sub cannot erase'
);

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok(
  $$select public.delete_my_data()$$,
  '42501',
  'permission denied for function delete_my_data',
  'anon role has no EXECUTE on delete_my_data'
);

select * from finish();
rollback;
