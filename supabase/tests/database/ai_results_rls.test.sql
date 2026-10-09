begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(7);

select ok(
  (select relrowsecurity from pg_class where relname = 'ai_results' and relnamespace = 'public'::regnamespace),
  'ai_results has RLS enabled'
);

insert into auth.users (id, aud, role, email, created_at, updated_at)
values
  ('88888888-8888-4888-8888-888888888888', 'authenticated', 'authenticated', 'ai-owner@atoenglish.test', now(), now()),
  ('99999999-9999-4999-9999-999999999999', 'authenticated', 'authenticated', 'ai-other@atoenglish.test', now(), now());

select set_config(
  'request.jwt.claims',
  '{"sub":"88888888-8888-4888-8888-888888888888","role":"authenticated"}',
  true
);
select set_config('request.jwt.claim.sub', '88888888-8888-4888-8888-888888888888', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

-- Owner caches one analysis and links an attempt to it.
create temp table _owner_card as
  with ins as (
    insert into public.study_cards (user_id, kind, key, display)
    values ('88888888-8888-4888-8888-888888888888', 'word', 'resilience', 'resilience')
    returning id
  )
  select id from ins;
create temp table _owner_ai as
  with ins as (
    insert into public.ai_results
      (user_id, kind, input_hash, model, output)
    values (
      '88888888-8888-4888-8888-888888888888',
      'sentence_analysis',
      repeat('a', 64),
      'gemini-2.5-flash',
      '{"translation_vi":"x"}'::jsonb
    )
    returning id
  )
  select id from ins;

insert into public.practice_attempts
  (user_id, card_id, mode, learner_text, ai_result_id)
values (
  '88888888-8888-4888-8888-888888888888',
  (select id from _owner_card), 'write_reuse', 'I try.', (select id from _owner_ai)
);

select is(
  (select count(*)::int from public.ai_results),
  1,
  'owner reads own ai_results'
);
select is(
  (select ai_result_id from public.practice_attempts where card_id = (select id from _owner_card)),
  (select id from _owner_ai),
  'attempt links to the cached ai_results row'
);

-- Cache key: same (user, kind, input_hash, model) may not duplicate.
select throws_ok(
  $$insert into public.ai_results (user_id, kind, input_hash, model, output)
    values (
      '88888888-8888-4888-8888-888888888888',
      'sentence_analysis',
      repeat('a', 64),
      'gemini-2.5-flash',
      '{"translation_vi":"y"}'::jsonb
    )$$,
  '23505',
  null,
  'duplicate (user, kind, input_hash, model) is rejected'
);

-- input_hash must be sha256 hex.
select throws_ok(
  $$insert into public.ai_results (user_id, kind, input_hash, model, output)
    values (
      '88888888-8888-4888-8888-888888888888',
      'sentence_analysis',
      'not-a-hash',
      'gemini-2.5-flash',
      '{}'::jsonb
    )$$,
  '23514',
  null,
  'input_hash must be 64-char hex'
);

-- Other user sees nothing.
select set_config('request.jwt.claim.sub', '99999999-9999-4999-9999-999999999999', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"99999999-9999-4999-9999-999999999999","role":"authenticated"}',
  true
);

select is(
  (select count(*)::int from public.ai_results),
  0,
  'other user sees no ai_results rows'
);
select throws_ok(
  $$insert into public.ai_results (user_id, kind, input_hash, model, output)
    values ('88888888-8888-4888-8888-888888888888', 'context_gloss', repeat('b', 64), 'm', '{}'::jsonb)$$,
  '42501',
  null,
  'other user cannot insert rows owned by someone else'
);

select * from finish();
rollback;
