import {
  createEmptyConstructProjection,
  evaluateOutcomeSuccess,
  projectLearnerState,
  type AcceptedEventAudit,
  type ConstructProjection,
} from "@/lib/core/learner-state";
import { buildEnglishOntologyV1 } from "@/lib/core/ontology-seed";

import { assertPilotEvidenceLineage } from "./identity";
import {
  PILOT_TASK_FAMILIES,
  NATIVE_PILOT_TARGET_ID,
  NATIVE_PILOT_CONTRACT_ID,
  type FeatureVector,
  type FrozenPilotTaskDefinition,
  type PredictionFeatureRow,
  type SyntheticPilotEvent,
} from "./types";

const ontologyResult = buildEnglishOntologyV1();
if (!ontologyResult.ok) {
  throw new Error(`Native pilot ontology failed to build: ${JSON.stringify(ontologyResult.problems)}`);
}
const ontology = ontologyResult.graph;

const PILOT_ROLES = ["meaning-recognition", "free-recall", "near-transfer"] as const;
const SUPPORT_BUCKETS = ["level0", "level1", "level2plus"] as const;

type SupportBucket = (typeof SUPPORT_BUCKETS)[number];

export type BuildPredictionRowInput = {
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

function supportBucket(level: number): SupportBucket {
  if (level === 0) return "level0";
  if (level === 1) return "level1";
  return "level2plus";
}

function secondsBetween(later: string, earlier: string): number {
  return Math.max(0, (parseTimestamp(later, "later") - parseTimestamp(earlier, "earlier")) / 1000);
}

function normalizeContextId(value: string | null): string | null {
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function assertSyntheticEventBinding(event: SyntheticPilotEvent): void {
  const taskDefinition = event.taskDefinition;
  const task = taskDefinition.task;
  const evidence = event.evidence;
  const problems: string[] = [];

  try {
    assertPilotEvidenceLineage(event);
  } catch {
    problems.push("pilot-lineage");
  }
  if (taskDefinition.pilotContractId !== NATIVE_PILOT_CONTRACT_ID) {
    problems.push("pilot-contract-id");
  }
  if (!task.id.startsWith(`native-pilot-v1:${taskDefinition.family}:`)) {
    problems.push("task-family");
  }
  if (task.id !== evidence.taskId) problems.push("task-id");
  if (evidence.targetId !== NATIVE_PILOT_TARGET_ID || !task.targetIds.includes(evidence.targetId)) {
    problems.push("target-id");
  }
  if (task.activity !== evidence.activity) problems.push("activity");
  if (
    task.responseModality !== evidence.responseModality ||
    task.responseModality !== evidence.attempt.responseModality
  ) {
    problems.push("response-modality");
  }
  if (task.allowedEvidenceRoles.length !== 1 || task.allowedEvidenceRoles[0] !== evidence.role) {
    problems.push("evidence-role");
  }
  if (task.support.level !== evidence.attempt.supportLevel) problems.push("support-level");
  if (task.transferDistance !== evidence.transferDistance) problems.push("transfer-distance");
  if (normalizeContextId(taskDefinition.contextId) !== normalizeContextId(evidence.attempt.contextId)) {
    problems.push("context-id");
  }
  if (taskDefinition.scoringContractId !== task.scoringContractId) {
    problems.push("scoring-contract-id");
  }
  if (JSON.stringify([...task.contextTags].sort()) !== JSON.stringify([...evidence.contextTags].sort())) {
    problems.push("context-tags");
  }

  if (problems.length > 0) {
    throw new Error(
      `Synthetic event wrapper does not match validated evidence ${evidence.eventId}: ${problems.join(",")}`,
    );
  }
}

function acceptanceKeyFromEvent(event: SyntheticPilotEvent): string {
  const evidence = event.evidence;
  return JSON.stringify({
    eventId: evidence.eventId,
    targetId: evidence.targetId,
    taskId: evidence.taskId,
    observationId: evidence.observationId,
    occurredAt: evidence.occurredAt,
    role: evidence.role,
    activity: evidence.activity,
    responseModality: evidence.responseModality,
    transferDistance: evidence.transferDistance,
    contextId: normalizeContextId(evidence.attempt.contextId),
    contextTags: [...evidence.contextTags].sort(),
    authorityScope: evidence.authorityScope,
    outcome: evidence.outcome,
    supportLevel: evidence.attempt.supportLevel,
    revealUsed: evidence.attempt.revealUsed,
    modelFingerprint: evidence.modelFingerprint,
    calibrationBenchmarkId: evidence.calibrationBenchmarkId,
    grantId: evidence.grantId,
  });
}

function acceptanceKeyFromAudit(audit: AcceptedEventAudit): string {
  return JSON.stringify({
    eventId: audit.eventId,
    targetId: audit.targetId,
    taskId: audit.taskId,
    observationId: audit.observationId,
    occurredAt: audit.occurredAt,
    role: audit.role,
    activity: audit.activity,
    responseModality: audit.responseModality,
    transferDistance: audit.transferDistance,
    contextId: normalizeContextId(audit.contextId),
    contextTags: [...audit.contextTags].sort(),
    authorityScope: audit.authorityScope,
    outcome: audit.outcome,
    supportLevel: audit.supportLevel,
    revealUsed: audit.revealUsed,
    modelFingerprint: audit.modelFingerprint,
    calibrationBenchmarkId: audit.calibrationBenchmarkId,
    grantId: audit.grantId,
  });
}

export function selectCausalAcceptedHistory(
  participantId: string,
  history: readonly SyntheticPilotEvent[],
  predictionTimestamp: string,
): readonly SyntheticPilotEvent[] {
  const cutoffMs = parseTimestamp(predictionTimestamp, "predictionTimestamp");
  const causallyAvailable = history.filter((event) => {
    if (event.participantId !== participantId) return false;
    const occurredMs = parseTimestamp(event.evidence.occurredAt, "occurredAt");
    const availableMs = parseTimestamp(event.availableAt, "availableAt");
    return occurredMs < cutoffMs && availableMs < cutoffMs;
  });

  if (causallyAvailable.length === 0) return Object.freeze([]);
  for (const event of causallyAvailable) assertSyntheticEventBinding(event);

  const projected = projectLearnerState(
    ontology,
    causallyAvailable.map((event) => event.evidence),
    { evaluationTimestamp: predictionTimestamp },
  );

  const wrappersByAcceptedKey = new Map<string, SyntheticPilotEvent[]>();
  for (const event of causallyAvailable) {
    const key = acceptanceKeyFromEvent(event);
    const wrappers = wrappersByAcceptedKey.get(key) ?? [];
    wrappers.push(event);
    wrappersByAcceptedKey.set(key, wrappers);
  }

  const acceptedHistory: SyntheticPilotEvent[] = [];
  for (const accepted of projected.acceptedEvents) {
    const key = acceptanceKeyFromAudit(accepted);
    const wrappers = wrappersByAcceptedKey.get(key);
    const wrapper = wrappers?.shift();
    if (!wrapper) {
      throw new Error(
        `Accepted core evidence could not be rebound to exactly one synthetic event wrapper: ${accepted.eventId}`,
      );
    }
    acceptedHistory.push(wrapper);
  }

  return Object.freeze(acceptedHistory);
}

function buildB2(
  causalHistory: readonly SyntheticPilotEvent[],
  currentTask: FrozenPilotTaskDefinition,
  predictionTimestamp: string,
): FeatureVector {
  let positive = 0;
  let negative = 0;
  let revealUsed = 0;
  let sameContextSuccess = 0;
  let sameContextFailure = 0;
  let nearTransferSuccess = 0;
  let nearTransferFailure = 0;

  const familyCount = Object.fromEntries(PILOT_TASK_FAMILIES.map((family) => [family, 0])) as Record<
    (typeof PILOT_TASK_FAMILIES)[number],
    number
  >;
  const familyPositive = Object.fromEntries(
    PILOT_TASK_FAMILIES.map((family) => [family, 0]),
  ) as Record<(typeof PILOT_TASK_FAMILIES)[number], number>;
  const familyNegative = Object.fromEntries(
    PILOT_TASK_FAMILIES.map((family) => [family, 0]),
  ) as Record<(typeof PILOT_TASK_FAMILIES)[number], number>;
  const rolePositive = Object.fromEntries(PILOT_ROLES.map((role) => [role, 0])) as Record<
    (typeof PILOT_ROLES)[number],
    number
  >;
  const roleNegative = Object.fromEntries(PILOT_ROLES.map((role) => [role, 0])) as Record<
    (typeof PILOT_ROLES)[number],
    number
  >;
  const supportCount = Object.fromEntries(SUPPORT_BUCKETS.map((bucket) => [bucket, 0])) as Record<
    SupportBucket,
    number
  >;
  const supportPositive = Object.fromEntries(SUPPORT_BUCKETS.map((bucket) => [bucket, 0])) as Record<
    SupportBucket,
    number
  >;
  const supportNegative = Object.fromEntries(SUPPORT_BUCKETS.map((bucket) => [bucket, 0])) as Record<
    SupportBucket,
    number
  >;
  const contexts = new Set<string>();

  for (const event of causalHistory) {
    const success = evaluateOutcomeSuccess(event.evidence.outcome);
    if (success) positive += 1;
    else negative += 1;

    familyCount[event.taskDefinition.family] += 1;
    if (success) familyPositive[event.taskDefinition.family] += 1;
    else familyNegative[event.taskDefinition.family] += 1;

    const role = event.evidence.role;
    if (role === "meaning-recognition" || role === "free-recall" || role === "near-transfer") {
      if (success) rolePositive[role] += 1;
      else roleNegative[role] += 1;
    }

    const bucket = supportBucket(event.evidence.attempt.supportLevel);
    supportCount[bucket] += 1;
    if (success) supportPositive[bucket] += 1;
    else supportNegative[bucket] += 1;

    if (event.evidence.attempt.revealUsed) revealUsed += 1;
    if (event.evidence.attempt.contextId) contexts.add(event.evidence.attempt.contextId);

    if (event.evidence.transferDistance === "same-context") {
      if (success) sameContextSuccess += 1;
      else sameContextFailure += 1;
    } else if (event.evidence.transferDistance === "near-transfer") {
      if (success) nearTransferSuccess += 1;
      else nearTransferFailure += 1;
    }
  }

  const previous = causalHistory.at(-1) ?? null;
  const first = causalHistory.at(0) ?? null;
  const total = causalHistory.length;
  const successRate = total === 0 ? null : positive / total;

  const features: Record<string, number | string | null> = {
    prior_eligible_attempt_count: total,
    prior_positive_count: positive,
    prior_negative_count: negative,
    prior_success_rate: successRate,
    previous_outcome: previous
      ? evaluateOutcomeSuccess(previous.evidence.outcome)
        ? "success"
        : "failure"
      : "missing",
    seconds_since_previous_attempt: previous
      ? secondsBetween(predictionTimestamp, previous.evidence.occurredAt)
      : null,
    prior_support_level0_count: supportCount.level0,
    prior_support_level1_count: supportCount.level1,
    prior_support_level2plus_count: supportCount.level2plus,
    prior_reveal_used_count: revealUsed,
    prior_distinct_context_count: contexts.size,
    same_context_success_count: sameContextSuccess,
    same_context_failure_count: sameContextFailure,
    near_transfer_success_count: nearTransferSuccess,
    near_transfer_failure_count: nearTransferFailure,
    seconds_since_first_accepted_evidence: first
      ? secondsBetween(predictionTimestamp, first.evidence.occurredAt)
      : null,
    current_task_family: currentTask.family,
    current_planned_support_level: currentTask.task.support.level,
    current_reveal_allowed: currentTask.task.support.revealAllowed ? 1 : 0,
    current_transfer_distance: currentTask.task.transferDistance,
    current_context_id: currentTask.contextId,
    current_stimulus_form_group: currentTask.stimulusFormGroup,
  };

  for (const family of PILOT_TASK_FAMILIES) {
    features[`prior_family_${family}_count`] = familyCount[family];
    features[`prior_family_${family}_positive`] = familyPositive[family];
    features[`prior_family_${family}_negative`] = familyNegative[family];
  }
  for (const role of PILOT_ROLES) {
    features[`prior_role_${role}_positive`] = rolePositive[role];
    features[`prior_role_${role}_negative`] = roleNegative[role];
  }
  for (const bucket of SUPPORT_BUCKETS) {
    features[`prior_support_${bucket}_positive`] = supportPositive[bucket];
    features[`prior_support_${bucket}_negative`] = supportNegative[bucket];
  }

  return Object.freeze(features);
}

function deriveBasisProjection(
  b2: FeatureVector,
): Pick<ConstructProjection, "status" | "uncertainty" | "provisionalRoutingScore"> {
  const total = Number(b2.prior_eligible_attempt_count ?? 0);
  const positive = Number(b2.prior_positive_count ?? 0);
  const negative = Number(b2.prior_negative_count ?? 0);

  if (total === 0) {
    return { status: "unknown", uncertainty: "maximal", provisionalRoutingScore: null };
  }
  if (total < 2) {
    return { status: "insufficient-support", uncertainty: "high", provisionalRoutingScore: null };
  }
  if (positive >= 2 && negative === 0) {
    return {
      status: "provisional-support",
      uncertainty: total >= 5 ? "low" : "moderate",
      provisionalRoutingScore: positive / total,
    };
  }
  if (negative >= 2 && positive === 0) {
    return {
      status: "provisional-weakness",
      uncertainty: total >= 5 ? "low" : "moderate",
      provisionalRoutingScore: 0,
    };
  }
  if (positive >= 1 && negative >= 1) {
    return { status: "conflicted-support", uncertainty: "high", provisionalRoutingScore: null };
  }
  return { status: "insufficient-support", uncertainty: "high", provisionalRoutingScore: null };
}

function buildB2Basis(b2: FeatureVector): FeatureVector {
  const basis = deriveBasisProjection(b2);
  return Object.freeze({
    ...b2,
    basis_status: basis.status,
    basis_uncertainty: basis.uncertainty,
    basis_provisional_routing_score: basis.provisionalRoutingScore,
    basis_routing_score_missing: basis.provisionalRoutingScore === null ? 1 : 0,
    basis_conflicted_count: Math.min(
      Number(b2.prior_positive_count ?? 0),
      Number(b2.prior_negative_count ?? 0),
    ),
  });
}

function buildB3(
  b2: FeatureVector,
  causalHistory: readonly SyntheticPilotEvent[],
  predictionTimestamp: string,
): FeatureVector {
  const state = projectLearnerState(
    ontology,
    causalHistory.map((event) => event.evidence),
    { evaluationTimestamp: predictionTimestamp, populateAllOntologyNodes: true },
  );
  const projection =
    state.constructs[NATIVE_PILOT_TARGET_ID] ??
    createEmptyConstructProjection(NATIVE_PILOT_TARGET_ID);
  const stats = projection.statistics;
  const first = stats.firstObservedAt;
  const last = stats.lastObservedAt;

  return Object.freeze({
    ...b2,
    nep_status: projection.status,
    nep_uncertainty: projection.uncertainty,
    nep_provisional_routing_score: projection.provisionalRoutingScore,
    nep_routing_score_missing: projection.provisionalRoutingScore === null ? 1 : 0,
    nep_total_event_count: stats.totalEvents,
    nep_positive_count: stats.positiveCount,
    nep_negative_count: stats.negativeCount,
    nep_conflicted_count: stats.conflictedCount,
    nep_distinct_context_count: stats.distinctContextCount,
    nep_role_meaning_recognition_positive: stats.byRole["meaning-recognition"].positive,
    nep_role_meaning_recognition_negative: stats.byRole["meaning-recognition"].negative,
    nep_role_free_recall_positive: stats.byRole["free-recall"].positive,
    nep_role_free_recall_negative: stats.byRole["free-recall"].negative,
    nep_role_near_transfer_positive: stats.byRole["near-transfer"].positive,
    nep_role_near_transfer_negative: stats.byRole["near-transfer"].negative,
    nep_support_level0_count: stats.supportDistribution.level0,
    nep_support_level1_count: stats.supportDistribution.level1,
    nep_support_level2plus_count: stats.supportDistribution.level2Plus,
    nep_reveal_used_count: stats.revealUsedCount,
    nep_same_context_success_count: b2.same_context_success_count,
    nep_same_context_failure_count: b2.same_context_failure_count,
    nep_near_transfer_success_count: b2.near_transfer_success_count,
    nep_near_transfer_failure_count: b2.near_transfer_failure_count,
    nep_seconds_since_first_accepted_evidence: first
      ? secondsBetween(predictionTimestamp, first)
      : null,
    nep_seconds_since_last_accepted_evidence: last ? secondsBetween(predictionTimestamp, last) : null,
  });
}

export function buildPredictionFeatureRow(input: BuildPredictionRowInput): PredictionFeatureRow {
  const causalHistory = selectCausalAcceptedHistory(
    input.participantId,
    input.history,
    input.predictionTimestamp,
  );
  const b2 = buildB2(causalHistory, input.currentTask, input.predictionTimestamp);
  const b2Basis = buildB2Basis(b2);
  const b3 = buildB3(b2, causalHistory, input.predictionTimestamp);

  return Object.freeze({
    participantId: input.participantId,
    targetEventId: input.targetEventId,
    predictionTimestamp: input.predictionTimestamp,
    label: input.label ?? null,
    acceptedHistoryEventIds: Object.freeze(causalHistory.map((event) => event.evidence.eventId)),
    acceptedHistoryLineageDigests: Object.freeze(
      causalHistory.map((event) => event.lineage.evidenceDigest),
    ),
    b2,
    b2Basis,
    b3,
  });
}
