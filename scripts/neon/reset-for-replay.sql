-- Reset a cloned branch to a fresh-apply state without touching
-- Neon-managed extensions. `drop schema public cascade` would also drop
-- pg_session_jwt / pgcrypto / vector (they live in `public`) and take the
-- extension-owned `auth` schema with them — so we drop only user-owned
-- objects (anything not extension-dependent).
--
-- `private` is a plain user schema with no extension objects: drop it whole.

drop schema if exists private cascade;
create schema private;

do $$
declare
  r record;
begin
  -- tables, partitioned tables, views, materialized views, foreign tables
  for r in
    select c.relname, c.relkind
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p', 'v', 'm', 'f')
      and not exists (
        select 1 from pg_depend d
        where d.classid = 'pg_class'::regclass
          and d.objid = c.oid
          and d.deptype = 'e'
      )
  loop
    execute format(
      'drop %s if exists public.%I cascade',
      case r.relkind
        when 'v' then 'view'
        when 'm' then 'materialized view'
        when 'f' then 'foreign table'
        else 'table'
      end,
      r.relname
    );
  end loop;

  -- standalone sequences (table-owned ones already went with their tables)
  for r in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'S'
      and not exists (
        select 1 from pg_depend d
        where d.classid = 'pg_class'::regclass
          and d.objid = c.oid
          and d.deptype = 'e'
      )
  loop
    execute format('drop sequence if exists public.%I cascade', r.relname);
  end loop;

  -- functions / procedures (extension-owned excluded via deptype 'e')
  for r in
    select p.oid::regprocedure::text as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and not exists (
        select 1 from pg_depend d
        where d.classid = 'pg_proc'::regclass
          and d.objid = p.oid
          and d.deptype = 'e'
      )
  loop
    execute format('drop function if exists %s cascade', r.sig);
  end loop;

  -- user-defined types: enums, domains, composites
  for r in
    select t.typname
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typtype in ('e', 'd', 'c')
      and not exists (
        select 1 from pg_depend d
        where d.classid = 'pg_type'::regclass
          and d.objid = t.oid
          and d.deptype = 'e'
      )
  loop
    execute format('drop type if exists public.%I cascade', r.typname);
  end loop;
end $$;
