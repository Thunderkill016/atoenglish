begin;

create extension if not exists pgtap;
set local search_path = public;

select plan(6);

select ok(
  (select relrowsecurity from pg_class where relname = 'subtitle_translations' and relnamespace = 'public'::regnamespace),
  'subtitle_translations has RLS enabled'
);

insert into neon_auth."user" (id, name, email, "emailVerified")
values
  ('66666666-6666-4666-8666-666666666666', 'pgtap', 'st-owner@atoenglish.test', true),
  ('77777777-7777-4777-8777-777777777777', 'pgtap', 'st-other@atoenglish.test', true);
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

insert into public.subtitle_translations (user_id, video_id, profile, line_i, text_hash, vi)
values ('66666666-6666-4666-8666-666666666666', 'vid1', 'p1', 0, repeat('a', 64), 'xin chào');

select is(
  (select count(*)::int from public.subtitle_translations where video_id = 'vid1'),
  1,
  'owner can read own cached translation'
);

-- Write-through upsert on the natural PK refreshes the cached line in place
insert into public.subtitle_translations (user_id, video_id, profile, line_i, text_hash, vi)
values ('66666666-6666-4666-8666-666666666666', 'vid1', 'p1', 0, repeat('b', 64), 'xin chào mới')
on conflict (user_id, video_id, profile, line_i)
do update set vi = excluded.vi, text_hash = excluded.text_hash, updated_at = now();

select is(
  (select vi from public.subtitle_translations where line_i = 0),
  'xin chào mới',
  'owner upsert refreshes the cached line'
);

-- Non-owner sees nothing and cannot insert for someone else
select set_config(
  'request.jwt.claims',
  '{"sub":"77777777-7777-4777-8777-777777777777","role":"authenticated"}',
  true
);
select is(
  (select count(*)::int from public.subtitle_translations where video_id = 'vid1'),
  0,
  'non-owner cannot read another learner''s cached translations'
);

select throws_ok(
  $$
    insert into public.subtitle_translations (user_id, video_id, profile, line_i, text_hash, vi)
    values ('66666666-6666-4666-8666-666666666666', 'vid1', 'p1', 1, repeat('c', 64), 'x')
  $$,
  '42501',
  null,
  'non-owner cannot insert a translation under another user_id'
);

-- Guests never touch the persisted cache — anon role sees nothing
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select is(
  (select count(*)::int from public.subtitle_translations),
  0,
  'anonymous role sees no cached translations'
);

select * from finish();
rollback;
