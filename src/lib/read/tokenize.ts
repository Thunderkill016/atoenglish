/**
 * Tokenizer for the reading surface.
 *
 * Splits text into word tokens and non-word spans. Words keep an apostrophe
 * tail (`don't`, `I'm`, `o's`) as a single token; everything that is not an
 * English word (digits, punctuation, non-Latin scripts, emoji) renders as a
 * neutral non-word span so it can never be tracked as a "word".
 *
 * Normalization is the storage join key: lowercase. The same surface form
 * ("Work", "work.", "WORK") must never fragment into multiple stored states
 * (see contracts/read-surface.md invariant 4).
 */

export type ReadToken =
  | {
      readonly type: "word";
      readonly text: string;
      readonly normalized: string;
    }
  | { readonly type: "space" | "punct" | "other"; readonly text: string };

// A word is an ASCII-letter run with an optional internal apostrophe tail.
const WORD_RE = /[A-Za-z]+(?:'[A-Za-z]+)*/y;
const SPACE_RE = /\s+/y;
const PUNCT_RE = /[\p{P}\p{S}\d_]+/uy;

/** Normalize a surface form to the storage join key. */
export function normalizeWord(text: string): string {
  return text.toLowerCase();
}

/**
 * Split text into render tokens. `sticky` regexes walk the string left to
 * right — anything that fails all three falls into `other` one char at a time
 * so a stray byte can't swallow the rest of the text.
 */
export function tokenizeText(text: string): ReadToken[] {
  const tokens: ReadToken[] = [];
  let pos = 0;
  while (pos < text.length) {
    WORD_RE.lastIndex = pos;
    let match = WORD_RE.exec(text);
    if (match) {
      tokens.push({
        type: "word",
        text: match[0],
        normalized: normalizeWord(match[0]),
      });
      pos += match[0].length;
      continue;
    }
    SPACE_RE.lastIndex = pos;
    match = SPACE_RE.exec(text);
    if (match) {
      tokens.push({ type: "space", text: match[0] });
      pos += match[0].length;
      continue;
    }
    PUNCT_RE.lastIndex = pos;
    match = PUNCT_RE.exec(text);
    if (match) {
      tokens.push({ type: "punct", text: match[0] });
      pos += match[0].length;
      continue;
    }
    tokens.push({ type: "other", text: text[pos] });
    pos += 1;
  }
  return tokens;
}

/** Distinct normalized words in a text — for state lookups and coverage. */
export function distinctWords(text: string): string[] {
  const words = new Set<string>();
  for (const token of tokenizeText(text)) {
    if (token.type === "word") words.add(token.normalized);
  }
  return [...words];
}
