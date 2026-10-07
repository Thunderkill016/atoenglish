import { describe, expect, it } from "vitest";
import {
  CAPTIONS_MESSAGE_TYPE,
  payloadToTranscript,
  validateCaptionsPayload,
} from "./extension-bridge";
import type { Json3Event } from "./types";

const ev = (t: number, text: string, d = 2000): Json3Event => ({
  tStartMs: t,
  dDurationMs: d,
  segs: [{ utf8: text }],
});

const EN_EVENTS = [
  ev(0, "Hello there."),
  ev(2000, "How are you?"),
  ev(4000, "I am fine."),
];
const VI_EVENTS = [
  ev(0, "Xin chào."),
  ev(2000, "Bạn khỏe không?"),
  ev(4000, "Tôi khỏe."),
];

function payload(overrides: Record<string, unknown> = {}) {
  return {
    type: CAPTIONS_MESSAGE_TYPE,
    version: 1,
    videoId: "8jPQjjsBbIc",
    title: "Test video",
    tracks: [
      { languageCode: "en", kind: "manual", events: EN_EVENTS },
      { languageCode: "vi", kind: "manual", events: VI_EVENTS },
    ],
    ...overrides,
  };
}

describe("validateCaptionsPayload", () => {
  it("accepts a well-formed payload", () => {
    const p = validateCaptionsPayload(payload());
    expect(p?.videoId).toBe("8jPQjjsBbIc");
    expect(p?.tracks).toHaveLength(2);
  });

  it("rejects non-object / missing fields", () => {
    expect(validateCaptionsPayload(null)).toBeNull();
    expect(validateCaptionsPayload("x")).toBeNull();
    expect(validateCaptionsPayload(payload({ videoId: 42 }))).toBeNull();
    expect(validateCaptionsPayload(payload({ tracks: [] }))).toBeNull();
  });

  it("rejects malformed events", () => {
    const bad = payload({
      tracks: [
        { languageCode: "en", kind: "manual", events: [{ segs: [{}] }] },
      ],
    });
    expect(validateCaptionsPayload(bad)).toBeNull();
  });

  it.each([NaN, Infinity, -1])(
    "rejects an invalid cue duration %s",
    (duration) => {
      expect(
        validateCaptionsPayload(
          payload({
            tracks: [
              {
                languageCode: "en",
                kind: "manual",
                events: [ev(0, "Hello.", duration)],
              },
            ],
          }),
        ),
      ).toBeNull();
    },
  );

  it("rejects unknown track kinds", () => {
    const bad = payload({
      tracks: [{ languageCode: "en", kind: "weird", events: EN_EVENTS }],
    });
    expect(validateCaptionsPayload(bad)).toBeNull();
  });
});

describe("payloadToTranscript", () => {
  it("segments English and aligns the manual Vietnamese track", () => {
    const t = payloadToTranscript(validateCaptionsPayload(payload())!);
    expect(t?.trackKind).toBe("manual");
    expect(t?.language).toBe("en");
    expect(t?.sentences.map((s) => s.text)).toEqual([
      "Hello there.",
      "How are you?",
      "I am fine.",
    ]);
    expect(t?.sentences[0].vi).toBe("Xin chào.");
    expect(t?.sentences[1].vi).toBe("Bạn khỏe không?");
  });

  it("returns null when no English track exists", () => {
    const p = validateCaptionsPayload(
      payload({
        tracks: [{ languageCode: "vi", kind: "manual", events: VI_EVENTS }],
      }),
    )!;
    expect(payloadToTranscript(p)).toBeNull();
  });

  it("drops a mistimed Vietnamese track instead of mispairing", () => {
    // VI cues offset 90s from EN — the same failure as the live TED check.
    const shifted = VI_EVENTS.map((e) => ({
      ...e,
      tStartMs: e.tStartMs + 90_000,
    }));
    const p = validateCaptionsPayload(
      payload({
        tracks: [
          { languageCode: "en", kind: "manual", events: EN_EVENTS },
          { languageCode: "vi", kind: "manual", events: shifted },
        ],
      }),
    )!;
    const t = payloadToTranscript(p)!;
    expect(t.sentences.every((s) => s.vi === undefined)).toBe(true);
  });

  it("ignores ASR Vietnamese (not a human translation)", () => {
    const p = validateCaptionsPayload(
      payload({
        tracks: [
          { languageCode: "en", kind: "manual", events: EN_EVENTS },
          { languageCode: "vi", kind: "asr", events: VI_EVENTS },
        ],
      }),
    )!;
    const t = payloadToTranscript(p)!;
    expect(t.sentences.every((s) => s.vi === undefined)).toBe(true);
  });
});
