# Data Model: Reality Benchmark Harness V1

**Contract**: `nep.reality-benchmark.v1`

## Canonical track metadata

```ts
export type SlamTrack = "en_es" | "es_en" | "fr_en";

export const SLAM_TRACKS = {
  en_es: { targetLanguage: "English", knownLanguage: "Spanish", publishedTestAuc: 0.774 },
  es_en: { targetLanguage: "Spanish", knownLanguage: "English", publishedTestAuc: 0.746 },
  fr_en: { targetLanguage: "French", knownLanguage: "English", publishedTestAuc: 0.771 },
} as const;
```

Reports and tests MUST derive result attribution from this table rather than restating track/language mappings independently.

## Raw SLAM entities

```ts
export interface SlamRawPromptHeader {
  /** Exact anonymized source identifier; 8 B64-style characters and may contain + or /. */
  readonly userId: string;
  /** Parsed from the pipe-delimited countries field. */
  readonly countries: readonly string[];
  /** Fractional course age in days, e.g. 1.793. */
  readonly days: number;
  readonly client: "web" | "ios" | "android";
  readonly session: "lesson" | "practice" | "test";
  readonly format: "reverse_translate" | "reverse_tap" | "listen";
  /** null for source null or documented negative logging errors. */
  readonly timeSeconds: number | null;
  readonly sourceLineNumber: number;
}

export interface SlamRawTokenLine {
  /** 12-character source token instance ID. */
  readonly tokenId: string;
  readonly token: string;
  readonly pos: string;
  readonly morphology: readonly string[];
  readonly depEdge: string;
  readonly depHead: number;
  /** Present only in labeled source/fit artifacts; null in blind evaluation input. */
  readonly label: 0 | 1 | null;
}

export interface SlamGoldKeyLine {
  readonly tokenId: string;
  readonly label: 0 | 1;
}
```

Parser fixtures MUST include a user ID containing `+` or `/`, `countries:US|MX`, fractional `days`, `time:null`, a negative `time` normalized to null, a 7-column TRAIN row, and a 6-column DEV/TEST row.

## Split / fit-phase label contract

```ts
export type SourceSplit = "train" | "dev" | "test";
export type FitPhase = "train-only" | "train-plus-dev";

export interface LabelAvailabilityPolicy {
  readonly fitPhase: FitPhase;
  /** Source splits whose labels may update label-dependent history before prediction. */
  readonly labelAvailableHistorySplits: readonly SourceSplit[];
  /** Split currently being predicted without online label feedback. */
  readonly blindPredictionSplit: "dev" | "test";
  readonly goldKeyUse: "post-prediction-scoring-only";
}
```

`train-only + dev` prediction means TRAIN labels remain available history while DEV labels are blind. `train-plus-dev + test` means TRAIN+DEV labels may seed history before TEST, but TEST labels remain blind.

## B2 learner-history features

```ts
export interface LearnerHistoryFeatures {
  readonly priorLabeledUserTokenCount: number;
  readonly priorLabeledUserErrorCount: number;
  readonly priorLabeledUserErrorRate: number | null;
  readonly priorLabeledTokenCount: number;
  readonly priorLabeledTokenErrorCount: number;
  readonly priorLabeledTokenErrorRate: number | null;
  readonly priorEncounterCount: number;
  /** Difference in source course-age days; null on first encounter. */
  readonly courseAgeDaysSinceLastEncounter: number | null;
  readonly exerciseFormat: "reverse_translate" | "reverse_tap" | "listen";
  readonly promptResponseTimeSeconds: number | null;
}
```

Zero labeled history uses `null` rate, not an invented failure rate. Encounter counts may include earlier blind-split encounters; error counts/rates may not.

## Canonical #137 B3 input

B3 binds to exported `src/lib/core/learner-state.ts` types after #140 merges:

```ts
export type ConstructEvidenceSufficiency =
  | "unknown"
  | "insufficient-support"
  | "provisional-support"
  | "provisional-weakness"
  | "conflicted-support";

export type ConstructUncertaintyLevel = "maximal" | "high" | "moderate" | "low";

export interface NepCanonicalStateProjection {
  readonly ontologyNodeId: string;
  readonly status: ConstructEvidenceSufficiency;
  readonly uncertainty: ConstructUncertaintyLevel;
  readonly provisionalRoutingScore: number | null;
  readonly decisionScope: "routing-only";
  readonly statistics: ConstructSufficientStatistics;
}
```

Numerical encodings are separately versioned:

```ts
export const NEP_REALITY_DERIVED_FEATURE_SET_ID = "nep.reality-derived-features.v1" as const;

export interface NepDerivedStateFeatures {
  readonly derivedFeatureId: typeof NEP_REALITY_DERIVED_FEATURE_SET_ID;
  readonly statusOneHot: Readonly<Record<ConstructEvidenceSufficiency, 0 | 1>>;
  readonly uncertaintyOrdinal: 0 | 1 | 2 | 3;
  readonly provisionalRoutingScoreValue: number;
  readonly provisionalRoutingScorePresent: 0 | 1;
  readonly totalEvents: number;
  readonly positiveCount: number;
  readonly negativeCount: number;
  readonly conflictedCount: number;
  readonly distinctContextCount: number;
  readonly revealUsedCount: number;
  readonly durableEvidenceCount: number;
  readonly referenceEvidenceCount: number;
  readonly nearTransferCount: number;
  readonly nearTransferFailedCount: number;
  readonly farTransferCount: number;
  readonly farTransferFailedCount: number;
}
```

Every derived formula and source field is frozen in the implementation contract before R2; no unversioned ratios are introduced ad hoc.

## Compatibility audit

```ts
export interface PreR2CompatibilityAuditResult {
  readonly track: SlamTrack;
  readonly ontologyLanguageCompatible: boolean;
  readonly totalRowsAudited: number;
  readonly mappedRows: number;
  readonly unmappedRows: number;
  readonly mappingCoverage: number;
  readonly requiredButUnavailableFields: readonly string[];
  readonly eligibleForB3: boolean;
  readonly decision: "proceed" | "b3-not-applicable-on-slam";
  readonly rationale: string;
}
```

## Provenance and artifact records

```ts
export interface RetrievalArtifact {
  readonly filename: string;
  readonly upstreamFileId: string;
  readonly sourceUrl: string;
  readonly upstreamChecksumType: string;
  readonly upstreamChecksumValue: string;
  readonly localSha256Fingerprint: string;
  readonly byteSize: number;
  readonly accessGate: "none" | "guestbook" | "other";
  readonly artifactLicense: string | "unverified";
  readonly repositoryCommitAllowed: boolean;
}
```

Dataset and starter-code license fields are separate. Do not infer starter-code licensing from dataset-level licensing.

## Experiment manifest

```ts
export type BaselineId = "B0" | "B1" | "B2" | "B3" | "B4";
export type ExperimentStatus =
  | "reproduced"
  | "candidate-better"
  | "no-evidence-of-improvement"
  | "candidate-worse"
  | "invalid-run"
  | "not-applicable";

export interface ExperimentManifest {
  readonly contractId: "nep.reality-benchmark.v1";
  readonly contractVersion: 1;
  readonly codeCommitSha: string;
  readonly dataset: {
    readonly doi: "10.7910/DVN/8SWHNO";
    readonly dataverseVersion: string;
    readonly retrievedAt: string;
    readonly datasetLicense: "CC-BY-NC-4.0";
    readonly commercialUseAllowed: false;
    readonly redistributionAllowedByNepPolicy: false;
    readonly artifacts: readonly RetrievalArtifact[];
  };
  readonly track: SlamTrack;
  readonly sourceSplit: SourceSplit;
  readonly fitPhase: FitPhase;
  readonly leakagePolicyId: "nep.slam-causal-mask.v1";
  readonly baselineId: BaselineId;
  readonly featureSetId: string;
  readonly baselineSource: {
    readonly name: string;
    readonly versionOrCommit: string;
    readonly sourceArtifactSha256: string | null;
  };
  readonly model: {
    readonly estimator: string;
    readonly hyperparameters: Readonly<Record<string, unknown>>;
    readonly randomSeed: number | null;
  };
  readonly runtime: {
    readonly pythonVersion: string | null;
    readonly nodeVersion: string | null;
    readonly os: string;
    readonly dependencies: Readonly<Record<string, string>>;
  };
  readonly resources: { readonly durationMs: number; readonly peakRssMb: number };
  readonly metrics: {
    readonly auc: number;
    readonly f1At05: number;
    readonly logLoss: number;
    readonly tokenCount: number;
    readonly learnerCount: number;
    readonly positiveCount: number;
    readonly positivePrevalence: number;
    readonly coverage: number;
  };
  readonly eligibleTrackCount: number;
  readonly comparison: null | {
    readonly comparatorBaselineId: BaselineId;
    readonly deltaAuc: number;
    readonly learnerClusterBootstrapResamples: number;
    readonly deltaAucCi95: readonly [number, number];
  };
  readonly status: ExperimentStatus;
  readonly decisionNote: string;
  readonly manifestDigest: `sha256:${string}`;
}
```

`manifestDigest` is SHA-256 over RFC 8785 canonical bytes of the manifest **with the `manifestDigest` field omitted**. The digest is integrity-only, not provenance authentication.