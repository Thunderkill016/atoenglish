import { describe, expect, it } from "vitest";

import { getNativeSpeechRecognitionConstructor } from "@/lib/utils/native-speech-recognition";

describe("getNativeSpeechRecognitionConstructor", () => {
  it("returns null when the browser exposes no native speech recognition API", () => {
    expect(getNativeSpeechRecognitionConstructor({})).toBeNull();
    expect(getNativeSpeechRecognitionConstructor(null)).toBeNull();
  });

  it("uses SpeechRecognition when available", () => {
    class NativeRecognition {}

    expect(
      getNativeSpeechRecognitionConstructor({ SpeechRecognition: NativeRecognition })
    ).toBe(NativeRecognition);
  });

  it("uses webkitSpeechRecognition when that is the native browser surface", () => {
    class WebkitRecognition {}

    expect(
      getNativeSpeechRecognitionConstructor({ webkitSpeechRecognition: WebkitRecognition })
    ).toBe(WebkitRecognition);
  });
});
