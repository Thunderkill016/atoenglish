/**
 * Vietnamese gloss dictionary for the reading surface.
 *
 * Seeded from `VOCABULARY_ENTRIES` — the repo's curated learner vocabulary —
 * rather than an external dictionary. That makes the dictionary small and
 * honest: misses return `null` and the UI shows "chưa có nghĩa" instead of a
 * fabricated meaning (contract invariant 1).
 *
 * Inflected forms resolve only through the explicit suffix rules in
 * `lookupGloss` — no morphological guessing.
 */
import { VOCABULARY_ENTRIES } from "@/lib/dict/vocabulary";
import { tokenizeText } from "./tokenize";

export type GlossEntry = {
  /** The normalized headword as stored in the dictionary. */
  readonly word: string;
  readonly meaning_vn: string;
  readonly phonetic?: string;
  readonly example_en?: string;
};

const dictionary = new Map<string, GlossEntry>();

for (const item of VOCABULARY_ENTRIES) {
  dictionary.set(item.word, {
    word: item.word,
    meaning_vn: item.meaning_vn,
    phonetic: item.phonetic || undefined,
    example_en: item.example_en || undefined,
  });
}

export const GLOSS_SIZE = dictionary.size;

/**
 * Candidate base forms for an inflected surface form, most-specific first.
 * Each candidate is only used if it actually exists in the dictionary —
 * the rules propose, the dictionary disposes.
 */
function inflectionCandidates(normalized: string): string[] {
  const candidates: string[] = [];
  if (normalized.endsWith("'s") && normalized.length > 2) {
    candidates.push(normalized.slice(0, -2));
  }
  if (normalized.endsWith("ies") && normalized.length > 3) {
    candidates.push(`${normalized.slice(0, -3)}y`); // carries → carry
  }
  if (normalized.endsWith("ied") && normalized.length > 3) {
    candidates.push(`${normalized.slice(0, -3)}y`); // carried → carry
  }
  if (normalized.endsWith("es") && normalized.length > 2) {
    candidates.push(normalized.slice(0, -2)); // watches → watch
  }
  if (
    normalized.endsWith("s") &&
    !normalized.endsWith("ss") &&
    normalized.length > 1
  ) {
    candidates.push(normalized.slice(0, -1)); // works → work
  }
  if (normalized.endsWith("ed") && normalized.length > 2) {
    candidates.push(normalized.slice(0, -2)); // worked → work
    candidates.push(normalized.slice(0, -1)); // baked → bake
    const stem = normalized.slice(0, -3); // stopped → stop (double consonant)
    if (
      normalized.length > 4 &&
      normalized.at(-3) === normalized.at(-4) &&
      /[a-z]/.test(normalized.at(-3) ?? "")
    ) {
      candidates.push(stem);
    }
  }
  if (normalized.endsWith("ing") && normalized.length > 4) {
    candidates.push(normalized.slice(0, -3)); // working → work
    candidates.push(`${normalized.slice(0, -3)}e`); // making → make
    const stem = normalized.slice(0, -4); // running → run (double consonant)
    if (
      normalized.length > 5 &&
      normalized.at(-4) === normalized.at(-5) &&
      /[a-z]/.test(normalized.at(-4) ?? "")
    ) {
      candidates.push(stem);
    }
  }
  return candidates;
}

/**
 * Look up a normalized surface form in the dictionary.
 * Returns the headword entry on hit, `null` on honest miss.
 */
export function lookupGloss(normalizedWord: string): GlossEntry | null {
  const direct = dictionary.get(normalizedWord);
  if (direct) return direct;
  for (const candidate of inflectionCandidates(normalizedWord)) {
    const entry = dictionary.get(candidate);
    if (entry) return entry;
  }
  return null;
}

// Three glosses keep the active cue readable on narrow screens; not a proficiency score.
export const ACTIVE_CUE_GLOSS_LIMIT = 3;
const MAX_GLOSS_WORDS = Math.max(
  ...VOCABULARY_ENTRIES.map((entry) => entry.word.split(" ").length),
);
export type SentenceGloss = GlossEntry & { readonly surface: string };
/** Curated meanings, not model-generated/context-verified senses. Honest misses stay absent. */
export function sentenceGlosses(text: string): SentenceGloss[] {
  const tokens = tokenizeText(text);
  const seen = new Set<string>();
  const result: SentenceGloss[] = [];
  for (
    let i = 0;
    i < tokens.length && result.length < ACTIVE_CUE_GLOSS_LIMIT;
    i++
  ) {
    if (tokens[i].type !== "word") continue;
    const words: string[] = [];
    const surfaces: string[] = [];
    let match: SentenceGloss | null = null;
    let last = i;
    for (
      let j = i;
      j < tokens.length && words.length < MAX_GLOSS_WORDS;
      j += 2
    ) {
      const token = tokens[j];
      if (token.type !== "word" || (j > i && tokens[j - 1].type !== "space"))
        break;
      words.push(token.normalized);
      surfaces.push(token.text);
      const entry =
        words.length === 1
          ? lookupGloss(words[0])
          : dictionary.get(words.join(" "));
      if (entry) {
        match = { ...entry, surface: surfaces.join(" ") };
        last = j;
      }
    }
    if (!match) continue;
    i = last;
    if (seen.has(match.word)) continue;
    seen.add(match.word);
    result.push(match);
  }
  return result;
}
