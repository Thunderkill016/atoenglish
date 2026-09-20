import { describe, expect, it } from "vitest";

import {
  buildBlindPredictionFeatureRow,
  buildFrozenNativeSplitProtocol,
  selectAuthorizedTrainPrefixEvents,
} from "./protocol";
import { buildPilotTaskDefinition } from "./task-matrix";
import { buildSyntheticTrace, issueSyntheticPilotEvent } from "./synthetic";

function targetBinding(
  participantId: string,
  predictionTimestamp: string,
  family: Parameters<typeof buildPilotTaskDefinition>[0],
) {
  const definition = buildPilotTaskDefinition(family);
  return {
    participantId,
    predictionTimestamp,
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

function makeProtocol() {
  return buildFrozenNativeSplitProtocol({
    frozenAt: "2026-09-01T08:00:00.000Z",
    fitCutoff: "2026-09-01T09:15:00.000Z",
    fitCompletedAt: "2026-09-01T09:16:00.000Z",
    trainingParticipantIds: ["p-train"],
    heldOutParticipantIds: ["p-heldout"],
    trainPrefixEventIdsByParticipant: {
      "p-train": ["p-train:e01", "p-train:e02", "p-train:e03"],
      "p-heldout": [],
    },
    blindTargetEventIds: ["p-train:e04", "p-train:e05", "p-heldout:cold-target"],
    blindTargetBindings: {
      "p-train:e04": targetBinding("p-train", "2026-09-01T09:20:00.000Z", "free-recall"),
      "p-train:e05": targetBinding(
        "p-train",
        "2026-09-02T09:00:00.000Z",
        "delayed-free-recall",
      ),
      "p-heldout:cold-target": targetBinding(
        "p-heldout",
        "2026-09-02T10:00:00.000Z",
        "free-recall",
      ),
    },
  });
}

function rowPayload(row: ReturnType<typeof buildBlindPredictionFeatureRow>): string {
  return JSON.stringify({
    acceptedHistoryEventIds: row.acceptedHistoryEventIds,
    acceptedHistoryLineageDigests: row.acceptedHistoryLineageDigests,
    b2: row.b2,
    b2Basis: row.b2Basis,
    b3: row.b3,
  });
}

describe("native pilot frozen split and blind block", () => {
  it("selects only frozen TRAIN-prefix labels available before the global fit cutoff", () => {
    const protocol = makeProtocol();
    const trace = buildSyntheticTrace("p-train");
    const selected = selectAuthorizedTrainPrefixEvents(protocol, trace);
    expect(selected.map((event) => event.evidence.eventId)).toEqual([
      "p-train:e01",
      "p-train:e02",
      "p-train:e03",
    ]);

    const latePrefix = issueSyntheticPilotEvent({
      participantId: "p-train",
      family: "recognition-independent",
      eventId: "p-train:e03",
      occurredAt: "2026-09-01T09:10:00.000Z",
      availableAt: "2026-09-01T09:15:00.000Z",
      success: true,
    });
    const replaced = [trace[0], trace[1], latePrefix, ...trace.slice(3)].filter(
      (event): event is NonNullable<typeof event> => event !== undefined,
    );
    expect(() => selectAuthorizedTrainPrefixEvents(protocol, replaced)).toThrow(
      /not causally available by fitCutoff/,
    );
  });

  it("rejects duplicate frozen TRAIN-prefix evidence instead of last-write-wins", () => {
    const protocol = makeProtocol();
    const trace = buildSyntheticTrace("p-train");
    const duplicate = issueSyntheticPilotEvent({
      participantId: "p-train",
      family: "recognition-supported",
      eventId: "p-train:e02",
      occurredAt: "2026-09-01T09:05:00.000Z",
      availableAt: "2026-09-01T09:05:02.000Z",
      success: true,
      responseLatencyMs: 900,
    });

    expect(() => selectAuthorizedTrainPrefixEvents(protocol, [...trace, duplicate])).toThrow(
      /ambiguous due to duplicate eventId: p-train:e02/,
    );
    expect(() =>
      buildBlindPredictionFeatureRow({
        protocol,
        participantId: "p-train",
        targetEventId: "p-train:e05",
        predictionTimestamp: "2026-09-02T09:00:00.000Z",
        currentTask: buildPilotTaskDefinition("delayed-free-recall"),
        history: [...trace, duplicate],
      }),
    ).toThrow(/duplicate prefix eventId: p-train:e02/);
  });

  it("binds every blind target to participant, timestamp and frozen task identity fingerprint", () => {
    const protocol = makeProtocol();

    expect(() =>
      buildBlindPredictionFeatureRow({
        protocol,
        participantId: "p-train",
        targetEventId: "p-heldout:cold-target",
        predictionTimestamp: "2026-09-02T10:00:00.000Z",
        currentTask: buildPilotTaskDefinition("free-recall"),
        history: buildSyntheticTrace("p-train"),
      }),
    ).toThrow(/frozen to participant p-heldout/);

    expect(() =>
      buildBlindPredictionFeatureRow({
        protocol,
        participantId: "p-train",
        targetEventId: "p-train:e05",
        predictionTimestamp: "2026-09-02T09:00:00.001Z",
        currentTask: buildPilotTaskDefinition("delayed-free-recall"),
        history: buildSyntheticTrace("p-train"),
      }),
    ).toThrow(/predictionTimestamp differs from frozen blind target/);

    expect(() =>
      buildBlindPredictionFeatureRow({
        protocol,
        participantId: "p-train",
        targetEventId: "p-train:e05",
        predictionTimestamp: "2026-09-02T09:00:00.000Z",
        currentTask: buildPilotTaskDefinition("free-recall"),
        history: buildSyntheticTrace("p-train"),
      }),
    ).toThrow(/currentTask differs from frozen blind target/);
  });

  it("fails closed on missing, extra or unallocated blind-target bindings", () => {
    expect(() =>
      buildFrozenNativeSplitProtocol({
        frozenAt: "2026-09-01T08:00:00.000Z",
        fitCutoff: "2026-09-01T09:15:00.000Z",
        fitCompletedAt: "2026-09-01T09:16:00.000Z",
        trainingParticipantIds: ["p-train"],
        heldOutParticipantIds: ["p-heldout"],
        trainPrefixEventIdsByParticipant: { "p-train": [], "p-heldout": [] },
        blindTargetEventIds: ["target-a"],
        blindTargetBindings: {},
      }),
    ).toThrow(/missing frozen binding: target-a/);

    expect(() =>
      buildFrozenNativeSplitProtocol({
        frozenAt: "2026-09-01T08:00:00.000Z",
        fitCutoff: "2026-09-01T09:15:00.000Z",
        fitCompletedAt: "2026-09-01T09:16:00.000Z",
        trainingParticipantIds: ["p-train"],
        heldOutParticipantIds: [],
        trainPrefixEventIdsByParticipant: { "p-train": [] },
        blindTargetEventIds: ["target-a"],
        blindTargetBindings: {
          "target-a": targetBinding("p-train", "2026-09-01T09:20:00.000Z", "free-recall"),
          "target-extra": targetBinding("p-train", "2026-09-01T09:21:00.000Z", "free-recall"),
        },
      }),
    ).toThrow(/blind target binding references unknown target: target-extra/);

    expect(() =>
      buildFrozenNativeSplitProtocol({
        frozenAt: "2026-09-01T08:00:00.000Z",
        fitCutoff: "2026-09-01T09:15:00.000Z",
        fitCompletedAt: "2026-09-01T09:16:00.000Z",
        trainingParticipantIds: ["p-train"],
        heldOutParticipantIds: [],
        trainPrefixEventIdsByParticipant: { "p-train": [] },
        blindTargetEventIds: ["target-a"],
        blindTargetBindings: {
          "target-a": targetBinding("not-allocated", "2026-09-01T09:20:00.000Z", "free-recall"),
        },
      }),
    ).toThrow(/blind target references unallocated participant/);
  });

  it("never feeds an earlier blind-block outcome into a later blind-block prediction", () => {
    const protocol = makeProtocol();
    const original = buildSyntheticTrace("p-train");
    const currentTask = buildPilotTaskDefinition("delayed-free-recall");
    const rowA = buildBlindPredictionFeatureRow({
      protocol,
      participantId: "p-train",
      targetEventId: "p-train:e05",
      predictionTimestamp: "2026-09-02T09:00:00.000Z",
      currentTask,
      history: original,
    });
    const mutatedEarlierBlindOutcome = [
      ...original.slice(0, 3),
      issueSyntheticPilotEvent({
        participantId: "p-train",
        family: "free-recall",
        eventId: "p-train:e04",
        occurredAt: "2026-09-01T09:20:00.000Z",
        availableAt: "2026-09-01T09:20:01.000Z",
        success: true,
      }),
      ...original.slice(4),
    ];
    const rowB = buildBlindPredictionFeatureRow({
      protocol,
      participantId: "p-train",
      targetEventId: "p-train:e05",
      predictionTimestamp: "2026-09-02T09:00:00.000Z",
      currentTask,
      history: mutatedEarlierBlindOutcome,
    });
    expect(rowA.acceptedHistoryEventIds).toEqual(["p-train:e01", "p-train:e02", "p-train:e03"]);
    expect(rowPayload(rowA)).toBe(rowPayload(rowB));
  });

  it("keeps a held-out participant at cold start even when their labeled history is supplied", () => {
    const protocol = makeProtocol();
    const row = buildBlindPredictionFeatureRow({
      protocol,
      participantId: "p-heldout",
      targetEventId: "p-heldout:cold-target",
      predictionTimestamp: "2026-09-02T10:00:00.000Z",
      currentTask: buildPilotTaskDefinition("free-recall"),
      history: buildSyntheticTrace("p-heldout"),
    });
    expect(row.acceptedHistoryEventIds).toEqual([]);
    expect(row.acceptedHistoryLineageDigests).toEqual([]);
    expect(row.b2.prior_eligible_attempt_count).toBe(0);
    expect(row.b2.prior_success_rate).toBeNull();
    expect(row.b3.nep_status).toBe("unknown");
    expect(row.b3.nep_uncertainty).toBe("maximal");
  });

  it("rejects held-out TRAIN contribution and noncausal frozen prediction timing", () => {
    expect(() =>
      buildFrozenNativeSplitProtocol({
        frozenAt: "2026-09-01T08:00:00.000Z",
        fitCutoff: "2026-09-01T09:15:00.000Z",
        fitCompletedAt: "2026-09-01T09:16:00.000Z",
        trainingParticipantIds: ["p-train"],
        heldOutParticipantIds: ["p-heldout"],
        trainPrefixEventIdsByParticipant: { "p-train": [], "p-heldout": ["p-heldout:e01"] },
        blindTargetEventIds: ["target"],
        blindTargetBindings: {
          target: targetBinding("p-train", "2026-09-01T09:20:00.000Z", "free-recall"),
        },
      }),
    ).toThrow(/held-out participant cannot contribute TRAIN prefix events/);

    expect(() =>
      buildFrozenNativeSplitProtocol({
        frozenAt: "2026-09-01T08:00:00.000Z",
        fitCutoff: "2026-09-01T09:15:00.000Z",
        fitCompletedAt: "2026-09-01T09:20:00.000Z",
        trainingParticipantIds: ["p-train"],
        heldOutParticipantIds: [],
        trainPrefixEventIdsByParticipant: { "p-train": [] },
        blindTargetEventIds: ["target"],
        blindTargetBindings: {
          target: targetBinding("p-train", "2026-09-01T09:20:00.000Z", "free-recall"),
        },
      }),
    ).toThrow(/blind target prediction must occur after fitCompletedAt/);
  });
});
