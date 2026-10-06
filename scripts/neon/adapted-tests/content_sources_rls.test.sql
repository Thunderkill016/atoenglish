begin;

create extension if not exists pgtap;
set local search_path = public;

select plan(8);

select ok(
  (select relrowsecurity from pg_class where relname = 'content_sources' and relnamespace = 'public'::regnamespace),
  'content_sources has RLS enabled'
);

select ok(
  (select relrowsecurity from pg_class where relname = 'content_transcripts' and relnamespace = 'public'::regnamespace),
  'content_transcripts has RLS enabled'
);

insert into neon_auth."user" (id, name, email, "emailVerified")
values
  ('66666666-6666-4666-8666-666666666666', 'pgtap', 'cs-owner@atoenglish.test', true),
  ('77777777-7777-4777-8777-777777777777', 'pgtap', 'cs-other@atoenglish.test', true);
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

insert into public.content_sources (user_id, kind, external_id, title)
values ('66666666-6666-4666-8666-666666666666', 'youtube', 'dQw4w9WgXcQ', 't');

insert into public.content_transcripts (source_id, user_id, origin, language, segmentation_version, sentences)
values (1, '66666666-6666-4666-8666-666666666666', 'youtube_asr', 'en', 1, '[]'::jsonb);

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
    values (1, '77777777-7777-4777-8777-777777777777', 'youtube_asr', 'en', 1, '[]'::jsonb)$$,
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
