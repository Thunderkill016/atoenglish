/**
 * Shared types for the watch surface (SPEC §4, §11).
 */

/** One event in a YouTube `json3` timedtext response. */
export interface Json3Seg {
  utf8: string;
  /** Word offset inside the event, ms. Present on `kind=asr` tracks. */
  tOffsetMs?: number;
}

export interface Json3Event {
  tStartMs: number;
  /** Display duration of the event (scrolling captions overlap). */
  dDurationMs?: number;
  /**
   * Line-end signal for `asr` tracks: the previous text event stops being the
   * "current line" at `tStartMs + dDurationMs` and the next text event starts
   * there. Carries no words — only `segs: [{utf8: "\n"}]`.
   */
  aAppend?: 1;
  segs?: Json3Seg[];
}

export interface Json3Payload {
  events?: Json3Event[];
}

/** A single caption track descriptor from `captionTracks` or timedtext list. */
export interface CaptionTrackInfo {
  languageCode: string;
  /** `asr` = machine-generated; anything else = uploader-authored ("manual"). */
  kind: "manual" | "asr";
  baseUrl?: string;
  name?: string;
}

/** One token inside a segmented sentence (for word karaoke + dictation). */
export interface SentenceWord {
  w: string;
  start_ms: number;
  end_ms: number;
}

export interface Sentence {
  i: number;
  /** `null` for plain-text transcripts with no timing (SPEC §4.2 step 5). */
  start_ms: number | null;
  end_ms: number | null;
  text: string;
  words?: SentenceWord[];
  /** Music/applause-only line — shown in the transcript but not practised. */
  noise?: boolean;
}

export type TranscriptOrigin =
  | "youtube_manual"
  | "youtube_asr"
  | "learner_upload"
  | "learner_paste"
  | "plain_text";

export interface Transcript {
  origin: TranscriptOrigin;
  language: string;
  segmentationVersion: number;
  sentences: Sentence[];
}
