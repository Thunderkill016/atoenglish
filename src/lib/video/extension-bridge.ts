/**
 * Caption import bridge between the browser extension and the watch page.
 *
 * The extension runs on youtube.com in the user's real session (the same
 * mechanism Trancy/easysubs/asbplayer use — the only reliable way to read
 * YouTube captions without hitting timedtext IP rate limits). It opens
 * youtube.com/watch from the app, reads `player.getPlayerResponse()`
 * captionTracks, fetches each track's json3 in-page (same-origin), then
 * postMessages the tracks back to the app tab that opened it.
 *
 * Trust boundary: the message comes from a youtube.com document, but its
 * contents are untrusted data — every field is validated before use.
 */

import type { Json3Event, Sentence } from "./types";
import { SEGMENTATION_VERSION, segmentTranscript } from "./segment";
import { alignHumanTranslation } from "./align-translation";
import { pickEnglishTrack, pickVietnameseTrack } from "./captions";

/** Message the extension posts from the youtube.com tab to the opener. */
export const CAPTIONS_MESSAGE_TYPE = "atoenglish:youtube-captions";
/** Reply the app posts back so the YouTube tab can stop retrying. */
export const CAPTIONS_ACK_TYPE = "atoenglish:youtube-captions-ack";
/** Origins the extension content script legitimately runs on. */
export const YOUTUBE_ORIGIN = "https://www.youtube.com";

export interface BridgeTrack {
  languageCode: string;
  kind: "manual" | "asr";
  events: Json3Event[];
}

export interface CaptionsPayload {
  videoId: string;
  title?: string;
  channel?: string;
  durationMs?: number;
  tracks: BridgeTrack[];
}

interface RawEvent {
  tStartMs?: unknown;
  dDurationMs?: unknown;
  aAppend?: unknown;
  segs?: Array<{ utf8?: unknown } | null>;
}

function isJson3Event(value: unknown): value is Json3Event {
  const e = value as RawEvent | null;
  return (
    typeof e === "object" &&
    e !== null &&
    typeof e.tStartMs === "number" &&
    Number.isFinite(e.tStartMs) &&
    (e.dDurationMs === undefined || typeof e.dDurationMs === "number") &&
    (e.aAppend === undefined || e.aAppend === 1) &&
    (e.segs === undefined ||
      (Array.isArray(e.segs) &&
        e.segs.every((s) => s !== null && typeof s.utf8 === "string")))
  );
}

/**
 * Validate an untrusted postMessage payload. Returns null on any shape
 * violation — the caller drops it silently (import is best-effort).
 */
export function validateCaptionsPayload(data: unknown): CaptionsPayload | null {
  const p = data as Partial<CaptionsPayload> | null;
  if (
    typeof p !== "object" ||
    p === null ||
    typeof p.videoId !== "string" ||
    !Array.isArray(p.tracks) ||
    p.tracks.length === 0 ||
    p.tracks.length > 200
  ) {
    return null;
  }
  const tracks: BridgeTrack[] = [];
  for (const t of p.tracks) {
    if (
      typeof t !== "object" ||
      t === null ||
      typeof t.languageCode !== "string" ||
      (t.kind !== "manual" && t.kind !== "asr") ||
      !Array.isArray(t.events) ||
      t.events.length === 0 ||
      t.events.length > 50_000 ||
      !t.events.every(isJson3Event)
    ) {
      return null;
    }
    tracks.push({
      languageCode: t.languageCode,
      kind: t.kind,
      events: t.events,
    });
  }
  return {
    videoId: p.videoId,
    title: typeof p.title === "string" ? p.title.slice(0, 500) : undefined,
    channel:
      typeof p.channel === "string" ? p.channel.slice(0, 200) : undefined,
    durationMs:
      typeof p.durationMs === "number" && Number.isFinite(p.durationMs)
        ? p.durationMs
        : undefined,
    tracks,
  };
}

export interface BridgeTranscript {
  sentences: Sentence[];
  language: string;
  trackKind: "manual" | "asr";
  title?: string;
  channel?: string;
  durationMs?: number;
}

/**
 * Pick the best English track + the uploader's manual Vietnamese track,
 * segment English, then time-align Vietnamese — the same pipeline the
 * server fetch path runs, so an imported transcript is identical to a
 * fetched one.
 */
export function payloadToTranscript(
  payload: CaptionsPayload,
): BridgeTranscript | null {
  const enIdx = pickEnglishTrack(payload.tracks);
  if (enIdx < 0) return null;
  const en = payload.tracks[enIdx];
  const sentences = segmentTranscript({
    kind: en.kind === "asr" ? "asr" : "cues",
    events: en.events,
  });
  if (!sentences.length) return null;

  const vi = pickVietnameseTrack(payload.tracks);
  const aligned = vi
    ? alignHumanTranslation(sentences, vi.events, en.events)
    : sentences;

  return {
    sentences: aligned,
    language: en.languageCode,
    trackKind: en.kind,
    title: payload.title,
    channel: payload.channel,
    durationMs: payload.durationMs,
  };
}
