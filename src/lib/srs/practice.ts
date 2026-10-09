import { normalizeWord, tokenizeText } from "@/lib/read/tokenize";

/**
 * Practice modes per SPEC 005 §8. One card has one FSRS schedule but several
 * drill shapes; every rep appends one practice_attempts row.
 *
 * State rules from the spec:
 * - New/Learning cards only ever see `recall` (word/phrase) or
 *   `sentence_meaning` (sentence) — supported, self-rated modes.
 * - From Review onwards, `listen_fill` / `sentence_dictation` interleave when
 *   the source is a video (needs the segment player — lands with the review
 *   audio slice).
 * - `speak_repeat` and `write_reuse` are evidence-only: they never change the
 *   FSRS schedule.
 */
export const PRACTICE_MODES = [
  "recall",
  "listen_fill",
  "sentence_dictation",
  "sentence_meaning",
  "speak_repeat",
  "write_reuse",
] as const;
export type PracticeMode = (typeof PRACTICE_MODES)[number];

/** Modes that produce an FSRS rating and reschedule the card. */
const GRADED_MODES: ReadonlySet<PracticeMode> = new Set([
  "recall",
  "listen_fill",
  "sentence_dictation",
  "sentence_meaning",
]);

export type StudyCardKind = "word" | "phrase" | "sentence";

/** FSRS card states as persisted on study_cards.state. */
export const CARD_STATE = { New: 0, Learning: 1, Review: 2, Relearning: 3 } as const;

/**
 * Which exercise a queued card gets. New/Learning cards always take the base
 * self-rated mode; Review-state cards may take the audio mode when their
 * context anchors to a playable video segment (the caller passes
 * `hasVideoSegment`). Audio modes are served only where the segment player
 * exists — until then pickPracticeMode returns the base modes, which remain
 * spec-legal at every state.
 */
export function pickPracticeMode(
  kind: StudyCardKind,
  state: number,
  hasVideoSegment: boolean,
): PracticeMode {
  const reviewable = state === CARD_STATE.Review || state === CARD_STATE.Relearning;
  if (kind === "sentence")
    return reviewable && hasVideoSegment
      ? "sentence_dictation"
      : "sentence_meaning";
  return reviewable && hasVideoSegment ? "listen_fill" : "recall";
}

export function isGradedMode(mode: PracticeMode): boolean {
  return GRADED_MODES.has(mode);
}

// Spec §8: dictation "≥ 90% không gợi ý → Good, có gợi ý → Hard, còn lại →
// Again". Conservative by design — auto-grading never awards Easy and any
// hint caps the outcome at Hard.
export const DICTATION_GOOD_ACCURACY = 0.9;

/**
 * Derive the FSRS rating for an auto-graded attempt. Returns null when the
 * attempt lacks the evidence its mode requires (caller validates instead).
 * `listen_fill`: correct → Good, wrong → Again.
 * `sentence_dictation`: accuracy ≥ 0.9 & no hints → Good, hints used → Hard,
 * otherwise → Again.
 */
export function autoRating(
  mode: "listen_fill" | "sentence_dictation",
  evidence: { correct?: boolean; word_accuracy?: number; hints_used?: number },
): "Again" | "Hard" | "Good" | null {
  if (mode === "listen_fill") {
    if (typeof evidence.correct !== "boolean") return null;
    return evidence.correct ? "Good" : "Again";
  }
  if (typeof evidence.word_accuracy !== "number") return null;
  const hints = evidence.hints_used ?? 0;
  if (evidence.word_accuracy >= DICTATION_GOOD_ACCURACY)
    return hints > 0 ? "Hard" : "Good";
  return "Again";
}

const RATING_BY_VALUE = { 1: "Again", 2: "Hard", 3: "Good", 4: "Easy" } as const;
export type RatingValue = keyof typeof RATING_BY_VALUE;

export function ratingLabel(rating: number): "Again" | "Hard" | "Good" | "Easy" | null {
  return RATING_BY_VALUE[rating as RatingValue] ?? null;
}

/**
 * Blank the saved item inside its context sentence for a recall cue. Matches
 * the card's display/key text case-insensitively at word boundaries so
 * punctuation can't defeat it; falls back to null when the surface form no
 * longer appears (re-segmented transcripts, edited sentences) so the UI can
 * render the sentence un-blanked rather than hiding the wrong span.
 */
export function blankTargetInSentence(
  sentence: string,
  target: string,
): { before: string; after: string } | null {
  // Tokens tile the string contiguously, so a running offset gives each
  // token's character span.
  let offset = 0;
  const words = tokenizeText(sentence)
    .map((token) => {
      const span = { token, start: offset, end: offset + token.text.length };
      offset = span.end;
      return span;
    })
    .filter(
      (span): span is typeof span & { token: { type: "word"; text: string; normalized: string } } =>
        span.token.type === "word",
    );
  const wanted = target
    .split(/\s+/)
    .map((w) => normalizeWord(w))
    .filter(Boolean);
  if (!wanted.length) return null;
  for (let i = 0; i <= words.length - wanted.length; i += 1) {
    const run = words.slice(i, i + wanted.length);
    if (run.every(({ token }, j) => token.normalized === wanted[j])) {
      const start = run[0].start;
      const end = run[run.length - 1].end;
      return { before: sentence.slice(0, start), after: sentence.slice(end) };
    }
  }
  return null;
}
