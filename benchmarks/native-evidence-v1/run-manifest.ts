import crypto from "node:crypto";

import { NATIVE_METRIC_SETTINGS, NATIVE_PREDICTOR_SETTINGS } from "./manifest";
import type { FrozenNativeSplitProtocol } from "./protocol";
import type {
  FrozenPilotTaskDefinition,
  PredictionFeatureRow,
  SyntheticArtifactRecord,
} from "./types";
import {
  NATIVE_PILOT_CONTRACT_ID,
  NATIVE_PREDICTOR_CONTRACT_ID,
  SYNTHETIC_ONLY_STATUS,
} from "./types";

export const NATIVE_DECISION_RULE_ID = "nep.native-decision.v1" as const;

export const NATIVE_FEATURE_AUDIT_POLICY = Object.freeze({
  acceptedHistory: "reference-evidence-plus-pilot-lineage",
  b2: "strong-causal-history",
  b2Basis: "deterministic-projector-basis-from-b2-counts",
  b3: "projectLearnerState-over-the-same-accepted-history",
  missingNumeric: "explicit-indicator",
  categoricalVocabulary: "prospective-task-matrix-plus-unknown",
  trainConstantColumns: "drop",
  exactDuplicateColumns: "drop-stable-name-order-b2-preferred",
  fitScope: "TRAIN-only",
});

export const NATIVE_SOURCE_RIGHTS = Object.freeze([
  Object.freeze({
    id: "integrated-frontier",
    revision: "db7ffc87154d4509b936bea95694c3c5dc623b0c",
    role: "reviewed-core-and-native-spec-contract-donor",
    rights: "repository-owned",
  }),
  Object.freeze({
    id: "native-spec-amendment",
    revision: "8250d0f4b6498c2ee9e4dba7bfc662bd9625491d",
    role: "final-reviewed-experiment-contract",
    rights: "repository-owned",
  }),
  Object.freeze({
    id: "slam-benchmark-donor",
    revision: "490fbcd0fcfbf161a475a17463445410ef67e99e",
    role: "manifest-statistics-pattern-donor-only",
    rights: "repository-owned-derived-code",
  }),
  Object.freeze({
    id: "scikit-learn",
    revision: "f159b78dc59f250cdde8fe391a21f0bc871960ad",
    role: "common-logistic-estimator",
    rights: "BSD-3-Clause",
  }),
  Object.freeze({
    id: "pyBKT",
    revision: "06fc180ae72c117458acc527f8ec90cc8e0581c1",
    role: "conditional-classical-comparator",
    rights: "MIT",
  }),
] as const);

export type SyntheticPredictorLane =
  | "b0-native"
  | "b2-native"
  | "b2-basis-native"
  | "b3-native"
  | "bkt-native";

export type SyntheticPredictorArtifactBinding = {
  readonly lane: SyntheticPredictorLane;
  readonly availability: "available" | "not-estimable" | "not-run";
  readonly specFingerprint: `sha256:${string}` | null;
  readonly transformFingerprint: `sha256:${string}` | null;
  readonly fittedModelFingerprint: `sha256:${string}` | null;
  readonly predictionFingerprint: `sha256:${string}` | null;
  readonly nonEstimabilityReason: string | null;
};

export type SyntheticCoverageSummary = {
  readonly eligibleOpportunityCount: number;
  readonly observedOutcomeCount: number;
  readonly emittedPredictionCount: number;
  readonly acceptedHistoryEventCount: number;
  readonly rejectedHistoryEventCount: number;
  readonly learnerCount: number;
  readonly attemptCount: number;
};

export type SyntheticBktRunBinding = {
  readonly diagnosticsArtifactDigest: `sha256:${string}` | null;
  readonly diagnosticsUnavailableReason: string | null;
  readonly convergenceAssurance: "convergence-observed" | "convergence-unverified" | "not-run";
  readonly stabilityAssurance:
    | "unresolved-pending-reviewed-train-only-tolerances"
    | "reviewed"
    | "not-run";
};

export type BuildSyntheticNativeRunManifestInput = {
  readonly tasks: readonly FrozenPilotTaskDefinition[];
  readonly rows: readonly PredictionFeatureRow[];
  readonly protocol: FrozenNativeSplitProtocol;
  readonly artifacts: readonly SyntheticArtifactRecord[];
  readonly predictorArtifacts: readonly SyntheticPredictorArtifactBinding[];
  readonly coverage: SyntheticCoverageSummary;
  readonly bkt: SyntheticBktRunBinding;
};

function digestJson(value: unknown): `sha256:${string}` {
  return `sha256:${crypto.createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex")}`;
}

function assertNonnegativeInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value < 0) throw new Error(`${field} must be a nonnegative integer`);
}

function validateCoverage(coverage: SyntheticCoverageSummary): void {
  for (const [field, value] of Object.entries(coverage)) assertNonnegativeInteger(value, `coverage.${field}`);
  if (coverage.observedOutcomeCount > coverage.eligibleOpportunityCount) {
    throw new Error("coverage.observedOutcomeCount cannot exceed eligibleOpportunityCount");
  }
  if (coverage.emittedPredictionCount > coverage.eligibleOpportunityCount) {
    throw new Error("coverage.emittedPredictionCount cannot exceed eligibleOpportunityCount");
  }
}

function freezePredictorArtifacts(
  bindings: readonly SyntheticPredictorArtifactBinding[],
): readonly SyntheticPredictorArtifactBinding[] {
  const expected: readonly SyntheticPredictorLane[] = [
    "b0-native",
    "b2-native",
    "b2-basis-native",
    "b3-native",
    "bkt-native",
  ];
  const byLane = new Map(bindings.map((binding) => [binding.lane, binding]));
  if (byLane.size !== bindings.length) throw new Error("predictorArtifacts must contain unique lanes");
  for (const lane of expected) {
    if (!byLane.has(lane)) throw new Error(`predictorArtifacts missing lane: ${lane}`);
  }
  for (const binding of bindings) {
    if (binding.availability === "not-estimable" && !binding.nonEstimabilityReason) {
      throw new Error(`not-estimable lane must record a reason: ${binding.lane}`);
    }
    if (binding.availability !== "not-estimable" && binding.nonEstimabilityReason) {
      throw new Error(`only not-estimable lanes may record nonEstimabilityReason: ${binding.lane}`);
    }
  }
  return Object.freeze(
    bindings
      .map((binding) => Object.freeze({ ...binding }))
      .sort((left, right) => left.lane.localeCompare(right.lane)),
  );
}

function freezeBkt(binding: SyntheticBktRunBinding): SyntheticBktRunBinding {
  if (binding.diagnosticsArtifactDigest === null && !binding.diagnosticsUnavailableReason) {
    throw new Error("missing BKT diagnostics digest requires diagnosticsUnavailableReason");
  }
  if (binding.diagnosticsArtifactDigest !== null && binding.diagnosticsUnavailableReason !== null) {
    throw new Error("BKT diagnostics reason must be null when a digest is present");
  }
  return Object.freeze({ ...binding });
}

export function buildSyntheticNativeRunManifest(input: BuildSyntheticNativeRunManifestInput) {
  validateCoverage(input.coverage);
  const predictorArtifacts = freezePredictorArtifacts(input.predictorArtifacts);
  const bkt = freezeBkt(input.bkt);

  const taskDefinitions = Object.freeze(
    input.tasks
      .map((definition) =>
        Object.freeze({
          family: definition.family,
          taskId: definition.task.id,
          taskVersion: definition.task.version,
          contentFingerprint: definition.contentFingerprint,
          definitionFingerprint: definition.definitionFingerprint,
          contextId: definition.contextId,
          stimulusFormGroup: definition.stimulusFormGroup,
        }),
      )
      .sort((left, right) => left.taskId.localeCompare(right.taskId)),
  );

  const featureRows = Object.freeze(
    input.rows
      .map((row) => {
        const featureDigest = digestJson({ b2: row.b2, b2Basis: row.b2Basis, b3: row.b3 });
        return Object.freeze({
          participantId: row.participantId,
          targetEventId: row.targetEventId,
          predictionTimestamp: row.predictionTimestamp,
          acceptedHistoryEventIds: Object.freeze([...row.acceptedHistoryEventIds]),
          acceptedHistoryLineageDigests: Object.freeze([...row.acceptedHistoryLineageDigests]),
          featureDigest,
          predictionBindingDigest: digestJson({
            participantId: row.participantId,
            targetEventId: row.targetEventId,
            predictionTimestamp: row.predictionTimestamp,
            acceptedHistoryEventIds: row.acceptedHistoryEventIds,
            acceptedHistoryLineageDigests: row.acceptedHistoryLineageDigests,
            featureDigest,
          }),
        });
      })
      .sort((left, right) => left.targetEventId.localeCompare(right.targetEventId)),
  );

  const trainPrefixEventIdsByParticipant = Object.freeze(
    Object.fromEntries(
      Object.entries(input.protocol.trainPrefixEventIdsByParticipant)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([participantId, eventIds]) => [participantId, Object.freeze([...eventIds].sort())]),
    ),
  );
  const blindTargetBindings = Object.freeze(
    Object.fromEntries(
      Object.entries(input.protocol.blindTargetBindings)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([targetEventId, binding]) => [targetEventId, Object.freeze({ ...binding })]),
    ),
  );
  const splitPayload = Object.freeze({
    protocolId: input.protocol.protocolId,
    frozenAt: input.protocol.frozenAt,
    fitCutoff: input.protocol.fitCutoff,
    fitCompletedAt: input.protocol.fitCompletedAt,
    trainingParticipantIds: Object.freeze([...input.protocol.trainingParticipantIds].sort()),
    heldOutParticipantIds: Object.freeze([...input.protocol.heldOutParticipantIds].sort()),
    trainPrefixEventIdsByParticipant,
    blindTargetEventIds: Object.freeze([...input.protocol.blindTargetEventIds].sort()),
    blindTargetBindings,
  });
  const split = Object.freeze({ ...splitPayload, digest: digestJson(splitPayload) });

  const artifacts = Object.freeze(
    input.artifacts
      .map((artifact) =>
        Object.freeze({
          ...artifact,
          participantIds: Object.freeze([...artifact.participantIds].sort()),
          dependsOnArtifactIds: Object.freeze([...artifact.dependsOnArtifactIds].sort()),
        }),
      )
      .sort((left, right) => left.artifactId.localeCompare(right.artifactId)),
  );

  const payload = Object.freeze({
    status: SYNTHETIC_ONLY_STATUS,
    purpose: "full-synthetic-run-binding" as const,
    pilotContractId: NATIVE_PILOT_CONTRACT_ID,
    predictorContractId: NATIVE_PREDICTOR_CONTRACT_ID,
    decisionRuleId: NATIVE_DECISION_RULE_ID,
    dataPolicy: Object.freeze({
      source: "synthetic-only" as const,
      humanDataIncluded: false as const,
      externalCorpusRowsIncluded: false as const,
      redistributionDecision: "not-applicable" as const,
    }),
    sourceRights: NATIVE_SOURCE_RIGHTS,
    predictor: NATIVE_PREDICTOR_SETTINGS,
    metrics: NATIVE_METRIC_SETTINGS,
    featureAuditPolicy: NATIVE_FEATURE_AUDIT_POLICY,
    causalPolicy: Object.freeze({
      currentOutcomeForbidden: true as const,
      futureOutcomeForbidden: true as const,
      strictOccurredBeforePrediction: true as const,
      strictAvailableBeforePrediction: true as const,
      equalTimestampExcluded: true as const,
      trainOnlyTransforms: true as const,
      blindBlockFeedbackForbidden: true as const,
    }),
    utilityGate: Object.freeze({
      status: "unresolved" as const,
      deltaHistory: null,
      deltaBasis: null,
      justificationArtifactDigest: null,
      predictiveKeepSimplifyEnabled: false as const,
    }),
    split,
    taskDefinitions,
    featureRows,
    predictorArtifacts,
    artifacts,
    coverage: Object.freeze({ ...input.coverage }),
    contrasts: Object.freeze({
      b3MinusB2: null,
      b3MinusB2Basis: null,
      reason: "synthetic-data-cannot-rank-models" as const,
    }),
    attribution: "unresolved-synthetic-only" as const,
    bkt,
    decision: Object.freeze({
      status: "disabled-synthetic-only" as const,
      reason: "no-human-outcomes-and-utility-margins-unresolved" as const,
    }),
    forbiddenClaims: Object.freeze([
      "learner-model-validity",
      "predictive-superiority",
      "learning-efficacy",
      "retention-validity",
      "transfer-validity",
      "mastery",
      "CEFR",
      "calibrated",
      "production-authority",
    ]),
  });

  return Object.freeze({ ...payload, manifestDigest: digestJson(payload) });
}
