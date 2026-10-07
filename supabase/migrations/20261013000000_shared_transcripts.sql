-- shared_transcripts: one caption cache row per YouTube video (SPEC §4.2).
-- Captions are public per-video data — the first successful fetch (server
-- chain or extension import) is stored once and served to every learner,
-- guest or signed-in, so "bấm là có" for any video already in the cache.
-- Per-learner copies in content_transcripts remain the personal library
-- (position, ownership); this table is only the shared read-through cache.
--
-- Trust boundary: anonymous can SELECT; writes go through
-- public.upsert_shared_transcript, executable by service_role only — the
-- app validates + segments before calling it, so unauthenticated callers
-- cannot inject transcript content.

create table public.shared_transcripts (
  video_id text primary key check (video_id ~ '^[A-Za-z0-9_-]{11}$'),
  -- Only YouTube-origin captions are shared; learner uploads stay personal.
  origin text not null check (origin in ('youtube_manual', 'youtube_asr')),
  language text not null check (char_length(language) between 1 and 20),
  segmentation_version integer not null,
  sentences jsonb not null,
  title text check (title is null or char_length(title) <= 300),
  channel text check (channel is null or char_length(channel) <= 200),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  fetched_at timestamptz not null default now(),
  -- Same payload bound as content_transcripts (1 MiB, keeps rows off TOAST).
  constraint shared_transcripts_sentences_size
    check (pg_column_size(sentences) <= 1048576)
);

comment on table public.shared_transcripts is
  'Read-through caption cache keyed by YouTube video_id. Public data served to all learners; written only via upsert_shared_transcript after server-side validation+segmentation.';

alter table public.shared_transcripts enable row level security;

-- Anyone can read the cache — this is what makes cached videos instant for
-- guests too. `anonymous` is the Data API role for unauthenticated callers.
create policy "Shared transcripts readable by anyone"
  on public.shared_transcripts
  for select
  to anonymous, authenticated
  using (true);

-- No insert/update/delete policies — all writes flow through the function
-- below, callable by service_role only.

create or replace function public.upsert_shared_transcript(
  p_video_id text,
  p_origin text,
  p_language text,
  p_segmentation_version integer,
  p_sentences jsonb,
  p_title text default null,
  p_channel text default null,
  p_duration_ms integer default null
)
returns void
language plpgsql
set search_path = public
as $$
begin
  insert into public.shared_transcripts (
    video_id, origin, language, segmentation_version,
    sentences, title, channel, duration_ms
  ) values (
    p_video_id, p_origin, p_language, p_segmentation_version,
    p_sentences, p_title, p_channel, p_duration_ms
  )
  on conflict (video_id) do update set
    origin = excluded.origin,
    language = excluded.language,
    segmentation_version = excluded.segmentation_version,
    sentences = excluded.sentences,
    title = excluded.title,
    channel = excluded.channel,
    duration_ms = excluded.duration_ms,
    fetched_at = now();
end;
$$;

-- Lock down EXECUTE — default grants would let any Data API caller write.
revoke execute on function public.upsert_shared_transcript(
  text, text, text, integer, jsonb, text, text, integer
) from public, anon, anonymous, authenticated;

grant execute on function public.upsert_shared_transcript(
  text, text, text, integer, jsonb, text, text, integer
) to service_role;
