-- Extension imports can now seed the shared cache (signed-in learners only,
-- after server-side plausibility checks). imported_via keeps the provenance
-- audit trail so extension-sourced rows can be reviewed/removed separately
-- from server-fetched ones if poisoning is ever suspected.

alter table public.shared_transcripts
  add column imported_via text not null default 'server'
    check (imported_via in ('server', 'extension'));

-- The signature changes, so the old function is dropped and recreated rather
-- than overloaded.
drop function public.upsert_shared_transcript(
  text, text, text, integer, jsonb, text, text, integer
);

create function public.upsert_shared_transcript(
  p_video_id text,
  p_origin text,
  p_language text,
  p_segmentation_version integer,
  p_sentences jsonb,
  p_title text default null,
  p_channel text default null,
  p_duration_ms integer default null,
  p_imported_via text default 'server'
)
returns void
language plpgsql
set search_path = public
as $$
begin
  insert into public.shared_transcripts (
    video_id, origin, language, segmentation_version,
    sentences, title, channel, duration_ms, imported_via
  ) values (
    p_video_id, p_origin, p_language, p_segmentation_version,
    p_sentences, p_title, p_channel, p_duration_ms, p_imported_via
  )
  on conflict (video_id) do update set
    origin = excluded.origin,
    language = excluded.language,
    segmentation_version = excluded.segmentation_version,
    sentences = excluded.sentences,
    title = excluded.title,
    channel = excluded.channel,
    duration_ms = excluded.duration_ms,
    imported_via = excluded.imported_via,
    fetched_at = now();
end;
$$;

revoke execute on function public.upsert_shared_transcript(
  text, text, text, integer, jsonb, text, text, integer, text
) from public, anon, anonymous, authenticated;

grant execute on function public.upsert_shared_transcript(
  text, text, text, integer, jsonb, text, text, integer, text
) to service_role;
