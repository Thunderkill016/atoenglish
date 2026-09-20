import type { DiagnosticPayload } from "./diagnostics";
import type { CommunicationActivity, CoreSourceRef } from "./domain";

export const VALIDATION_STATES = [
  "unvalidated",
  "shadow",
  "benchmarked",
  "human-validated",
] as const;

export type ValidationState = (typeof VALIDATION_STATES)[number];

export const OBSERVATION_AUTHORITIES = [
  "none",
  "hint-only",
  "assessment-candidate",
  "mastery-candidate",
] as const;

export type ObservationAuthority = (typeof OBSERVATION_AUTHORITIES)[number];

export const CALIBRATION_DECISIONS = ["shadow", "hint-only", "assessment", "mastery"] as const;
export type CalibrationDecision = (typeof CALIBRATION_DECISIONS)[number];

export type AcousticNoiseClass = "clean" | "office" | "street-mobile" | "babble" | "clipping";

export type ArtifactFingerprint = {
  artifactId: string;
  version: string;
  sha256?: string;
  runtime?: string;
  configurationId?: string;
};

export type ObservationProvenance = {
  evaluator: string;
  evaluatorKind: "deterministic" | "model" | "human" | "hybrid";
  artifact?: ArtifactFingerprint;
  sources?: CoreSourceRef[];
};

/** A calibration claim is valid only inside the population/context where it was measured. */
export type CalibrationProfile = {
  validationState: ValidationState;
  decision: CalibrationDecision;
  benchmarkId: string | null;
  modelFingerprint: string;
  scope: {
    activity: CommunicationActivity;
    construct: string;
    requiredPopulationTags: string[];
    allowedNoiseClasses?: AcousticNoiseClass[];
    minimumSnrDb?: number;
    allowedDeviceClasses?: string[];
    allowedPromptContexts?: string[];
  };
  metrics: {
    sampleSize: number;
    precision?: number;
    precisionLowerBound?: number;
    recall?: number;
    f05?: number;
    falsePositiveRate?: number;
    mae?: number;
    pearson?: number;
  };
};

export type ObservationContext = {
  populationTags: string[];
  construct: string;
  noiseClass?: AcousticNoiseClass;
  snrDb?: number | null;
  deviceClass?: string;
  promptContext?: string;
};

/**
 * All NLP/speech/model outputs enter Nếp as typed observations first. A model response cannot
 * acquire learner authority merely because it contains a high score or confidence.
 */
export type CoreObservation<TPayload extends DiagnosticPayload = DiagnosticPayload> = {
  observationId: string;
  targetId: string;
  activity: CommunicationActivity;
  payload: TPayload;
  confidence: number | null;
  calibration: CalibrationProfile;
  authority: ObservationAuthority;
  provenance: ObservationProvenance;
  context: ObservationContext;
  contextId: string | null;
  createdAt: string;
};

export function normalizeObservationConfidence(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  return Math.min(1, Math.max(0, value));
}

export function calibrationCoversObservation(observation: CoreObservation): boolean {
  const { calibration, context } = observation;
  const { scope } = calibration;

  if (calibration.validationState !== "benchmarked" && calibration.validationState !== "human-validated") {
    return false;
  }
  if (scope.activity !== observation.activity || scope.construct !== context.construct) return false;
  if (!scope.requiredPopulationTags.every((tag) => context.populationTags.includes(tag))) return false;

  if (scope.allowedNoiseClasses) {
    if (!context.noiseClass || !scope.allowedNoiseClasses.includes(context.noiseClass)) return false;
  }
  if (scope.minimumSnrDb !== undefined) {
    if (context.snrDb === null || context.snrDb === undefined || context.snrDb < scope.minimumSnrDb) {
      return false;
    }
  }
  if (scope.allowedDeviceClasses) {
    if (!context.deviceClass || !scope.allowedDeviceClasses.includes(context.deviceClass)) return false;
  }
  if (scope.allowedPromptContexts) {
    if (!context.promptContext || !scope.allowedPromptContexts.includes(context.promptContext)) return false;
  }

  return true;
}

export function canAffectDurableAssessment(observation: CoreObservation): boolean {
  if (!calibrationCoversObservation(observation)) return false;
  if (observation.calibration.decision !== "assessment" && observation.calibration.decision !== "mastery") {
    return false;
  }

  return (
    observation.authority === "assessment-candidate" ||
    observation.authority === "mastery-candidate"
  );
}

export function canBecomeMasteryCandidate(observation: CoreObservation): boolean {
  return (
    calibrationCoversObservation(observation) &&
    observation.calibration.decision === "mastery" &&
    observation.authority === "mastery-candidate"
  );
}
