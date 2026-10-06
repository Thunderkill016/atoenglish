"use server";

import { headers } from "next/headers";
import { randomUUID } from "node:crypto";

import { createClient } from "@/lib/supabase/server";
import {
  createRateLimiter,
  getClientIpFromHeaders,
} from "@/lib/security/rate-limit";
import { fetchYoutubeCaptions } from "@/lib/video/captions";
import {
  SEGMENTATION_VERSION,
  segmentTranscript,
} from "@/lib/video/segment";
import { parseSubtitleFile } from "@/lib/video/subtitle-file";
import { YOUTUBE_VIDEO_ID_RE } from "@/lib/video/youtube-url";
import type { Json } from "@/types/supabase";
import type {
  Sentence,
  TranscriptOrigin,
} from "@/lib/video/types";

// SPEC §4.2: fetching captions is a per-learner, explicit-action-only,
// rate-limited operation. 20/hour per user (or per IP for guests) is generous
// for real use while capping upstream exposure; tune on pilot_events data.
const CAPTION_FETCH_LIMIT = 20;
const CAPTION_FETCH_WINDOW_MS = 60 * 60 * 1000;

const captionLimiter = createRateLimiter(
  CAPTION_FETCH_LIMIT,
  CAPTION_FETCH_WINDOW_MS,
  "caption-fetch",
  { rateLimit: "CAPTION_RATE_LIMITER" },
);

export type CaptionActionError =
  | "invalid_url"
  | "no_captions"
  | "blocked"
  | "rate_limited"
  | "unauthorized"
  | "invalid_file"
  | "error";

export interface LoadedTranscript {
  sentences: Sentence[];
  origin: TranscriptOrigin;
  language: string;
  /** Chain step / track kind — surfaced in the UI as "Phụ đề tự động" etc. */
  trackKind: "manual" | "asr" | "learner";
  title?: string;
  channel?: string;
  durationMs?: number;
  /** True when the transcript was persisted to the learner's library. */
  saved: boolean;
}

export type CaptionActionResult =
  | ({ ok: true } & LoadedTranscript)
  | { ok: false; error: CaptionActionError };

async function currentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}

async function rateLimitKey(): Promise<string> {
  const { user } = await currentUser();
  if (user?.id) return `user:${user.id}`;
  const h = await headers();
  return `anon:${getClientIpFromHeaders(h)}`;
}

/** Observability per SPEC §4.2 — outcome counts go to pilot_events. */
async function logCaptionEvent(
  eventName:
    | "caption_fetch_succeeded"
    | "caption_fetch_failed"
    | "caption_fetch_fallback",
  videoId: string,
) {
  try {
    const { supabase, user } = await currentUser();
    await supabase.from("pilot_events").insert({
      event_name: eventName,
      user_id: user?.id ?? null,
      anonymous_id: randomUUID(),
      source: "youtube",
      unit_id: videoId,
    });
  } catch {
    // Telemetry must never break the learning surface.
  }
}

function originForTrack(kind: "manual" | "asr" | "learner"): TranscriptOrigin {
  if (kind === "asr") return "youtube_asr";
  if (kind === "manual") return "youtube_manual";
  return "learner_upload";
}

async function existingTranscript(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  videoId: string,
): Promise<LoadedTranscript | null> {
  const { data: source } = await supabase
    .from("content_sources")
    .select("id, title, channel, duration_ms")
    .eq("user_id", userId)
    .eq("kind", "youtube")
    .eq("external_id", videoId)
    .maybeSingle();
  if (!source) return null;
  const { data: transcript } = await supabase
    .from("content_transcripts")
    .select("origin, language, sentences")
    .eq("source_id", source.id)
    .maybeSingle();
  if (!transcript) return null;
  const sentences = transcript.sentences as unknown as Sentence[];
  if (!Array.isArray(sentences) || sentences.length === 0) return null;
  return {
    sentences,
    origin: transcript.origin as TranscriptOrigin,
    language: transcript.language,
    trackKind:
      transcript.origin === "youtube_asr"
        ? "asr"
        : transcript.origin === "youtube_manual"
          ? "manual"
          : "learner",
    title: source.title ?? undefined,
    channel: source.channel ?? undefined,
    durationMs: source.duration_ms ?? undefined,
    saved: true,
  };
}

async function persistTranscript(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  videoId: string,
  loaded: LoadedTranscript,
) {
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

/**
 * Fetch YouTube captions for a video (SPEC §4.2). Explicit learner action
 * only; an existing stored transcript is returned without any upstream call.
 * Guests can fetch but nothing is persisted (RLS needs an owner).
 */
export async function fetchVideoCaptions(
  videoId: string,
): Promise<CaptionActionResult> {
  if (!YOUTUBE_VIDEO_ID_RE.test(videoId)) {
    return { ok: false, error: "invalid_url" };
  }

  const { success } = await captionLimiter.check(await rateLimitKey());
  if (!success) return { ok: false, error: "rate_limited" };

  const { supabase, user } = await currentUser();
  if (user) {
    const existing = await existingTranscript(supabase, user.id, videoId);
    if (existing) return { ok: true, ...existing };
  }

  const result = await fetchYoutubeCaptions(videoId);
  if (!result.ok) {
    const error =
      result.error === "aborted" || result.error === "error"
        ? "error"
        : result.error;
    await logCaptionEvent("caption_fetch_failed", videoId);
    return { ok: false, error };
  }

  const sentences = segmentTranscript({
    kind: result.track.kind === "asr" ? "asr" : "cues",
    events: result.events,
  });
  if (sentences.length === 0) {
    await logCaptionEvent("caption_fetch_failed", videoId);
    return { ok: false, error: "no_captions" };
  }

  const loaded: LoadedTranscript = {
    sentences,
    origin: originForTrack(result.track.kind),
    language: result.track.languageCode,
    trackKind: result.track.kind,
    title: result.video.title,
    channel: result.video.channel,
    durationMs: result.video.durationMs,
    saved: false,
  };

  if (user) {
    loaded.saved = await persistTranscript(supabase, user.id, videoId, loaded);
  }
  await logCaptionEvent("caption_fetch_succeeded", videoId);
  return { ok: true, ...loaded };
}

/**
 * Persist a learner-pasted/uploaded transcript. Guests parse client-side and
 * are rejected here — persistence needs an owner row (RLS).
 */
export async function saveLearnerTranscript(
  videoId: string,
  rawText: string,
): Promise<CaptionActionResult> {
  if (!YOUTUBE_VIDEO_ID_RE.test(videoId)) {
    return { ok: false, error: "invalid_url" };
  }
  const { supabase, user } = await currentUser();
  if (!user) return { ok: false, error: "unauthorized" };
  if (typeof rawText !== "string" || rawText.length > 1_000_000) {
    return { ok: false, error: "invalid_file" };
  }

  const parsed = parseSubtitleFile(rawText);
  if (parsed.kind === "invalid" || parsed.sentences.length === 0) {
    return { ok: false, error: "invalid_file" };
  }

  const origin: TranscriptOrigin =
    parsed.kind === "plain"
      ? "plain_text"
      : parsed.kind === "timed_paste"
        ? "learner_paste"
        : "learner_upload";

  const loaded: LoadedTranscript = {
    sentences: parsed.sentences,
    origin,
    language: "en",
    trackKind: "learner",
    saved: false,
  };
  loaded.saved = await persistTranscript(supabase, user.id, videoId, loaded);
  await logCaptionEvent("caption_fetch_fallback", videoId);
  return { ok: true, ...loaded };
}

/** Persist playback position for "continue watching" (SPEC §4.4). */
export async function saveWatchPosition(
  videoId: string,
  positionMs: number,
): Promise<void> {
  if (
    !YOUTUBE_VIDEO_ID_RE.test(videoId) ||
    !Number.isFinite(positionMs) ||
    positionMs < 0
  ) {
    return;
  }
  const { supabase, user } = await currentUser();
  if (!user) return;
  await supabase
    .from("content_sources")
    .update({
      last_position_ms: Math.round(positionMs),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("kind", "youtube")
    .eq("external_id", videoId);
}
