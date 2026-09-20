# Data Model: Core Acceleration (Vetted OSS Registry & Adapter Contracts)

**Feature**: [spec.md](./spec.md) | **Date**: 2026-09-04 | **Status**: Draft

---

## 1. Core Data Entities

### 1.1 Vetted Package Identifier (`VettedPackageId`)
```typescript
export const VETTED_PACKAGE_IDS = [
  "cahlr-pybkt",
  "openai-whisper",
  "systran-faster-whisper",
  "silero-vad",
  "montreal-forced-aligner",
  "speechbrain",
  "languagetool",
  "stanfordnlp-stanza",
  "explosion-spacy",
  "cmusphinx-cmudict",
  "bootphon-phonemizer",
  "open-spaced-repetition-ts-fsrs",
] as const;

export type VettedPackageId = (typeof VETTED_PACKAGE_IDS)[number];
```

---

### 1.2 License & Integration Mode Enums
```typescript
export type LicenseClassification =
  | "permissive-mit"
  | "permissive-apache2"
  | "permissive-bsd"
  | "copyleft-lgpl"
  | "copyleft-gpl"
  | "non-commercial"
  | "unapproved";

export type IntegrationMode =
  | "direct-library"
  | "source-adaptation"
  | "isolated-service"
  | "baseline-donor"
  | "rejected";
```

---

### 1.3 Vetted Package Descriptor (`VettedPackageDescriptor`)
```typescript
export type VettedPackageDescriptor = {
  readonly id: VettedPackageId;
  readonly name: string;
  readonly capability: string;
  readonly upstreamUrl: string;
  readonly pinnedTag: string;
  readonly pinnedCommit: string; // Strictly validated 40-character hexadecimal git commit SHA
  readonly codeLicense: LicenseClassification;
  readonly modelLicense: LicenseClassification | "not-applicable";
  readonly modelLicenseNotes?: string; // Explicit per-model/per-checkpoint license notes
  readonly runtime: string;
  readonly offlineSelfHostable: boolean;
  readonly footprint: {
    readonly ramMb: number;
    readonly diskMb: number;
    readonly gpuRequired: boolean;
  };
  readonly footprintNotes?: string; // Explicit hardware/model-size scaling notes
  readonly latencyProfile: string;
  readonly latencyNotes?: string;
  readonly integrationMode: IntegrationMode;
  readonly attributionRequired: boolean;
  readonly adapterContract: string;
  readonly attributionNotice: string;
};
```

---

### 1.4 Descriptor Validation Result
```typescript
export type DescriptorValidationResult = {
  readonly valid: boolean;
  readonly reason?: string;
};
```

---

### 1.5 Reuse Evaluation & Decision
```typescript
export type ReuseDecision = {
  readonly packageId: VettedPackageId;
  readonly status: "approved" | "rejected";
  readonly decisionTier: 1 | 2 | 3 | 4 | 5;
  readonly mode: IntegrationMode;
  readonly justification: string;
};
```

---

### 1.6 External Engine Raw Payloads & Canonical CoreObservation Envelope

Adapters emit pure, deterministic raw payloads without ambient time or authority semantics.
Then, the Nếp-owned constructor `createVettedCoreObservation` wraps the raw payload into a canonical `CoreObservation` envelope with `authority: "none"` and unvalidated shadow calibration, failing closed against any injected authority or mastery fields.

```typescript
// 1. Raw ASR Transcription Payload
export type AsrTranscriptionRawPayload = {
  readonly kind: "asr-transcription";
  readonly text: string;
  readonly durationMs: number;
  readonly tokens: readonly {
    readonly token: string;
    readonly startMs: number;
    readonly endMs: number;
    readonly confidence: number;
  }[];
  readonly noSpeechProbability: number;
  readonly engine: string;
  readonly occurredAt: string;
};

// 2. Raw VAD Speech Activity Payload
export type VadSpeechRawPayload = {
  readonly kind: "vad-speech";
  readonly isSpeech: boolean;
  readonly speechProbability: number;
  readonly intervals: readonly {
    readonly startMs: number;
    readonly endMs: number;
  }[];
  readonly totalDurationMs: number;
  readonly speechDurationMs: number;
  readonly engine: string;
  readonly occurredAt: string;
};

// 3. Raw Linguistic & Grammar Diagnostics Payload
export type LinguisticAnnotationRawPayload = {
  readonly kind: "linguistic-annotation";
  readonly text: string;
  readonly tokens: readonly {
    readonly text: string;
    readonly lemma: string;
    readonly pos: string;
    readonly tag: string;
    readonly dep: string;
    readonly headIndex: number;
  }[];
  readonly grammarDiagnostics?: readonly {
    readonly ruleId: string;
    readonly message: string;
    readonly offset: number;
    readonly length: number;
    readonly replacements: readonly string[];
    readonly category: string;
  }[];
  readonly engine: string;
  readonly occurredAt: string;
};

// 4. Raw Phoneme Alignment Payload
export type PhonemeAlignmentRawPayload = {
  readonly kind: "phoneme-alignment";
  readonly transcript: string;
  readonly words: readonly {
    readonly word: string;
    readonly startMs: number;
    readonly endMs: number;
    readonly phonemes: readonly {
      readonly phone: string;
      readonly startMs: number;
      readonly endMs: number;
      readonly score?: number;
    }[];
  }[];
  readonly totalDurationMs: number;
  readonly engine: string;
  readonly occurredAt: string;
};

// 5. Raw BKT Baseline Comparator Payload
export type BktStepRawPayload = {
  readonly kind: "bkt-comparator";
  readonly constructId: string;
  readonly priorMastery: number;
  readonly posteriorMastery: number;
  readonly pNextState: number;
  readonly predictedCorrectProbability: number;
  readonly correct: boolean;
  readonly parameters: {
    readonly pInit: number;
    readonly pTransit: number;
    readonly pGuess: number;
    readonly pSlip: number;
    readonly pForget?: number;
  };
  readonly engine: string;
  readonly occurredAt: string;
};

// Nếp-Owned Envelope Constructor
export function createVettedCoreObservation<TPayload extends DiagnosticPayload = DiagnosticPayload>(
  options: CreateVettedCoreObservationOptions<TPayload>
): CoreObservation<TPayload>;
```

