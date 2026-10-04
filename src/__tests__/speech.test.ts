import { describe, it, expect, vi } from "vitest";
import { calcTranscriptMatchScore } from "@/lib/utils/speech";
import { SpeechRecognitionFallback } from "@/lib/utils/speech-fallback";

describe("calcTranscriptMatchScore", () => {
  it("perfect match returns 100", () => {
    expect(calcTranscriptMatchScore("hello world", "hello world")).toBe(100);
  });

  it("empty spoken returns 0", () => {
    expect(calcTranscriptMatchScore("hello world", "")).toBe(0);
  });

  it("empty target remains unscored instead of defaulting to 100", () => {
    expect(calcTranscriptMatchScore("", "anything")).toBe(0);
  });

  it("partial match returns correct percentage", () => {
    // target: 4 words, spoken: 2 match → 50%
    expect(calcTranscriptMatchScore("the quick brown fox", "the brown")).toBe(50);
  });

  it("case-insensitive matching", () => {
    expect(calcTranscriptMatchScore("Hello World", "hello world")).toBe(100);
    expect(calcTranscriptMatchScore("HELLO WORLD", "Hello World")).toBe(100);
  });

  it("ignores punctuation in comparison", () => {
    expect(calcTranscriptMatchScore("hello, world!", "hello world")).toBe(100);
  });

  it("extra words in spoken don't reduce score", () => {
    // target: "hello" → all target words found → 100%
    expect(calcTranscriptMatchScore("hello", "oh hello there")).toBe(100);
  });

  it("completely wrong spoken returns 0", () => {
    expect(calcTranscriptMatchScore("hello world", "foo bar baz")).toBe(0);
  });

  it("single word match", () => {
    expect(calcTranscriptMatchScore("hello", "hello")).toBe(100);
  });

  it("handles multiple spaces correctly", () => {
    expect(calcTranscriptMatchScore("hello world", "hello  world")).toBe(100);
  });
});

describe("SpeechRecognitionFallback", () => {
  it("should trigger onstart when start is called", async () => {
    const recognition = new SpeechRecognitionFallback();
    const onstartSpy = vi.fn();
    recognition.onstart = onstartSpy;

    recognition.start();

    // Wait for the async setTimeout to trigger
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(onstartSpy).toHaveBeenCalled();
  });

  it("reports unavailable without fabricating a transcript", async () => {
    const recognition = new SpeechRecognitionFallback();
    const onresultSpy = vi.fn();
    const onerrorSpy = vi.fn();
    const onendSpy = vi.fn();

    recognition.onresult = onresultSpy;
    recognition.onerror = onerrorSpy;
    recognition.onend = onendSpy;

    recognition.start();
    recognition.stop();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(onresultSpy).not.toHaveBeenCalled();
    expect(onerrorSpy).toHaveBeenCalled();
    expect(onerrorSpy.mock.calls[0][0]).toMatchObject({ error: "not-supported" });
    expect(onendSpy).toHaveBeenCalled();
  });

  it("never emits a default transcript", async () => {
    const recognition = new SpeechRecognitionFallback();
    const onresultSpy = vi.fn();

    recognition.onresult = onresultSpy;

    recognition.start();
    recognition.stop();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(onresultSpy).not.toHaveBeenCalled();
  });
});
