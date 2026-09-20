import type { ReferenceCoreEvidence } from "@/lib/core/certified-evidence";
import type { CoreTaskSpec } from "@/lib/core/task";

export const NATIVE_PILOT_CONTRACT_ID = "nep.native-evidence-pilot.v1" as const;
export const NATIVE_PREDICTOR_CONTRACT_ID = "nep.native-predictor.v1" as const;
export const NATIVE_PILOT_SCORING_CONTRACT_ID = "nep.native-pilot.binary-v1" as const;
export const NATIVE_PILOT_TARGET_ID = "nep.en.v1.language-system.syntax-grammar" as const;
export const NATIVE_PILOT_CONTENT_SLICE = "pilot-slice:present-subject-verb-agreement" as const;
export const SYNTHETIC_ONLY_STATUS = "synthetic-plumbing-only" as const;

export const PILOT_TASK_FAMILIES = [
  "recognition-independent",
  "recognition-supported",
  "free-recall",
  "delayed-free-recall",
  "near-transfer",
] as const;

export type PilotTaskFamily = (typeof PILOT_TASK_FAMILIES)[number];

export type PilotTaskDefinition = {
  readonly pilotContractId: typeof NATIVE_PILOT_CONTRACT_ID;
  readonly family: PilotTaskFamily;
  readonly task: CoreTaskSpec;
  readonly contentFingerprint: `sha256:${string}`;
  readonly contextId: string;
  readonly stimulusFormGroup: string;
  readonly scoringContractId: typeof NATIVE_PILOT_SCORING_CONTRACT_ID;
};

export type FrozenPilotTaskDefinition = Readonly<PilotTaskDefinition> & {
  readonly definitionFingerprint: `sha256:${string}`;
};

export type PilotAttemptIdentity = {
  readonly taskId: string;
  readonly taskVersion: number;
  readonly contentFingerprint: `sha256:${string}`;
  readonly definitionFingerprint: `sha256:${string}`;
  readonly contextId: string;
};

export type PilotEvidenceLineage = {
  readonly eventId: string;
  readonly observationId: string;
  readonly taskId: string;
  readonly taskVersion: number;
  readonly contentFingerprint: `sha256:${string}`;
  readonly contextId: string;
  readonly definitionFingerprint: `sha256:${string}`;
  readonly evidenceDigest: `sha256:${string}`;
};

export type SyntheticPilotEvent = {
  readonly participantId: string;
  readonly taskDefinition: FrozenPilotTaskDefinition;
  readonly evidence: ReferenceCoreEvidence;
  readonly lineage: PilotEvidenceLineage;
  readonly availableAt: string;
};

export type FeatureValue = number | string | null;
export type FeatureVector = Readonly<Record<string, FeatureValue>>;

export type PredictionFeatureRow = {
  readonly participantId: string;
  readonly targetEventId: string;
  readonly predictionTimestamp: string;
  readonly label: 0 | 1 | null;
  readonly acceptedHistoryEventIds: readonly string[];
  readonly acceptedHistoryLineageDigests: readonly `sha256:${string}`[];
  readonly b2: FeatureVector;
  readonly b2Basis: FeatureVector;
  readonly b3: FeatureVector;
};

export type SyntheticArtifactKind = "feature" | "model" | "prediction" | "result";

export type SyntheticArtifactRecord = {
  readonly artifactId: string;
  readonly kind: SyntheticArtifactKind;
  readonly participantIds: readonly string[];
  readonly dependsOnArtifactIds: readonly string[];
  readonly valid: boolean;
  readonly invalidatedReason: string | null;
};
