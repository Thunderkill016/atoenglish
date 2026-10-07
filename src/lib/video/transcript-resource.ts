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
 * dropped. Returns a sorted, deduped-by-id array.
 */
export function normalizeSegments(
  segments: readonly Omit<TranscriptSegment, "id">[] | TranscriptSegment[],
): TranscriptSegment[] {
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
    if (
      typeof text !== "string" ||
      !text.trim() ||
      text.length > SEGMENT_TEXT_MAX
    ) {
      throw new TranscriptValidationError(`segment ${index}: invalid text`);
    }
    const id =
      "id" in s && typeof s.id === "string" && s.id ? s.id : `seg-${index}`;
    normalized.push({ id, startMs, endMs, text: text.trim() });
  }
  normalized.sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs);
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
  resource.segments = normalizeSegments(resource.segments);
  return resource;
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

/** Map a storage `Sentence` row to canonical segments (lossless). */
export function sentencesToSegments(
  sentences: Sentence[],
): TranscriptSegment[] {
  return sentences.map((s, i) => ({
    id: `seg-${s.i ?? i}`,
    startMs: s.start_ms ?? 0,
    endMs: s.end_ms ?? s.start_ms ?? 0,
    text: s.text,
  }));
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
