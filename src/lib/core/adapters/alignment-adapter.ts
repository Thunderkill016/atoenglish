export type AlignedPhoneme = {
  readonly phone: string;
  readonly startMs: number;
  readonly endMs: number;
  readonly score?: number;
};

export type AlignedWord = {
  readonly word: string;
  readonly startMs: number;
  readonly endMs: number;
  readonly phonemes: readonly AlignedPhoneme[];
};

export type PhonemeAlignmentRequest = {
  readonly audioData: Uint8Array | ArrayBuffer;
  readonly sampleRateHz: number;
  readonly durationMs: number;
  readonly transcript: string;
  readonly occurredAt: string;
};

export type PhonemeAlignmentRawPayload = {
  readonly kind: "phoneme-alignment";
  readonly transcript: string;
  readonly words: readonly AlignedWord[];
  readonly totalDurationMs: number;
  readonly engine: string;
  readonly occurredAt: string;
};

/** @deprecated Alias for PhonemeAlignmentRawPayload for transition compatibility */
export type PhonemeAlignmentObservation = PhonemeAlignmentRawPayload;

export type AlignmentAdapterResult =
  | { readonly ok: true; readonly payload: PhonemeAlignmentRawPayload; readonly observation?: PhonemeAlignmentRawPayload }
  | { readonly ok: false; readonly error: string; readonly code: "audio-transcript-mismatch" | "audio-corrupt" | "invalid-timestamp" };

export interface AlignmentAdapterContract {
  readonly engineName: string;
  align(request: PhonemeAlignmentRequest): Promise<AlignmentAdapterResult>;
}

export function createMockAlignmentAdapter(
  engineName = "mock-montreal-forced-aligner"
): AlignmentAdapterContract {
  return {
    engineName,
    async align(request: PhonemeAlignmentRequest): Promise<AlignmentAdapterResult> {
      if (!request.occurredAt || typeof request.occurredAt !== "string" || Number.isNaN(Date.parse(request.occurredAt))) {
        return Object.freeze({
          ok: false,
          error: "Valid occurredAt ISO timestamp is required",
          code: "invalid-timestamp",
        });
      }

      if (request.durationMs <= 0) {
        return Object.freeze({
          ok: false,
          error: "Invalid audio duration",
          code: "audio-corrupt",
        });
      }

      const words = request.transcript.trim().split(/\s+/);
      const wordStepMs = Math.floor(request.durationMs / Math.max(1, words.length));

      const alignedWords: AlignedWord[] = words.map((w, wIdx) => {
        const wStart = wIdx * wordStepMs;
        const wEnd = (wIdx + 1) * wordStepMs;
        const phoneDuration = Math.floor((wEnd - wStart) / Math.max(1, w.length));

        const phonemes: AlignedPhoneme[] = w.split("").map((char, pIdx) =>
          Object.freeze({
            phone: char.toLowerCase(),
            startMs: wStart + pIdx * phoneDuration,
            endMs: wStart + (pIdx + 1) * phoneDuration,
            score: 0.92,
          })
        );

        return Object.freeze({
          word: w,
          startMs: wStart,
          endMs: wEnd,
          phonemes: Object.freeze(phonemes),
        });
      });

      const payload: PhonemeAlignmentRawPayload = Object.freeze({
        kind: "phoneme-alignment",
        transcript: request.transcript,
        words: Object.freeze(alignedWords),
        totalDurationMs: request.durationMs,
        engine: engineName,
        occurredAt: request.occurredAt,
      });

      return Object.freeze({
        ok: true,
        payload,
        observation: payload,
      });
    },
  };
}

