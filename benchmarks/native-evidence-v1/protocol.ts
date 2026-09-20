import { buildPredictionFeatureRow } from "./features";
import { assertFrozenPilotTaskDefinition } from "./identity";
import type {
  FrozenPilotTaskDefinition,
  PredictionFeatureRow,
  SyntheticPilotEvent,
} from "./types";

export const NATIVE_SPLIT_PROTOCOL_ID = "nep.native-split.v1" as const;

export type FrozenBlindTargetBinding = {
  readonly participantId: string;
  readonly predictionTimestamp: string;
  readonly family: FrozenPilotTaskDefinition["family"];
  readonly taskId: string;
  readonly taskVersion: number;
  readonly contentFingerprint: `sha256:${string}`;
  readonly definitionFingerprint: `sha256:${string}`;
  readonly supportLevel: number;
  readonly revealAllowed: boolean;
  readonly transferDistance: FrozenPilotTaskDefinition["task"]["transferDistance"];
  readonly contextId: string;
  readonly stimulusFormGroup: string;
  readonly scoringContractId: string;
};

export type FrozenNativeSplitProtocol = {
  readonly protocolId: typeof NATIVE_SPLIT_PROTOCOL_ID;
  readonly frozenAt: string;
  readonly fitCutoff: string;
  readonly fitCompletedAt: string;
  readonly trainingParticipantIds: readonly string[];
  readonly heldOutParticipantIds: readonly string[];
  readonly trainPrefixEventIdsByParticipant: Readonly<Record<string, readonly string[]>>;
  readonly blindTargetEventIds: readonly string[];
  readonly blindTargetBindings: Readonly<Record<string, FrozenBlindTargetBinding>>;
};

export type BuildFrozenNativeSplitProtocolInput = Omit<FrozenNativeSplitProtocol, "protocolId">;

export type BuildBlindPredictionRowInput = {
  readonly protocol: FrozenNativeSplitProtocol;
  readonly participantId: string;
  readonly targetEventId: string;
  readonly predictionTimestamp: string;
  readonly currentTask: FrozenPilotTaskDefinition;
  readonly history: readonly SyntheticPilotEvent[];
  readonly label?: 0 | 1 | null;
};

function parseTimestamp(value: string, field: string): number {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) throw new Error(`${field} must be a valid ISO timestamp: ${value}`);
  return parsed;
}

function assertUnique(values: readonly string[], field: string): void {
  if (new Set(values).size !== values.length) {
    throw new Error(`${field} must contain unique values`);
  }
}

function freezeBlindTargetBinding(
  targetEventId: string,
  binding: FrozenBlindTargetBinding,
  knownParticipants: ReadonlySet<string>,
  fitCutoffMs: number,
  fitCompletedAtMs: number,
): FrozenBlindTargetBinding {
  if (!knownParticipants.has(binding.participantId)) {
    throw new Error(
      `blind target references unallocated participant: ${targetEventId}:${binding.participantId}`,
    );
  }
  const predictionMs = parseTimestamp(
    binding.predictionTimestamp,
    `blindTargetBindings.${targetEventId}.predictionTimestamp`,
  );
  if (predictionMs <= fitCutoffMs) {
    throw new Error(`blind target prediction must occur after fitCutoff: ${targetEventId}`);
  }
  if (predictionMs <= fitCompletedAtMs) {
    throw new Error(`blind target prediction must occur after fitCompletedAt: ${targetEventId}`);
  }
  if (!binding.taskId) throw new Error(`blind target taskId must be non-empty: ${targetEventId}`);
  if (!Number.isInteger(binding.taskVersion) || binding.taskVersion <= 0) {
    throw new Error(`blind target taskVersion must be a positive integer: ${targetEventId}`);
  }
  if (!/^sha256:[0-9a-f]{64}$/.test(binding.contentFingerprint)) {
    throw new Error(`blind target contentFingerprint must be sha256: ${targetEventId}`);
  }
  if (!/^sha256:[0-9a-f]{64}$/.test(binding.definitionFingerprint)) {
    throw new Error(`blind target definitionFingerprint must be sha256: ${targetEventId}`);
  }
  if (!Number.isInteger(binding.supportLevel) || binding.supportLevel < 0) {
    throw new Error(`blind target supportLevel must be a nonnegative integer: ${targetEventId}`);
  }
  if (!binding.contextId) throw new Error(`blind target contextId must be non-empty: ${targetEventId}`);
  if (!binding.stimulusFormGroup) {
    throw new Error(`blind target stimulusFormGroup must be non-empty: ${targetEventId}`);
  }
  if (!binding.scoringContractId) {
    throw new Error(`blind target scoringContractId must be non-empty: ${targetEventId}`);
  }
  return Object.freeze({ ...binding });
}

function currentTaskMatchesBinding(
  currentTask: FrozenPilotTaskDefinition,
  binding: FrozenBlindTargetBinding,
): boolean {
  assertFrozenPilotTaskDefinition(currentTask);
  return (
    binding.family === currentTask.family &&
    binding.taskId === currentTask.task.id &&
    binding.taskVersion === currentTask.task.version &&
    binding.contentFingerprint === currentTask.contentFingerprint &&
    binding.definitionFingerprint === currentTask.definitionFingerprint &&
    binding.supportLevel === currentTask.task.support.level &&
    binding.revealAllowed === currentTask.task.support.revealAllowed &&
    binding.transferDistance === currentTask.task.transferDistance &&
    binding.contextId === currentTask.contextId &&
    binding.stimulusFormGroup === currentTask.stimulusFormGroup &&
    binding.scoringContractId === currentTask.scoringContractId &&
    binding.scoringContractId === currentTask.task.scoringContractId
  );
}

export function buildFrozenNativeSplitProtocol(
  input: BuildFrozenNativeSplitProtocolInput,
): FrozenNativeSplitProtocol {
  const frozenAtMs = parseTimestamp(input.frozenAt, "frozenAt");
  const fitCutoffMs = parseTimestamp(input.fitCutoff, "fitCutoff");
  const fitCompletedAtMs = parseTimestamp(input.fitCompletedAt, "fitCompletedAt");
  if (frozenAtMs > fitCutoffMs) throw new Error("split protocol must be frozen no later than fitCutoff");
  if (fitCompletedAtMs < fitCutoffMs) {
    throw new Error("fitCompletedAt cannot precede the global fitCutoff");
  }

  assertUnique(input.trainingParticipantIds, "trainingParticipantIds");
  assertUnique(input.heldOutParticipantIds, "heldOutParticipantIds");
  assertUnique(input.blindTargetEventIds, "blindTargetEventIds");

  const training = new Set(input.trainingParticipantIds);
  for (const heldOut of input.heldOutParticipantIds) {
    if (training.has(heldOut)) throw new Error(`participant cannot be both TRAIN and held out: ${heldOut}`);
  }

  const knownParticipants = new Set([
    ...input.trainingParticipantIds,
    ...input.heldOutParticipantIds,
  ]);
  const prefixEntries = Object.entries(input.trainPrefixEventIdsByParticipant);
  const seenPrefixEvents = new Set<string>();
  for (const [participantId, eventIds] of prefixEntries) {
    if (!knownParticipants.has(participantId)) {
      throw new Error(`train prefix references unallocated participant: ${participantId}`);
    }
    if (input.heldOutParticipantIds.includes(participantId) && eventIds.length > 0) {
      throw new Error(`held-out participant cannot contribute TRAIN prefix events: ${participantId}`);
    }
    assertUnique(eventIds, `trainPrefixEventIdsByParticipant.${participantId}`);
    for (const eventId of eventIds) {
      if (seenPrefixEvents.has(eventId)) {
        throw new Error(`train prefix eventId must be globally unique: ${eventId}`);
      }
      seenPrefixEvents.add(eventId);
    }
  }

  for (const targetEventId of input.blindTargetEventIds) {
    if (seenPrefixEvents.has(targetEventId)) {
      throw new Error(`blind target cannot also be a TRAIN prefix event: ${targetEventId}`);
    }
  }

  const frozenBlindTargetIds = new Set(input.blindTargetEventIds);
  for (const targetEventId of Object.keys(input.blindTargetBindings)) {
    if (!frozenBlindTargetIds.has(targetEventId)) {
      throw new Error(`blind target binding references unknown target: ${targetEventId}`);
    }
  }

  const blindTargetBindings: Record<string, FrozenBlindTargetBinding> = {};
  for (const targetEventId of [...input.blindTargetEventIds].sort()) {
    const binding = input.blindTargetBindings[targetEventId];
    if (!binding) throw new Error(`blind target is missing frozen binding: ${targetEventId}`);
    blindTargetBindings[targetEventId] = freezeBlindTargetBinding(
      targetEventId,
      binding,
      knownParticipants,
      fitCutoffMs,
      fitCompletedAtMs,
    );
  }

  const sortedPrefix: Record<string, readonly string[]> = {};
  for (const participantId of [...knownParticipants].sort()) {
    sortedPrefix[participantId] = Object.freeze([
      ...(input.trainPrefixEventIdsByParticipant[participantId] ?? []),
    ].sort());
  }

  return Object.freeze({
    protocolId: NATIVE_SPLIT_PROTOCOL_ID,
    frozenAt: input.frozenAt,
    fitCutoff: input.fitCutoff,
    fitCompletedAt: input.fitCompletedAt,
    trainingParticipantIds: Object.freeze([...input.trainingParticipantIds].sort()),
    heldOutParticipantIds: Object.freeze([...input.heldOutParticipantIds].sort()),
    trainPrefixEventIdsByParticipant: Object.freeze(sortedPrefix),
    blindTargetEventIds: Object.freeze([...input.blindTargetEventIds].sort()),
    blindTargetBindings: Object.freeze(blindTargetBindings),
  });
}

export function selectAuthorizedTrainPrefixEvents(
  protocol: FrozenNativeSplitProtocol,
  events: readonly SyntheticPilotEvent[],
): readonly SyntheticPilotEvent[] {
  const fitCutoffMs = parseTimestamp(protocol.fitCutoff, "fitCutoff");
  const requiredPrefixIds = new Set(
    protocol.trainingParticipantIds.flatMap(
      (participantId) => protocol.trainPrefixEventIdsByParticipant[participantId] ?? [],
    ),
  );
  const eventsById = new Map<string, SyntheticPilotEvent>();
  for (const event of events) {
    const eventId = event.evidence.eventId;
    if (!requiredPrefixIds.has(eventId)) continue;
    if (eventsById.has(eventId)) {
      throw new Error(`frozen TRAIN prefix event is ambiguous due to duplicate eventId: ${eventId}`);
    }
    eventsById.set(eventId, event);
  }
  const selected: SyntheticPilotEvent[] = [];

  for (const participantId of protocol.trainingParticipantIds) {
    const prefixIds = protocol.trainPrefixEventIdsByParticipant[participantId] ?? [];
    for (const eventId of prefixIds) {
      const event = eventsById.get(eventId);
      if (!event) throw new Error(`frozen TRAIN prefix event is missing: ${eventId}`);
      if (event.participantId !== participantId) {
        throw new Error(`frozen TRAIN prefix event belongs to wrong participant: ${eventId}`);
      }
      const occurredMs = parseTimestamp(event.evidence.occurredAt, "occurredAt");
      const availableMs = parseTimestamp(event.availableAt, "availableAt");
      if (occurredMs >= fitCutoffMs || availableMs >= fitCutoffMs) {
        throw new Error(`TRAIN prefix label is not causally available by fitCutoff: ${eventId}`);
      }
      selected.push(event);
    }
  }

  return Object.freeze(
    selected.sort((left, right) => {
      const occurred = left.evidence.occurredAt.localeCompare(right.evidence.occurredAt);
      if (occurred !== 0) return occurred;
      return left.evidence.eventId.localeCompare(right.evidence.eventId);
    }),
  );
}

export function selectFrozenPredictionHistory(
  protocol: FrozenNativeSplitProtocol,
  participantId: string,
  events: readonly SyntheticPilotEvent[],
): readonly SyntheticPilotEvent[] {
  if (protocol.heldOutParticipantIds.includes(participantId)) return Object.freeze([]);
  if (!protocol.trainingParticipantIds.includes(participantId)) {
    throw new Error(`participant is not allocated by frozen split protocol: ${participantId}`);
  }

  const allowedIds = new Set(protocol.trainPrefixEventIdsByParticipant[participantId] ?? []);
  const selectedById = new Map<string, SyntheticPilotEvent>();
  for (const event of events) {
    const eventId = event.evidence.eventId;
    if (event.participantId !== participantId || !allowedIds.has(eventId)) continue;
    if (selectedById.has(eventId)) {
      throw new Error(`frozen prediction history has duplicate prefix eventId: ${eventId}`);
    }
    selectedById.set(eventId, event);
  }
  if (selectedById.size !== allowedIds.size) {
    const missing = [...allowedIds].filter((eventId) => !selectedById.has(eventId));
    throw new Error(`frozen prediction history is missing prefix events: ${missing.join(",")}`);
  }
  return Object.freeze([...selectedById.values()]);
}

export function buildBlindPredictionFeatureRow(
  input: BuildBlindPredictionRowInput,
): PredictionFeatureRow {
  if (!input.protocol.blindTargetEventIds.includes(input.targetEventId)) {
    throw new Error(`targetEventId is not in frozen blind block: ${input.targetEventId}`);
  }
  const targetBinding = input.protocol.blindTargetBindings[input.targetEventId];
  if (!targetBinding) throw new Error(`blind target is missing frozen binding: ${input.targetEventId}`);
  if (targetBinding.participantId !== input.participantId) {
    throw new Error(
      `blind target is frozen to participant ${targetBinding.participantId}: ${input.targetEventId}`,
    );
  }
  if (targetBinding.predictionTimestamp !== input.predictionTimestamp) {
    throw new Error(`predictionTimestamp differs from frozen blind target: ${input.targetEventId}`);
  }
  if (!currentTaskMatchesBinding(input.currentTask, targetBinding)) {
    throw new Error(`currentTask differs from frozen blind target: ${input.targetEventId}`);
  }

  const predictionMs = parseTimestamp(input.predictionTimestamp, "predictionTimestamp");
  const fitCutoffMs = parseTimestamp(input.protocol.fitCutoff, "fitCutoff");
  const fitCompletedAtMs = parseTimestamp(input.protocol.fitCompletedAt, "fitCompletedAt");
  if (predictionMs <= fitCutoffMs) throw new Error("evaluated prediction must occur after the global fitCutoff");
  if (predictionMs <= fitCompletedAtMs) {
    throw new Error("fitCompletedAt must strictly precede predictionTimestamp");
  }

  const frozenHistory = selectFrozenPredictionHistory(
    input.protocol,
    input.participantId,
    input.history,
  );

  return buildPredictionFeatureRow({
    participantId: input.participantId,
    targetEventId: input.targetEventId,
    predictionTimestamp: input.predictionTimestamp,
    currentTask: input.currentTask,
    history: frozenHistory,
    label: input.label,
  });
}
