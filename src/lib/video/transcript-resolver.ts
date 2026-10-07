/**
 * TranscriptResolver — the single ordered lookup every device runs before
 * deciding a video has no transcript (mission 006).
 *
 * Source order for a signed-in learner:
 *   1. ACCOUNT  — the learner's own `content_transcripts` row (extension
 *      import, upload, paste, or a previous fetch — private per account).
 *   2. LIBRARY  — `shared_transcripts`, the validated public caption
 *      cache served to everyone including guests.
 * Guests skip step 1: they own no rows.
 *
 * Anything the resolver cannot find returns `not_available`; upstream
 * acquisition (server fetch, extension capture, learner paste) is the
 * caller's fallback concern, not the resolver's.
 */

import type { Sentence, TranscriptOrigin } from "./types";
import type { LoadedTranscript } from "@/app/actions/captions";
import type { RightsScope } from "./transcript-resource";

/**
 * Minimal query surface both the Supabase server client and test fakes
 * satisfy — Postgrest builders are thenables (PromiseLike), not Promises.
 * Keeping this interface structural and tiny avoids importing the full
 * client type into a unit-testable module.
 */
export interface TranscriptQuery {
  eq(column: string, value: unknown): TranscriptQuery;
  maybeSingle(): PromiseLike<{ data: unknown }>;
}

export interface TranscriptStore {
  from(table: string): { select(columns: string): TranscriptQuery };
}

export type ResolveResult =
  | { status: "found"; transcript: LoadedTranscript; scope: RightsScope }
  | { status: "not_available" };

interface SourceRow {
  id: string;
  title: string | null;
  channel: string | null;
  duration_ms: number | null;
}

interface TranscriptRow {
  origin: string;
  language: string;
  sentences: unknown;
  segmentation_version: number;
}

function trackKindFor(origin: TranscriptOrigin): "manual" | "asr" | "learner" {
  if (origin === "youtube_asr") return "asr";
  if (origin === "youtube_manual") return "manual";
  return "learner";
}

function rowToTranscript(
  row: TranscriptRow,
  meta: {
    title?: string | null;
    channel?: string | null;
    duration_ms?: number | null;
  },
  saved: boolean,
): LoadedTranscript | null {
  const sentences = row.sentences as unknown as Sentence[] | undefined;
  if (!Array.isArray(sentences) || sentences.length === 0) return null;
  return {
    sentences,
    origin: row.origin as TranscriptOrigin,
    language: row.language,
    segmentationVersion: row.segmentation_version,
    trackKind: trackKindFor(row.origin as TranscriptOrigin),
    title: meta.title ?? undefined,
    channel: meta.channel ?? undefined,
    durationMs: meta.duration_ms ?? undefined,
    saved,
  };
}

/**
 * Resolve the best available transcript for `videoId`. Pass `userId` when
 * the request is authenticated; pass `null` for guests.
 */
export async function resolveTranscript(
  store: TranscriptStore,
  videoId: string,
  userId: string | null,
): Promise<ResolveResult> {
  if (userId) {
    const { data: source } = await store
      .from("content_sources")
      .select("id, title, channel, duration_ms")
      .eq("user_id", userId)
      .eq("kind", "youtube")
      .eq("external_id", videoId)
      .maybeSingle();
    if (source) {
      const { data: transcript } = await store
        .from("content_transcripts")
        .select("origin, language, sentences, segmentation_version")
        .eq("source_id", (source as SourceRow).id)
        .maybeSingle();
      const loaded = transcript
        ? rowToTranscript(
            transcript as TranscriptRow,
            source as SourceRow,
            /* saved */ true,
          )
        : null;
      if (loaded) {
        return { status: "found", transcript: loaded, scope: "account" };
      }
    }
  }

  const { data: shared } = await store
    .from("shared_transcripts")
    .select(
      "origin, language, sentences, segmentation_version, title, channel, duration_ms",
    )
    .eq("video_id", videoId)
    .maybeSingle();
  const sharedLoaded = shared
    ? rowToTranscript(
        shared as TranscriptRow,
        shared as SourceRow,
        /* saved */ false,
      )
    : null;
  if (sharedLoaded) {
    return { status: "found", transcript: sharedLoaded, scope: "library" };
  }

  return { status: "not_available" };
}
