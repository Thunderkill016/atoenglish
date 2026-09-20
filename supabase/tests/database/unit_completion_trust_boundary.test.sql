begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(6);

insert into auth.users (id, aud, role, email, created_at, updated_at)
values (
  '55555555-5555-4555-8555-555555555555',
  'authenticated',
  'authenticated',
  'completion-boundary@atoenglish.test',
  now(),
  now()
);

select set_config(
  'request.jwt.claims',
  '{"sub":"55555555-5555-4555-8555-555555555555","role":"authenticated"}',
  true
);
select set_config('request.jwt.claim.sub', '55555555-5555-4555-8555-555555555555', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
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

select * from finish();
rollback;
