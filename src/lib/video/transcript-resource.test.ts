import { describe, expect, it } from "vitest";
import {
  aiTranscriptionAllowed,
  normalizeSegments,
  segmentsToSentences,
  sentencesToSegments,
  TranscriptValidationError,
  validateTranscriptResource,
  type TranscriptResource,
} from "./transcript-resource";

function resource(
  partial: Partial<TranscriptResource> = {},
): TranscriptResource {
  return {
    id: "r1",
    media: { provider: "youtube", providerId: "abcdefghijk" },
    language: "en",
    source: "ato_library",
    segments: [{ id: "a", startMs: 0, endMs: 1000, text: "Hello" }],
    provenance: { createdAt: "2026-10-07T00:00:00Z" },
    rights: { sharingScope: "library" },
    ...partial,
  };
}

describe("normalizeSegments", () => {
  it("rejects negative start", () => {
    expect(() =>
      normalizeSegments([{ startMs: -1, endMs: 5, text: "x" }]),
    ).toThrow(TranscriptValidationError);
  });

  it("rejects endMs <= startMs", () => {
    expect(() =>
      normalizeSegments([{ startMs: 5, endMs: 5, text: "x" }]),
    ).toThrow(TranscriptValidationError);
  });

  it("rejects non-finite timing", () => {
    expect(() =>
      normalizeSegments([{ startMs: 0, endMs: NaN, text: "x" }]),
    ).toThrow(TranscriptValidationError);
  });

  it("rejects empty text", () => {
    expect(() =>
      normalizeSegments([{ startMs: 0, endMs: 5, text: "   " }]),
    ).toThrow(TranscriptValidationError);
  });

  it("sorts unsorted input", () => {
    const out = normalizeSegments([
      { startMs: 1000, endMs: 2000, text: "b" },
      { startMs: 0, endMs: 1000, text: "a" },
    ]);
    expect(out.map((s) => s.text)).toEqual(["a", "b"]);
  });

  it("clamps soft overlaps into the next segment's start", () => {
    const out = normalizeSegments([
      { startMs: 0, endMs: 1500, text: "a" },
      { startMs: 1000, endMs: 2000, text: "b" },
    ]);
    expect(out[0].endMs).toBe(1000);
    expect(out[1].endMs).toBe(2000);
  });

  it("clamps a segment containing the next one entirely", () => {
    // a[0–5000] contains b[1000–2000]: a yields display time to b.
    const out = normalizeSegments([
      { startMs: 0, endMs: 5000, text: "a" },
      { startMs: 1000, endMs: 2000, text: "b" },
    ]);
    expect(out.map((s) => [s.startMs, s.endMs])).toEqual([
      [0, 1000],
      [1000, 2000],
    ]);
  });

  it("drops a same-start segment clamped to zero duration", () => {
    // b[0–500] sorts before a[0–1000] (endMs asc); b clamps to a's start
    // (0) → zero duration → dropped. a and c survive.
    const out = normalizeSegments([
      { startMs: 0, endMs: 1000, text: "a" },
      { startMs: 0, endMs: 500, text: "b" },
      { startMs: 1500, endMs: 2000, text: "c" },
    ]);
    expect(out.map((s) => s.text)).toEqual(["a", "c"]);
  });

  it("rejects an empty segment list", () => {
    expect(() => normalizeSegments([])).toThrow(TranscriptValidationError);
  });

  it("rejects non-array input", () => {
    expect(() => normalizeSegments(null as never)).toThrow(
      TranscriptValidationError,
    );
  });

  it("makes duplicate ids unique", () => {
    const out = normalizeSegments([
      { id: "x", startMs: 0, endMs: 100, text: "a" },
      { id: "x", startMs: 200, endMs: 300, text: "b" },
    ]);
    expect(new Set(out.map((s) => s.id)).size).toBe(2);
  });
});

describe("validateTranscriptResource", () => {
  it("accepts a complete library resource", () => {
    expect(validateTranscriptResource(resource())).toBeTruthy();
  });

  it("rejects missing provenance", () => {
    expect(() =>
      validateTranscriptResource(resource({ provenance: undefined as never })),
    ).toThrow(/provenance/);
  });

  it("rejects missing rights scope", () => {
    expect(() =>
      validateTranscriptResource(resource({ rights: undefined as never })),
    ).toThrow(/rights/);
  });

  it("rejects media without providerId", () => {
    expect(() =>
      validateTranscriptResource(resource({ media: { provider: "youtube" } })),
    ).toThrow(/providerId/);
  });
});

describe("aiTranscriptionAllowed", () => {
  it("refuses YouTube media", () => {
    expect(
      aiTranscriptionAllowed({ provider: "youtube", providerId: "x" }),
    ).toBe(false);
  });

  it("allows learner uploads and cleared corpus", () => {
    expect(aiTranscriptionAllowed({ provider: "upload" })).toBe(true);
    expect(aiTranscriptionAllowed({ provider: "voa" })).toBe(true);
  });

  it("validateTranscriptResource enforces the gate", () => {
    expect(() =>
      validateTranscriptResource(
        resource({
          source: "ai_transcription",
          provenance: { createdAt: "x", model: "whisper-1" },
        }),
      ),
    ).toThrow(/rights-cleared/);
  });

  it("requires provenance.model for ai_transcription", () => {
    expect(() =>
      validateTranscriptResource(
        resource({
          source: "ai_transcription",
          media: { provider: "upload", providerId: "u1" },
        }),
      ),
    ).toThrow(/model/);
  });
});

describe("sentence/segment mapping", () => {
  it("round-trips losslessly", () => {
    const sentences = [
      { i: 0, start_ms: 0, end_ms: 1200, text: "Hello" },
      { i: 1, start_ms: 1300, end_ms: 2500, text: "World" },
    ];
    const back = segmentsToSentences(sentencesToSegments(sentences));
    expect(back.map((s) => s.text)).toEqual(["Hello", "World"]);
    expect(back.map((s) => s.start_ms)).toEqual([0, 1300]);
    expect(back.map((s) => s.end_ms)).toEqual([1200, 2500]);
  });

  it("throws on untimed sentences instead of fabricating 0-0 timing", () => {
    expect(() =>
      sentencesToSegments([{ i: 0, start_ms: null, end_ms: null, text: "x" }]),
    ).toThrow(TranscriptValidationError);
  });
});
