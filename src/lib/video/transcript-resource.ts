/**
 * Canonical transcript model for the cross-device platform
 * (mission 006, TASK_CONTRACT.md).
 *
 * The watch client, resolver, sync endpoint and future AI-transcription
 * pipeline all speak this vocabulary. `Sentence` (./types.ts) remains the
 * on-disk segmentation format inside content_transcripts/shared_transcripts
 * — TranscriptResource is the typed view on top of it.
 */

import type { Sentence } from "./types";

/** Where a transcript's content came from — drives trust + rights. */
export type TranscriptSource =
  /** Validated captions YouTube publishes; cached for every learner. */
  | "ato_library"
  /** Captured through a learner's own YouTube session by the extension. */
  | "extension_import"
  /** Learner-provided .srt/.vtt/paste — private to that learner. */
  | "user_upload"
  /** Rights-cleared media the uploader authorized us to process. */
  | "creator_authorized"
  /** Model-generated (e.g. Whisper) — allowed only on rights-clear media. */
  | "ai_transcription";

/** Who may read this transcript resource. */
export type RightsScope =
  /** Only the owning learner. */
  | "private"
  /** The owning account across its devices. */
  | "account"
  /** Every learner, guest included (validated public caption data only). */
  | "library";

export interface VideoResource {
  provider: "youtube" | "upload" | "voa";
  providerId?: string;
  title?: string;
  channel?: string;
  durationMs?: number;
}

export interface TranscriptSegment {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
}

export interface TranscriptProvenance {
  createdAt: string;
  importerVersion?: string;
  /** Model name+version when source === "ai_transcription". */
  model?: string;
  sourceHash?: string;
}

export interface TranscriptResource {
  id: string;
  media: VideoResource;
  language: string;
  source: TranscriptSource;
  segments: TranscriptSegment[];
  provenance: TranscriptProvenance;
  rights: { sharingScope: RightsScope };
}

export class TranscriptValidationError extends Error {}

const SEGMENT_TEXT_MAX = 2000;

/**
 * Validate + normalize raw segments: finite non-negative timings,
 * `endMs > startMs`, non-empty bounded text. Overlapping segments are
 * clamped so `endMs` never exceeds the next segment's `startMs` (YouTube
 * timedtext and SRT both produce soft overlaps — rejecting them would
 * break real files); a segment that would clamp to zero duration is
 * dropped. Returns a sorted array; duplicate caller-supplied ids get a
 * `-N` suffix so React keys never collide.
 */
export function normalizeSegments(
  segments: readonly Omit<TranscriptSegment, "id">[] | TranscriptSegment[],
): TranscriptSegment[] {
  if (!Array.isArray(segments)) {
    throw new TranscriptValidationError("segments must be an array");
  }
  const normalized: TranscriptSegment[] = [];
  for (const [index, s] of segments.entries()) {
    const { startMs, endMs, text } = s;
    if (
      !Number.isFinite(startMs) ||
      !Number.isFinite(endMs) ||
      startMs < 0 ||
      endMs <= startMs
    ) {
      throw new TranscriptValidationError(
        `segment ${index}: invalid timing ${startMs}–${endMs}`,
      );
    }
    const trimmed = typeof text === "string" ? text.trim() : "";
    if (!trimmed || trimmed.length > SEGMENT_TEXT_MAX) {
      throw new TranscriptValidationError(`segment ${index}: invalid text`);
    }
    normalized.push({
      id: "id" in s && typeof s.id === "string" && s.id ? s.id : "",
      startMs,
      endMs,
      text: trimmed,
    });
  }
  normalized.sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs);
  // Generated ids follow sorted order so they match display position.
  const seenIds = new Set<string>();
  for (const [i, seg] of normalized.entries()) {
    if (!seg.id) seg.id = `seg-${i}`;
    if (seenIds.has(seg.id)) seg.id = `${seg.id}-${i}`;
    seenIds.add(seg.id);
  }
  const out: TranscriptSegment[] = [];
  for (const [i, seg] of normalized.entries()) {
    const next = normalized[i + 1];
    // Clamp into the next segment's start so playback never double-shows.
    const endMs = next ? Math.min(seg.endMs, next.startMs) : seg.endMs;
    if (endMs <= seg.startMs) continue; // fully swallowed — drop.
    out.push({ ...seg, endMs });
  }
  if (out.length === 0) {
    throw new TranscriptValidationError("transcript has no usable segments");
  }
  return out;
}

/**
 * Validate a resource before it may persist or resolve: provenance and
 * rights scope are mandatory, media needs a provider id, and AI sources
 * must pass the processing-rights gate.
 */
export function validateTranscriptResource(
  resource: TranscriptResource,
): TranscriptResource {
  if (!resource.media?.provider || !resource.media.providerId) {
    throw new TranscriptValidationError("media.provider/providerId required");
  }
  if (!resource.provenance?.createdAt) {
    throw new TranscriptValidationError("provenance.createdAt required");
  }
  if (!resource.rights?.sharingScope) {
    throw new TranscriptValidationError("rights.sharingScope required");
  }
  if (
    resource.source === "ai_transcription" &&
    !aiTranscriptionAllowed(resource.media)
  ) {
    throw new TranscriptValidationError(
      "ai_transcription requires rights-cleared media",
    );
  }
  if (resource.source === "ai_transcription" && !resource.provenance.model) {
    throw new TranscriptValidationError(
      "ai_transcription requires provenance.model",
    );
  }
  // Normalize into a fresh object — never mutate the caller's resource.
  return { ...resource, segments: normalizeSegments(resource.segments) };
}

/**
 * AI transcription runs only where media-processing rights are clear:
 * learner-uploaded media, AtoEnglish-cleared corpus, or creator-authorized
 * sources. YouTube media is excluded — generating transcripts from fetched
 * YouTube audio is outside the owner-accepted boundary
 * (YOUTUBE_PLATFORM_BOUNDARY.md §3).
 */
export function aiTranscriptionAllowed(media: VideoResource): boolean {
  return media.provider === "upload" || media.provider === "voa";
}

/**
 * Map a storage `Sentence` row to canonical segments. This is a
 * timing+text projection: `Sentence` extras (`words`, `noise`, `vi`) do
 * not exist in the segment model. Untimed sentences (plain-text/paste
 * transcripts) cannot become segments — they throw instead of
 * fabricating `0–0` timings.
 */
export function sentencesToSegments(
  sentences: Sentence[],
): TranscriptSegment[] {
  return sentences.map((s, i) => {
    if (s.start_ms === null || s.end_ms === null) {
      throw new TranscriptValidationError(
        `sentence ${i} is untimed — canonical segments require timing`,
      );
    }
    return {
      id: `seg-${s.i ?? i}`,
      startMs: s.start_ms,
      endMs: s.end_ms,
      text: s.text,
    };
  });
}

/** Map canonical segments back to the storage `Sentence` shape. */
export function segmentsToSentences(segments: TranscriptSegment[]): Sentence[] {
  return segments.map((s, i) => ({
    i,
    start_ms: s.startMs,
    end_ms: s.endMs,
    text: s.text,
  }));
}

/** A playback projection, never a replacement for the original caption rows. */
export interface PlaybackTimeline {
  segments: TranscriptSegment[];
  sentenceById: ReadonlyMap<string, Sentence>;
  idBySentence: ReadonlyMap<number, string>;
}

export function buildPlaybackTimeline(
  sentences: readonly Sentence[],
): PlaybackTimeline {
  const valid = sentences.filter(
    (s) =>
      s.start_ms != null &&
      s.end_ms != null &&
      Number.isFinite(s.start_ms) &&
      Number.isFinite(s.end_ms) &&
      s.start_ms >= 0 &&
      s.end_ms > s.start_ms &&
      s.text.trim(),
  );
  const segments = valid.length
    ? normalizeSegments(sentencesToSegments(valid))
    : [];
  const source = new Map(valid.map((s) => [`seg-${s.i}`, s]));
  const sentenceById = new Map<string, Sentence>();
  const idBySentence = new Map<number, string>();
  for (const segment of segments) {
    const sentence = source.get(segment.id);
    if (!sentence) continue;
    sentenceById.set(segment.id, sentence);
    idBySentence.set(sentence.i, segment.id);
  }
  return { segments, sentenceById, idBySentence };
}

/** Last begun cue stays readable in a caption gap; boundaries use endMs separately. */
export function segmentAtTime(
  segments: readonly TranscriptSegment[],
  ms: number,
): string | null {
  let low = 0;
  let high = segments.length - 1;
  let found = -1;
  while (low <= high) {
    const middle = (low + high) >>> 1;
    if (segments[middle].startMs <= ms) {
      found = middle;
      low = middle + 1;
    } else high = middle - 1;
  }
  return found < 0 ? null : segments[found].id;
}
