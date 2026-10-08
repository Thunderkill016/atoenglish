/**
 * Account-scope persistence for resolved transcripts (mission 006).
 *
 * Extracted from the captions server action so both the action and the
 * watch-page SSR backfill share one implementation: a library-cached
 * transcript viewed by a signed-in learner becomes their account copy,
 * which is what makes watch-position saving and library ownership work.
 *
 * This module is NOT "use server" — callers pass their own client.
 */

import type { Json } from "@/types/supabase";
import type { createClient } from "@/lib/supabase/server";
import type { LoadedTranscript } from "@/app/actions/captions";
import { SEGMENTATION_VERSION } from "./segment";

type Db = Awaited<ReturnType<typeof createClient>>;

/**
 * Upsert the learner's `content_sources` + `content_transcripts` rows for a
 * video. Returns false on failure — callers treat persistence as
 * best-effort and keep serving the transcript.
 */
export async function persistAccountTranscript(
  supabase: Db,
  userId: string,
  videoId: string,
  loaded: LoadedTranscript,
): Promise<boolean> {
  const { data: source, error: srcError } = await supabase
    .from("content_sources")
    .upsert(
      {
        user_id: userId,
        kind: "youtube",
        external_id: videoId,
        title: loaded.title ?? null,
        channel: loaded.channel ?? null,
        duration_ms: loaded.durationMs ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,kind,external_id" },
    )
    .select("id")
    .single();
  if (srcError || !source) return false;

  const { error: trError } = await supabase.from("content_transcripts").upsert(
    {
      source_id: source.id,
      user_id: userId,
      origin: loaded.origin,
      language: loaded.language,
      segmentation_version: SEGMENTATION_VERSION,
      sentences: loaded.sentences as unknown as Json,
    },
    { onConflict: "source_id" },
  );
  return !trError;
}
