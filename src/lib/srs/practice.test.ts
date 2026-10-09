import { describe, expect, it } from "vitest";

import {
  answersMatch,
  autoRating,
  blankTargetInSentence,
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
      wordAccuracy("It takes resilience to keep going.", "it takes resilience to keep going"),
    ).toBe(1);
  });

  it("costs one position per missing or extra word, not the tail", () => {
    // Missing "takes" — Levenshtein keeps the suffix aligned.
    expect(
      wordAccuracy("It takes resilience to keep going.", "it resilience to keep going"),
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
    expect(
      autoRating("sentence_dictation", { word_accuracy: 0.95 }),
    ).toBe("Good");
    expect(
      autoRating("sentence_dictation", { word_accuracy: 0.5 }),
    ).toBe("Again");
  });
});

describe("blankTargetInSentence", () => {
  it("splits the sentence around the surface form", () => {
    expect(blankTargetInSentence("It takes resilience to keep going.", "resilience")).toEqual(
      { before: "It takes ", after: " to keep going." },
    );
  });

  it("matches multi-word phrases and curly apostrophes", () => {
    expect(
      blankTargetInSentence("You should keep going today.", "keep going"),
    ).toEqual({ before: "You should ", after: " today." });
    expect(blankTargetInSentence("It’s okay.", "it's")).not.toBeNull();
  });

  it("returns null when the surface form no longer appears", () => {
    expect(blankTargetInSentence("Different sentence.", "resilience")).toBeNull();
  });
});
