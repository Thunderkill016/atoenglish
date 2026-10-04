import { describe, expect, it } from "vitest";

import { lookupGloss } from "@/lib/read/gloss";
import { STARTER_TEXTS } from "@/lib/read/starter-texts";
import { distinctWords } from "@/lib/read/tokenize";

/**
 * Starter texts are authored inside the seed dictionary's coverage — every
 * meaningful word must gloss, except a small explicit allowlist of function
 * words the curated dictionary legitimately omits (articles, pronouns,
 * auxiliaries). The allowlist is honest, not a loophole: adding a word to it
 * requires an edit a reviewer can see.
 */
const ALLOWED_MISSES = new Set([
  "a", "an", "the", "and", "or", "but", "of", "in", "on", "at", "to", "with",
  "i", "we", "he", "she", "it", "they", "me", "us", "them", "you",
  "my", "our", "his", "their", "your", "is", "am", "are", "was", "were", "be",
  "do", "does", "did", "not", "no", "yes", "so", "as", "by", "for",
  "says", "say", "s", "re", "m", "how", "what", "thank", "i'm",
  // high-frequency function words the curated dict covers only inside
  // phrases ("go to work", "Good night") — not as single headwords
  "go", "night", "hanoi", "minh", "o'clock", "tv",
]);

describe("starter texts coverage", () => {
  it("ships at least 3 starter texts with declared levels", () => {
    expect(STARTER_TEXTS.length).toBeGreaterThanOrEqual(3);
    for (const text of STARTER_TEXTS) {
      expect(text.body.length).toBeGreaterThan(50);
      expect(["A0", "A1"]).toContain(text.level);
    }
  });

  it("keeps every text inside dictionary coverage or the explicit allowlist", () => {
    for (const text of STARTER_TEXTS) {
      const misses = distinctWords(text.body).filter(
        (word) => !lookupGloss(word) && !ALLOWED_MISSES.has(word),
      );
      expect(misses, `${text.id} has unglossed words: ${misses.join(", ")}`).toEqual([]);
    }
  });
});
