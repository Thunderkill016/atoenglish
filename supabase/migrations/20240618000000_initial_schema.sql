-- =============================================================================
-- AtoEnglish — Initial Database Schema
-- Run in Supabase SQL Editor or via: supabase db push
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Custom types
-- ---------------------------------------------------------------------------
create type public.cefr_level as enum ('A1', 'A2', 'B1', 'B2', 'C1');

-- ---------------------------------------------------------------------------
-- 1. users — extends Supabase Auth (neon_auth.user)
-- ---------------------------------------------------------------------------
create table public.users (
  id          uuid primary key references neon_auth.user (id) on delete cascade,
  email       text not null,
  display_name text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.users is 'Application profile linked 1:1 with neon_auth.user';

-- ---------------------------------------------------------------------------
-- 2. user_progress — learning roadmap & gamification
-- ---------------------------------------------------------------------------
create table public.user_progress (
  user_id       uuid primary key references public.users (id) on delete cascade,
  current_level public.cefr_level not null default 'A1',
  streak        integer not null default 0 check (streak >= 0),
  total_xp      integer not null default 0 check (total_xp >= 0),
  last_active   timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. cards — flashcards with SRS metadata
-- ---------------------------------------------------------------------------
create table public.cards (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users (id) on delete cascade,
  word          text not null,
  phonetic      text,
  meaning_vn    text not null,
  example_en    text,
  topic         text,
  level         public.cefr_level not null default 'A1',
  interval      integer not null default 0 check (interval >= 0),
  ease_factor   numeric(4, 2) not null default 2.50 check (ease_factor >= 1.30),
  due_date      timestamptz not null default now(),
  repetitions   integer not null default 0 check (repetitions >= 0),
  last_reviewed timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index cards_user_id_idx on public.cards (user_id);
create index cards_due_date_idx on public.cards (user_id, due_date);
create index cards_topic_idx on public.cards (user_id, topic);

-- ---------------------------------------------------------------------------
-- 4. lesson_history — completed lessons
-- ---------------------------------------------------------------------------
create table public.lesson_history (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users (id) on delete cascade,
  lesson_id    text not null,
  completed_at timestamptz not null default now(),
  score        numeric(5, 2) check (score >= 0 and score <= 100),
  created_at   timestamptz not null default now()
);

create index lesson_history_user_id_idx on public.lesson_history (user_id);
create index lesson_history_lesson_id_idx on public.lesson_history (user_id, lesson_id);

-- ---------------------------------------------------------------------------
-- 5. user_sentences — user-added example sentences
-- ---------------------------------------------------------------------------
create table public.user_sentences (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  sentence_en text not null,
  meaning_vn  text not null,
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index user_sentences_user_id_idx on public.user_sentences (user_id);
create index user_sentences_tags_idx on public.user_sentences using gin (tags);

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger user_progress_set_updated_at
  before update on public.user_progress
  for each row execute function public.set_updated_at();

create trigger cards_set_updated_at
  before update on public.cards
  for each row execute function public.set_updated_at();

create trigger user_sentences_set_updated_at
  before update on public.user_sentences
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-provision users + user_progress on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );

  insert into public.user_progress (user_id)
  values (new.id);

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS)
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.user_progress enable row level security;
alter table public.cards enable row level security;
alter table public.lesson_history enable row level security;
alter table public.user_sentences enable row level security;

-- users
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- user_progress
create policy "Users can view own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

-- cards
create policy "Users can view own cards"
  on public.cards for select
  using (auth.uid() = user_id);

create policy "Users can insert own cards"
  on public.cards for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cards"
  on public.cards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own cards"
  on public.cards for delete
  using (auth.uid() = user_id);

-- lesson_history
create policy "Users can view own lesson history"
  on public.lesson_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own lesson history"
  on public.lesson_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update own lesson history"
  on public.lesson_history for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own lesson history"
  on public.lesson_history for delete
  using (auth.uid() = user_id);

-- user_sentences
create policy "Users can view own sentences"
  on public.user_sentences for select
  using (auth.uid() = user_id);

create policy "Users can insert own sentences"
  on public.user_sentences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sentences"
  on public.user_sentences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own sentences"
  on public.user_sentences for delete
  using (auth.uid() = user_id);