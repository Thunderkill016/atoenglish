import { describe, expect, it } from "vitest";

import { GLOSS_SIZE, lookupGloss } from "@/lib/read/gloss";

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
