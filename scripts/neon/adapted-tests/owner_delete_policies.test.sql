begin;

create extension if not exists pgtap;
set local search_path = public;

select plan(19);

-- Every user-keyed table must grant owner DELETE — a missing policy makes
-- "xoá toàn bộ dữ liệu" silently keep rows behind the learner's back.
with t(name) as (
  values
    ('card_review_logs'),
    ('challenge_results'),
    ('league_memberships'),
    ('learner_skill_states'),
    ('learning_attempts'),
    ('learning_attempts_legacy_202607'),
    ('learning_evidence_events'),
    ('notification_logs'),
    ('pilot_events'),
    ('push_subscriptions'),
    ('quiz_results'),
    ('subtitle_translations'),
    ('user_achievements'),
    ('user_lesson_progress'),
    ('user_onboarding_profile'),
    ('user_progress'),
    ('zero_path_sessions')
)
select ok(
  exists(
    select 1 from pg_policies
    where schemaname = 'public' and tablename = t.name and cmd = 'DELETE'
  ),
  t.name || ' grants owner DELETE'
)
from t;

-- Functional check on a previously insert/select-only table. The other
-- learner's row is seeded before the role switch: a single multi-row INSERT
-- mixing owners would fail the insert WITH CHECK wholesale.
insert into neon_auth."user" (id, name, email, "emailVerified")
values
  ('66666666-6666-4666-8666-666666666666', 'pgtap', 'del-owner@atoenglish.test', true),
  ('77777777-7777-4777-8777-777777777777', 'pgtap', 'del-other@atoenglish.test', true);
-- Neon: no on_auth_user_created trigger — seed user_progress
insert into public.user_progress (user_id)
values ('66666666-6666-4666-8666-666666666666'), ('77777777-7777-4777-8777-777777777777')
on conflict (user_id) do nothing;


insert into public.subtitle_translations
  (user_id, video_id, profile, line_i, text_hash, vi)
values
  ('77777777-7777-4777-8777-777777777777', 'dQw4w9WgXcQ', 'gemini-2.5-flash', 0, repeat('a', 64), 'xin chào');

select set_config(
  'request.jwt.claims',
  '{"sub":"66666666-6666-4666-8666-666666666666","role":"authenticated"}',
  true
);
set local role authenticated;

insert into public.subtitle_translations
  (user_id, video_id, profile, line_i, text_hash, vi)
values
  ('66666666-6666-4666-8666-666666666666', 'dQw4w9WgXcQ', 'gemini-2.5-flash', 0, repeat('a', 64), 'xin chào');

-- RLS makes foreign rows invisible, so this affects zero rows rather than
-- raising — the count check below is what proves the boundary.
delete from public.subtitle_translations
where user_id = '77777777-7777-4777-8777-777777777777';

delete from public.subtitle_translations
where user_id = '66666666-6666-4666-8666-666666666666';

select is(
  (select count(*) from public.subtitle_translations
   where user_id = '66666666-6666-4666-8666-666666666666'),
  0::bigint,
  'owner delete removes own rows'
);

reset role;
select is(
  (select count(*) from public.subtitle_translations
   where user_id = '77777777-7777-4777-8777-777777777777'),
  1::bigint,
  'owner delete cannot touch foreign rows'
);

select * from finish();
rollback;
