import type { Json3Event, Sentence } from "./types";

interface Cue {
  start: number;
  end: number;
  text: string;
}

/** Fallback cue length when json3 omits dDurationMs (typical manual cue). */
const DEFAULT_CUE_MS = 2000;
/** A track this short of the English sentences is too sparse to trust. */
const MIN_COVERAGE = 0.5;
/**
 * A real translation of the same cue list starts its cues where the English
 * ones start. Live TED check (07/10, iG9CE55wbtY): only 22 % of VI starts sat
 * within 300 ms of an EN start (best constant shift 40 %) — a differently
 * timed cut whose time-alignment pairs the wrong sentences. Require ≥80 %.
 */
const CUE_START_TOLERANCE_MS = 300;
const MIN_CUE_START_MATCH = 0.8;

function toCues(events: Json3Event[]): Cue[] {
  const cues: Cue[] = [];
  for (const e of events) {
    const text = (e.segs ?? [])
      .map((s) => s.utf8)
      .join("")
      .replace(/\s+/g, " ")
      .trim();
    if (!text || e.aAppend) continue;
    cues.push({
      start: e.tStartMs,
      end: e.tStartMs + (e.dDurationMs ?? DEFAULT_CUE_MS),
      text,
    });
  }
  return cues;
}

/** Share of VI cues that start where some English cue starts. */
export function cueStartMatch(viEvents: Json3Event[], enEvents: Json3Event[]) {
  const vi = toCues(viEvents);
  const en = toCues(enEvents)
    .map((c) => c.start)
    .sort((a, b) => a - b);
  if (!vi.length || !en.length) return 0;
  let hits = 0;
  for (const cue of vi) {
    // Binary search for the nearest English start.
    let lo = 0;
    let hi = en.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (en[mid] < cue.start) lo = mid + 1;
      else hi = mid;
    }
    const nearest = Math.min(
      Math.abs(en[lo] - cue.start),
      lo > 0 ? Math.abs(en[lo - 1] - cue.start) : Infinity,
    );
    if (nearest <= CUE_START_TOLERANCE_MS) hits++;
  }
  return hits / vi.length;
}

/**
 * Attach the uploader's Vietnamese track to English sentences by time: each
 * VI cue goes to exactly one sentence — the one containing its midpoint, else
 * the one it overlaps most. Sentences without timing or without a matching
 * cue stay untranslated (machine translation may fill them later, labelled).
 * Returns the input unchanged — no human Vietnamese at all — when the track is
 * timed differently from the English cues or covers too few sentences: a
 * mispaired translation would teach the wrong meaning.
 */
export function alignHumanTranslation(
  sentences: Sentence[],
  viEvents: Json3Event[],
  enEvents: Json3Event[],
): Sentence[] {
  const cues = toCues(viEvents);
  const timed = sentences.filter(
    (s) => s.start_ms != null && s.end_ms != null && !s.noise,
  );
  if (!cues.length || !timed.length) return sentences;
  if (cueStartMatch(viEvents, enEvents) < MIN_CUE_START_MATCH) return sentences;

  const assigned = new Map<number, string[]>();
  for (const cue of cues) {
    const mid = (cue.start + cue.end) / 2;
    let target = timed.find((s) => s.start_ms! <= mid && mid < s.end_ms!);
    if (!target) {
      let best = 0;
      for (const s of timed) {
        const overlap =
          Math.min(cue.end, s.end_ms!) - Math.max(cue.start, s.start_ms!);
        if (overlap > best) {
          best = overlap;
          target = s;
        }
      }
    }
    if (!target) continue;
    const parts = assigned.get(target.i) ?? [];
    parts.push(cue.text);
    assigned.set(target.i, parts);
  }

  if (assigned.size < timed.length * MIN_COVERAGE) return sentences;
  return sentences.map((s) => {
    const parts = assigned.get(s.i);
    return parts ? { ...s, vi: parts.join(" ") } : s;
  });
}
