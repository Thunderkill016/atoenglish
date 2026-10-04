-- Harden Supabase RPCs, function search paths, and exposed privileges.
-- Keeps current app signatures stable while moving trust checks into Postgres.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

-- Restore columns required by the current completeUnit() server action.
alter table public.user_lesson_progress
  add column if not exists xp_earned integer not null default 0;
alter table public.user_lesson_progress
  add column if not exists created_at timestamptz not null default now();
create unique index if not exists user_lesson_progress_user_id_unit_id_key
  on public.user_lesson_progress (user_id, unit_id);

-- Remove an unnecessary permissive INSERT policy. service_role bypasses RLS.
drop policy if exists "Service role can insert notifications"
  on public.notification_logs;
revoke insert on table public.notification_logs from anon, authenticated;

-- Internal project memories must not be exposed to browser roles.
revoke all on table public.project_memories from anon, authenticated;

-- Move pgvector out of the exposed public schema.
create or replace function public.match_memories(
  query_embedding public.vector,
  match_threshold double precision default 0.70,
  match_count integer default 8,
  filter_project text default null,
  filter_category text default null
)
returns table (
  id bigint,
  content text,
  category text,
  metadata jsonb,
  project text,
  created_at timestamptz,
  similarity double precision
)
language sql
stable
security invoker
set search_path = ''
as $function$
  select
    pm.id,
    pm.content,
    pm.category,
    pm.metadata,
    pm.project,
    pm.created_at,
    (1 - (pm.embedding operator(public.<=>) query_embedding))::double precision as similarity
  from public.project_memories as pm
  where
    (1 - (pm.embedding operator(public.<=>) query_embedding)) > greatest(0.0, least(match_threshold, 1.0))
    and (filter_project is null or pm.project = filter_project)
    and (filter_category is null or pm.category = filter_category)
  order by pm.embedding operator(public.<=>) query_embedding
  limit greatest(1, least(match_count, 50));
$function$;

revoke all on function public.match_memories(public.vector, double precision, integer, text, text)
  from public, anon, authenticated;
grant execute on function public.match_memories(public.vector, double precision, integer, text, text)
  to service_role;

-- Safe trigger helpers and pure helpers: immutable search path.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$function$;

create or replace function public.update_ufp_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$function$;

create or replace function public.update_unit_content_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$function$;

create or replace function public.prune_old_notifications()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  delete from public.notification_logs
  where user_id = new.user_id
    and id not in (
      select nl.id
      from public.notification_logs as nl
      where nl.user_id = new.user_id
      order by nl.created_at desc
      limit 200
    );
  return new;
end;
$function$;

create or replace function public.units_required_for_level(level text)
returns integer
language sql
immutable
security invoker
set search_path = ''
as $function$
  select case level
    when 'A1' then 4
    when 'A2' then 6
    when 'B1' then 8
    when 'B2' then 10
    else 999
  end;
$function$;

create or replace function public.next_cefr_level(level text)
returns text
language sql
immutable
security invoker
set search_path = ''
as $function$
  select case level
    when 'A1' then 'A2'
    when 'A2' then 'B1'
    when 'B1' then 'B2'
    when 'B2' then 'C1'
    else level
  end;
$function$;

create or replace function public.check_cefr_progression()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_current_level text;
  v_completed_count integer;
  v_required integer;
  v_next_level text;
begin
  select up.current_level
    into v_current_level
  from public.user_progress as up
  where up.user_id = new.user_id;

  if v_current_level is null or v_current_level = 'C1' then
    return new;
  end if;

  select count(distinct ulp.unit_id)::integer
    into v_completed_count
  from public.user_lesson_progress as ulp
  where ulp.user_id = new.user_id;

  v_required := public.units_required_for_level(v_current_level);

  if v_completed_count >= v_required then
    v_next_level := public.next_cefr_level(v_current_level);
    update public.user_progress
    set current_level = v_next_level
    where user_id = new.user_id
      and current_level = v_current_level;
  end if;

  return new;
end;
$function$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.users (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_progress (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$function$;

revoke all on function public.handle_new_user()
  from public, anon, authenticated, service_role;
grant execute on function public.handle_new_user()
  to supabase_auth_admin;
