"use server";

import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { rpcService } from "@/lib/supabase/service";
import {
  createRateLimiter,
  getClientIpFromHeaders,
} from "@/lib/security/rate-limit";
import { fetchYoutubeCaptions } from "@/lib/video/captions";
import {
  SEGMENTATION_VERSION,
  isStaleSegmentation,
  segmentTranscript,
} from "@/lib/video/segment";
import { alignHumanTranslation } from "@/lib/video/align-translation";
import {
  payloadToTranscript,
  validateCaptionsPayload,
  type CaptionsPayload,
} from "@/lib/video/extension-bridge";
import { parseSubtitleFile } from "@/lib/video/subtitle-file";
import { persistAccountTranscript } from "@/lib/video/persist-transcript";
import { YOUTUBE_VIDEO_ID_RE } from "@/lib/video/youtube-url";
import type { Sentence, TranscriptOrigin } from "@/lib/video/types";

// Caption intake runs once on opening a video, or on explicit retry:
// rate-limited operation enforced in TWO layers — the CF binding alone does
// NOT enforce the quota:
//  - burst: CAPTION_RATE_LIMITER native binding (5/min distributed ceiling —
//    its simple.period only supports 10s|60s windows; cloudflare.config.ts);
//  - hourly: the real 20/hour per-user (per-IP for guests) quota via Upstash,
//    falling back to per-isolate in-memory — same caveat as the auth limiter:
//    without Upstash it's ineffective under Cloudflare isolate fan-out.
// 20/hour is generous for real use while capping upstream exposure; tune on
// pilot_events data.
const CAPTION_FETCH_LIMIT = 20;
const CAPTION_FETCH_WINDOW_MS = 60 * 60 * 1000;
// Mirrors CAPTION_RATE_LIMITER's simple.limit/period in cloudflare.config.ts.
const CAPTION_BURST_LIMIT = 5;
const CAPTION_BURST_WINDOW_MS = 60 * 1000;
/** Ceiling on the whole upstream chain — a stalled socket must not hang the
 * action. Lib maps the timeout abort to { error: "aborted" } → "error". */
const UPSTREAM_TIMEOUT_MS = 20_000;

const captionBurstLimiter = createRateLimiter(
  CAPTION_BURST_LIMIT,
  CAPTION_BURST_WINDOW_MS,
  "caption-burst",
  { rateLimit: "CAPTION_RATE_LIMITER" },
);
const captionHourlyLimiter = createRateLimiter(
  CAPTION_FETCH_LIMIT,
  CAPTION_FETCH_WINDOW_MS,
  // Distinct key prefix — must not share Upstash/memory counters with burst.
  "caption-hourly",
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
  segmentationVersion?: number;
  /** Chain step / track kind — surfaced in the UI as "Phụ đề tự động" etc. */
  trackKind: "manual" | "asr" | "learner";
  title?: string;
  channel?: string;
  durationMs?: number;
  /** True when the transcript was persisted to the learner's library. */
  saved: boolean;
  /**
   * Cached YouTube transcript segmented under older rules — usable
   * immediately, but a background refetch may upgrade it. Never set on
   * learner-authored content (no upstream to upgrade from).
   */
  stale?: boolean;
}

export type CaptionActionResult =
  | ({ ok: true } & LoadedTranscript)
  | { ok: false; error: CaptionActionError };

async function currentUser() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return { supabase, user: data.user };
  } catch {
    // Auth/env failure (e.g. preview deploy without worker secrets) must not
    // kill caption fetching — degrade to guest: the YouTube chain still runs,
    // persist/telemetry simply skip (they need supabase anyway).
    return { supabase: null, user: null };
  }
}

/** Neon Auth getUser() can be a network round-trip — resolve once per action
 * and pass the context through instead of re-calling per helper. */
type AuthContext = Awaited<ReturnType<typeof currentUser>>;

async function rateLimitKey(user: AuthContext["user"]): Promise<string> {
  if (user?.id) return `user:${user.id}`;
  const h = await headers();
  return `anon:${getClientIpFromHeaders(h)}`;
}

/** Observability per SPEC §4.2 — outcome counts go to pilot_events. */
async function logCaptionEvent(
  { supabase, user }: AuthContext,
  eventName:
    | "caption_fetch_succeeded"
    | "caption_fetch_failed"
    | "caption_fetch_fallback",
  videoId: string,
) {
  if (!supabase) return;
  try {
    await supabase.from("pilot_events").insert({
      event_name: eventName,
      user_id: user?.id ?? null,
      anonymous_id: crypto.randomUUID(),
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
    .select("origin, language, sentences, segmentation_version")
    .eq("source_id", source.id)
    .maybeSingle();
  if (!transcript) return null;
  const sentences = transcript.sentences as unknown as Sentence[];
  if (!Array.isArray(sentences) || sentences.length === 0) return null;
  return {
    sentences,
    origin: transcript.origin as TranscriptOrigin,
    language: transcript.language,
    segmentationVersion: transcript.segmentation_version,
    trackKind:
      transcript.origin === "youtube_asr"
        ? "asr"
        : transcript.origin === "youtube_manual"
          ? "manual"
          : "learner",
    title: source.title ?? undefined,
    channel: source.channel ?? undefined,
    durationMs: source.duration_ms ?? undefined,
    stale:
      isStaleSegmentation(transcript.origin, transcript.segmentation_version) ||
      undefined,
    saved: true,
  };
}

async function persistTranscript(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  videoId: string,
  loaded: LoadedTranscript,
) {
  return persistAccountTranscript(supabase, userId, videoId, loaded);
}

/**
 * The shared caption cache: one public row per video, served to every
 * learner. Only YouTube-origin transcripts go in — learner uploads/pastes
 * stay per-user. Reads work for guests (RLS select is public); writes go
 * through the service RPC so callers can't inject transcript content.
 */
async function readSharedTranscript(
  supabase: Awaited<ReturnType<typeof createClient>>,
  videoId: string,
): Promise<LoadedTranscript | null> {
  const { data: shared } = await supabase
    .from("shared_transcripts")
    .select(
      "origin, language, sentences, segmentation_version, title, channel, duration_ms",
    )
    .eq("video_id", videoId)
    .maybeSingle();
  if (!shared) return null;
  const sentences = shared.sentences as unknown as Sentence[];
  if (!Array.isArray(sentences) || sentences.length === 0) return null;
  return {
    sentences,
    origin: shared.origin as TranscriptOrigin,
    language: shared.language,
    segmentationVersion: shared.segmentation_version,
    trackKind: shared.origin === "youtube_asr" ? "asr" : "manual",
    title: shared.title ?? undefined,
    channel: shared.channel ?? undefined,
    durationMs: shared.duration_ms ?? undefined,
    stale:
      isStaleSegmentation(shared.origin, shared.segmentation_version) ||
      undefined,
    saved: false,
  };
}

/**
 * Upsert the shared cache. Best-effort — a failed cache write must never
 * fail the learner's fetch, so the result is only returned, not thrown.
 */
async function shareTranscript(
  videoId: string,
  loaded: LoadedTranscript,
  importedVia: "server" | "extension" = "server",
) {
  if (loaded.origin !== "youtube_manual" && loaded.origin !== "youtube_asr") {
    return;
  }
  await rpcService("upsert_shared_transcript", {
    p_video_id: videoId,
    p_origin: loaded.origin,
    p_language: loaded.language,
    p_segmentation_version: SEGMENTATION_VERSION,
    // Bound SQL params map JS arrays to PG arrays, not jsonb — the JSON
    // string is what the jsonb input function accepts (verified live: raw
    // array fails with "invalid input syntax for type json").
    p_sentences: JSON.stringify(loaded.sentences),
    p_title: loaded.title ?? null,
    p_channel: loaded.channel ?? null,
    p_duration_ms: loaded.durationMs ?? null,
    p_imported_via: importedVia,
  });
}

/** A real YouTube transcript has more than a handful of segmented lines. */
const MIN_SHARED_SENTENCES = 5;
/** Slack before a transcript can plausibly outlast the video duration. */
const DURATION_SLACK_MS = 60_000;

/**
 * Cheap attestation for a browser-imported transcript before it may seed the
 * public cache: YouTube timedtext always carries monotonically ordered timing
 * on every line, and the text must stay inside the video's own duration. A
 * crafted payload that fails these stays private to the importing learner —
 * the checks catch junk, not a determined attacker, which is why only
 * signed-in imports may share and every row keeps its imported_via marker.
 */
function plausibleYoutubeTranscript(loaded: LoadedTranscript) {
  if (!/^en(?:[-_]|$)/i.test(loaded.language)) return false;
  if (loaded.sentences.length < MIN_SHARED_SENTENCES) return false;
  let previous = -Infinity;
  for (const sentence of loaded.sentences) {
    if (sentence.start_ms === null || sentence.start_ms < previous) {
      return false;
    }
    previous = sentence.start_ms;
  }
  if (
    loaded.durationMs !== undefined &&
    previous > loaded.durationMs + DURATION_SLACK_MS
  ) {
    return false;
  }
  return true;
}

/**
 * Fetch YouTube captions for a visited video. Existing private/shared
 * captions return without upstream acquisition. Guests have no private
 * library writes; successful server acquisition can enrich the public cache.
 */
export async function fetchVideoCaptions(
  videoId: string,
): Promise<CaptionActionResult> {
  if (!YOUTUBE_VIDEO_ID_RE.test(videoId)) {
    return { ok: false, error: "invalid_url" };
  }

  // One auth resolution feeds the rate-limit key, the transcript cache check
  // and telemetry — getUser() may hit Neon Auth on every call.
  const ctx = await currentUser();
  const key = await rateLimitKey(ctx.user);
  // Hourly first: a user already past the quota shouldn't burn burst-binding
  // slots on the edge.
  const hourly = await captionHourlyLimiter.check(key);
  if (!hourly.success) return { ok: false, error: "rate_limited" };
  const burst = await captionBurstLimiter.check(key);
  if (!burst.success) return { ok: false, error: "rate_limited" };

  const { supabase, user } = ctx;
  // Soft invalidation: a YouTube transcript segmented under older rules is
  // served as-is when nothing better exists, but does not end the lookup —
  // the upstream chain still runs so blob-era rows upgrade themselves.
  let staleFallback: LoadedTranscript | null = null;
  if (user && supabase) {
    const existing = await existingTranscript(supabase, user.id, videoId);
    if (existing) {
      if (!isStaleSegmentation(existing.origin, existing.segmentationVersion))
        return { ok: true, ...existing };
      staleFallback = existing;
    }
  }
  if (supabase) {
    // Shared cache: any earlier fetch — by anyone — makes this instant and
    // never touches YouTube again. A fresh shared row beats a stale private
    // copy; a stale shared row only replaces the fallback.
    const shared = await readSharedTranscript(supabase, videoId);
    if (shared) {
      if (!isStaleSegmentation(shared.origin, shared.segmentationVersion)) {
        if (user) {
          shared.saved = await persistTranscript(
            supabase,
            user.id,
            videoId,
            shared,
          );
        }
        return { ok: true, ...shared };
      }
      staleFallback ??= shared;
    }
  }

  const result = await fetchYoutubeCaptions(videoId, {
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!result.ok) {
    const error =
      result.error === "aborted" || result.error === "error"
        ? "error"
        : result.error;
    await logCaptionEvent(ctx, "caption_fetch_failed", videoId);
    // pilot_events has no metadata column, so the per-route refusal detail
    // goes to Worker logs (Workers Observability) for diagnosis.
    console.warn("caption_fetch_failed", {
      videoId,
      error: result.error,
      detail: result.detail,
    });
    // Refetching a stale cached row must never regress to an error screen —
    // the old segmentation is still better than none.
    if (staleFallback) return { ok: true, ...staleFallback };
    return { ok: false, error };
  }

  const sentences = segmentTranscript({
    kind: result.track.kind === "asr" ? "asr" : "cues",
    events: result.events,
  });
  if (sentences.length === 0) {
    await logCaptionEvent(ctx, "caption_fetch_failed", videoId);
    if (staleFallback) return { ok: true, ...staleFallback };
    return { ok: false, error: "no_captions" };
  }

  const loaded: LoadedTranscript = {
    sentences: result.viEvents
      ? alignHumanTranslation(sentences, result.viEvents, result.events)
      : sentences,
    origin: originForTrack(result.track.kind),
    language: result.track.languageCode,
    segmentationVersion: SEGMENTATION_VERSION,
    trackKind: result.track.kind,
    title: result.video.title,
    channel: result.video.channel,
    // Upstream lengthSeconds can parse to NaN — never persist it.
    durationMs: Number.isFinite(result.video.durationMs)
      ? result.video.durationMs
      : undefined,
    saved: false,
  };

  if (user && supabase) {
    loaded.saved = await persistTranscript(supabase, user.id, videoId, loaded);
  }
  // A successful upstream fetch enriches the shared cache for everyone —
  // even when this caller is a guest (service RPC writes, not the user).
  await shareTranscript(videoId, loaded);
  await logCaptionEvent(ctx, "caption_fetch_succeeded", videoId);
  return { ok: true, ...loaded };
}

/**
 * Persist a transcript imported by the browser extension (SPEC §4.2 fallback —
 * collection ran inside the user's YouTube session; that collection can
 * still be refused). The payload is untrusted:
 * re-validated and re-segmented here before anything is stored.
 */
export async function importYoutubeCaptions(
  videoId: string,
  rawPayload: unknown,
): Promise<CaptionActionResult> {
  if (!YOUTUBE_VIDEO_ID_RE.test(videoId)) {
    return { ok: false, error: "invalid_url" };
  }
  const ctx = await currentUser();
  const { supabase, user } = ctx;
  if (!user || !supabase) return { ok: false, error: "unauthorized" };

  const key = await rateLimitKey(user);
  const hourly = await captionHourlyLimiter.check(key);
  if (!hourly.success) return { ok: false, error: "rate_limited" };

  const payload: CaptionsPayload | null = validateCaptionsPayload(rawPayload);
  if (!payload || payload.videoId !== videoId) {
    return { ok: false, error: "invalid_file" };
  }
  const parsed = payloadToTranscript(payload);
  if (!parsed) return { ok: false, error: "no_captions" };

  const loaded: LoadedTranscript = {
    sentences: parsed.sentences,
    origin: originForTrack(parsed.trackKind),
    language: parsed.language,
    segmentationVersion: SEGMENTATION_VERSION,
    trackKind: parsed.trackKind,
    title: payload.title,
    channel: payload.channel,
    durationMs: Number.isFinite(payload.durationMs)
      ? payload.durationMs
      : undefined,
    saved: false,
  };
  loaded.saved = await persistTranscript(supabase, user.id, videoId, loaded);
  // Browser payloads are untrusted even after shape checks, so only imports
  // that pass the plausibility gate enrich the shared cache — marked
  // imported_via='extension' for audit. Anything implausible stays private.
  if (plausibleYoutubeTranscript(loaded)) {
    await shareTranscript(videoId, loaded, "extension");
  }
  await logCaptionEvent(ctx, "caption_fetch_fallback", videoId);
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
  const ctx = await currentUser();
  const { supabase, user } = ctx;
  if (!user || !supabase) return { ok: false, error: "unauthorized" };
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
    segmentationVersion: SEGMENTATION_VERSION,
    trackKind: "learner",
    saved: false,
  };
  loaded.saved = await persistTranscript(supabase, user.id, videoId, loaded);
  await logCaptionEvent(ctx, "caption_fetch_fallback", videoId);
  return { ok: true, ...loaded };
}

/** Persist playback position for "continue watching" (SPEC §4.4). */
export type WatchPositionResult =
  | { ok: true }
  | {
      ok: false;
      error: "invalid_input" | "unauthorized" | "not_saved" | "error";
    };

export async function saveWatchPosition(
  videoId: string,
  positionMs: number,
): Promise<WatchPositionResult> {
  if (
    !YOUTUBE_VIDEO_ID_RE.test(videoId) ||
    !Number.isFinite(positionMs) ||
    positionMs < 0
  ) {
    return { ok: false, error: "invalid_input" };
  }
  const { supabase, user } = await currentUser();
  if (!user || !supabase) return { ok: false, error: "unauthorized" };
  const { data, error } = await supabase
    .from("content_sources")
    .update({
      last_position_ms: Math.round(positionMs),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("kind", "youtube")
    .eq("external_id", videoId)
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: "error" };
  return data ? { ok: true } : { ok: false, error: "not_saved" };
}
