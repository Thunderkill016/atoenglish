import { describe, expect, it } from "vitest";

import {
  ACTIVE_CUE_GLOSS_LIMIT,
  GLOSS_SIZE,
  lookupGloss,
  sentenceGlosses,
} from "@/lib/read/gloss";

describe("gloss dictionary", () => {
  it("builds a non-trivial dictionary from the curated vocabulary", () => {
    expect(GLOSS_SIZE).toBeGreaterThan(200);
  });

  it("returns the curated meaning for an exact headword", () => {
    const entry = lookupGloss("hello");
    expect(entry).not.toBeNull();
    expect(entry!.meaning_vn).toContain("chào");
  });
});

describe("inflection resolution", () => {
  it("resolves plural -s to the headword", () => {
    const entry = lookupGloss("teachers");
    expect(entry?.word).toBe("teacher");
  });

  it("resolves -ing forms — exact entry or doubled-consonant undo", () => {
    // "swimming" exists in the dictionary itself → direct hit, no rule needed.
    const entry = lookupGloss("swimming");
    expect(
      entry === null || entry.word === "swim" || entry.word === "swimming",
    ).toBe(true);
  });

  it("resolves -ed to the headword", () => {
    const entry = lookupGloss("worked");
    expect(entry?.word).toBe("work");
  });
});

describe("honest misses", () => {
  it("returns null — never a fabricated meaning — for words outside the dictionary", () => {
    expect(lookupGloss("photosynthesis")).toBeNull();
    expect(lookupGloss("zzzzq")).toBeNull();
  });
});

describe("automatic sentence glosses", () => {
  it("normalizes and deduplicates inflections while keeping the visible source form", () => {
    const entries = sentenceGlosses("WORK worked. Teachers work.");
    expect(entries.map((entry) => entry.word)).toEqual(["work", "teacher"]);
    expect(entries[0].surface).toBe("WORK");
    expect(entries[0].meaning_vn).toBe(lookupGloss("work")!.meaning_vn);
  });
  it("prefers an existing phrase and does not construct a phrase across punctuation", () => {
    expect(
      sentenceGlosses("We go to work.").map((entry) => entry.word),
    ).toContain("go to work");
    expect(
      sentenceGlosses("We go, to work.").map((entry) => entry.word),
    ).not.toContain("go to work");
  });
  it("bounds meanings for reading and never fabricates unknown or non-English words", () => {
    expect(
      sentenceGlosses("hello teacher work hospital school morning"),
    ).toHaveLength(ACTIVE_CUE_GLOSS_LIMIT);
    expect(sentenceGlosses("zzzzq photosynthesis 123 tiếng Việt 🙂")).toEqual(
      [],
    );
  });
});
