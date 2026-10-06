import { describe, expect, it } from "vitest";
import {
  detectSubtitleKind,
  parseSubtitleFile,
  parseTimestamp,
} from "./subtitle-file";

const SRT = `1
00:00:01,000 --> 00:00:04,000
Hello world.

2
00:00:04,500 --> 00:00:07,200
This is the
second cue.

3
00:00:07,500 --> 00:00:09,000
Bye now.
`;

const VTT = `WEBVTT

00:00:01.000 --> 00:00:04.000
Hello <i>world</i>.

00:00:04.500 --> 00:00:07.200 align:start position:0%
Second cue.
`;

const TIMED = `[00:01] Hello world.
[00:04.500] Second line
01:23 Third line here`;

describe("parseTimestamp", () => {
  it("parses all timestamp shapes", () => {
    expect(parseTimestamp("00:00:01,000")).toBe(1000);
    expect(parseTimestamp("00:00:04.500")).toBe(4500);
    expect(parseTimestamp("01:23")).toBe(83_000);
    expect(parseTimestamp("1:02:03.500")).toBe(3_723_500);
    expect(parseTimestamp("00:07")).toBe(7000);
  });

  it("rejects malformed timestamps", () => {
    expect(parseTimestamp("99:99")).toBeNull();
    expect(parseTimestamp("abc")).toBeNull();
    expect(parseTimestamp("")).toBeNull();
  });
});

describe("detectSubtitleKind", () => {
  it("detects srt, vtt, timed paste and plain text", () => {
    expect(detectSubtitleKind(SRT)).toBe("srt");
    expect(detectSubtitleKind(VTT)).toBe("vtt");
    expect(detectSubtitleKind(TIMED)).toBe("timed_paste");
    expect(detectSubtitleKind("Just some plain text.")).toBe("plain");
  });
});

describe("parseSubtitleFile", () => {
  it("parses srt into timed sentences with text joined across lines", () => {
    const r = parseSubtitleFile(SRT);
    expect(r.kind).toBe("srt");
    expect(r.sentences.length).toBeGreaterThanOrEqual(2);
    const all = r.sentences.map((s) => s.text).join(" ");
    expect(all).toContain("Hello world.");
    expect(all).toContain("second cue.");
    expect(r.sentences[0].start_ms).toBe(1000);
  });

  it("parses vtt, stripping tags and cue settings", () => {
    const r = parseSubtitleFile(VTT);
    expect(r.kind).toBe("vtt");
    const all = r.sentences.map((s) => s.text).join(" ");
    expect(all).toContain("Hello world.");
    expect(all).not.toContain("<i>");
    expect(r.sentences[0].start_ms).toBe(1000);
  });

  it("parses timed paste lines into cues", () => {
    const r = parseSubtitleFile(TIMED);
    expect(r.kind).toBe("timed_paste");
    expect(r.sentences.length).toBeGreaterThanOrEqual(2);
    expect(r.sentences[0].start_ms).toBe(1000);
    // end = next cue start
    const hello = r.sentences.find((s) => s.text.includes("Hello"));
    expect(hello?.end_ms).toBe(4500);
  });

  it("parses plain text with null timings", () => {
    const r = parseSubtitleFile("One two. Three four.");
    expect(r.kind).toBe("plain");
    expect(r.sentences).toHaveLength(2);
    expect(r.sentences[0].start_ms).toBeNull();
  });

  it("rejects empty input", () => {
    expect(parseSubtitleFile("").kind).toBe("invalid");
    expect(parseSubtitleFile("   \n\n  ").kind).toBe("invalid");
  });
});
