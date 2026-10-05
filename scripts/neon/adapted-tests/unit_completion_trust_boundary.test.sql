begin;

create extension if not exists pgtap;
set local search_path = public;

select plan(11);

insert into neon_auth."user" (id, name, email, "emailVerified")
values ('55555555-5555-4555-8555-555555555555', 'pgtap', 'completion-boundary@atoenglish.test', true);
-- Neon: no on_auth_user_created trigger — seed user_progress
insert into public.user_progress (user_id)
values ('55555555-5555-4555-8555-555555555555')
on conflict (user_id) do nothing;


select set_config(
  'request.jwt.claims',
  '{"sub":"55555555-5555-4555-8555-555555555555","role":"authenticated"}',
  true
);
set local role authenticated;

select throws_ok(
  $$
    select public.complete_unit_transaction(
      '55555555-5555-4555-8555-555555555555'::uuid,
      'unit-a0-2',
      60,
      3,
      '2099-01-01'
    )
  $$,
  '42501',
  null,
  'authenticated caller cannot directly assert unit completion and stars'
);

select is(
  (
    public.claim_unit_checkpoint_transaction(
      '55555555-5555-4555-8555-555555555555'::uuid,
      'unit-a0-2',
      '{"price":"wrong","take":"wrong","payment":"wrong","repeat":"wrong"}'::jsonb
    ) ->> 'passed'
  )::boolean,
  false,
  'failed checkpoint does not produce completion'
);

reset role;

select is(
  (
    select count(*)::integer
    from public.user_lesson_progress
    where user_id = '55555555-5555-4555-8555-555555555555'::uuid
      and unit_id = 'unit-a0-2'
  ),
  0,
  'failed checkpoint leaves authoritative lesson progress unchanged'
);

set local role authenticated;

select is(
  (
    public.claim_unit_checkpoint_transaction(
      '55555555-5555-4555-8555-555555555555'::uuid,
      'unit-a0-2',
      '{"price":"How much is this?","take":"I''ll take it.","payment":"Can I pay by card?","repeat":"wrong"}'::jsonb
    ) ->> 'stars'
  )::integer,
  2,
  'database derives two stars from a passing non-perfect checkpoint'
);

reset role;

select is(
  (
    select xp_earned
    from public.user_lesson_progress
    where user_id = '55555555-5555-4555-8555-555555555555'::uuid
      and unit_id = 'unit-a0-2'
  ),
  51,
  'database derives authoritative XP from trusted checkpoint result'
);

select is(
  (
    select total_xp
    from public.user_progress
    where user_id = '55555555-5555-4555-8555-555555555555'::uuid
  ),
  51,
  'trusted checkpoint result is the only completion XP applied to progress'
);

-- ATO-004: direct writes on user_lesson_progress are denied ──────────────────

set local role authenticated;

select throws_ok(
  $$
    insert into public.user_lesson_progress (user_id, unit_id, xp_earned)
    values ('55555555-5555-4555-8555-555555555555', 'unit-b2-10', 99999)
  $$,
  '42501',
  null,
  'authenticated caller cannot insert forged unit completions'
);

select throws_ok(
  $$
    update public.user_lesson_progress
    set xp_earned = 1
    where user_id = '55555555-5555-4555-8555-555555555555'
  $$,
  '42501',
  null,
  'authenticated caller cannot rewrite completion rows'
);

select throws_ok(
  $$
    delete from public.user_lesson_progress
    where user_id = '55555555-5555-4555-8555-555555555555'
  $$,
  '42501',
  null,
  'authenticated caller cannot erase completion evidence'
);

select lives_ok(
  $$
    select public.reset_unit_progress('unit-a0-2')
  $$,
  'authenticated caller can reset own progress through the bound RPC'
);

reset role;

select is(
  (
    select count(*)::integer
    from public.user_lesson_progress
    where user_id = '55555555-5555-4555-8555-555555555555'::uuid
      and unit_id = 'unit-a0-2'
  ),
  0,
  'reset_unit_progress removed only the caller-scoped row'
);

select * from finish();
rollback;
