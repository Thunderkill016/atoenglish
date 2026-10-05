begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(15);

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

-- ATO-003: stat columns locked, preferences writable, inserts bounded ─────────

select ok(
  not has_column_privilege(
    'authenticated',
    'public.user_progress',
    'total_xp',
    'UPDATE'
  ),
  'authenticated cannot UPDATE user_progress.total_xp directly'
);

select ok(
  not has_column_privilege(
    'authenticated',
    'public.user_progress',
    'current_level',
    'UPDATE'
  ),
  'authenticated cannot UPDATE user_progress.current_level directly'
);

select ok(
  not has_column_privilege(
    'authenticated',
    'public.user_progress',
    'streak',
    'UPDATE'
  ),
  'authenticated cannot UPDATE user_progress.streak directly'
);

select ok(
  has_column_privilege(
    'authenticated',
    'public.user_progress',
    'daily_xp_goal',
    'UPDATE'
  ),
  'authenticated retains UPDATE on preference column daily_xp_goal'
);

select ok(
  has_function_privilege(
    'authenticated',
    to_regprocedure('public.apply_placement_result(text,integer,integer,date)'),
    'EXECUTE'
  ),
  'authenticated can persist placement results through guarded RPC'
);

select ok(
  not has_function_privilege(
    'anon',
    to_regprocedure('public.apply_placement_result(text,integer,integer,date)'),
    'EXECUTE'
  ),
  'anonymous callers cannot execute apply_placement_result'
);

insert into auth.users (id, aud, role, email, created_at, updated_at)
values (
  '44444444-4444-4444-8444-444444444444',
  'authenticated',
  'authenticated',
  'xp-boundary@atoenglish.test',
  now(),
  now()
);

select set_config(
  'request.jwt.claims',
  '{"sub":"44444444-4444-4444-8444-444444444444","role":"authenticated"}',
  true
);
select set_config('request.jwt.claim.sub', '44444444-4444-4444-8444-444444444444', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
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

-- ATO-003 behavioral checks as the authenticated role
select throws_ok(
  $$
    update public.user_progress
    set total_xp = 999999, current_level = 'C1', streak = 9999
    where user_id = '44444444-4444-4444-8444-444444444444'
  $$,
  '42501',
  null,
  'authenticated caller cannot forge stat columns via direct UPDATE'
);

select throws_ok(
  $$
    insert into public.user_progress (user_id, current_level, streak, total_xp, best_streak)
    values ('44444444-4444-4444-8444-444444444444', 'C1', 999, 999999, 999)
  $$,
  '42501',
  null,
  'authenticated caller cannot provision a pre-forged progress row'
);

reset role;

select * from finish();
rollback;
