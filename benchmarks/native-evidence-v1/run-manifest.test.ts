import { describe, expect, it } from "vitest";

import { buildPredictionFeatureRow } from "./features";
import { buildFrozenNativeSplitProtocol } from "./protocol";
import {
  buildSyntheticNativeRunManifest,
  type SyntheticPredictorArtifactBinding,
} from "./run-manifest";
import { SyntheticPilotStore } from "./store";
import { buildFrozenPilotTaskMatrix, buildPilotTaskDefinition } from "./task-matrix";
import { buildSyntheticTrace } from "./synthetic";

const SHA_A = `sha256:${"a".repeat(64)}` as const;
const SHA_B = `sha256:${"b".repeat(64)}` as const;
const SHA_C = `sha256:${"c".repeat(64)}` as const;
const SHA_D = `sha256:${"d".repeat(64)}` as const;

function frozenTaskBinding(definition: ReturnType<typeof buildPilotTaskDefinition>) {
  return {
    family: definition.family,
    taskId: definition.task.id,
    taskVersion: definition.task.version,
    contentFingerprint: definition.contentFingerprint,
    definitionFingerprint: definition.definitionFingerprint,
    supportLevel: definition.task.support.level,
    revealAllowed: definition.task.support.revealAllowed,
    transferDistance: definition.task.transferDistance,
    contextId: definition.contextId,
    stimulusFormGroup: definition.stimulusFormGroup,
    scoringContractId: definition.scoringContractId,
  } as const;
}

function buildFixture() {
  const participantId = "manifest-p";
  const tasks = buildFrozenPilotTaskMatrix();
  const trace = buildSyntheticTrace(participantId);
  const delayedTask = buildPilotTaskDefinition("delayed-free-recall");
  const coldTask = buildPilotTaskDefinition("free-recall");
  const row = buildPredictionFeatureRow({
    participantId,
    targetEventId: `${participantId}:e05`,
    predictionTimestamp: "2026-09-02T09:00:00.000Z",
    currentTask: delayedTask,
    history: trace,
  });
  const protocol = buildFrozenNativeSplitProtocol({
    frozenAt: "2026-08-31T00:00:00.000Z",
    fitCutoff: "2026-09-01T23:00:00.000Z",
    fitCompletedAt: "2026-09-01T23:05:00.000Z",
    trainingParticipantIds: [participantId],
    heldOutParticipantIds: ["manifest-cold"],
    trainPrefixEventIdsByParticipant: {
      [participantId]: [
        `${participantId}:e01`,
        `${participantId}:e02`,
        `${participantId}:e03`,
        `${participantId}:e04`,
      ],
      "manifest-cold": [],
    },
    blindTargetEventIds: [`${participantId}:e05`, "manifest-cold:target"],
    blindTargetBindings: {
      [`${participantId}:e05`]: {
        participantId,
        predictionTimestamp: "2026-09-02T09:00:00.000Z",
        ...frozenTaskBinding(delayedTask),
      },
      "manifest-cold:target": {
        participantId: "manifest-cold",
        predictionTimestamp: "2026-09-02T10:00:00.000Z",
        ...frozenTaskBinding(coldTask),
      },
    },
  });

  const store = new SyntheticPilotStore();
  const feature = store.registerArtifact("feature:manifest-p", "feature", [participantId]);
  const model = store.registerArtifact("model:native", "model", [], [feature.artifactId]);
  const prediction = store.registerArtifact(
    "prediction:manifest-p:e05",
    "prediction",
    [],
    [model.artifactId],
  );
  store.registerArtifact("result:synthetic", "result", [], [prediction.artifactId]);

  const predictorArtifacts: readonly SyntheticPredictorArtifactBinding[] = [
    { lane: "b0-native", availability: "available", specFingerprint: SHA_A, transformFingerprint: null, fittedModelFingerprint: SHA_B, predictionFingerprint: SHA_C, nonEstimabilityReason: null },
    { lane: "b2-native", availability: "available", specFingerprint: SHA_A, transformFingerprint: SHA_B, fittedModelFingerprint: SHA_C, predictionFingerprint: SHA_D, nonEstimabilityReason: null },
    { lane: "b2-basis-native", availability: "available", specFingerprint: SHA_A, transformFingerprint: SHA_B, fittedModelFingerprint: SHA_C, predictionFingerprint: SHA_D, nonEstimabilityReason: null },
    { lane: "b3-native", availability: "available", specFingerprint: SHA_A, transformFingerprint: SHA_B, fittedModelFingerprint: SHA_C, predictionFingerprint: SHA_D, nonEstimabilityReason: null },
    { lane: "bkt-native", availability: "available", specFingerprint: SHA_A, transformFingerprint: null, fittedModelFingerprint: SHA_C, predictionFingerprint: SHA_D, nonEstimabilityReason: null },
  ];

  return { tasks, row, protocol, artifacts: store.listValidArtifacts(), predictorArtifacts };
}

describe("native pilot full synthetic run manifest", () => {
  it("binds split, lineage, fingerprints, coverage and claim boundaries deterministically", () => {
    const fixture = buildFixture();
    const input = {
      tasks: fixture.tasks,
      rows: [fixture.row],
      protocol: fixture.protocol,
      artifacts: fixture.artifacts,
      predictorArtifacts: fixture.predictorArtifacts,
      coverage: {
        eligibleOpportunityCount: 2,
        observedOutcomeCount: 0,
        emittedPredictionCount: 0,
        acceptedHistoryEventCount: fixture.row.acceptedHistoryEventIds.length,
        rejectedHistoryEventCount: 0,
        learnerCount: 2,
        attemptCount: 4,
      },
      bkt: {
        diagnosticsArtifactDigest: SHA_D,
        diagnosticsUnavailableReason: null,
        convergenceAssurance: "convergence-observed" as const,
        stabilityAssurance: "unresolved-pending-reviewed-train-only-tolerances" as const,
      },
    };

    const first = buildSyntheticNativeRunManifest(input);
    const second = buildSyntheticNativeRunManifest({
      ...input,
      tasks: [...input.tasks].reverse(),
      artifacts: [...input.artifacts].reverse(),
      predictorArtifacts: [...input.predictorArtifacts].reverse(),
    });

    const coldTask = buildPilotTaskDefinition("free-recall");
    const delayedTask = buildPilotTaskDefinition("delayed-free-recall");
    expect(first.manifestDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(first.manifestDigest).toBe(second.manifestDigest);
    expect(first.status).toBe("synthetic-plumbing-only");
    expect(first.dataPolicy.humanDataIncluded).toBe(false);
    expect(first.split.digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(first.split.trainingParticipantIds).toEqual(["manifest-p"]);
    expect(first.split.heldOutParticipantIds).toEqual(["manifest-cold"]);
    expect(first.split.blindTargetBindings).toEqual({
      "manifest-cold:target": {
        participantId: "manifest-cold",
        predictionTimestamp: "2026-09-02T10:00:00.000Z",
        ...frozenTaskBinding(coldTask),
      },
      "manifest-p:e05": {
        participantId: "manifest-p",
        predictionTimestamp: "2026-09-02T09:00:00.000Z",
        ...frozenTaskBinding(delayedTask),
      },
    });
    expect(first.causalPolicy.blindBlockFeedbackForbidden).toBe(true);
    expect(first.taskDefinitions.every((task) => /^sha256:[0-9a-f]{64}$/.test(task.definitionFingerprint))).toBe(true);
    expect(first.featureRows[0]?.acceptedHistoryLineageDigests).toEqual(
      fixture.row.acceptedHistoryLineageDigests,
    );
    expect(first.featureRows[0]?.predictionBindingDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(first.artifacts.find((artifact) => artifact.artifactId === "result:synthetic")?.participantIds).toEqual(["manifest-p"]);
    expect(first.predictorArtifacts).toHaveLength(5);
    expect(first.contrasts).toEqual({ b3MinusB2: null, b3MinusB2Basis: null, reason: "synthetic-data-cannot-rank-models" });
    expect(first.utilityGate.predictiveKeepSimplifyEnabled).toBe(false);
    expect(first.decision.status).toBe("disabled-synthetic-only");
    expect(first.forbiddenClaims).toContain("learner-model-validity");
    expect(first.forbiddenClaims).toContain("predictive-superiority");
  });

  it("fails closed on incomplete lane, impossible coverage or ambiguous BKT diagnostics", () => {
    const fixture = buildFixture();
    const base = {
      tasks: fixture.tasks,
      rows: [fixture.row],
      protocol: fixture.protocol,
      artifacts: fixture.artifacts,
      predictorArtifacts: fixture.predictorArtifacts,
      coverage: {
        eligibleOpportunityCount: 1,
        observedOutcomeCount: 0,
        emittedPredictionCount: 0,
        acceptedHistoryEventCount: 4,
        rejectedHistoryEventCount: 0,
        learnerCount: 1,
        attemptCount: 4,
      },
      bkt: {
        diagnosticsArtifactDigest: SHA_D,
        diagnosticsUnavailableReason: null,
        convergenceAssurance: "convergence-observed" as const,
        stabilityAssurance: "unresolved-pending-reviewed-train-only-tolerances" as const,
      },
    };

    expect(() =>
      buildSyntheticNativeRunManifest({
        ...base,
        predictorArtifacts: base.predictorArtifacts.filter((lane) => lane.lane !== "b3-native"),
      }),
    ).toThrow("predictorArtifacts missing lane: b3-native");

    expect(() =>
      buildSyntheticNativeRunManifest({
        ...base,
        coverage: { ...base.coverage, observedOutcomeCount: 2 },
      }),
    ).toThrow("coverage.observedOutcomeCount cannot exceed eligibleOpportunityCount");

    expect(() =>
      buildSyntheticNativeRunManifest({
        ...base,
        bkt: { ...base.bkt, diagnosticsArtifactDigest: null, diagnosticsUnavailableReason: null },
      }),
    ).toThrow("missing BKT diagnostics digest requires diagnosticsUnavailableReason");
  });
});
