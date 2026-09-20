import { describe, expect, it } from "vitest";

import { projectLearnerState, createEmptyLearnerStateProjection, reduceLearnerState } from "@/lib/core/learner-state";
import { buildEnglishOntologyV1 } from "@/lib/core/ontology-seed";
import { validateCoreTask } from "@/lib/core/task";

import { buildPredictionFeatureRow, selectCausalAcceptedHistory } from "./features";
import { buildSyntheticNativePilotManifest } from "./manifest";
import { SyntheticPilotStore } from "./store";
import { buildFrozenPilotTaskMatrix, buildPilotTaskDefinition } from "./task-matrix";
import {
  buildSyntheticTrace,
  createSyntheticEvidenceFixture,
  issueSyntheticPilotEvent,
} from "./synthetic";
import { NATIVE_PILOT_TARGET_ID, SYNTHETIC_ONLY_STATUS } from "./types";

const ontologyResult = buildEnglishOntologyV1();
if (!ontologyResult.ok) throw new Error(JSON.stringify(ontologyResult.problems));
const ontology = ontologyResult.graph;

function predictionPayload(row: ReturnType<typeof buildPredictionFeatureRow>) {
  return JSON.stringify({
    acceptedHistoryEventIds: row.acceptedHistoryEventIds,
    b2: row.b2,
    b2Basis: row.b2Basis,
    b3: row.b3,
  });
}

describe("Nếp native evidence N2 synthetic plumbing", () => {
  it("freezes the five prospective task families with valid core semantics", () => {
    const matrix = buildFrozenPilotTaskMatrix();
    expect(matrix.map((definition) => definition.family)).toEqual([
      "recognition-independent",
      "recognition-supported",
      "free-recall",
      "delayed-free-recall",
      "near-transfer",
    ]);

    for (const definition of matrix) {
      expect(definition.task.targetIds).toEqual([NATIVE_PILOT_TARGET_ID]);
      expect(definition.contentFingerprint).toMatch(/^sha256:[0-9a-f]{64}$/);
      expect(definition.task.scoringContractId).toBe("nep.native-pilot.binary-v1");
      expect(validateCoreTask(definition.task)).toEqual([]);
    }

    const supported = matrix.find((definition) => definition.family === "recognition-supported");
    expect(supported?.task.support).toEqual({ level: 1, revealAllowed: true });

    const transfer = matrix.find((definition) => definition.family === "near-transfer");
    expect(transfer?.task.transferDistance).toBe("near-transfer");
    expect(transfer?.task.allowedEvidenceRoles).toEqual(["near-transfer"]);
  });

  it("issues only unvalidated repository-reference evidence and keeps supported reveal explicit", () => {
    const unused = issueSyntheticPilotEvent({
      participantId: "p-support",
      family: "recognition-supported",
      eventId: "p-support:e1",
      occurredAt: "2026-09-01T09:00:00.000Z",
      availableAt: "2026-09-01T09:00:01.000Z",
      success: false,
      revealUsed: false,
    });
    const used = issueSyntheticPilotEvent({
      participantId: "p-support",
      family: "recognition-supported",
      eventId: "p-support:e2",
      occurredAt: "2026-09-01T09:01:00.000Z",
      availableAt: "2026-09-01T09:01:01.000Z",
      success: true,
      revealUsed: true,
    });

    expect(unused.evidence.authorityScope).toBe("repository-reference");
    expect(unused.evidence.calibrationBenchmarkId).toBeNull();
    expect(unused.evidence.grantId).toBeNull();
    expect(unused.evidence.attempt.revealUsed).toBe(false);
    expect(used.evidence.attempt.revealUsed).toBe(true);

    const invalidIndependent = createSyntheticEvidenceFixture({
      participantId: "p-support",
      family: "free-recall",
      eventId: "p-support:invalid-independent",
      occurredAt: "2026-09-01T09:02:00.000Z",
      availableAt: "2026-09-01T09:02:01.000Z",
      success: true,
      revealUsed: true,
    });
    expect(invalidIndependent.validation.ok).toBe(false);
    if (!invalidIndependent.validation.ok) {
      expect(invalidIndependent.validation.problems).toContainEqual({ type: "reveal-not-allowed" });
      expect(invalidIndependent.validation.problems).toContainEqual({
        type: "support-invalidates-strong-evidence",
        role: "free-recall",
      });
    }
  });

  it("rejects first-event transfer but accepts prospective changed-context transfer after baseline", () => {
    const firstTransfer = issueSyntheticPilotEvent({
      participantId: "p-transfer",
      family: "near-transfer",
      eventId: "p-transfer:e1",
      occurredAt: "2026-09-01T10:00:00.000Z",
      availableAt: "2026-09-01T10:00:01.000Z",
      success: true,
    });
    const firstState = projectLearnerState(ontology, [firstTransfer.evidence]);
    expect(firstState.acceptedEvents).toHaveLength(0);
    expect(firstState.rejectedEvents[0]?.code).toBe("invalid-transfer-distance");

    const baseline = issueSyntheticPilotEvent({
      participantId: "p-transfer",
      family: "free-recall",
      eventId: "p-transfer:e0",
      occurredAt: "2026-09-01T09:55:00.000Z",
      availableAt: "2026-09-01T09:55:01.000Z",
      success: true,
    });
    const validState = projectLearnerState(ontology, [baseline.evidence, firstTransfer.evidence]);
    expect(validState.acceptedEvents).toHaveLength(2);
    expect(validState.rejectedEvents).toHaveLength(0);
    expect(validState.constructs[NATIVE_PILOT_TARGET_ID]?.statistics.transfer.nearTransferCount).toBe(1);
  });

  it("rejects duplicate and late out-of-order events in the append-only reducer", () => {
    const trace = buildSyntheticTrace("p-order");
    const early = trace[0];
    const late = trace[3];
    if (!early || !late) throw new Error("Synthetic trace fixture incomplete");

    let state = createEmptyLearnerStateProjection(ontology);
    state = reduceLearnerState(state, early.evidence, ontology);
    state = reduceLearnerState(state, early.evidence, ontology);
    expect(state.acceptedEvents).toHaveLength(1);
    expect(state.rejectedEvents.at(-1)?.code).toBe("duplicate-event-id");

    let lateFirst = createEmptyLearnerStateProjection(ontology);
    lateFirst = reduceLearnerState(lateFirst, late.evidence, ontology);
    lateFirst = reduceLearnerState(lateFirst, early.evidence, ontology);
    expect(lateFirst.acceptedEvents).toHaveLength(1);
    expect(lateFirst.rejectedEvents.at(-1)?.code).toBe("out-of-order-event");
  });

  it("rejects a detached cloned evidence object even when its fields are unchanged", () => {
    const event = buildSyntheticTrace("p-clone")[0];
    if (!event) throw new Error("Synthetic trace fixture incomplete");
    const detached: unknown = JSON.parse(JSON.stringify(event.evidence));
    const state = projectLearnerState(ontology, [detached]);
    expect(state.acceptedEvents).toHaveLength(0);
    expect(state.rejectedEvents).toHaveLength(1);
    expect(state.rejectedEvents[0]?.code).toBe("unvalidated-evidence-rejected");
  });

  it("keeps cold-start unknown distinct from observed zero", () => {
    const currentTask = buildPilotTaskDefinition("free-recall");
    const row = buildPredictionFeatureRow({
      participantId: "p-cold",
      targetEventId: "p-cold:target",
      predictionTimestamp: "2026-09-01T09:00:00.000Z",
      currentTask,
      history: [],
    });

    expect(row.b2.prior_eligible_attempt_count).toBe(0);
    expect(row.b2.prior_positive_count).toBe(0);
    expect(row.b2.prior_success_rate).toBeNull();
    expect(row.b2.previous_outcome).toBe("missing");
    expect(row.b2.seconds_since_previous_attempt).toBeNull();
    expect(row.b3.nep_status).toBe("unknown");
    expect(row.b3.nep_uncertainty).toBe("maximal");
    expect(row.b3.nep_provisional_routing_score).toBeNull();
    expect(row.b3.nep_routing_score_missing).toBe(1);
  });

  it("requires strict occurredAt and availableAt precedence, excluding equal-time labels", () => {
    const event = issueSyntheticPilotEvent({
      participantId: "p-late-label",
      family: "recognition-independent",
      eventId: "p-late-label:e1",
      occurredAt: "2026-09-01T08:59:00.000Z",
      availableAt: "2026-09-01T09:00:00.000Z",
      success: true,
    });

    const excluded = selectCausalAcceptedHistory(
      "p-late-label",
      [event],
      "2026-09-01T09:00:00.000Z",
    );
    expect(excluded).toEqual([]);

    const included = selectCausalAcceptedHistory(
      "p-late-label",
      [event],
      "2026-09-01T09:00:00.001Z",
    );
    expect(included.map((item) => item.evidence.eventId)).toEqual(["p-late-label:e1"]);
  });

  it("keeps pre-attempt features byte-identical when current/future outcomes or attached label change", () => {
    const participantId = "p-leakage";
    const baseTrace = buildSyntheticTrace(participantId);
    const currentTask = buildPilotTaskDefinition("free-recall");
    const predictionTimestamp = "2026-09-01T09:20:00.000Z";

    const mutatedFuture = [
      ...baseTrace.slice(0, 3),
      issueSyntheticPilotEvent({
        participantId,
        family: "free-recall",
        eventId: `${participantId}:e04-mutated`,
        occurredAt: "2026-09-01T09:20:00.000Z",
        availableAt: "2026-09-01T09:20:01.000Z",
        success: true,
      }),
      issueSyntheticPilotEvent({
        participantId,
        family: "delayed-free-recall",
        eventId: `${participantId}:e05-mutated`,
        occurredAt: "2026-09-02T09:00:00.000Z",
        availableAt: "2026-09-02T09:00:01.000Z",
        success: false,
      }),
      issueSyntheticPilotEvent({
        participantId,
        family: "near-transfer",
        eventId: `${participantId}:e06-mutated`,
        occurredAt: "2026-09-02T09:10:00.000Z",
        availableAt: "2026-09-02T09:10:01.000Z",
        success: false,
      }),
    ];

    const rowA = buildPredictionFeatureRow({
      participantId,
      targetEventId: `${participantId}:target`,
      predictionTimestamp,
      currentTask,
      history: baseTrace,
      label: 0,
    });
    const rowB = buildPredictionFeatureRow({
      participantId,
      targetEventId: `${participantId}:target`,
      predictionTimestamp,
      currentTask,
      history: mutatedFuture,
      label: 1,
    });

    expect(rowA.acceptedHistoryEventIds).toEqual([
      `${participantId}:e01`,
      `${participantId}:e02`,
      `${participantId}:e03`,
    ]);
    expect(predictionPayload(rowA)).toBe(predictionPayload(rowB));
  });

  it("reconstructs the projector count-derived status, uncertainty and routing control from B2 history", () => {
    const participantId = "p-basis";
    const trace = buildSyntheticTrace(participantId);
    const row = buildPredictionFeatureRow({
      participantId,
      targetEventId: `${participantId}:target`,
      predictionTimestamp: "2026-09-01T09:20:00.000Z",
      currentTask: buildPilotTaskDefinition("free-recall"),
      history: trace,
    });

    expect(row.b2Basis.basis_status).toBe(row.b3.nep_status);
    expect(row.b2Basis.basis_uncertainty).toBe(row.b3.nep_uncertainty);
    expect(row.b2Basis.basis_provisional_routing_score).toBe(row.b3.nep_provisional_routing_score);
    expect(row.b2Basis.basis_conflicted_count).toBe(row.b3.nep_conflicted_count);
  });

  it("exports only synthetic metadata and deletion invalidates participant-dependent artifacts", () => {
    const participantId = "p-delete";
    const store = new SyntheticPilotStore();
    store.addEvents(buildSyntheticTrace(participantId));
    store.addEvents(buildSyntheticTrace("p-other"));

    for (const kind of ["feature", "model", "prediction", "result"] as const) {
      store.registerArtifact(`${kind}:dependent`, kind, [participantId, "p-other"]);
    }
    store.registerArtifact("result:other-only", "result", ["p-other"]);

    const exported = store.exportParticipant(participantId);
    expect(exported.status).toBe(SYNTHETIC_ONLY_STATUS);
    expect(exported.events).toHaveLength(6);
    expect(exported.events[0]?.evidenceDigest).toMatch(/^sha256:[0-9a-f]{64}$/);

    const deletion = store.deleteParticipant(participantId);
    expect(deletion.removedEventCount).toBe(6);
    expect(store.getEvents(participantId)).toEqual([]);
    expect(deletion.invalidatedArtifactIds).toEqual([
      "feature:dependent",
      "model:dependent",
      "prediction:dependent",
      "result:dependent",
    ]);
    expect(store.getArtifact("model:dependent")?.valid).toBe(false);
    expect(store.getArtifact("result:other-only")?.valid).toBe(true);
  });

  it("emits a machine-readable manifest that cannot be mistaken for learner validity evidence", () => {
    const tasks = buildFrozenPilotTaskMatrix();
    const row = buildPredictionFeatureRow({
      participantId: "p-manifest",
      targetEventId: "p-manifest:target",
      predictionTimestamp: "2026-09-01T09:20:00.000Z",
      currentTask: buildPilotTaskDefinition("free-recall"),
      history: buildSyntheticTrace("p-manifest"),
    });
    const manifest = buildSyntheticNativePilotManifest(tasks, [row]);

    expect(manifest.status).toBe("synthetic-plumbing-only");
    expect(manifest.predictor.version).toBe("1.6.1");
    expect(manifest.utilityGate.deltaHistory).toBeNull();
    expect(manifest.utilityGate.deltaBasis).toBeNull();
    expect(manifest.utilityGate.predictiveKeepSimplifyEnabled).toBe(false);
    expect(manifest.forbiddenClaims).toContain("predictive-superiority");
    expect(manifest.forbiddenClaims).toContain("learner-model-validity");
  });
});
