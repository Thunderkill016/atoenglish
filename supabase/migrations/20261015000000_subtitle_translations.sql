-- subtitle_translations: per-account machine-translation cache (mission 008).
-- One Vietnamese line per (user, video, engine profile, cue id). text_hash is
-- the staleness guard: a changed source cue must never silently reuse the old
-- translation. Per-user only — a private transcript's VI must not leak to
-- another account, so there is deliberately no shared/global cache.

create table public.subtitle_translations (
  user_id uuid not null references neon_auth.user(id) on delete cascade,
  video_id text not null check (char_length(video_id) between 1 and 64),
  profile text not null check (char_length(profile) between 1 and 200),
  line_i integer not null check (line_i >= 0),
  -- hex sha-256 of the cue's English text at translate time
  text_hash text not null check (char_length(text_hash) = 64),
  vi text not null check (char_length(vi) between 1 and 6000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, video_id, profile, line_i)
);

comment on table public.subtitle_translations is
  'Per-account machine translation cache for subtitle cues. Keyed by engine profile + source text hash so a different model or changed source never reuses stale output. Cross-device reuse within one account.';

alter table public.subtitle_translations enable row level security;

create policy "Subtitle translations readable by owner"
  on public.subtitle_translations
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Subtitle translations insertable by owner"
  on public.subtitle_translations
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Subtitle translations updatable by owner"
  on public.subtitle_translations
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- No delete: translations are append/upsert only; a source-text change is a
-- different key, not an edit of the old row.
