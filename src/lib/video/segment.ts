/**
 * Sentence segmentation (SPEC §4.3).
 *
 * Pure functions, versioned by SEGMENTATION_VERSION — bump it whenever the
 * rules change so stored transcripts can be re-segmented.
 *
 * `asr` json3 tracks: events carry per-word `segs[].tOffsetMs` and interleave
 * `aAppend` line-end markers. Sentences often break mid-event ("love. You
 * know the rules and so do" / "I. I feel …") so we segment over the flat
 * word stream with a pending-split: mark at terminal punctuation, flush when
 * the next word arrives so the boundary gets the real gap timing. (Technique
 * from read-frog's parseScrollingAsrSubtitles — GPL, reimplemented.)
 *
 * Manual/cue tracks (YouTube uploader tracks, .srt/.vtt uploads): cues are
 * merged until the text ends with terminal punctuation.
 */

import type { Json3Event, Sentence, SentenceWord } from "./types";

/**
 * Bump on every rule change — stored in `content_transcripts.segmentation_version`.
 */
export const SEGMENTATION_VERSION = 2;

/** Estimated duration of the stream-final word when no next offset exists. */
export const WORD_END_ESTIMATE_MS = 200;
/** Silence at a word boundary that forces a sentence break. Starting value — tune on fixtures. */
export const SILENCE_SPLIT_MS = 700;
/** Hard caps for `asr` sentences. Starting values — tune on fixtures. */
export const ASR_MAX_WORDS = 25;
export const ASR_MAX_DURATION_MS = 12_000;
/** Hard caps for merged manual cues. */
export const CUE_MAX_WORDS = 40;
export const CUE_MAX_DURATION_MS = 12_000;

const TERMINAL_PUNCT_RE = /[.!?]["'”’)\]]*\s*$/;

/**
 * Annotations YouTube inserts that are not speech: `[Music]`, `(Applause)`.
 * Music-note glyphs `♪ 🎵 ` are *decoration*, not noise markers — lyric
 * videos wrap every cue in `♪ … ♪`, so the notes are stripped while the
 * text inside is kept (verified on the rickroll manual track, 06/10).
 */
const NOISE_RE = /\[[^\]]*\]|\([^)]*\)|[♪🎵🎶]+/g;

function cleanText(text: string): string {
  return text.replace(NOISE_RE, " ").replace(/\s+/g, " ").trim();
}

interface StreamWord extends SentenceWord {
  /**
   * End of the carrying event's display window. Kept so the last seg of an
   * event can honour the spec formula `max(start + WORD_END, eventEnd)`.
   */
  eventEndMs?: number;
  /** True when this is the last usable seg of its event. */
  eventFinal?: boolean;
}

/**
 * Flatten `asr` json3 events into a word stream with absolute times.
 * `aAppend` events carry no words — they only matter as line-end hints, which
 * the word-level gap timing already encodes.
 */
function asrWordStream(events: Json3Event[]): StreamWord[] {
  const words: StreamWord[] = [];
  for (const event of events) {
    if (event.aAppend || !event.segs) continue;
    const eventEndMs =
      event.dDurationMs != null ? event.tStartMs + event.dDurationMs : undefined;
    const usable = event.segs.filter((seg) => cleanText(seg.utf8) !== "");
    usable.forEach((seg, idx) => {
      const text = cleanText(seg.utf8);
      // One seg is normally one word; split defensively if not.
      for (const token of text.split(/\s+/)) {
        if (!token) continue;
        words.push({
          w: token,
          start_ms: event.tStartMs + (seg.tOffsetMs ?? 0),
          end_ms: 0, // resolved below
          eventFinal: idx === usable.length - 1,
          eventEndMs,
        });
      }
    });
  }
  for (let i = 0; i < words.length; i++) {
    const next = words[i + 1];
    const w = words[i];
    if (next) {
      // Event-final segs use the spec formula; mid-event words end where the
      // next word starts.
      w.end_ms = w.eventFinal
        ? Math.max(w.start_ms + WORD_END_ESTIMATE_MS, w.eventEndMs ?? 0, next.start_ms)
        : next.start_ms;
    } else {
      w.end_ms = w.eventEndMs
        ? Math.max(w.start_ms + WORD_END_ESTIMATE_MS, w.eventEndMs)
        : w.start_ms + WORD_END_ESTIMATE_MS;
    }
  }
  return words;
}

function stripEventFinal(w: StreamWord): SentenceWord {
  return { w: w.w, start_ms: w.start_ms, end_ms: w.end_ms };
}

/**
 * Segment an `asr` (auto-generated) json3 event list into sentences with
 * word-level timings.
 */
export function segmentAsrEvents(events: Json3Event[]): Sentence[] {
  const words = asrWordStream(events);
  const sentences: Sentence[] = [];
  let cur: StreamWord[] = [];
  let pendingSplit = false;

  const flush = (nextStart: number | null) => {
    if (cur.length === 0) return;
    const last = cur[cur.length - 1];
    const tightEnd = last.start_ms + WORD_END_ESTIMATE_MS;
    sentences.push({
      i: sentences.length,
      start_ms: cur[0].start_ms,
      // Pause after the sentence is not part of its span.
      end_ms: nextStart != null ? Math.min(tightEnd, nextStart) : tightEnd,
      text: cur.map((w) => w.w).join(" "),
      words: cur.map(stripEventFinal),
    });
    cur = [];
    pendingSplit = false;
  };

  for (const w of words) {
    if (cur.length > 0) {
      const prev = cur[cur.length - 1];
      const gapMs = w.start_ms - prev.start_ms;
      const tooLong =
        cur.length >= ASR_MAX_WORDS ||
        w.start_ms - cur[0].start_ms >= ASR_MAX_DURATION_MS;
      if (pendingSplit || gapMs >= SILENCE_SPLIT_MS || tooLong) {
        flush(w.start_ms);
      }
    }
    cur.push(w);
    if (TERMINAL_PUNCT_RE.test(w.w)) pendingSplit = true;
  }
  flush(null);

  return sentences;
}

export interface Cue {
  start_ms: number;
  end_ms: number;
  text: string;
}

/**
 * True when a cue is *only* noise annotations (`[Music]`, `♪`, `(Applause)`)
 * — no speech at all. Checked on raw text because cleanText strips the
 * annotations away.
 */
const NOISE_ONLY_RE = /^(\s*(\[[^\]]*\]|\([^)]*\)|[♪🎵🎶]+)\s*)+$/;

/**
 * Note-wrapped instrumental markers (`♪ Music ♪`, `🎵 Applause �`): one
 * noise word between notes, nothing else. `♪ We're no strangers ♪` is a
 * lyric — real content — and does NOT match.
 */
const NOTE_WRAPPED_NOISE_RE =
  /^[♪🎵🎶\s]*(?:music|instrumental|applause|laughter|cheering)[♪🎵🎶\s]*$/i;

/**
 * Segment uploader-authored cues (manual `json3` events or parsed
 * .srt/.vtt): merge consecutive cues until the accumulated text ends with
 * terminal punctuation, capped at CUE_MAX_WORDS / CUE_MAX_DURATION_MS.
 * Music-only cues stay visible but are flagged `noise` (excluded from practice).
 */
export function segmentCues(cues: Cue[]): Sentence[] {
  const sentences: Sentence[] = [];
  let startMs: number | null = null;
  let endMs: number | null = null;
  let parts: string[] = [];

  const flush = () => {
    if (startMs == null || parts.length === 0) return;
    sentences.push({
      i: sentences.length,
      start_ms: startMs,
      end_ms: endMs,
      text: parts.join(" "),
    });
    startMs = null;
    endMs = null;
    parts = [];
  };

  for (const cue of cues) {
    const rawText = cue.text.replace(/\s+/g, " ").trim();
    if (!rawText) continue;
    const text = cleanText(rawText);
    if (
      !text ||
      NOISE_ONLY_RE.test(rawText) ||
      NOTE_WRAPPED_NOISE_RE.test(rawText)
    ) {
      flush();
      sentences.push({
        i: sentences.length,
        start_ms: cue.start_ms,
        end_ms: cue.end_ms,
        text: rawText,
        noise: true,
      });
      continue;
    }
    if (parts.length > 0 && startMs != null) {
      const wordCount =
        parts.join(" ").split(/\s+/).length + text.split(/\s+/).length;
      if (
        wordCount > CUE_MAX_WORDS ||
        cue.end_ms - startMs > CUE_MAX_DURATION_MS
      ) {
        flush();
      }
    }
    startMs ??= cue.start_ms;
    endMs = cue.end_ms;
    parts.push(text);
    if (TERMINAL_PUNCT_RE.test(text)) flush();
  }
  flush();
  return sentences;
}

/** Extract cues from a manual-track json3 payload. */
export function cuesFromJson3(events: Json3Event[]): Cue[] {
  const cues: Cue[] = [];
  for (const event of events) {
    if (event.aAppend || !event.segs) continue;
    const text = event.segs.map((s) => s.utf8).join("").replace(/\n/g, " ");
    if (cleanText(text) === "") continue;
    cues.push({
      start_ms: event.tStartMs,
      end_ms: event.tStartMs + (event.dDurationMs ?? 0),
      text,
    });
  }
  return cues;
}

/**
 * Plain text with no timing (SPEC §4.2 step 5): sentence-split on terminal
 * punctuation; start/end are null so callers render read-only lines.
 */
export function segmentPlainText(text: string): Sentence[] {
  const cleaned = cleanText(text);
  if (!cleaned) return [];
  const sentences: Sentence[] = [];
  // Split after terminal punctuation followed by whitespace.
  const parts = cleaned.split(/(?<=[.!?]["'”’)\]]*)\s+/);
  for (const part of parts) {
    const t = part.trim();
    if (!t) continue;
    sentences.push({ i: sentences.length, start_ms: null, end_ms: null, text: t });
  }
  return sentences;
}

/**
 * Entry point for segmentation by track shape (SPEC §4.3 `segmentTranscript`).
 */
export function segmentTranscript(input: {
  kind: "asr" | "cues" | "plain";
  events?: Json3Event[];
  cues?: Cue[];
  text?: string;
}): Sentence[] {
  switch (input.kind) {
    case "asr":
      return segmentAsrEvents(input.events ?? []);
    case "cues":
      return segmentCues(input.cues ?? cuesFromJson3(input.events ?? []));
    case "plain":
      return segmentPlainText(input.text ?? "");
  }
}
