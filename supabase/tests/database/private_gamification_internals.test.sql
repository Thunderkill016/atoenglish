begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(12);

select ok(
  not has_function_privilege(
    'authenticated',
    to_regprocedure('private.assign_league_for_user_internal(uuid)'),
    'EXECUTE'
  ),
  'authenticated cannot directly execute private league assignment primitive'
);

select ok(
  not has_function_privilege(
    'authenticated',
    to_regprocedure('private.grant_streak_freeze_internal(uuid,integer)'),
    'EXECUTE'
  ),
  'authenticated cannot directly execute private streak-freeze primitive'
);

select ok(
  has_function_privilege(
    'service_role',
    to_regprocedure('private.assign_league_for_user_internal(uuid)'),
    'EXECUTE'
  ),
  'service role retains private league assignment access'
);

select ok(
  has_function_privilege(
    'service_role',
    to_regprocedure('private.grant_streak_freeze_internal(uuid,integer)'),
    'EXECUTE'
  ),
  'service role retains private streak-freeze grant access'
);

select ok(
  has_function_privilege(
    'authenticated',
    to_regprocedure('public.assign_league_for_user(uuid)'),
    'EXECUTE'
  ),
  'authenticated retains the public self-scoped league wrapper'
);

select ok(
  has_function_privilege(
    'authenticated',
    to_regprocedure('public.grant_streak_freeze(uuid,integer)'),
    'EXECUTE'
  ),
  'authenticated retains the public self-scoped streak-freeze wrapper'
);

-- Private schema functions are implementation details. Browser-authenticated callers
-- must cross an explicit public authorization boundary instead of executing any
-- private function directly. This repository-wide invariant prevents a future
-- private mutator from silently recreating the same USAGE + EXECUTE bypass.
select is(
  (
    select count(*)::bigint
    from pg_catalog.pg_proc as p
    join pg_catalog.pg_namespace as n on n.oid = p.pronamespace
    where n.nspname = 'private'
      and has_function_privilege('authenticated', p.oid, 'EXECUTE')
  ),
  0::bigint,
  'authenticated has no direct EXECUTE privilege on any private-schema function'
);

insert into auth.users (id, aud, role, email, created_at, updated_at)
values
  (
    '55555555-5555-4555-8555-555555555555',
    'authenticated',
    'authenticated',
    'gamification-owner@atoenglish.test',
    now(),
    now()
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'authenticated',
    'authenticated',
    'gamification-other@atoenglish.test',
    now(),
    now()
  );

-- Make the other account eligible for a freeze grant so a missing ownership check
-- would produce a visible mutation rather than a harmless no-op.
update public.user_progress
set streak = 7,
    streak_freeze_count = 0
where user_id = '66666666-6666-4666-8666-666666666666'::uuid;

select set_config(
  'request.jwt.claims',
  '{"sub":"55555555-5555-4555-8555-555555555555","role":"authenticated"}',
  true
);
select set_config('request.jwt.claim.sub', '55555555-5555-4555-8555-555555555555', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $$
    select public.assign_league_for_user(
      '55555555-5555-4555-8555-555555555555'::uuid
    )
  $$,
  'authenticated learner can still assign their own league through public wrapper'
);

select throws_ok(
  $$
    select public.assign_league_for_user(
      '66666666-6666-4666-8666-666666666666'::uuid
    )
  $$,
  '42501',
  'not authorized',
  'authenticated learner cannot assign another user through public wrapper'
);

select throws_ok(
  $$
    select public.grant_streak_freeze(
      '66666666-6666-4666-8666-666666666666'::uuid,
      1
    )
  $$,
  '42501',
  'not authorized',
  'authenticated learner cannot grant a streak freeze to another user through public wrapper'
);

reset role;

select is(
  (
    select streak_freeze_count
    from public.user_progress
    where user_id = '66666666-6666-4666-8666-666666666666'::uuid
  ),
  0,
  'denied cross-account streak-freeze call leaves target freeze count unchanged'
);

select is(
  (
    select count(*)::bigint
    from private.streak_freeze_grants
    where user_id = '66666666-6666-4666-8666-666666666666'::uuid
  ),
  0::bigint,
  'denied cross-account streak-freeze call creates no private grant record'
);

select * from finish();
rollback;
