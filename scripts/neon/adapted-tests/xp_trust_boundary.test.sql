begin;

create extension if not exists pgtap;
set local search_path = public;

select plan(7);

select ok(
  not has_function_privilege(
    'authenticated',
    to_regprocedure('public.award_user_xp(uuid,integer,date,date)'),
    'EXECUTE'
  ),
  'authenticated cannot execute arbitrary total-XP award RPC'
);

select ok(
  not has_function_privilege(
    'authenticated',
    to_regprocedure('public.bump_league_xp(uuid,integer)'),
    'EXECUTE'
  ),
  'authenticated cannot execute arbitrary league-XP bump RPC'
);

select ok(
  has_function_privilege(
    'service_role',
    to_regprocedure('public.award_user_xp(uuid,integer,date,date)'),
    'EXECUTE'
  ),
  'service role retains privileged total-XP compatibility access'
);

select ok(
  has_function_privilege(
    'service_role',
    to_regprocedure('public.bump_league_xp(uuid,integer)'),
    'EXECUTE'
  ),
  'service role retains privileged league-XP compatibility access'
);

select ok(
  not has_function_privilege(
    'authenticated',
    to_regprocedure('public.complete_unit_transaction(uuid,text,integer,integer,text)'),
    'EXECUTE'
  ),
  'authenticated cannot bypass checkpoint proof through completion primitive'
);

select ok(
  has_function_privilege(
    'authenticated',
    to_regprocedure('public.claim_unit_checkpoint_transaction(uuid,text,jsonb)'),
    'EXECUTE'
  ),
  'authenticated can submit checkpoint answers to trusted completion boundary'
);

insert into neon_auth."user" (id, name, email, "emailVerified")
values ('44444444-4444-4444-8444-444444444444', 'pgtap', 'xp-boundary@atoenglish.test', true);
-- Neon: no on_auth_user_created trigger — seed user_progress
insert into public.user_progress (user_id)
values ('44444444-4444-4444-8444-444444444444')
on conflict (user_id) do nothing;


select set_config(
  'request.jwt.claims',
  '{"sub":"44444444-4444-4444-8444-444444444444","role":"authenticated"}',
  true
);
set local role authenticated;

select lives_ok(
  $$
    select public.claim_unit_checkpoint_transaction(
      '44444444-4444-4444-8444-444444444444'::uuid,
      'unit-a0-1',
      '{"name":"My name is Lan.","role":"I work as a designer.","ask-name":"What is your name?","repair":"Could you say that again?"}'::jsonb
    )
  $$,
  'database-validated checkpoint completion remains available to authenticated learner'
);

reset role;

select * from finish();
rollback;
