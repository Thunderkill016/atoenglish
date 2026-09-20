export type VadSpeechInterval = {
  readonly startMs: number;
  readonly endMs: number;
};

export type VadAudioSegmentRequest = {
  readonly audioData: Uint8Array | Float32Array;
  readonly sampleRateHz: number;
  readonly durationMs: number;
  readonly occurredAt: string;
  readonly threshold?: number;
};

export type VadSpeechRawPayload = {
  readonly kind: "vad-speech";
  readonly isSpeech: boolean;
  readonly speechProbability: number;
  readonly intervals: readonly VadSpeechInterval[];
  readonly totalDurationMs: number;
  readonly speechDurationMs: number;
  readonly engine: string;
  readonly occurredAt: string;
};

/** @deprecated Alias for VadSpeechRawPayload for transition compatibility */
export type VadSpeechObservation = VadSpeechRawPayload;

export type VadAdapterResult =
  | { readonly ok: true; readonly payload: VadSpeechRawPayload; readonly observation?: VadSpeechRawPayload }
  | { readonly ok: false; readonly error: string; readonly code: "audio-corrupt" | "invalid-sample-rate" | "invalid-timestamp" };

export interface VadAdapterContract {
  readonly engineName: string;
  detectActivity(request: VadAudioSegmentRequest): Promise<VadAdapterResult>;
}

export function createMockVadAdapter(
  defaultIntervals: VadSpeechInterval[] = [{ startMs: 200, endMs: 1800 }],
  engineName = "mock-silero-vad"
): VadAdapterContract {
  return {
    engineName,
    async detectActivity(request: VadAudioSegmentRequest): Promise<VadAdapterResult> {
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

      const totalSpeechMs = defaultIntervals.reduce(
        (sum, iv) => sum + Math.max(0, iv.endMs - iv.startMs),
        0
      );

      const payload: VadSpeechRawPayload = Object.freeze({
        kind: "vad-speech",
        isSpeech: defaultIntervals.length > 0,
        speechProbability: defaultIntervals.length > 0 ? 0.98 : 0.05,
        intervals: Object.freeze(defaultIntervals),
        totalDurationMs: request.durationMs,
        speechDurationMs: totalSpeechMs,
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

