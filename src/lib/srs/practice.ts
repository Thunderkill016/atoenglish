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
 * self-rated mode; Review-state cards with a playable video segment
 * interleave the audio mode (`listen_fill`/`sentence_dictation`) — "xen" in
 * spec §8 is realised per-card via `reps` parity: each completed rep flips
 * the parity, so a card alternates audio/self-rated across its reviews.
 */
export function pickPracticeMode(
  kind: StudyCardKind,
  state: number,
  hasVideoSegment: boolean,
  reps = 0,
): PracticeMode {
  const reviewable =
    state === CARD_STATE.Review || state === CARD_STATE.Relearning;
  const audioTurn = reviewable && hasVideoSegment && reps % 2 === 1;
  if (kind === "sentence")
    return audioTurn ? "sentence_dictation" : "sentence_meaning";
  return audioTurn ? "listen_fill" : "recall";
}

/**
 * Normalized word-level accuracy for dictation: Levenshtein distance over
 * the tokenized word sequences, so a single missing/extra word only costs
 * its own position, not everything after it. Returns 1 for identical input
 * and 0 when the expected side is empty.
 */
export function wordAccuracy(expected: string, typed: string): number {
  const want = tokenizeText(expected)
    .filter((t) => t.type === "word")
    .map((t) => t.normalized);
  const got = tokenizeText(typed)
    .filter((t) => t.type === "word")
    .map((t) => t.normalized);
  if (!want.length) return 0;
  if (!got.length) return want.length ? 0 : 1;

  // DP edit distance over words — bounded by the 2000-char sentence limit.
  const prev = new Array<number>(got.length + 1);
  const curr = new Array<number>(got.length + 1);
  for (let j = 0; j <= got.length; j += 1) prev[j] = j;
  for (let i = 1; i <= want.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= got.length; j += 1) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (want[i - 1] === got[j - 1] ? 0 : 1),
      );
    }
    prev.splice(0, prev.length, ...curr);
  }
  return Math.max(0, 1 - prev[got.length] / want.length);
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

/** Word tokens of a sentence in surface form — the dictation hint scaffold. */
export function tokenizeWords(text: string): string[] {
  return tokenizeText(text)
    .filter((t) => t.type === "word")
    .map((t) => t.text);
}

/**
 * listen_fill answer check: the typed text must match the card's surface
 * form as a word sequence — case and surrounding punctuation ignored, and
 * contractions compare after normalizeWord's curly→straight fold.
 */
export function answersMatch(typed: string, target: string): boolean {
  const words = (s: string) =>
    tokenizeText(s)
      .filter((t) => t.type === "word")
      .map((t) => t.normalized)
      .join(" ");
  return typed.trim() !== "" && words(typed) === words(target);
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
