import { describe, expect, it } from "vitest";

import { lemmaKey } from "./lemma";

describe("lemmaKey", () => {
  it("normalizes case, whitespace and edge punctuation", () => {
    expect(lemmaKey("  Book ")).toBe("book");
    expect(lemmaKey("How  are   you?")).toBe("how are you");
    expect(lemmaKey("My name is")).toBe("my name is");
  });

  it("unifies curly and straight apostrophes", () => {
    expect(lemmaKey("don’t")).toBe(lemmaKey("don't"));
    expect(lemmaKey("I’m")).toBe("i'm");
  });

  it("collapses regular plurals to the singular lemma", () => {
    expect(lemmaKey("books")).toBe("book");
    expect(lemmaKey("plays")).toBe("play");
    expect(lemmaKey("ideas")).toBe("idea");
    expect(lemmaKey("cases")).toBe("case");
    expect(lemmaKey("horses")).toBe("horse");
  });

  it("collapses ies inflections with a sufficient stem", () => {
    expect(lemmaKey("studies")).toBe("study");
    expect(lemmaKey("ladies")).toBe("lady");
  });

  it("collapses oes inflections for longer words", () => {
    expect(lemmaKey("potatoes")).toBe("potato");
    expect(lemmaKey("heroes")).toBe("hero");
  });

  it("collapses ed/ing only onto vowel-final stems", () => {
    expect(lemmaKey("played")).toBe("play");
    expect(lemmaKey("going")).toBe("go");
    expect(lemmaKey("agreed")).toBe("agree");
  });

  it("never merges forms it cannot safely deinflect", () => {
    // Documented boundary: conservative by design.
    expect(lemmaKey("running")).toBe("running");
    expect(lemmaKey("stopped")).toBe("stopped");
    expect(lemmaKey("created")).toBe("created");
    expect(lemmaKey("goes")).toBe("goes");
    expect(lemmaKey("making")).toBe("making");
    expect(lemmaKey("class")).toBe("class");
    expect(lemmaKey("this")).toBe("this");
    expect(lemmaKey("virus")).toBe("virus");
    expect(lemmaKey("died")).toBe("died");
    expect(lemmaKey("tries")).toBe("tries");
    expect(lemmaKey("flies")).toBe("flies");
  });

  it("keeps multi-word chunks atomic and distinct from head words", () => {
    expect(lemmaKey("My name is")).toBe("my name is");
    expect(lemmaKey("my name is")).not.toBe(lemmaKey("name"));
    expect(lemmaKey("good morning")).not.toBe(lemmaKey("good"));
  });

  it("rejects input without letter or digit content", () => {
    expect(lemmaKey("")).toBeNull();
    expect(lemmaKey("   ")).toBeNull();
    expect(lemmaKey("?!.")).toBeNull();
  });
});
