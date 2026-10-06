/**
 * Learner-provided transcript parsing (SPEC §4.2 steps 4–5).
 *
 * Accepts `.srt`, `.vtt`, timestamped paste (`[mm:ss]` / `mm:ss.mmm` per line,
 * or `HH:MM:SS,mmm --> ...` cue blocks) and plain text. Malformed input is
 * rejected — the caller falls back to "read without sync".
 */

import { segmentCues, segmentPlainText, type Cue } from "./segment";
import type { Sentence } from "./types";

export type SubtitleInputKind =
  | "srt"
  | "vtt"
  | "timed_paste"
  | "plain"
  | "invalid";

export interface ParsedSubtitle {
  kind: SubtitleInputKind;
  sentences: Sentence[];
}

const TS_RE = /(\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3}/;
// `1:23 text`, `[01:23.456] text`, `(1:23) text`, `01:23 - text`
const TIMED_LINE_RE =
  /^[\[(]?\s*((?:\d{1,2}:)?\d{1,2}:\d{2}(?:[.,]\d{1,3})?)\s*[\])]?\s*[-–—:]?\s*(.+)$/;

export function parseTimestamp(ts: string): number | null {
  const m = ts.trim().match(/^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})[.,](\d{1,3})$/);
  const mNoMs = ts.trim().match(/^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})$/);
  const mm = m ?? mNoMs;
  if (!mm) return null;
  const hours = Number(mm[1] ?? 0);
  const minutes = Number(mm[2]);
  const seconds = Number(mm[3]);
  const frac = m?.[4] ? Number(m[4].padEnd(3, "0")) : 0;
  if (minutes >= 60 || seconds >= 60) return null;
  return ((hours * 60 + minutes) * 60 + seconds) * 1000 + frac;
}

const SRT_ARROW_RE = /-->/;
// VTT metadata blocks that legally precede cues: WEBVTT header remnants,
// NOTE comments, STYLE sheets, REGION definitions. They carry no timing
// line, so they must not invalidate the file — only truly malformed blocks do.
const VTT_PREAMBLE_RE = /^(WEBVTT|NOTE|STYLE|REGION)\b/;

function parseCueBlocks(text: string): Cue[] | null {
  // Split into blocks on blank lines; each block: optional index line,
  // `start --> end` line, then 1..n text lines.
  const blocks = text
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  const cues: Cue[] = [];
  let sawArrow = false;
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim());
    const arrowIdx = lines.findIndex((l) => SRT_ARROW_RE.test(l));
    if (arrowIdx === -1) {
      // Legal VTT preamble/metadata block — skip it at any position.
      if (VTT_PREAMBLE_RE.test(lines[0])) continue;
      // Any other block with no timing line before the first cue → invalid;
      // after cues started it's ignored (trailing notes).
      if (!sawArrow) return null;
      continue;
    }
    const times = lines[arrowIdx].split(SRT_ARROW_RE).map((t) => t.trim());
    const start = parseTimestamp(times[0]);
    const end = parseTimestamp(times[1].split(/\s+/)[0]); // strip VTT settings
    if (start == null || end == null || end <= start) return null;
    const text2 = lines
      .slice(arrowIdx + 1)
      .join(" ")
      // Strip VTT/SRT inline tags (<i>, <b>, <c.foo>, karaoke <00:00.000>).
      .replace(/<[^>]+>/g, "")
      .trim();
    if (!text2) continue;
    sawArrow = true;
    cues.push({ start_ms: start, end_ms: end, text: text2 });
  }
  return cues.length > 0 ? cues : null;
}

function parseTimedPaste(text: string): Cue[] | null {
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const cues: Cue[] = [];
  for (const line of lines) {
    const m = line.match(TIMED_LINE_RE);
    // Stray headers/separators are common in pasted transcripts — skip them.
    // detectSubtitleKind already guaranteed ≥60% timed lines.
    if (!m) continue;
    const start = parseTimestamp(m[1]);
    if (start == null) continue;
    cues.push({ start_ms: start, end_ms: start, text: m[2].trim() });
  }
  if (cues.length === 0) return null;
  // End = next cue's start; last cue gets a default tail duration.
  for (let i = 0; i < cues.length; i++) {
    cues[i].end_ms =
      i + 1 < cues.length ? cues[i + 1].start_ms : cues[i].start_ms + 3_000;
  }
  return cues;
}

export function detectSubtitleKind(raw: string): SubtitleInputKind {
  const head = raw.trimStart().slice(0, 200);
  if (/^WEBVTT/i.test(head)) return "vtt";
  const lines = raw
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 40);
  const arrowLines = lines.filter((l) => SRT_ARROW_RE.test(l) && TS_RE.test(l));
  if (arrowLines.length > 0) return "srt";
  const timedLines = lines.filter((l) => TIMED_LINE_RE.test(l));
  if (timedLines.length >= Math.max(2, lines.length * 0.6)) return "timed_paste";
  return "plain";
}

/**
 * Parse pasted/uploaded transcript text into sentences.
 * Returns `kind: "invalid"` when the input looks timed but is malformed.
 */
export function parseSubtitleFile(raw: string): ParsedSubtitle {
  // Strip BOM and normalise CRLF/CR once — the VTT header drop below and the
  // block splitter both key on \n.
  const text = raw.replace(/^﻿/, "").replace(/\r\n?/g, "\n").trim();
  if (!text) return { kind: "invalid", sentences: [] };

  const kind = detectSubtitleKind(text);
  switch (kind) {
    case "vtt":
    case "srt": {
      // For VTT, drop the header block (everything up to the first blank
      // line); a malformed file with no blank line just loses its first
      // line instead of the whole first cue.
      const body =
        kind === "vtt"
          ? text.slice(
              text.indexOf("\n\n") === -1
                ? text.indexOf("\n") + 1
                : text.indexOf("\n\n") + 2,
            )
          : text;
      const cues = parseCueBlocks(body);
      if (!cues) return { kind: "invalid", sentences: [] };
      return { kind, sentences: segmentCues(cues) };
    }
    case "timed_paste": {
      const cues = parseTimedPaste(text);
      if (!cues) return { kind: "invalid", sentences: [] };
      return { kind, sentences: segmentCues(cues) };
    }
    case "plain":
      return { kind, sentences: segmentPlainText(text) };
    default:
      return { kind: "invalid", sentences: [] };
  }
}
