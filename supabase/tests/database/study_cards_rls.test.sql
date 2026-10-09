begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(11);

select ok(
  (select relrowsecurity from pg_class where relname = 'study_cards' and relnamespace = 'public'::regnamespace),
  'study_cards has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'card_contexts' and relnamespace = 'public'::regnamespace),
  'card_contexts has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'practice_attempts' and relnamespace = 'public'::regnamespace),
  'practice_attempts has RLS enabled'
);

insert into auth.users (id, aud, role, email, created_at, updated_at)
values
  ('66666666-6666-4666-8666-666666666666', 'authenticated', 'authenticated', 'sc-owner@atoenglish.test', now(), now()),
  ('77777777-7777-4777-8777-777777777777', 'authenticated', 'authenticated', 'sc-other@atoenglish.test', now(), now());

select set_config(
  'request.jwt.claims',
  '{"sub":"66666666-6666-4666-8666-666666666666","role":"authenticated"}',
  true
);
select set_config('request.jwt.claim.sub', '66666666-6666-4666-8666-666666666666', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

-- Owner can create a card with a source context and an attempt.
create temp table _owner_source as
  with ins as (
    insert into public.content_sources (user_id, kind, external_id, title)
    values ('66666666-6666-4666-8666-666666666666', 'youtube', 'dQw4w9WgXcQ', 't')
    returning id
  )
  select id from ins;
create temp table _owner_card as
  with ins as (
    insert into public.study_cards (user_id, kind, key, display, meaning_vi, meaning_origin)
    values (
      '66666666-6666-4666-8666-666666666666',
      'word', 'resilience', 'resilience', 'khả năng phục hồi', 'dictionary'
    )
    returning id
  )
  select id from ins;

insert into public.card_contexts
  (user_id, card_id, source_id, sentence_index, token_start, token_count,
   sentence_text, start_ms, end_ms, context_origin)
values (
  '66666666-6666-4666-8666-666666666666',
  (select id from _owner_card), (select id from _owner_source),
  12, 3, 1, 'It takes resilience to keep going.', 41000, 43000, 'watch_lookup'
);

insert into public.practice_attempts
  (user_id, card_id, mode, rating, correct)
values (
  '66666666-6666-4666-8666-666666666666',
  (select id from _owner_card), 'recall', 3, true
);

select is(
  (select count(*)::int from public.study_cards),
  1,
  'owner reads own study_cards'
);
select is(
  (select count(*)::int from public.card_contexts),
  1,
  'owner reads own card_contexts'
);
select is(
  (select count(*)::int from public.practice_attempts),
  1,
  'owner reads own practice_attempts'
);

-- Dedupe: the same encounter saved twice stays one row.
select throws_ok(
  $$insert into public.card_contexts
    (user_id, card_id, source_id, sentence_index, token_start, token_count,
     sentence_text, start_ms, end_ms, context_origin)
    values (
      '66666666-6666-4666-8666-666666666666',
      (select id from _owner_card), (select id from _owner_source),
      12, 3, 1, 'It takes resilience to keep going.', 41000, 43000, 'watch_lookup'
    )$$,
  '23505',
  null,
  'saving the same encounter twice hits the dedupe constraint'
);

-- Anchor rule: an attempt with neither card nor (source, sentence) is invalid.
select throws_ok(
  $$insert into public.practice_attempts (user_id, mode, rating)
    values ('66666666-6666-4666-8666-666666666666', 'recall', 3)$$,
  '23514',
  null,
  'practice_attempts requires card_id or (source_id + sentence_index)'
);

-- Switch to the other user: sees nothing, cannot write under own id
-- referencing the owner's card.
select set_config('request.jwt.claim.sub', '77777777-7777-4777-8777-777777777777', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"77777777-7777-4777-8777-777777777777","role":"authenticated"}',
  true
);

select is(
  (select count(*)::int from public.study_cards),
  0,
  'other user sees no study_cards rows'
);
select is(
  (select count(*)::int from public.card_contexts),
  0,
  'other user sees no card_contexts rows'
);
select throws_ok(
  $$insert into public.study_cards (user_id, kind, key, display)
    values ('66666666-6666-4666-8666-666666666666', 'word', 'nope', 'nope')$$,
  '42501',
  null,
  'other user cannot insert rows owned by someone else'
);

select * from finish();
rollback;
