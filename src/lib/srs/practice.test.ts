import { describe, expect, it } from "vitest";

import { tokenizeText } from "@/lib/read/tokenize";
import {
  alignWords,
  answersMatch,
  autoRating,
  blankTargetInSentence,
  inOrderMatchRatio,
  markSavedTokens,
  pickPracticeMode,
  tokenizeWords,
  wordAccuracy,
} from "./practice";

describe("pickPracticeMode", () => {
  it("keeps New/Learning cards on self-rated modes even with video", () => {
    expect(pickPracticeMode("word", 0, true, 5)).toBe("recall");
    expect(pickPracticeMode("sentence", 1, true, 5)).toBe("sentence_meaning");
  });

  it("interleaves audio modes by reps parity on Review cards with video", () => {
    // Spec §8 "xen": reps parity alternates the exercise across a card's
    // reviews — odd reps take the audio turn, even reps self-rate.
    expect(pickPracticeMode("word", 2, true, 1)).toBe("listen_fill");
    expect(pickPracticeMode("word", 2, true, 2)).toBe("recall");
    expect(pickPracticeMode("sentence", 3, true, 3)).toBe("sentence_dictation");
    expect(pickPracticeMode("sentence", 2, true, 4)).toBe("sentence_meaning");
  });

  it("never serves audio modes without a playable segment", () => {
    expect(pickPracticeMode("word", 2, false, 1)).toBe("recall");
    expect(pickPracticeMode("sentence", 2, false, 1)).toBe("sentence_meaning");
  });
});

describe("answersMatch", () => {
  it("compares normalized word sequences, ignoring case and punctuation", () => {
    expect(answersMatch("resilience", "resilience")).toBe(true);
    expect(answersMatch("Resilience.", "resilience")).toBe(true);
    expect(answersMatch("keep going", "Keep Going!")).toBe(true);
    expect(answersMatch("it’s", "it's")).toBe(true);
  });

  it("rejects wrong or empty answers", () => {
    expect(answersMatch("resilient", "resilience")).toBe(false);
    expect(answersMatch("", "resilience")).toBe(false);
    expect(answersMatch("keep", "keep going")).toBe(false);
  });
});

describe("wordAccuracy", () => {
  it("scores identical sentences at 1", () => {
    expect(
      wordAccuracy(
        "It takes resilience to keep going.",
        "it takes resilience to keep going",
      ),
    ).toBe(1);
  });

  it("costs one position per missing or extra word, not the tail", () => {
    // Missing "takes" — Levenshtein keeps the suffix aligned.
    expect(
      wordAccuracy(
        "It takes resilience to keep going.",
        "it resilience to keep going",
      ),
    ).toBeCloseTo(1 - 1 / 6);
  });

  it("returns 0 for empty input against a real sentence", () => {
    expect(wordAccuracy("It takes resilience.", "")).toBe(0);
  });
});

describe("tokenizeWords", () => {
  it("returns surface word forms, skipping spaces and punctuation", () => {
    expect(tokenizeWords("It's fine, really.")).toEqual([
      "It's",
      "fine",
      "really",
    ]);
  });
});

describe("autoRating", () => {
  it("grades listen_fill by correctness", () => {
    expect(autoRating("listen_fill", { correct: true })).toBe("Good");
    expect(autoRating("listen_fill", { correct: false })).toBe("Again");
    expect(autoRating("listen_fill", {})).toBeNull();
  });

  it("caps dictation at Hard when hints were used", () => {
    expect(
      autoRating("sentence_dictation", { word_accuracy: 0.95, hints_used: 2 }),
    ).toBe("Hard");
    expect(autoRating("sentence_dictation", { word_accuracy: 0.95 })).toBe(
      "Good",
    );
    expect(autoRating("sentence_dictation", { word_accuracy: 0.5 })).toBe(
      "Again",
    );
  });
});

describe("markSavedTokens", () => {
  const tokens = tokenizeText("It takes resilience to keep going today.");

  it("marks saved words by their card state and skips the rest", () => {
    const marks = markSavedTokens(tokens, new Map([["resilience", 2]]));
    expect(tokens[4].type).toBe("word");
    expect(marks[4]).toBe(2); // "resilience"
    expect(marks[0]).toBeNull(); // "It"
    expect(marks[1]).toBeNull(); // space — never matches
  });

  it("longest match wins: a saved phrase marks its whole run", () => {
    const saved = new Map([
      ["keep", 0],
      ["keep going", 2],
    ]);
    const marks = markSavedTokens(tokens, saved);
    const keepIdx = tokens.findIndex((t) => t.text === "keep");
    const goingIdx = tokens.findIndex((t) => t.text === "going");
    expect(marks[keepIdx]).toBe(2);
    expect(marks[goingIdx]).toBe(2); // belongs to the phrase, not unmatched
  });

  it("normalizes case and curly apostrophes like save keys", () => {
    const curly = tokenizeText("It’s fine.");
    const marks = markSavedTokens(curly, new Map([["it's", 1]]));
    expect(marks[0]).toBe(1);
  });

  it("returns all null for an empty map", () => {
    expect(markSavedTokens(tokens, new Map()).every((m) => m === null)).toBe(
      true,
    );
  });
});

describe("inOrderMatchRatio", () => {
  it("scores a perfect transcript at 1", () => {
    expect(
      inOrderMatchRatio("It takes resilience.", "it takes resilience"),
    ).toBe(1);
  });

  it("counts only words that appear in order — extra words don't help", () => {
    // "the quick brown fox jumps": learner says "quick fox" — 2/5 in order.
    expect(
      inOrderMatchRatio("the quick brown fox jumps", "quick fox"),
    ).toBeCloseTo(2 / 5);
  });

  it("rejects out-of-order words — a pointer never rewinds", () => {
    // Learner swaps the order: only the longer ordered run counts.
    expect(
      inOrderMatchRatio("keep going today", "today keep going"),
    ).toBeCloseTo(2 / 3);
  });

  it("repeated words must appear twice in the transcript", () => {
    expect(inOrderMatchRatio("go go go", "go go")).toBeCloseTo(2 / 3);
  });

  it("returns 0 on empty expected or no overlap", () => {
    expect(inOrderMatchRatio("", "anything")).toBe(0);
    expect(inOrderMatchRatio("hello world", "nothing alike")).toBe(0);
  });

  it("folds curly apostrophes like the rest of the pipeline", () => {
    expect(inOrderMatchRatio("It’s fine", "it's fine")).toBe(1);
  });
});

describe("alignWords", () => {
  it("marks every word correct on identical input", () => {
    expect(alignWords("keep going", "keep going")).toEqual([
      { status: "correct", word: "keep" },
      { status: "correct", word: "going" },
    ]);
  });

  it("flags substitutions, omissions and extras separately", () => {
    // want: "it takes resilience"; got: "it needs real resilience". The
    // backtrace prefers insertions before substitutions, so the extra word
    // surfaces first — any minimal alignment is equally honest here.
    const ops = alignWords("it takes resilience", "it needs real resilience");
    expect(ops).toEqual([
      { status: "correct", word: "it" },
      { status: "extra", word: "needs" },
      { status: "wrong", word: "takes", typed: "real" },
      { status: "correct", word: "resilience" },
    ]);
  });

  it("reports a whole-word missing run", () => {
    const ops = alignWords("it takes resilience today", "it today");
    expect(ops[0]).toEqual({ status: "correct", word: "it" });
    expect(ops[1]).toEqual({ status: "missing", word: "takes" });
    expect(ops[2]).toEqual({ status: "missing", word: "resilience" });
    expect(ops[3]).toEqual({ status: "correct", word: "today" });
  });

  it("keeps surface forms in ops while comparing normalized", () => {
    const ops = alignWords("It’s fine.", "it's fine");
    expect(ops[0]).toEqual({ status: "correct", word: "It’s" });
  });

  it("empty typing marks everything missing", () => {
    const ops = alignWords("keep going", "");
    expect(ops).toEqual([
      { status: "missing", word: "keep" },
      { status: "missing", word: "going" },
    ]);
  });
});

describe("blankTargetInSentence", () => {
  it("splits the sentence around the surface form", () => {
    expect(
      blankTargetInSentence("It takes resilience to keep going.", "resilience"),
    ).toEqual({ before: "It takes ", after: " to keep going." });
  });

  it("matches multi-word phrases and curly apostrophes", () => {
    expect(
      blankTargetInSentence("You should keep going today.", "keep going"),
    ).toEqual({ before: "You should ", after: " today." });
    expect(blankTargetInSentence("It’s okay.", "it's")).not.toBeNull();
  });

  it("returns null when the surface form no longer appears", () => {
    expect(
      blankTargetInSentence("Different sentence.", "resilience"),
    ).toBeNull();
  });
});
