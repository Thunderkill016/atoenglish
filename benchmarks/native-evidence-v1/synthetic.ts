import {
  validateReferenceCoreEvidence,
  type CoreEvidenceCandidate,
  type ReferenceEvidenceValidationResult,
} from "@/lib/core/certified-evidence";
import type { DiagnosticPayload } from "@/lib/core/diagnostics";
import type { CoreObservation } from "@/lib/core/observation";

import {
  assertPilotAttemptMatchesDefinition,
  buildPilotAttemptIdentity,
  createPilotEvidenceLineage,
} from "./identity";
import { buildPilotTaskDefinition, type BuildPilotTaskOptions } from "./task-matrix";
import {
  NATIVE_PILOT_TARGET_ID,
  type FrozenPilotTaskDefinition,
  type PilotAttemptIdentity,
  type PilotTaskFamily,
  type SyntheticPilotEvent,
} from "./types";

const SYNTHETIC_EVALUATOR_FINGERPRINT = "native-pilot-synthetic-deterministic-v1" as const;

export type SyntheticAttemptInput = {
  readonly participantId: string;
  readonly family: PilotTaskFamily;
  readonly eventId: string;
  readonly occurredAt: string;
  readonly availableAt: string;
  readonly success: boolean;
  readonly revealUsed?: boolean;
  readonly responseLatencyMs?: number | null;
  readonly taskOptions?: BuildPilotTaskOptions;
  readonly attemptIdentity?: PilotAttemptIdentity;
};

export type SyntheticEvidenceFixture = {
  readonly taskDefinition: FrozenPilotTaskDefinition;
  readonly observation: CoreObservation;
  readonly candidate: CoreEvidenceCandidate;
  readonly validation: ReferenceEvidenceValidationResult;
};

function buildPayload(
  taskDefinition: FrozenPilotTaskDefinition,
  success: boolean,
  responseLatencyMs: number | null,
): DiagnosticPayload {
  if (
    taskDefinition.family === "recognition-independent" ||
    taskDefinition.family === "recognition-supported"
  ) {
    return {
      kind: "comprehension",
      taskId: taskDefinition.task.id,
      responseCorrect: success,
      responseLatencyMs,
      supportLevel: taskDefinition.task.support.level,
      targetedConstructs: [NATIVE_PILOT_TARGET_ID],
    };
  }

  return {
    kind: "controlled-response",
    taskId: taskDefinition.task.id,
    observedResponse: true,
    responseCorrect: success,
    matchedTargetIds: success ? [NATIVE_PILOT_TARGET_ID] : [],
    missingTargetIds: success ? [] : [NATIVE_PILOT_TARGET_ID],
    evaluatorRuleId: "native-pilot.binary-v1",
  };
}

export function createSyntheticEvidenceFixture(input: SyntheticAttemptInput): SyntheticEvidenceFixture {
  const taskDefinition = buildPilotTaskDefinition(input.family, input.taskOptions);
  const attemptIdentity = input.attemptIdentity ?? buildPilotAttemptIdentity(taskDefinition);

  // This wrapper identity gate deliberately runs before any response/outcome object is constructed.
  assertPilotAttemptMatchesDefinition(attemptIdentity, taskDefinition);

  const role = taskDefinition.task.allowedEvidenceRoles[0];
  if (!role) throw new Error(`Native pilot task ${taskDefinition.task.id} has no evidence role`);

  const responseLatencyMs = input.responseLatencyMs ?? null;
  const revealUsed = input.revealUsed ?? false;
  const observationId = `obs:${input.participantId}:${input.eventId}`;

  const observation: CoreObservation = Object.freeze({
    observationId,
    targetId: NATIVE_PILOT_TARGET_ID,
    activity: taskDefinition.task.activity,
    payload: buildPayload(taskDefinition, input.success, responseLatencyMs),
    confidence: 1,
    calibration: Object.freeze({
      validationState: "unvalidated",
      decision: "shadow",
      benchmarkId: null,
      modelFingerprint: SYNTHETIC_EVALUATOR_FINGERPRINT,
      scope: Object.freeze({
        activity: taskDefinition.task.activity,
        construct: NATIVE_PILOT_TARGET_ID,
        requiredPopulationTags: ["synthetic-only"],
      }),
      metrics: Object.freeze({ sampleSize: 0 }),
    }),
    authority: "none",
    provenance: Object.freeze({
      evaluator: SYNTHETIC_EVALUATOR_FINGERPRINT,
      evaluatorKind: "deterministic",
      sources: taskDefinition.task.sources,
    }),
    context: Object.freeze({
      populationTags: ["synthetic-only"],
      construct: NATIVE_PILOT_TARGET_ID,
      promptContext: taskDefinition.family,
    }),
    contextId: taskDefinition.contextId,
    createdAt: input.occurredAt,
  });

  const candidate: CoreEvidenceCandidate = Object.freeze({
    eventId: input.eventId,
    taskId: taskDefinition.task.id,
    targetId: NATIVE_PILOT_TARGET_ID,
    role,
    observationId,
    outcome: Object.freeze({ kind: "binary" as const, success: input.success }),
    evaluatorConfidence: 1,
    attempt: Object.freeze({
      supportLevel: taskDefinition.task.support.level,
      revealUsed,
      responseLatencyMs,
      responseModality: taskDefinition.task.responseModality,
      contextId: taskDefinition.contextId,
    }),
    occurredAt: input.occurredAt,
  });

  return Object.freeze({
    taskDefinition,
    observation,
    candidate,
    validation: validateReferenceCoreEvidence(taskDefinition.task, observation, candidate),
  });
}

export function issueSyntheticPilotEvent(input: SyntheticAttemptInput): SyntheticPilotEvent {
  const fixture = createSyntheticEvidenceFixture(input);
  if (!fixture.validation.ok) {
    throw new Error(
      `Synthetic evidence failed reference validation: ${JSON.stringify(fixture.validation.problems)}`,
    );
  }

  const lineage = createPilotEvidenceLineage(fixture.taskDefinition, fixture.validation.evidence);
  return Object.freeze({
    participantId: input.participantId,
    taskDefinition: fixture.taskDefinition,
    evidence: fixture.validation.evidence,
    lineage,
    availableAt: input.availableAt,
  });
}

export function buildSyntheticTrace(participantId = "synthetic-participant-a"): readonly SyntheticPilotEvent[] {
  return Object.freeze([
    issueSyntheticPilotEvent({
      participantId,
      family: "recognition-independent",
      eventId: `${participantId}:e01`,
      occurredAt: "2026-09-01T09:00:00.000Z",
      availableAt: "2026-09-01T09:00:01.000Z",
      success: true,
      responseLatencyMs: 1200,
    }),
    issueSyntheticPilotEvent({
      participantId,
      family: "recognition-supported",
      eventId: `${participantId}:e02`,
      occurredAt: "2026-09-01T09:05:00.000Z",
      availableAt: "2026-09-01T09:05:01.000Z",
      success: false,
      revealUsed: false,
      responseLatencyMs: 1800,
    }),
    issueSyntheticPilotEvent({
      participantId,
      family: "recognition-supported",
      eventId: `${participantId}:e03`,
      occurredAt: "2026-09-01T09:10:00.000Z",
      availableAt: "2026-09-01T09:10:01.000Z",
      success: true,
      revealUsed: true,
      responseLatencyMs: 1500,
    }),
    issueSyntheticPilotEvent({
      participantId,
      family: "free-recall",
      eventId: `${participantId}:e04`,
      occurredAt: "2026-09-01T09:20:00.000Z",
      availableAt: "2026-09-01T09:20:01.000Z",
      success: false,
      responseLatencyMs: 4200,
    }),
    issueSyntheticPilotEvent({
      participantId,
      family: "delayed-free-recall",
      eventId: `${participantId}:e05`,
      occurredAt: "2026-09-02T09:00:00.000Z",
      availableAt: "2026-09-02T09:00:01.000Z",
      success: true,
      responseLatencyMs: 3000,
    }),
    issueSyntheticPilotEvent({
      participantId,
      family: "near-transfer",
      eventId: `${participantId}:e06`,
      occurredAt: "2026-09-02T09:10:00.000Z",
      availableAt: "2026-09-02T09:10:01.000Z",
      success: true,
      responseLatencyMs: 3500,
    }),
  ]);
}
