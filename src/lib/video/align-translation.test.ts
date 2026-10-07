import { describe, expect, it } from "vitest";
import { alignHumanTranslation, cueStartMatch } from "./align-translation";
import type { Json3Event, Sentence } from "./types";

const sentences: Sentence[] = [
  { i: 0, text: "My father taught me.", start_ms: 0, end_ms: 2000 },
  { i: 1, text: "(Applause)", start_ms: 2000, end_ms: 3000, noise: true },
  { i: 2, text: "He is my teacher.", start_ms: 3000, end_ms: 6000 },
  { i: 3, text: "Untimed line.", start_ms: null, end_ms: null },
];
const ev = (tStartMs: number, dDurationMs: number, text: string): Json3Event => ({
  tStartMs,
  dDurationMs,
  segs: [{ utf8: text }],
});

describe("alignHumanTranslation", () => {
  it("assigns each Vietnamese cue to the sentence holding its midpoint and joins split cues", () => {
    const out = alignHumanTranslation(
      sentences,
      [
        ev(0, 2000, "Bố tôi đã dạy tôi."),
        ev(3000, 1500, "Ông ấy là"),
        ev(4500, 1500, "thầy của tôi."),
      ],
      [ev(0, 2000, "x"), ev(3000, 1500, "x"), ev(4520, 1500, "x")],
    );
    expect(out.map((s) => s.vi)).toEqual([
      "Bố tôi đã dạy tôi.",
      undefined,
      "Ông ấy là thầy của tôi.",
      undefined,
    ]);
    // Source text and timing are never changed.
    expect(out.map(({ vi: _vi, ...s }) => s)).toEqual(sentences);
  });

  it("falls back to the largest overlap when a midpoint lands in a gap", () => {
    const gappy: Sentence[] = [
      { i: 0, text: "A.", start_ms: 0, end_ms: 1000 },
      { i: 1, text: "B.", start_ms: 3000, end_ms: 4000 },
    ];
    const out = alignHumanTranslation(
      gappy,
      [
        ev(0, 1000, "A vi."),
        ev(500, 2700, "B vi."), // midpoint 1850 is in the gap; overlaps A 500, B 200
      ],
      [ev(0, 1000, "x"), ev(500, 2700, "x")],
    );
    expect(out[0].vi).toBe("A vi. B vi.");
  });

  it("ignores line-append events, blank cues and too-sparse tracks", () => {
    expect(
      alignHumanTranslation(
        sentences,
        [
          { tStartMs: 0, aAppend: 1, segs: [{ utf8: "\n" }] },
          ev(3000, 1000, "   "),
        ],
        [ev(0, 1000, "x")],
      ),
    ).toBe(sentences);
    const many: Sentence[] = Array.from({ length: 10 }, (_, i) => ({
      i,
      text: `S${i}.`,
      start_ms: i * 1000,
      end_ms: i * 1000 + 900,
    }));
    // One cue for ten sentences is not a translation of this transcript.
    expect(
      alignHumanTranslation(many, [ev(0, 900, "Một.")], [ev(0, 900, "x")]),
    ).toBe(many);
  });

  it("rejects a differently timed Vietnamese cut instead of pairing wrong sentences", () => {
    // Live TED case: VI cues lead the English by seconds — time-alignment
    // would attach later lines' meaning to earlier sentences.
    const en = [ev(0, 2000, "x"), ev(3000, 3000, "x")];
    const shifted = [ev(1200, 1500, "Sai câu."), ev(2400, 2000, "Cũng sai.")];
    expect(cueStartMatch(shifted, en)).toBe(0);
    expect(alignHumanTranslation(sentences, shifted, en)).toBe(sentences);
    expect(cueStartMatch([ev(0, 1, "a"), ev(3100, 1, "b")], en)).toBe(1);
  });
});
