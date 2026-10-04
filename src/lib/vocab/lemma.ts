/**
 * Lemma-level vocabulary identity.
 *
 * `cards.word`, reader word marks and review scheduling used to key on the raw
 * surface form, so "Book", "books", and " studies " were three identities.
 * `lemmaKey` maps surface forms to one canonical key so dedupe, scheduling
 * and coverage compute per lexical item, not per inflection.
 *
 * Design rule: under-collapse beats wrong-collapse. Only unambiguous
 * normalisation + a small conservative suffix set are applied; anything
 * uncertain keeps its surface key rather than merging with the wrong lemma.
 * Multi-word items are atomic chunks — the whole normalized phrase is the
 * key, never reduced to a head word.
 */

const TRIM_EDGE_PUNCT = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;
const VOWEL_STEM_END = /[aeouy]$/;

function normalizeSurface(surface: string): string {
  return surface
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(TRIM_EDGE_PUNCT, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Conservative single-word deinflection:
 * - `ies` → `y` when the stem is at least 3 chars (studies→study, ladies→lady;
 *   flies/tries keep surface form — stem too short to be sure)
 * - trailing `s` drop when the stem is ≥4 chars and does not end in
 *   ss/us/is (books→book, plays→play, ideas→idea; class/virus/this safe)
 * - `oes` → `o` when the word is ≥5 chars (potatoes→potato, heroes→hero)
 * - `ed`/`ing` drop only when the remaining stem is ≥3 chars and ends in a
 *   vowel or y (played→play, going→go, agreed→agree; created/stopped/running
 *   keep surface form)
 */
function deinflect(word: string): string {
  if (word.length >= 6 && word.endsWith("ies")) {
    return `${word.slice(0, -3)}y`;
  }
  if (word.length >= 5 && word.endsWith("oes")) {
    return word.slice(0, -2);
  }
  if (
    word.length >= 5 &&
    word.endsWith("s") &&
    !word.endsWith("ies") &&
    !/[sui]s$/.test(word)
  ) {
    return word.slice(0, -1);
  }
  if (word.length >= 4 && word.endsWith("eed")) {
    return word.slice(0, -1);
  }
  for (const suffix of ["ing", "ed"] as const) {
    if (word.endsWith(suffix)) {
      const stem = word.slice(0, -suffix.length);
      if (stem.length >= 2 && VOWEL_STEM_END.test(stem)) {
        return stem;
      }
    }
  }
  return word;
}

/**
 * Canonical identity for a vocabulary item. Returns null for input that has
 * no letter/digit content after normalisation.
 */
export function lemmaKey(surface: string): string | null {
  if (typeof surface !== "string") return null;
  const normalized = normalizeSurface(surface);
  if (!normalized || !/[\p{L}\p{N}]/u.test(normalized)) return null;
  if (normalized.includes(" ")) return normalized;
  return deinflect(normalized);
}
