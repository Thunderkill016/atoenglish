export type AsrToken = {
  readonly token: string;
  readonly startMs: number;
  readonly endMs: number;
  readonly confidence: number;
};

export type AsrTranscriptionRequest = {
  readonly audioData: Uint8Array | ArrayBuffer;
  readonly sampleRateHz: number;
  readonly durationMs: number;
  readonly occurredAt: string;
  readonly language?: string;
  readonly promptContext?: string;
};

export type AsrTranscriptionRawPayload = {
  readonly kind: "asr-transcription";
  readonly text: string;
  readonly durationMs: number;
  readonly tokens: readonly AsrToken[];
  readonly noSpeechProbability: number;
  readonly engine: string;
  readonly occurredAt: string;
};

/** @deprecated Alias for AsrTranscriptionRawPayload for transition compatibility */
export type AsrTranscriptionObservation = AsrTranscriptionRawPayload;

export type AsrAdapterResult =
  | { readonly ok: true; readonly payload: AsrTranscriptionRawPayload; readonly observation?: AsrTranscriptionRawPayload }
  | { readonly ok: false; readonly error: string; readonly code: "audio-corrupt" | "unsupported-format" | "timeout" | "invalid-timestamp" };

export interface AsrAdapterContract {
  readonly engineName: string;
  transcribe(request: AsrTranscriptionRequest): Promise<AsrAdapterResult>;
}

export function createMockAsrAdapter(
  defaultTranscript = "hello world",
  engineName = "mock-faster-whisper"
): AsrAdapterContract {
  return {
    engineName,
    async transcribe(request: AsrTranscriptionRequest): Promise<AsrAdapterResult> {
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

      const words = defaultTranscript.trim().split(/\s+/);
      const stepMs = Math.floor(request.durationMs / Math.max(1, words.length));
      const tokens: AsrToken[] = words.map((w, idx) =>
        Object.freeze({
          token: w,
          startMs: idx * stepMs,
          endMs: (idx + 1) * stepMs,
          confidence: 0.95,
        })
      );

      const payload: AsrTranscriptionRawPayload = Object.freeze({
        kind: "asr-transcription",
        text: defaultTranscript,
        durationMs: request.durationMs,
        tokens: Object.freeze(tokens),
        noSpeechProbability: 0.02,
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

