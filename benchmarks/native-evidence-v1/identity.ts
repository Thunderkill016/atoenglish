import crypto from "node:crypto";

import {
  computeCanonicalEvidenceDigest,
  type ReferenceCoreEvidence,
} from "@/lib/core/certified-evidence";

import type {
  FrozenPilotTaskDefinition,
  PilotAttemptIdentity,
  PilotEvidenceLineage,
  PilotTaskDefinition,
  SyntheticPilotEvent,
} from "./types";

const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/;

function canonicalizeValue(value: unknown, path: string): string {
  if (value === null) return "null";

  if (typeof value === "string" || typeof value === "boolean") {
    return JSON.stringify(value);
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`${path} contains a non-finite number`);
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    const parts: string[] = [];
    for (let index = 0; index < value.length; index += 1) {
      if (!Object.hasOwn(value, index)) throw new Error(`${path} contains a sparse array`);
      parts.push(canonicalizeValue(value[index], `${path}[${index}]`));
    }
    return `[${parts.join(",")}]`;
  }

  if (typeof value !== "object") {
    throw new Error(`${path} contains a non-JSON value of type ${typeof value}`);
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new Error(`${path} must contain plain JSON objects only`);
  }
  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw new Error(`${path} contains symbol keys`);
  }

  const object = value as Record<string, unknown>;
  const ownKeys = Reflect.ownKeys(object);
  const enumerableKeys = Object.keys(object);
  if (ownKeys.length !== enumerableKeys.length) {
    throw new Error(`${path} contains non-enumerable JSON fields`);
  }

  return `{${enumerableKeys
    .sort()
    .map(
      (key) => `${JSON.stringify(key)}:${canonicalizeValue(object[key], `${path}.${key}`)}`,
    )
    .join(",")}}`;
}

export function canonicalizePilotJson(value: unknown): string {
  return canonicalizeValue(value, "pilot-definition");
}

function definitionPayload(definition: PilotTaskDefinition | FrozenPilotTaskDefinition) {
  return {
    pilotContractId: definition.pilotContractId,
    family: definition.family,
    task: definition.task,
    contentFingerprint: definition.contentFingerprint,
    contextId: definition.contextId,
    stimulusFormGroup: definition.stimulusFormGroup,
    scoringContractId: definition.scoringContractId,
  };
}

function hashCanonical(value: unknown): `sha256:${string}` {
  const canonical = canonicalizePilotJson(value);
  return `sha256:${crypto.createHash("sha256").update(canonical, "utf8").digest("hex")}`;
}

export function computePilotTaskDefinitionFingerprint(
  definition: PilotTaskDefinition | FrozenPilotTaskDefinition,
): `sha256:${string}` {
  return hashCanonical(definitionPayload(definition));
}

export function freezePilotTaskDefinition(
  definition: PilotTaskDefinition,
): FrozenPilotTaskDefinition {
  return Object.freeze({
    ...definition,
    definitionFingerprint: computePilotTaskDefinitionFingerprint(definition),
  });
}

export function assertFrozenPilotTaskDefinition(
  definition: FrozenPilotTaskDefinition,
): void {
  if (!SHA256_PATTERN.test(definition.definitionFingerprint)) {
    throw new Error("Pilot task definitionFingerprint must be lowercase sha256");
  }
  const expected = computePilotTaskDefinitionFingerprint(definition);
  if (expected !== definition.definitionFingerprint) {
    throw new Error("Pilot task definitionFingerprint does not match frozen semantics");
  }
  if (definition.scoringContractId !== definition.task.scoringContractId) {
    throw new Error("Pilot task scoring contract differs from CoreTaskSpec");
  }
  if (!definition.task.contextTags.includes(`context:${definition.contextId}`)) {
    throw new Error("Pilot task contextId is not bound into CoreTaskSpec contextTags");
  }
  if (!definition.task.contextTags.includes(`stimulus-form-group:${definition.stimulusFormGroup}`)) {
    throw new Error("Pilot task stimulusFormGroup is not bound into CoreTaskSpec contextTags");
  }
}

export function buildPilotAttemptIdentity(
  definition: FrozenPilotTaskDefinition,
): PilotAttemptIdentity {
  assertFrozenPilotTaskDefinition(definition);
  return Object.freeze({
    taskId: definition.task.id,
    taskVersion: definition.task.version,
    contentFingerprint: definition.contentFingerprint,
    definitionFingerprint: definition.definitionFingerprint,
    contextId: definition.contextId,
  });
}

export function assertPilotAttemptMatchesDefinition(
  attempt: PilotAttemptIdentity,
  definition: FrozenPilotTaskDefinition,
): void {
  assertFrozenPilotTaskDefinition(definition);
  const expected = buildPilotAttemptIdentity(definition);
  const mismatches: string[] = [];
  if (attempt.taskId !== expected.taskId) mismatches.push("taskId");
  if (attempt.taskVersion !== expected.taskVersion) mismatches.push("taskVersion");
  if (attempt.contentFingerprint !== expected.contentFingerprint) mismatches.push("contentFingerprint");
  if (attempt.definitionFingerprint !== expected.definitionFingerprint) {
    mismatches.push("definitionFingerprint");
  }
  if (attempt.contextId !== expected.contextId) mismatches.push("contextId");
  if (mismatches.length > 0) {
    throw new Error(`Pilot attempt identity mismatch: ${mismatches.join(",")}`);
  }
}

export function createPilotEvidenceLineage(
  definition: FrozenPilotTaskDefinition,
  evidence: ReferenceCoreEvidence,
): PilotEvidenceLineage {
  assertFrozenPilotTaskDefinition(definition);
  if (evidence.taskId !== definition.task.id) {
    throw new Error("Validated evidence taskId differs from frozen pilot definition");
  }
  if (evidence.attempt.contextId !== definition.contextId) {
    throw new Error("Validated evidence contextId differs from frozen pilot definition");
  }
  return Object.freeze({
    eventId: evidence.eventId,
    observationId: evidence.observationId,
    taskId: definition.task.id,
    taskVersion: definition.task.version,
    contentFingerprint: definition.contentFingerprint,
    contextId: definition.contextId,
    definitionFingerprint: definition.definitionFingerprint,
    evidenceDigest: computeCanonicalEvidenceDigest(evidence) as `sha256:${string}`,
  });
}

export function assertPilotEvidenceLineage(event: SyntheticPilotEvent): void {
  assertFrozenPilotTaskDefinition(event.taskDefinition);
  const lineage = event.lineage as PilotEvidenceLineage | undefined;
  if (!lineage) throw new Error("Pilot event is missing evidence lineage");

  const expectedDigest = computeCanonicalEvidenceDigest(event.evidence);
  const mismatches: string[] = [];
  if (lineage.eventId !== event.evidence.eventId) mismatches.push("eventId");
  if (lineage.observationId !== event.evidence.observationId) mismatches.push("observationId");
  if (lineage.taskId !== event.taskDefinition.task.id || lineage.taskId !== event.evidence.taskId) {
    mismatches.push("taskId");
  }
  if (lineage.taskVersion !== event.taskDefinition.task.version) mismatches.push("taskVersion");
  if (lineage.contentFingerprint !== event.taskDefinition.contentFingerprint) {
    mismatches.push("contentFingerprint");
  }
  if (
    lineage.contextId !== event.taskDefinition.contextId ||
    lineage.contextId !== event.evidence.attempt.contextId
  ) {
    mismatches.push("contextId");
  }
  if (lineage.definitionFingerprint !== event.taskDefinition.definitionFingerprint) {
    mismatches.push("definitionFingerprint");
  }
  if (!SHA256_PATTERN.test(lineage.evidenceDigest) || lineage.evidenceDigest !== expectedDigest) {
    mismatches.push("evidenceDigest");
  }
  if (mismatches.length > 0) {
    throw new Error(`Pilot evidence lineage mismatch: ${mismatches.join(",")}`);
  }
}
