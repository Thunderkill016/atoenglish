import { describe, expect, it } from "vitest";

import { buildPredictionFeatureRow, selectCausalAcceptedHistory } from "./features";
import { buildPilotTaskDefinition } from "./task-matrix";
import { issueSyntheticPilotEvent } from "./synthetic";

describe("native pilot accepted-history parity", () => {
  it("excludes causally available evidence that the core projector rejects", () => {
    const firstTransfer = issueSyntheticPilotEvent({
      participantId: "p-history-parity",
      family: "near-transfer",
      eventId: "p-history-parity:transfer-first",
      occurredAt: "2026-09-01T08:00:00.000Z",
      availableAt: "2026-09-01T08:00:01.000Z",
      success: true,
    });

    const accepted = selectCausalAcceptedHistory(
      "p-history-parity",
      [firstTransfer],
      "2026-09-01T09:00:00.000Z",
    );

    expect(accepted).toEqual([]);
  });

  it("uses the same accepted ledger after a valid baseline makes transfer lawful", () => {
    const baseline = issueSyntheticPilotEvent({
      participantId: "p-history-parity",
      family: "free-recall",
      eventId: "p-history-parity:baseline",
      occurredAt: "2026-09-01T08:00:00.000Z",
      availableAt: "2026-09-01T08:00:01.000Z",
      success: true,
    });
    const transfer = issueSyntheticPilotEvent({
      participantId: "p-history-parity",
      family: "near-transfer",
      eventId: "p-history-parity:transfer",
      occurredAt: "2026-09-01T08:10:00.000Z",
      availableAt: "2026-09-01T08:10:01.000Z",
      success: true,
    });

    const accepted = selectCausalAcceptedHistory(
      "p-history-parity",
      [baseline, transfer],
      "2026-09-01T09:00:00.000Z",
    );

    expect(accepted.map((event) => event.evidence.eventId)).toEqual([
      "p-history-parity:baseline",
      "p-history-parity:transfer",
    ]);
  });

  it("rebinds duplicate event IDs one-to-one instead of double-counting a core rejection", () => {
    const duplicateSuccess = issueSyntheticPilotEvent({
      participantId: "p-duplicate-parity",
      family: "free-recall",
      eventId: "p-duplicate-parity:e01",
      occurredAt: "2026-09-01T08:00:00.000Z",
      availableAt: "2026-09-01T08:00:01.000Z",
      success: true,
    });
    const duplicateFailure = issueSyntheticPilotEvent({
      participantId: "p-duplicate-parity",
      family: "free-recall",
      eventId: "p-duplicate-parity:e01",
      occurredAt: "2026-09-01T08:00:00.000Z",
      availableAt: "2026-09-01T08:00:02.000Z",
      success: false,
    });

    const history = [duplicateSuccess, duplicateFailure];
    const accepted = selectCausalAcceptedHistory(
      "p-duplicate-parity",
      history,
      "2026-09-01T09:00:00.000Z",
    );
    const row = buildPredictionFeatureRow({
      participantId: "p-duplicate-parity",
      targetEventId: "p-duplicate-parity:target",
      predictionTimestamp: "2026-09-01T09:00:00.000Z",
      currentTask: buildPilotTaskDefinition("free-recall"),
      history,
    });

    expect(accepted).toHaveLength(1);
    expect(row.acceptedHistoryEventIds).toEqual(["p-duplicate-parity:e01"]);
    expect(row.b2.prior_eligible_attempt_count).toBe(1);
    expect(row.b3.nep_total_event_count).toBe(1);
  });

  it("preserves the core occurredAt/eventId order instead of ordering by label availability", () => {
    const eventB = issueSyntheticPilotEvent({
      participantId: "p-order-parity",
      family: "recognition-independent",
      eventId: "p-order-parity:b",
      occurredAt: "2026-09-01T08:00:00.000Z",
      availableAt: "2026-09-01T08:00:01.000Z",
      success: false,
    });
    const eventA = issueSyntheticPilotEvent({
      participantId: "p-order-parity",
      family: "recognition-independent",
      eventId: "p-order-parity:a",
      occurredAt: "2026-09-01T08:00:00.000Z",
      availableAt: "2026-09-01T08:00:02.000Z",
      success: true,
    });

    const accepted = selectCausalAcceptedHistory(
      "p-order-parity",
      [eventB, eventA],
      "2026-09-01T09:00:00.000Z",
    );

    expect(accepted.map((event) => event.evidence.eventId)).toEqual([
      "p-order-parity:a",
      "p-order-parity:b",
    ]);
  });

  it("fails closed when wrapper task metadata diverges from the validated evidence", () => {
    const event = issueSyntheticPilotEvent({
      participantId: "p-wrapper-mismatch",
      family: "free-recall",
      eventId: "p-wrapper-mismatch:e01",
      occurredAt: "2026-09-01T08:00:00.000Z",
      availableAt: "2026-09-01T08:00:01.000Z",
      success: true,
    });
    const forged = Object.freeze({
      ...event,
      taskDefinition: buildPilotTaskDefinition("recognition-independent"),
    });

    expect(() =>
      selectCausalAcceptedHistory(
        "p-wrapper-mismatch",
        [forged],
        "2026-09-01T09:00:00.000Z",
      ),
    ).toThrow(/wrapper does not match validated evidence/);
  });
});
