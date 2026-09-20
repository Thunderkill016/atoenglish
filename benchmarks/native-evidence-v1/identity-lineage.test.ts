import { describe, expect, it } from "vitest";

import { computeCanonicalEvidenceDigest } from "@/lib/core/certified-evidence";

import { buildPredictionFeatureRow } from "./features";
import {
  buildPilotAttemptIdentity,
  computePilotTaskDefinitionFingerprint,
} from "./identity";
import { SyntheticPilotStore } from "./store";
import { buildPilotTaskDefinition } from "./task-matrix";
import { issueSyntheticPilotEvent } from "./synthetic";
import type { PilotTaskDefinition, SyntheticPilotEvent } from "./types";

const OTHER_SHA = `sha256:${"f".repeat(64)}` as const;

function payload(definition: ReturnType<typeof buildPilotTaskDefinition>): PilotTaskDefinition {
  return {
    scoringContractId: definition.scoringContractId,
    stimulusFormGroup: definition.stimulusFormGroup,
    contextId: definition.contextId,
    contentFingerprint: definition.contentFingerprint,
    task: definition.task,
    family: definition.family,
    pilotContractId: definition.pilotContractId,
  };
}

describe("native pilot task identity and evidence lineage", () => {
  it("is invariant to object insertion order but sensitive to frozen array order", () => {
    const definition = buildPilotTaskDefinition("free-recall");
    expect(computePilotTaskDefinitionFingerprint(payload(definition))).toBe(
      definition.definitionFingerprint,
    );

    const reversedTask = Object.freeze({
      ...definition.task,
      contextTags: Object.freeze([...definition.task.contextTags].reverse()) as unknown as string[],
    });
    const reordered: PilotTaskDefinition = {
      ...payload(definition),
      task: reversedTask,
    };
    expect(computePilotTaskDefinitionFingerprint(reordered)).not.toBe(
      definition.definitionFingerprint,
    );
  });

  it("fails closed before evidence validation on version/content/context/definition substitution", () => {
    const definition = buildPilotTaskDefinition("free-recall");
    const identity = buildPilotAttemptIdentity(definition);
    const common = {
      participantId: "p-identity",
      family: "free-recall" as const,
      eventId: "p-identity:e01",
      occurredAt: "2026-09-01T09:00:00.000Z",
      availableAt: "2026-09-01T09:00:01.000Z",
      success: true,
    };

    expect(() =>
      issueSyntheticPilotEvent({
        ...common,
        attemptIdentity: { ...identity, taskVersion: identity.taskVersion + 1 },
      }),
    ).toThrow(/taskVersion/);
    expect(() =>
      issueSyntheticPilotEvent({
        ...common,
        attemptIdentity: { ...identity, contentFingerprint: OTHER_SHA },
      }),
    ).toThrow(/contentFingerprint/);
    expect(() =>
      issueSyntheticPilotEvent({
        ...common,
        attemptIdentity: { ...identity, contextId: "ctx-substituted" },
      }),
    ).toThrow(/contextId/);
    expect(() =>
      issueSyntheticPilotEvent({
        ...common,
        attemptIdentity: { ...identity, definitionFingerprint: OTHER_SHA },
      }),
    ).toThrow(/definitionFingerprint/);
  });

  it("binds issued evidence to canonical digest and excludes missing/tampered lineage", () => {
    const event = issueSyntheticPilotEvent({
      participantId: "p-lineage",
      family: "free-recall",
      eventId: "p-lineage:e01",
      occurredAt: "2026-09-01T09:00:00.000Z",
      availableAt: "2026-09-01T09:00:01.000Z",
      success: true,
    });
    expect(event.lineage.definitionFingerprint).toBe(event.taskDefinition.definitionFingerprint);
    expect(event.lineage.evidenceDigest).toBe(computeCanonicalEvidenceDigest(event.evidence));

    const tampered = Object.freeze({
      ...event,
      lineage: Object.freeze({ ...event.lineage, evidenceDigest: OTHER_SHA }),
    }) as SyntheticPilotEvent;
    expect(() =>
      buildPredictionFeatureRow({
        participantId: "p-lineage",
        targetEventId: "p-lineage:target",
        predictionTimestamp: "2026-09-01T10:00:00.000Z",
        currentTask: buildPilotTaskDefinition("free-recall"),
        history: [tampered],
      }),
    ).toThrow(/wrapper does not match validated evidence/);

    const missing = Object.freeze({ ...event, lineage: undefined }) as unknown as SyntheticPilotEvent;
    const store = new SyntheticPilotStore();
    expect(() => store.addEvent(missing)).toThrow(/missing evidence lineage/);
  });

  it("persists accepted lineage digests into feature rows and participant export", () => {
    const event = issueSyntheticPilotEvent({
      participantId: "p-lineage-export",
      family: "free-recall",
      eventId: "p-lineage-export:e01",
      occurredAt: "2026-09-01T09:00:00.000Z",
      availableAt: "2026-09-01T09:00:01.000Z",
      success: true,
    });
    const row = buildPredictionFeatureRow({
      participantId: "p-lineage-export",
      targetEventId: "p-lineage-export:target",
      predictionTimestamp: "2026-09-01T10:00:00.000Z",
      currentTask: buildPilotTaskDefinition("free-recall"),
      history: [event],
    });
    expect(row.acceptedHistoryLineageDigests).toEqual([event.lineage.evidenceDigest]);

    const store = new SyntheticPilotStore();
    store.addEvent(event);
    const exported = store.exportParticipant("p-lineage-export");
    expect(exported.events[0]?.definitionFingerprint).toBe(event.taskDefinition.definitionFingerprint);
    expect(exported.events[0]?.evidenceDigest).toBe(event.lineage.evidenceDigest);
  });
});
