"use client";

import { useMemo } from "react";

import {
  tokenizeText,
  phraseFromTokens,
  type ReadToken,
} from "@/lib/read/tokenize";
import { markSavedTokens, CARD_STATE } from "@/lib/srs/practice";
import { cn } from "@/lib/utils";
import type { Sentence } from "@/lib/video/types";

/**
 * Token-level sentence text shared by the watch transcript/captions and the
 * `/read` surface: word tokens are lookup buttons, everything else is a
 * neutral span, and saved study cards paint through `savedWords`.
 */

export type PhraseStart = { sentenceI: number; tokenIndex: number };

export type SentenceLookup = (
  term: string,
  sentence: Sentence,
  trigger: HTMLButtonElement,
) => void;

export interface SentenceTextProps {
  sentence: Sentence;
  nowMs: number;
  active: boolean;
  onLookup?: SentenceLookup;
  phraseMode?: boolean;
  phraseStart?: PhraseStart | null;
  onPhraseStart?: (start: PhraseStart | null) => void;
  onPhraseError?: (message: string | null) => void;
  savedWords?: ReadonlyMap<string, number>;
}

/**
 * Saved-word paint (spec §8 C4): still learning → warm amber, stable in
 * review → quiet underline. The word stays a lookup button — the class only
 * re-skins it, so keyboard/click behavior is untouched.
 */
function savedWordClass(state: number | null): string | null {
  if (state == null) return null;
  if (state === CARD_STATE.Review)
    return "underline decoration-state-known/50 decoration-2 underline-offset-4";
  return "bg-state-learning/25 underline decoration-state-learning/60 decoration-2 underline-offset-4 rounded-sm";
}

/** Shared caption/rail/read text: timestamps seek; words look up, never seek. */
export function SentenceText({
  sentence,
  nowMs,
  active,
  onLookup,
  phraseMode = false,
  phraseStart,
  onPhraseStart,
  onPhraseError,
  savedWords,
}: SentenceTextProps) {
  const tokens = useMemo(() => {
    if (!sentence.words?.length)
      return tokenizeText(sentence.text).map((token) => ({
        token,
        start: null as number | null,
        end: null as number | null,
      }));
    return sentence.words.flatMap((word, i) => [
      ...tokenizeText(word.w).map((token) => ({
        token,
        start: word.start_ms,
        end: word.end_ms,
      })),
      ...(i < sentence.words!.length - 1
        ? [
            {
              token: { type: "space", text: " " } as ReadToken,
              start: null,
              end: null,
            },
          ]
        : []),
    ]);
  }, [sentence.text, sentence.words]);
  // C4: saved word/phrase marks — one pass per sentence over the card map.
  const savedMarks = useMemo(
    () =>
      savedWords?.size
        ? markSavedTokens(
            tokens.map((item) => item.token),
            savedWords,
          )
        : null,
    [tokens, savedWords],
  );
  const selectWord = (index: number, trigger: HTMLButtonElement) => {
    const token = tokens[index].token;
    if (token.type !== "word") return;
    if (!phraseMode) {
      onLookup?.(token.text, sentence, trigger);
      return;
    }
    onPhraseError?.(null);
    if (!phraseStart || phraseStart.sentenceI !== sentence.i) {
      onPhraseStart?.({ sentenceI: sentence.i, tokenIndex: index });
      return;
    }
    const phrase = phraseFromTokens(
      tokens.map((item) => item.token),
      phraseStart.tokenIndex,
      index,
    );
    // Match the dictionary API's bounded one-term intake; never truncate a phrase silently.
    if (!phrase || phrase.length > 120) {
      onPhraseError?.("Chọn cụm ngắn hơn (tối đa 120 ký tự).");
      return;
    }
    onPhraseStart?.(null);
    onLookup?.(phrase, sentence, trigger);
  };
  if (sentence.noise) return <span>{sentence.text}</span>;
  return (
    <span data-testid="sentence-text" className="[overflow-wrap:anywhere]">
      {tokens.map(({ token, start, end }, index) => {
        const highlighted =
          active &&
          start != null &&
          nowMs >= start &&
          (end == null || nowMs < end);
        const savedClass = savedMarks
          ? savedWordClass(savedMarks[index])
          : null;
        if (token.type !== "word" || !onLookup)
          return (
            <span
              key={index}
              className={cn(highlighted && "rounded bg-primary/25", savedClass)}
            >
              {token.text}
            </span>
          );
        return (
          <button
            key={index}
            type="button"
            aria-label={`${phraseMode ? "Chọn từ" : "Tra từ"} “${token.text}”`}
            onClick={(event) => selectWord(index, event.currentTarget)}
            className={cn(
              // Source whitespace sets word spacing; lookup highlights must not widen every word.
              "inline max-w-full rounded p-0 align-baseline text-inherit [overflow-wrap:anywhere] hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-ring",
              highlighted && "bg-primary/25",
              phraseStart?.sentenceI === sentence.i &&
                phraseStart.tokenIndex === index &&
                "bg-primary/25 underline",
              savedClass,
            )}
          >
            {token.text}
          </button>
        );
      })}
    </span>
  );
}
