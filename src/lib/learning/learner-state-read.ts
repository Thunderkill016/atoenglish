import type { EvidenceType, LearnerSkillState } from "./evidence";

export const LEARNER_STATE_MODEL_VERSION = "ema-routing-v1" as const;

export type LearnerDimensionRead = {
  estimate: number | null;
  evidenceCount: number;
  status: "unknown" | "observed";
  /** Not calibrated yet. Keep null rather than inventing probability-like certainty. */
  confidence: null;
  modelVersion: typeof LEARNER_STATE_MODEL_VERSION;
  decisionScope: "routing";
};

/**
 * Read one learner dimension without confusing an unobserved default zero with observed weakness.
 *
 * New planner reads attach per-type evidence coverage from append-only evidence history. The
 * fallback preserves compatibility for older in-memory callers that only know total evidence.
 */
export function readLearnerDimension(
  state: LearnerSkillState,
  evidenceType: EvidenceType,
): LearnerDimensionRead {
  const typedCoverage = state.evidenceByType;
  const rawValue = clamp01(state[evidenceType]);

  let evidenceCount = 0;
  if (typedCoverage) {
    evidenceCount = normalizeCount(typedCoverage[evidenceType]);
  } else if (rawValue > 0) {
    // When typed coverage is absent, only an explicit positive score proves prior observation.
    // A default zero must fail closed to unknown, not borrow total evidence from other dimensions.
    evidenceCount = Math.max(1, state.evidenceCount);
  }

  if (evidenceCount === 0) {
    return {
      estimate: null,
      evidenceCount: 0,
      status: "unknown",
      confidence: null,
      modelVersion: LEARNER_STATE_MODEL_VERSION,
      decisionScope: "routing",
    };
  }

  return {
    estimate: clamp01(state[evidenceType]),
    evidenceCount,
    status: "observed",
    confidence: null,
    modelVersion: LEARNER_STATE_MODEL_VERSION,
    decisionScope: "routing",
  };
}

export function hasObservedLearnerDimension(
  state: LearnerSkillState,
  evidenceType: EvidenceType,
) {
  return readLearnerDimension(state, evidenceType).status === "observed";
}

export const LEARNER_STATE_LEDGER_MODEL_VERSION = "nep.learner-evidence-state.v1" as const;

export type LearnerConstructSufficiencyStatus =
  | "unknown"
  | "insufficient-support"
  | "provisional-support"
  | "provisional-weakness"
  | "conflicted-support";

export type LearnerConstructRead = {
  estimate: number | null;
  evidenceCount: number;
  status: LearnerConstructSufficiencyStatus | "observed";
  legacyStatus: "unknown" | "insufficient" | "conflicted" | "observed";
  /** Not calibrated yet. Keep null rather than inventing probability-like certainty. */
  confidence: null;
  modelVersion: typeof LEARNER_STATE_LEDGER_MODEL_VERSION;
  decisionScope: "routing";
  sourceModel: typeof LEARNER_STATE_LEDGER_MODEL_VERSION;
  sourceStatus: LearnerConstructSufficiencyStatus;
  uncertainty: "maximal" | "high" | "moderate" | "low";
};

/**
 * Bounded read adapter connecting the V1 ontology-bound learner state projection
 * to legacy learner dimension readers without turning unknown into zero, conflating
 * conflicted/insufficient states into unknown, or mislabeling the model version as legacy EMA.
 */
export function readConstructFromLearnerState(
  projection: { constructs: Record<string, any> },
  targetId: string,
): LearnerConstructRead {
  const construct = projection.constructs[targetId];
  if (!construct || construct.status === "unknown") {
    return {
      estimate: null,
      evidenceCount: 0,
      status: "unknown",
      legacyStatus: "unknown",
      confidence: null,
      modelVersion: LEARNER_STATE_LEDGER_MODEL_VERSION,
      decisionScope: "routing",
      sourceModel: LEARNER_STATE_LEDGER_MODEL_VERSION,
      sourceStatus: "unknown",
      uncertainty: "maximal",
    };
  }

  const sourceStatus = construct.status as LearnerConstructSufficiencyStatus;
  const evidenceCount = construct.statistics?.totalEvents ?? 0;
  const uncertainty = construct.uncertainty ?? "high";

  if (sourceStatus === "insufficient-support") {
    return {
      estimate: null,
      evidenceCount,
      status: "insufficient-support",
      legacyStatus: "insufficient",
      confidence: null,
      modelVersion: LEARNER_STATE_LEDGER_MODEL_VERSION,
      decisionScope: "routing",
      sourceModel: LEARNER_STATE_LEDGER_MODEL_VERSION,
      sourceStatus,
      uncertainty,
    };
  }

  if (sourceStatus === "conflicted-support") {
    return {
      estimate: null,
      evidenceCount,
      status: "conflicted-support",
      legacyStatus: "conflicted",
      confidence: null,
      modelVersion: LEARNER_STATE_LEDGER_MODEL_VERSION,
      decisionScope: "routing",
      sourceModel: LEARNER_STATE_LEDGER_MODEL_VERSION,
      sourceStatus,
      uncertainty,
    };
  }

  return {
    estimate: construct.provisionalRoutingScore,
    evidenceCount,
    status: "observed",
    legacyStatus: "observed",
    confidence: null,
    modelVersion: LEARNER_STATE_LEDGER_MODEL_VERSION,
    decisionScope: "routing",
    sourceModel: LEARNER_STATE_LEDGER_MODEL_VERSION,
    sourceStatus,
    uncertainty,
  };
}

function normalizeCount(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}
