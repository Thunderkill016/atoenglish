begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(8);

select ok(
  (select relrowsecurity from pg_class where relname = 'content_sources' and relnamespace = 'public'::regnamespace),
  'content_sources has RLS enabled'
);

select ok(
  (select relrowsecurity from pg_class where relname = 'content_transcripts' and relnamespace = 'public'::regnamespace),
  'content_transcripts has RLS enabled'
);

insert into auth.users (id, aud, role, email, created_at, updated_at)
values
  ('66666666-6666-4666-8666-666666666666', 'authenticated', 'authenticated', 'cs-owner@atoenglish.test', now(), now()),
  ('77777777-7777-4777-8777-777777777777', 'authenticated', 'authenticated', 'cs-other@atoenglish.test', now(), now());

select set_config(
  'request.jwt.claims',
  '{"sub":"66666666-6666-4666-8666-666666666666","role":"authenticated"}',
  true
);
select set_config('request.jwt.claim.sub', '66666666-6666-4666-8666-666666666666', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

-- Capture the generated id in a temp table: identity sequences survive
-- rollback, so a hardcoded source_id only works when this suite runs first.
create temp table _owner_source as
  with ins as (
    insert into public.content_sources (user_id, kind, external_id, title)
    values ('66666666-6666-4666-8666-666666666666', 'youtube', 'dQw4w9WgXcQ', 't')
    returning id
  )
  select id from ins;

insert into public.content_transcripts (source_id, user_id, origin, language, segmentation_version, sentences)
values ((select id from _owner_source), '66666666-6666-4666-8666-666666666666', 'youtube_asr', 'en', 1, '[]'::jsonb);

select is(
  (select count(*)::int from public.content_sources where user_id = '66666666-6666-4666-8666-666666666666'),
  1,
  'owner reads own content_sources'
);

select is(
  (select count(*)::int from public.content_transcripts where user_id = '66666666-6666-4666-8666-666666666666'),
  1,
  'owner reads own content_transcripts'
);

-- Switch to the other user: sees nothing, cannot insert under own id the
-- owner's source FK, cannot touch owner's rows.
select set_config('request.jwt.claim.sub', '77777777-7777-4777-8777-777777777777', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"77777777-7777-4777-8777-777777777777","role":"authenticated"}',
  true
);

select is(
  (select count(*)::int from public.content_sources),
  0,
  'other user sees no content_sources rows'
);

select is(
  (select count(*)::int from public.content_transcripts),
  0,
  'other user sees no content_transcripts rows'
);

select throws_ok(
  $$insert into public.content_transcripts (source_id, user_id, origin, language, segmentation_version, sentences)
    values ((select id from _owner_source), '77777777-7777-4777-8777-777777777777', 'youtube_asr', 'en', 1, '[]'::jsonb)$$,
  '42501',
  null,
  'other user cannot attach a transcript to the owner source'
);

select throws_ok(
  $$insert into public.content_sources (user_id, kind, external_id)
    values ('66666666-6666-4666-8666-666666666666', 'youtube', 'aaaaaaaaaaa')$$,
  '42501',
  null,
  'other user cannot insert rows owned by someone else'
);

select * from finish();
rollback;
