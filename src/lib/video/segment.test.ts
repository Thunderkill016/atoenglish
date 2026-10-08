import { describe, expect, it } from "vitest";
import {
  ASR_MAX_DURATION_MS,
  ASR_MAX_WORDS,
  CAPITAL_GAP_SPLIT_MS,
  CUE_MAX_DURATION_MS,
  CUE_MAX_WORDS,
  cuesFromJson3,
  isStaleSegmentation,
  RUNON_SPLIT_MIN_WORDS,
  SEGMENTATION_VERSION,
  segmentAsrEvents,
  segmentCues,
  segmentPlainText,
  segmentTranscript,
  SILENCE_SPLIT_MS,
  WORD_END_ESTIMATE_MS,
} from "./segment";
import type { Json3Event } from "./types";
import rickrollAsrJson from "./__fixtures__/rickroll.asr.json";
import jobsAsrJson from "./__fixtures__/jobs-stanford.asr.json";
import tedAsrJson from "./__fixtures__/ted-calm.asr.json";
import tedManualJson from "./__fixtures__/ted-calm.manual.json";

const rickrollAsr = rickrollAsrJson as { events: Json3Event[] };
const jobsAsr = jobsAsrJson as { events: Json3Event[] };
const tedAsr = tedAsrJson as { events: Json3Event[] };
const tedManual = tedManualJson as { events: Json3Event[] };

const asrFixtures: Array<[string, { events: Json3Event[] }]> = [
  ["rickroll", rickrollAsr],
  ["jobs-stanford", jobsAsr],
  ["ted-calm", tedAsr],
];

describe("segmentAsrEvents — real fixtures", () => {
  it.each(asrFixtures)(
    "%s: produces sentences within hard caps",
    (_name, json) => {
      const sentences = segmentAsrEvents(json.events);
      expect(sentences.length).toBeGreaterThan(3);
      for (const s of sentences) {
        const wordCount = s.text.split(/\s+/).length;
        expect(wordCount).toBeLessThanOrEqual(ASR_MAX_WORDS);
        if (s.start_ms != null && s.end_ms != null) {
          expect(s.end_ms - s.start_ms).toBeLessThanOrEqual(
            ASR_MAX_DURATION_MS + 500, // last word may start just under the cap
          );
        }
        expect(s.text.length).toBeGreaterThan(0);
        expect(s.words?.length).toBe(wordCount);
      }
    },
  );

  it.each(asrFixtures)(
    "%s: sentences are ordered and non-overlapping",
    (_n, json) => {
      const sentences = segmentAsrEvents(json.events);
      for (let i = 1; i < sentences.length; i++) {
        expect(sentences[i].start_ms!).toBeGreaterThanOrEqual(
          sentences[i - 1].start_ms!,
        );
        // Each sentence starts no earlier than the previous one's estimated end.
        expect(sentences[i].start_ms!).toBeGreaterThanOrEqual(
          sentences[i - 1].end_ms! - WORD_END_ESTIMATE_MS,
        );
      }
      sentences.forEach((s, i) => expect(s.i).toBe(i));
    },
  );

  it.each(asrFixtures)(
    "%s: keeps word timings inside the sentence span",
    (_n, json) => {
      for (const s of segmentAsrEvents(json.events)) {
        for (const w of s.words ?? []) {
          expect(w.start_ms).toBeGreaterThanOrEqual(s.start_ms!);
        }
      }
    },
  );

  it("rickroll: splits mid-event on terminal punctuation (pendingSplit)", () => {
    const sentences = segmentAsrEvents(rickrollAsr.events);
    // The fixture's first text event (t=21800) contains "love. You know the
    // rules and so do" — "love." ends with punct mid-event and must become
    // its own sentence cut inside the event span.
    const love = sentences.find((s) => s.text === "love.");
    expect(love).toBeDefined();
    expect(love!.start_ms).toBe(21800);
    const next = sentences[love!.i + 1];
    expect(next.text).toBe("You know the rules");
    expect(next.start_ms!).toBeGreaterThanOrEqual(love!.end_ms!);
    // And the "and so do" | "I." pause boundary (the LEDGER-observed
    // mid-sentence event break) is honoured too.
    const soDo = sentences.find((s) => s.text.endsWith("and so do"));
    expect(soDo).toBeDefined();
    expect(sentences[soDo!.i + 1].text).toBe("I.");
  });

  it("strips [Music]-style noise segs entirely", () => {
    const sentences = segmentAsrEvents(rickrollAsr.events);
    for (const s of sentences) {
      expect(s.text).not.toMatch(/\[|\]|♪/);
    }
    // No sentence may be only noise.
    expect(sentences.every((s) => s.text.trim().length > 0)).toBe(true);
  });
});

describe("segmentAsrEvents — synthetic edge cases", () => {
  const ev = (
    t: number,
    d: number,
    words: string[],
    aAppend = false,
  ): Json3Event => ({
    tStartMs: t,
    dDurationMs: d,
    ...(aAppend ? { aAppend: 1 as const } : {}),
    segs: words.map((w, i) => ({
      utf8: i === 0 ? w : " " + w,
      tOffsetMs: i * 400,
    })),
  });

  it("splits on a long silence even without punctuation", () => {
    const events = [
      ev(0, 3000, ["hello", "world"]),
      {
        tStartMs: 0 + SILENCE_SPLIT_MS + 2000,
        dDurationMs: 2000,
        segs: [{ utf8: "next", tOffsetMs: 0 }],
      },
    ];
    const s = segmentAsrEvents(events);
    expect(s.length).toBe(2);
    expect(s[0].text).toBe("hello world");
    expect(s[0].end_ms!).toBeLessThan(s[1].start_ms!);
  });

  it("force-splits at the word cap", () => {
    const words = Array.from({ length: ASR_MAX_WORDS + 2 }, (_, i) => `w${i}`);
    const s = segmentAsrEvents([ev(0, 999999, words)]);
    expect(s.length).toBe(2);
    expect(s[0].text.split(" ")).toHaveLength(ASR_MAX_WORDS);
  });

  it("handles parenthesized noise and keeps real words", () => {
    const events = [
      {
        tStartMs: 0,
        dDurationMs: 1000,
        segs: [{ utf8: "(Applause)" }],
      },
      ev(1000, 2000, ["real", "talk"]),
    ];
    const s = segmentAsrEvents(events);
    expect(s).toHaveLength(1);
    expect(s[0].text).toBe("real talk");
  });

  it("empty input yields no sentences", () => {
    expect(segmentAsrEvents([])).toEqual([]);
    expect(
      segmentAsrEvents([{ tStartMs: 0, aAppend: 1, segs: [{ utf8: "\n" }] }]),
    ).toEqual([]);
  });
});

describe("segmentAsrEvents — capital-letter sentence boundaries", () => {
  // YouTube ASR capitalizes sentence-initial words but often omits terminal
  // punctuation entirely; without this rule whole verses merge into one row
  // (the JGwWNGJdvx8 blob the Trancy comparison exposed).

  /** Evenly-spaced word segs — `stepMs` controls the inter-word gap. */
  const wordEvent = (
    t: number,
    stepMs: number,
    words: string[],
  ): Json3Event => ({
    tStartMs: t,
    dDurationMs: stepMs * words.length,
    segs: words.map((w, i) => ({
      utf8: i === 0 ? w : " " + w,
      tOffsetMs: i * stepMs,
    })),
  });

  it("splits at a capitalized starter word with no pause or punctuation", () => {
    const s = segmentAsrEvents([
      wordEvent(0, 200, [
        "the",
        "club",
        "isn't",
        "my",
        "lover",
        "So",
        "the",
        "bar",
        "is",
        "where",
        "I",
        "go",
      ]),
    ]);
    expect(s.map((x) => x.text)).toEqual([
      "the club isn't my lover",
      "So the bar is where I go",
    ]);
    // The boundary keeps real word timing — "So" starts sentence two.
    expect(s[1].start_ms).toBe(5 * 200);
  });

  it("keeps capitalized non-starters inline without a pause (New York)", () => {
    const s = segmentAsrEvents([
      wordEvent(0, 200, ["i", "moved", "to", "New", "York", "last", "year"]),
    ]);
    expect(s).toHaveLength(1);
    expect(s[0].text).toBe("i moved to New York last year");
  });

  it("splits a capitalized non-starter when a pause marks the boundary", () => {
    const s = segmentAsrEvents([
      wordEvent(0, 200, ["doing", "shots"]),
      wordEvent(400 + CAPITAL_GAP_SPLIT_MS, 150, [
        "Drinking",
        "fast",
        "and",
        "then",
        "we",
        "talk",
        "slow",
      ]),
    ]);
    expect(s.map((x) => x.text)).toEqual([
      "doing shots",
      "Drinking fast and then we talk slow",
    ]);
  });

  it("never treats 'I'-family words as boundaries", () => {
    const s = segmentAsrEvents([
      wordEvent(0, 200, ["you", "know", "I", "think", "I'm", "sure"]),
    ]);
    expect(s).toHaveLength(1);
  });
});

describe("segmentCues — manual tracks", () => {
  it("merges cues until terminal punctuation on the ted manual fixture", () => {
    const cues = cuesFromJson3(tedManual.events);
    const s = segmentCues(cues);
    expect(s.length).toBeGreaterThan(20);
    // Known first merged sentence: "A few years ago, I broke into my own house."
    const first = s.find((x) => x.text.includes("broke into my own house"));
    expect(first).toBeDefined();
    expect(first!.text).toMatch(/^A few years ago.*house\.$/);
    for (const x of s) {
      const words = x.text.split(/\s+/).length;
      expect(words).toBeLessThanOrEqual(40);
    }
  });

  it("merges short unpunctuated cues and flags music-only lines", () => {
    const cues = [
      { start_ms: 0, end_ms: 1000, text: "I was" },
      { start_ms: 1000, end_ms: 2000, text: "going home" },
      { start_ms: 2000, end_ms: 2500, text: "that night." },
      { start_ms: 2500, end_ms: 3500, text: "[Music]" },
      { start_ms: 3500, end_ms: 4500, text: "And then?" },
    ];
    const s = segmentCues(cues);
    expect(s).toHaveLength(3);
    expect(s[0].text).toBe("I was going home that night.");
    expect(s[0].end_ms).toBe(2500);
    expect(s[1].noise).toBe(true);
    expect(s[1].text).toBe("[Music]");
    expect(s[2].noise).toBeUndefined();
  });

  it("keeps ♪-wrapped lyrics as content — lyric-video regression", () => {
    // dQw4w9WgXcQ's manual track wraps EVERY cue in ♪ — note glyphs are
    // decoration, not noise markers, or the whole track collapses to zero.
    const s = segmentCues([
      { start_ms: 1360, end_ms: 3040, text: "♪ We're no strangers to love ♪" },
      {
        start_ms: 3040,
        end_ms: 5200,
        text: "♪ You know the rules and so do I. ♪",
      },
      { start_ms: 5200, end_ms: 6400, text: "♪ Music ♪" },
    ]);
    const lyric = s.find((x) => x.text.includes("We're no strangers to love"));
    expect(lyric).toBeDefined();
    expect(lyric!.noise).toBeUndefined();
    expect(lyric!.text).not.toMatch(/♪/);
    // A pure instrumental marker still flags noise.
    const marker = s.find((x) => x.noise);
    expect(marker!.text).toBe("♪ Music ♪");
  });

  it("splits when merged text would exceed the word cap", () => {
    // Cue 1 alone is exactly at CUE_MAX_WORDS with no terminal punctuation;
    // cue 2 would push the merge past the cap, so it must split — the old
    // version of this test used ONE long token, which never tripped the cap.
    const cues = [
      {
        start_ms: 0,
        end_ms: 1000,
        text: Array.from({ length: CUE_MAX_WORDS }, (_, i) => `w${i}`).join(
          " ",
        ),
      },
      { start_ms: 1000, end_ms: 2000, text: "more words." },
    ];
    const s = segmentCues(cues);
    expect(s).toHaveLength(2);
    expect(s[0].text.split(/\s+/)).toHaveLength(CUE_MAX_WORDS);
    expect(s[0].end_ms).toBe(cues[0].end_ms);
    expect(s[1].text).toBe("more words.");
  });

  it("splits when the merged span exceeds CUE_MAX_DURATION_MS", () => {
    const cues = [
      { start_ms: 0, end_ms: 5_000, text: "still going" },
      { start_ms: 13_000, end_ms: 14_000, text: "and more" },
    ];
    const s = segmentCues(cues);
    expect(s).toHaveLength(2);
    expect(s[0].end_ms).toBe(cues[0].end_ms);
    expect(s[1].end_ms! - s[0].start_ms!).toBeGreaterThan(CUE_MAX_DURATION_MS);
  });
});

describe("segmentCues — run-on blobs", () => {
  // Lyric/lyric-adjacent manual tracks carry casing but no terminal
  // punctuation; the merge loop then swallows whole verses into one row.
  // Post-splitting at capitalized starter words reproduces the per-line
  // presentation Trancy shows for the same track.

  it("splits an unpunctuated lyric blob at capitalized starters", () => {
    const s = segmentCues([
      {
        start_ms: 0,
        end_ms: 10_000,
        text: "♪ The club isn't the best place to find a lover So the bar is where I go Me and my friends at the table doing shots Drinking fast and then we talk slow ♪",
      },
    ]);
    expect(s.map((x) => x.text)).toEqual([
      "The club isn't the best place to find a lover",
      "So the bar is where I go",
      // "Drinking" is capitalized but not a starter word; without a pause
      // (cues have no word timing) it can't be told from a proper noun.
      "Me and my friends at the table doing shots Drinking fast and then we talk slow",
    ]);
    // Timing interpolates linearly by word share across the blob's span
    // (33 tokens; cuts at 10 = "So" and 17 = "Me").
    expect(s[0].start_ms).toBe(0);
    expect(s[1].start_ms).toBe(Math.round((10 / 33) * 10_000));
    expect(s[2].start_ms).toBe(Math.round((17 / 33) * 10_000));
    expect(s[2].end_ms).toBe(10_000);
    s.forEach((x, i) => expect(x.i).toBe(i));
  });

  it("leaves a run-on at or under the word floor untouched", () => {
    const atFloor = Array.from(
      { length: RUNON_SPLIT_MIN_WORDS - 1 },
      (_, i) => `w${i}`,
    ).join(" ");
    const s = segmentCues([
      { start_ms: 0, end_ms: 2000, text: `${atFloor} And done` },
    ]);
    expect(s).toHaveLength(1);
  });

  it("never post-splits noise rows", () => {
    const raw = "(Applause And Cheering And More Noise Words Here Indeed)";
    const s = segmentCues([{ start_ms: 0, end_ms: 5000, text: raw }]);
    expect(s).toHaveLength(1);
    expect(s[0].noise).toBe(true);
    expect(s[0].text).toBe(raw);
  });
});

describe("segmentPlainText", () => {
  it("splits on terminal punctuation without timings", () => {
    const s = segmentPlainText("Hello world. How are you? I am fine!");
    expect(s).toHaveLength(3);
    expect(s[0]).toMatchObject({
      start_ms: null,
      end_ms: null,
      text: "Hello world.",
    });
  });

  it("returns [] for empty input", () => {
    expect(segmentPlainText("")).toEqual([]);
    expect(segmentPlainText("   ")).toEqual([]);
  });
});

describe("segmentTranscript dispatch", () => {
  it("routes by kind", () => {
    expect(
      segmentTranscript({ kind: "asr", events: rickrollAsr.events }).length,
    ).toBeGreaterThan(3);
    expect(
      segmentTranscript({ kind: "cues", events: tedManual.events }).length,
    ).toBeGreaterThan(20);
    expect(
      segmentTranscript({ kind: "plain", text: "One. Two." }),
    ).toHaveLength(2);
  });
});

describe("isStaleSegmentation", () => {
  it("flags YouTube rows segmented under older rules", () => {
    expect(
      isStaleSegmentation("youtube_manual", SEGMENTATION_VERSION - 1),
    ).toBe(true);
    expect(isStaleSegmentation("youtube_asr", undefined)).toBe(true);
  });
  it("accepts current-version rows", () => {
    expect(isStaleSegmentation("youtube_manual", SEGMENTATION_VERSION)).toBe(
      false,
    );
  });
  it("never flags learner content — there is no upstream to refetch", () => {
    expect(isStaleSegmentation("learner_upload", 1)).toBe(false);
    expect(isStaleSegmentation("plain_text", 1)).toBe(false);
  });
});
