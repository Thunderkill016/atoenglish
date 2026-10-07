"use server";

import { headers } from "next/headers";
import { randomUUID } from "node:crypto";

import { createClient } from "@/lib/supabase/server";
import {
  createRateLimiter,
  getClientIpFromHeaders,
} from "@/lib/security/rate-limit";
import { fetchYoutubeCaptions } from "@/lib/video/captions";
import { SEGMENTATION_VERSION, segmentTranscript } from "@/lib/video/segment";
import { alignHumanTranslation } from "@/lib/video/align-translation";
import {
  payloadToTranscript,
  validateCaptionsPayload,
  type CaptionsPayload,
} from "@/lib/video/extension-bridge";
import { parseSubtitleFile } from "@/lib/video/subtitle-file";
import { YOUTUBE_VIDEO_ID_RE } from "@/lib/video/youtube-url";
import type { Json } from "@/types/supabase";
import type { Sentence, TranscriptOrigin } from "@/lib/video/types";

// SPEC §4.2: fetching captions is a per-learner, explicit-action-only,
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
  if (user && supabase) {
    const existing = await existingTranscript(supabase, user.id, videoId);
    if (existing) return { ok: true, ...existing };
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
    return { ok: false, error };
  }

  const sentences = segmentTranscript({
    kind: result.track.kind === "asr" ? "asr" : "cues",
    events: result.events,
  });
  if (sentences.length === 0) {
    await logCaptionEvent(ctx, "caption_fetch_failed", videoId);
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
  await logCaptionEvent(ctx, "caption_fetch_succeeded", videoId);
  return { ok: true, ...loaded };
}

/**
 * Persist a transcript imported by the browser extension (SPEC §4.2 fallback —
 * the fetch ran inside the user's own YouTube session, so this path never
 * hits the server-side timedtext rate limit). The payload is untrusted:
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
  if (!user || !supabase) return;
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
