import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { webcrypto } from "node:crypto";
import {
  outsideTranslationWindow,
  translationBatch,
  translationFingerprint,
  translationInput,
  translationPayload,
  validateTranslations,
  TRANSLATION_MAX_CHARS,
  DEVICE_TRANSLATION_PROFILE,
} from "./translation";
import type { Sentence } from "./types";
const sentences: Sentence[] = Array.from({ length: 30 }, (_, n) => ({
  i: n * 2,
  text: `Sentence ${n}.`,
  start_ms: n * 1000,
  end_ms: n * 1000 + 900,
}));
beforeEach(() => vi.stubGlobal("crypto", webcrypto));
afterEach(() => vi.unstubAllGlobals());
describe("subtitle translation contract", () => {
  it("preserves sparse source IDs rather than joining results by position", () => {
    expect(
      validateTranslations(
        [
          { i: 4, vi: "Bốn" },
          { i: 0, vi: null },
        ],
        sentences,
      ),
    ).toEqual([
      { i: 4, vi: "Bốn" },
      { i: 0, vi: null },
    ]);
    expect(() =>
      validateTranslations([{ i: 3, vi: "Lạc câu" }], sentences),
    ).toThrow();
    expect(() =>
      validateTranslations(
        [
          { i: 0, vi: "A" },
          { i: 0, vi: "B" },
        ],
        sentences,
      ),
    ).toThrow();
    expect(() => validateTranslations([{ i: 0, vi: "" }], sentences)).toThrow();
  });
  it("prioritises the playback neighborhood then wraps back to untranslated earlier cues", () => {
    const first = translationBatch(sentences, new Set(), 38);
    expect(first[0].i).toBe(38);
    expect(first.length).toBeLessThanOrEqual(12);
    const done = new Set(first.map((s) => s.i));
    expect(translationBatch(sentences, done, 38)[0].i).toBe(0);
    expect(
      translationBatch(sentences, new Set([4]), 0).map((s) => s.i),
    ).toEqual([0, 2]);
    expect(
      translationBatch(sentences, new Set(sentences.map((s) => s.i)), 0),
    ).toEqual([]);
  });
  it("uses adjacent context only and never changes source timings or words", () => {
    const original = structuredClone(sentences);
    const input = translationPayload(sentences, sentences.slice(4, 7));
    expect(input.before.map((s) => s.i)).toEqual([4, 6]);
    expect(input.after.map((s) => s.i)).toEqual([14, 16]);
    expect(input.lines.map((s) => s.i)).toEqual([8, 10, 12]);
    expect(sentences).toEqual(original);
    expect(input.lines[0]).not.toHaveProperty("start_ms");
  });
  it("drops context at the budget boundary without silently truncating a sentence", () => {
    const long = { ...sentences[2], text: "x".repeat(TRANSLATION_MAX_CHARS) };
    const input = translationPayload(
      [sentences[0], long, sentences[3]],
      [long],
    );
    expect(input.before).toEqual([]);
    expect(input.after).toEqual([]);
    expect(input.lines[0].text).toHaveLength(TRANSLATION_MAX_CHARS);
    expect(() =>
      translationPayload(
        [{ ...long, text: long.text + "x" }],
        [{ ...long, text: long.text + "x" }],
      ),
    ).toThrow();
    expect(
      translationInput.safeParse({ ...input, after: [input.lines[0]] }).success,
    ).toBe(false);
  });
  it("honors a provider's single-cue and context budget without rewriting source", () => {
    expect(
      translationBatch(sentences, new Set(), 8, 1, 100).map((s) => s.i),
    ).toEqual([8]);
    const cue = { ...sentences[4], text: "x".repeat(100) };
    const source = [sentences[3], cue, sentences[5]];
    expect(translationPayload(source, [cue], 100)).toMatchObject({
      before: [],
      after: [],
      lines: [{ i: 8, text: cue.text }],
    });
    expect(() => translationPayload(source, [cue], 99)).toThrow(
      "Source cue exceeds provider budget",
    );
    expect(source[1].start_ms).toBe(sentences[4].start_ms);
  });
  it("retains the nearest context on both sides before admitting distant background", () => {
    const source = sentences.slice(0, 5).map((line, n) => ({
      ...line,
      text:
        n === 0
          ? "x".repeat(190)
          : n === 4
            ? "y".repeat(150)
            : n === 2
              ? "She went to the bank."
              : n === 1
                ? "Now let me explain."
                : "She sat by the river.",
    }));
    const original = structuredClone(source);
    const input = translationPayload(source, [source[2]], 100);
    expect(input.before).toEqual([{ i: source[1].i, text: source[1].text }]);
    expect(input.after).toEqual([{ i: source[3].i, text: source[3].text }]);
    expect(input.lines).toEqual([{ i: source[2].i, text: source[2].text }]);
    expect(source).toEqual(original);
  });
  it("leaves noise out of background while preserving it as a selected source cue", () => {
    const source = sentences
      .slice(0, 5)
      .map((line, n) => (n === 1 || n === 3 ? { ...line, noise: true } : line));
    const input = translationPayload(source, [source[2]]);
    expect(input.before.map((line) => line.i)).toEqual([source[0].i]);
    expect(input.after.map((line) => line.i)).toEqual([source[4].i]);
    expect(translationPayload(source, [source[1]]).lines[0].text).toBe(
      source[1].text,
    );
  });
  it("rejects empty, foreign, edited, reordered, duplicated or non-contiguous source selections", () => {
    for (const selected of [
      [],
      [{ ...sentences[0], i: 999 }],
      [{ ...sentences[0], text: "Changed" }],
      [sentences[1], sentences[0]],
      [sentences[0], sentences[0]],
      [sentences[0], sentences[2]],
    ])
      expect(() => translationPayload(sentences, selected)).toThrow(
        "Selected cues must match contiguous source sentences",
      );
  });
  it("invalidates cache on source, timing, segmentation or provider changes", async () => {
    const key = await translationFingerprint(sentences, 2);
    expect(await translationFingerprint(sentences, 2)).toBe(key);
    for (const changed of [
      sentences.map((s, n) => (n ? s : { ...s, text: "Changed." })),
      sentences.map((s, n) => (n ? s : { ...s, start_ms: 42 })),
    ])
      expect(await translationFingerprint(changed, 2)).not.toBe(key);
    expect(await translationFingerprint(sentences, 3)).not.toBe(key);
    expect(
      await translationFingerprint(sentences, 2, DEVICE_TRANSLATION_PROFILE),
    ).not.toBe(key);
  });
});

describe("translation context cache identity", () => {
  it("invalidates on a changed video title or human Vietnamese anchor", async () => {
    const key = await translationFingerprint(
      sentences,
      2,
      DEVICE_TRANSLATION_PROFILE,
      "Talk A",
    );
    expect(
      await translationFingerprint(
        sentences,
        2,
        DEVICE_TRANSLATION_PROFILE,
        "Talk B",
      ),
    ).not.toBe(key);
    expect(
      await translationFingerprint(
        sentences,
        2,
        DEVICE_TRANSLATION_PROFILE,
        "  Talk A  ",
      ),
    ).toBe(key);
    const anchored = sentences.map((s, n) =>
      n ? s : { ...s, vi: "Bố tôi đã dạy tôi." },
    );
    expect(
      await translationFingerprint(
        anchored,
        2,
        DEVICE_TRANSLATION_PROFILE,
        "Talk A",
      ),
    ).not.toBe(key);
  });
});

describe("learner-paced window and whole-video context", () => {
  it("only offers cues from one back to twelve ahead of the playhead", () => {
    // IDs are n*2; playhead on ID 20 (offset 10) → offsets 9..22 allowed.
    const skip = outsideTranslationWindow(sentences, 20);
    const allowed = sentences.filter((s) => !skip.has(s.i)).map((s) => s.i);
    expect(allowed).toEqual(Array.from({ length: 14 }, (_, k) => (9 + k) * 2));
    const batch = translationBatch(sentences, new Set(), 20, 30, 6000, skip);
    expect(batch[0].i).toBe(20);
    expect(batch.at(-1)!.i).toBe(44);
    // Window exhausted → nothing to do until the learner moves on.
    const done = new Set(allowed);
    expect(translationBatch(sentences, done, 20, 30, 6000, skip)).toEqual([]);
  });

  it("adds the video title and known Vietnamese of preceding lines as context only", () => {
    const input = translationPayload(sentences, [sentences[5]], 6000, {
      title: "  A talk about fathers  ",
      known: { 6: "Câu ba.", 8: "Câu bốn.", 12: "Không phải ngữ cảnh." },
    });
    expect(input.title).toBe("A talk about fathers");
    expect(input.before).toEqual([
      { i: 6, text: "Sentence 3.", vi: "Câu ba." },
      { i: 8, text: "Sentence 4.", vi: "Câu bốn." },
    ]);
    // Following lines never carry Vietnamese, and only the source is translated.
    expect(input.after).toEqual([
      { i: 12, text: "Sentence 6." },
      { i: 14, text: "Sentence 7." },
    ]);
    expect(input.lines).toEqual([{ i: 10, text: "Sentence 5." }]);
  });

  it("drops title and known Vietnamese before ever truncating the source", () => {
    const source = sentences[5];
    const tight = source.text.length + "Sentence 4.".length;
    const input = translationPayload(sentences, [source], tight, {
      title: "Long title",
      known: { 8: "Câu bốn." },
    });
    expect(input.title).toBeUndefined();
    expect(input.lines).toEqual([{ i: 10, text: source.text }]);
    expect(input.before).toEqual([{ i: 8, text: "Sentence 4." }]);
  });
});
