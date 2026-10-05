begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(4);

select ok(
  (select relrowsecurity from pg_class
    where relname = '_neon_migrations'
      and relnamespace = 'public'::regnamespace),
  '_neon_migrations has RLS enabled'
);

select ok(
  not has_table_privilege('authenticated', 'public._neon_migrations', 'SELECT'),
  'authenticated cannot read the migration ledger'
);

select ok(
  not has_table_privilege('anon', 'public._neon_migrations', 'INSERT'),
  'anon cannot insert into the migration ledger'
);

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select set_config('request.jwt.claim.role', 'anon', true);

select throws_ok(
  $$ select count(*)::int from public._neon_migrations $$,
  '42501',
  null,
  'anonymous caller is denied at the privilege layer, not just empty rows'
);

reset role;
select * from finish();
rollback;
