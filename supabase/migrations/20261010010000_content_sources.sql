-- content_sources: learner-owned content items (SPEC §11).
-- One row per (user, kind, external_id). Guests have no rows — anonymous
-- transcripts live client-side only.

create table public.content_sources (
  id bigint generated always as identity primary key,
  user_id uuid not null references neon_auth.user(id) on delete cascade,
  kind text not null check (kind in ('youtube', 'text')),
  external_id text not null check (char_length(external_id) between 1 and 64),
  title text check (title is null or char_length(title) <= 300),
  channel text check (channel is null or char_length(channel) <= 200),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  last_position_ms integer not null default 0 check (last_position_ms >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_sources_user_kind_external_unique
    unique (user_id, kind, external_id),
  -- YouTube ids are exactly 11 chars of [A-Za-z0-9_-]; text sources are free-form hashes.
  constraint content_sources_external_id_shape
    check (kind <> 'youtube' or external_id ~ '^[A-Za-z0-9_-]{11}$')
);

comment on table public.content_sources is
  'Learner-owned content items for the video-first product (mission 005): YouTube videos and pasted text. last_position_ms resumes playback from /discover and /library.';

create index content_sources_user_updated_idx
  on public.content_sources (user_id, updated_at desc);

alter table public.content_sources enable row level security;

create policy "Content sources readable by owner"
  on public.content_sources
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Content sources insertable by owner"
  on public.content_sources
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Content sources updatable by owner"
  on public.content_sources
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Content sources deletable by owner"
  on public.content_sources
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- content_transcripts: one segmented transcript per source (SPEC §11).
-- sentences jsonb shape: [{i, start_ms, end_ms, text, words?, noise?}]

create table public.content_transcripts (
  id bigint generated always as identity primary key,
  source_id bigint not null references public.content_sources(id) on delete cascade,
  user_id uuid not null references neon_auth.user(id) on delete cascade,
  origin text not null check (
    origin in (
      'youtube_manual',
      'youtube_asr',
      'learner_upload',
      'learner_paste',
      'plain_text'
    )
  ),
  language text not null check (char_length(language) between 1 and 20),
  segmentation_version integer not null,
  sentences jsonb not null,
  created_at timestamptz not null default now(),
  constraint content_transcripts_source_unique unique (source_id),
  -- Bounded payload: 1 MiB keeps rows out of TOAST pathologies on the Data API.
  constraint content_transcripts_sentences_size
    check (pg_column_size(sentences) <= 1048576)
);

comment on table public.content_transcripts is
  'Segmented sentence list for a content_sources row. One transcript per source; learner re-upload replaces. segmentation_version allows re-segmenting when rules change.';

create index content_transcripts_user_idx
  on public.content_transcripts (user_id);

alter table public.content_transcripts enable row level security;

create policy "Transcripts readable by owner"
  on public.content_transcripts
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Transcripts insertable by owner"
  on public.content_transcripts
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.content_sources s
      where s.id = source_id and s.user_id = (select auth.uid())
    )
  );

create policy "Transcripts updatable by owner"
  on public.content_transcripts
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.content_sources s
      where s.id = source_id and s.user_id = (select auth.uid())
    )
  );

create policy "Transcripts deletable by owner"
  on public.content_transcripts
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
