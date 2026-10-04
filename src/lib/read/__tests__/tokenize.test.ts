import { describe, expect, it } from "vitest";

import { distinctWords, normalizeWord, tokenizeText } from "@/lib/read/tokenize";

describe("tokenizeText", () => {
  it("splits words and punctuation into render tokens", () => {
    const tokens = tokenizeText("Hello, world!");
    expect(tokens.map((t) => t.type)).toEqual([
      "word",
      "punct",
      "space",
      "word",
      "punct",
    ]);
    expect(tokens[0]).toMatchObject({ text: "Hello", normalized: "hello" });
  });

  it("keeps apostrophes inside a word token", () => {
    const words = tokenizeText("I don't think it's late").filter((t) => t.type === "word");
    expect(words.map((w) => w.normalized)).toContain("don't");
    expect(words.map((w) => w.normalized)).toContain("it's");
  });

  it("renders non-Latin runs as neutral other spans, never as words", () => {
    const tokens = tokenizeText("Xin chào こんにちは");
    const others = tokens.filter((t) => t.type === "other" || t.type === "punct");
    expect(others.some((t) => t.text.includes("こ"))).toBe(true);
    expect(tokens.filter((t) => t.type === "word").map((w) => w.normalized)).not.toContain("んにちは");
  });

  it("does not treat digits as words", () => {
    const tokens = tokenizeText("Room 101 is ready");
    expect(tokens.filter((t) => t.type === "word").map((w) => w.normalized)).toEqual([
      "room",
      "is",
      "ready",
    ]);
  });
});

describe("normalizeWord / distinctWords", () => {
  it("normalizes case so surface forms share one state", () => {
    expect(normalizeWord("Work")).toBe("work");
    expect(distinctWords("Work. work! WORK")).toEqual(["work"]);
  });
});
