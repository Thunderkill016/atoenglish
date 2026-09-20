import {
  applyEvidenceToSkillState,
  createEmptyLearnerSkillState,
  type EvidenceEvent,
  type EvidenceType,
  type LearnerSkillState,
  type ResponseModality,
} from "@/lib/learning/evidence";
import { readLearnerDimension } from "@/lib/learning/learner-state-read";
import { planSession } from "@/lib/learning/session-planner";

import {
  type CoreEvidenceForRouting,
  type ReferenceEvidenceValidationResult,
  validateReferenceCoreEvidence,
} from "./certified-evidence";
import type { ControlledResponseDiagnosticPayload } from "./diagnostics";
import type { SkillGraph, SkillNode } from "./domain";
import type { CoreEvidenceRole } from "./evidence-role";
import type { CoreObservation } from "./observation";
import { validateCoreTask, type CoreTaskSpec } from "./task";

const TARGET_ID = "strategy.repair.request-repetition";
const REFERENCE_BENCHMARK_ID = "core-gold-slice-reference-fixture-v1";
const EVALUATOR_ID = "deterministic-repair-phrase-v1";
const DAY_MS = 24 * 60 * 60 * 1000;

export type GoldSliceCapability = {
  target: SkillNode;
  memoryKind: "declarative-formulaic-recall";
  acceptedResponses: string[];
};

export type GoldSliceAttempt = {
  attemptId: string;
  task: CoreTaskSpec;
  role: CoreEvidenceRole;
  response: string | null;
  unavailableReason?: "response-unavailable" | "evaluator-unavailable";
  supportLevel: number;
  revealUsed: boolean;
  responseModality: ResponseModality;
  contextId: string;
  populationTags: string[];
  latencyMs: number | null;
  occurredAt: string;
};

export type GoldSliceAnalysis =
  | {
      status: "unavailable";
      reason: "response-unavailable" | "evaluator-unavailable";
      observation: null;
      candidate: null;
    }
  | {
      status: "observed";
      reason: "deterministic-target-match" | "deterministic-target-missing";
      observation: CoreObservation<ControlledResponseDiagnosticPayload>;
      candidate: Parameters<typeof validateReferenceCoreEvidence>[2];
    };

export type GoldSliceFeedback = {
  claims: Array<{ code: "target-observed" | "target-not-observed"; targetId: string }>;
  retry: {
    required: boolean;
    reasonCode: "independent-target-missing" | "not-required";
  };
};

export type RetrievalSchedulePrescription = {
  status: "scheduled" | "not-eligible";
  schedulerBoundary: "declarative-retrieval-adapter";
  calibrationState: "provisional";
  dueAt: string | null;
  reasonCode:
    | "independent-declarative-success"
    | "not-declarative"
    | "not-independent-success";
};

export type GoldSliceTransition = {
  step: string;
  reasonCodes: string[];
  certification: "reference-validated" | "rejected" | "not-attempted";
  production: ReturnType<typeof readLearnerDimension>;
  transfer: ReturnType<typeof readLearnerDimension>;
};

export type GoldSliceStateSnapshot = {
  recognition: ReturnType<typeof readLearnerDimension>;
  retrieval: ReturnType<typeof readLearnerDimension>;
  listening: ReturnType<typeof readLearnerDimension>;
  production: ReturnType<typeof readLearnerDimension>;
  repair: ReturnType<typeof readLearnerDimension>;
  transfer: ReturnType<typeof readLearnerDimension>;
  retention: ReturnType<typeof readLearnerDimension>;
};

export type CoreGoldSliceArtifact = {
  artifactId: "core-gold-slice-v1";
  artifactClass: "deterministic-reference-flow";
  authorityScope: "repository-reference-only";
  promotionDecision: "not-production-authority";
  targetId: string;
  resolvedTargetIds: string[];
  stateModel: "ema-routing-v1";
  stateCalibration: "provisional-routing-only";
  transitions: GoldSliceTransition[];
  feedback: GoldSliceFeedback;
  retryAttemptId: string;
  retrievalSchedule: RetrievalSchedulePrescription;
  transferPlan: {
    selectedCandidateId: string | null;
    reasonCodes: string[];
    contextChanged: boolean;
  };
  finalState: GoldSliceStateSnapshot;
  residualUnknowns: string[];
};

export const goldSliceCapability: GoldSliceCapability = {
  target: {
    id: TARGET_ID,
    version: 1,
    title: "Request repetition",
    description: "Recall a formulaic request asking an interlocutor to repeat a message.",
    kind: "knowledge",
    systems: ["phraseology", "strategy"],
    activities: ["written-production"],
    allowedEvidence: ["controlled-production", "free-production", "near-transfer"],
    allowedResponses: ["text"],
    tags: ["repair", "formulaic-language"],
    sources: [],
  },
  memoryKind: "declarative-formulaic-recall",
  acceptedResponses: ["could you say that again", "could you repeat that please"],
};

export const goldSliceSkillGraph: SkillGraph = {
  version: "core-gold-slice-v1",
  nodes: [goldSliceCapability.target],
  relations: [],
};

export function resolveGoldSliceTargets(
  task: CoreTaskSpec,
  graph: SkillGraph,
): { ok: true; targetIds: string[] } | { ok: false; reasonCodes: string[] } {
  const reasonCodes = validateCoreTask(task).map((problem) => `invalid-task:${problem.type}`);
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));

  for (const targetId of task.targetIds) {
    const node = nodes.get(targetId);
    if (!node) {
      reasonCodes.push(`target-not-found:${targetId}`);
      continue;
    }
    if (!node.activities.includes(task.activity)) reasonCodes.push(`activity-not-supported:${targetId}`);
    if (!node.allowedResponses.includes(task.responseModality)) {
      reasonCodes.push(`modality-not-supported:${targetId}`);
    }
    for (const role of task.allowedEvidenceRoles) {
      if (!node.allowedEvidence.includes(role)) {
        reasonCodes.push(`evidence-role-not-supported:${targetId}:${role}`);
      }
    }
  }

  return reasonCodes.length > 0
    ? { ok: false, reasonCodes }
    : { ok: true, targetIds: [...task.targetIds] };
}

export function analyzeGoldSliceResponse(
  capability: GoldSliceCapability,
  attempt: GoldSliceAttempt,
): GoldSliceAnalysis {
  if (attempt.unavailableReason) {
    return {
      status: "unavailable",
      reason: attempt.unavailableReason,
      observation: null,
      candidate: null,
    };
  }

  const normalized = normalizeResponse(attempt.response ?? "");
  const observedResponse = normalized.length > 0;
  const success = capability.acceptedResponses.some(
    (accepted) => normalizeResponse(accepted) === normalized,
  );
  const observation: CoreObservation<ControlledResponseDiagnosticPayload> = {
    observationId: `observation:${attempt.attemptId}`,
    targetId: capability.target.id,
    activity: attempt.task.activity,
    payload: {
      kind: "controlled-response",
      taskId: attempt.task.id,
      observedResponse,
      responseCorrect: observedResponse ? success : null,
      matchedTargetIds: success ? [capability.target.id] : [],
      missingTargetIds: success ? [] : [capability.target.id],
      evaluatorRuleId: EVALUATOR_ID,
    },
    confidence: 1,
    calibration: {
      validationState: "unvalidated",
      decision: "shadow",
      benchmarkId: null,
      modelFingerprint: `${EVALUATOR_ID}@1`,
      scope: {
        activity: attempt.task.activity,
        construct: capability.target.id,
        requiredPopulationTags: [...attempt.populationTags],
        allowedPromptContexts: [attempt.contextId],
      },
      metrics: { sampleSize: 0 },
    },
    authority: "none",
    provenance: {
      evaluator: EVALUATOR_ID,
      evaluatorKind: "deterministic",
      artifact: {
        artifactId: EVALUATOR_ID,
        version: "1",
        configurationId: REFERENCE_BENCHMARK_ID,
      },
    },
    context: {
      populationTags: [...attempt.populationTags],
      construct: capability.target.id,
      promptContext: attempt.contextId,
    },
    contextId: attempt.contextId,
    createdAt: attempt.occurredAt,
  };

  return {
    status: "observed",
    reason: success ? "deterministic-target-match" : "deterministic-target-missing",
    observation,
    candidate: {
      eventId: `evidence:${attempt.attemptId}`,
      taskId: attempt.task.id,
      targetId: capability.target.id,
      role: attempt.role,
      observationId: observation.observationId,
      outcome: { kind: "binary", success },
      evaluatorConfidence: 1,
      attempt: {
        supportLevel: attempt.supportLevel,
        revealUsed: attempt.revealUsed,
        responseLatencyMs: attempt.latencyMs,
        responseModality: attempt.responseModality,
        contextId: attempt.contextId,
      },
      occurredAt: attempt.occurredAt,
    },
  };
}

export function applyValidatedEvidenceToRoutingState(
  state: LearnerSkillState,
  evidence: CoreEvidenceForRouting,
): { state: LearnerSkillState; reasonCode: string } {
  const evidenceType = evidenceTypeForRole(evidence.role);
  if (!evidenceType) return { state, reasonCode: `unsupported-role:${evidence.role}` };
  if (evidence.evaluatorConfidence === null) {
    return { state, reasonCode: "evaluator-confidence-unknown" };
  }
  if (evidence.outcome.kind !== "binary") {
    return { state, reasonCode: "bounded-score-mapping-required" };
  }
  const event: EvidenceEvent = {
    type: evidenceType,
    targetId: evidence.targetId,
    success: evidence.outcome.success,
    confidence: evidence.evaluatorConfidence,
    supportLevel: evidence.attempt.supportLevel,
    contextId: evidence.attempt.contextId,
    evaluator: EVALUATOR_ID,
    metadata: {
      coreEvidenceRole: evidence.role,
      calibrationBenchmarkId: evidence.calibrationBenchmarkId,
      authorityScope: evidence.authorityScope,
      decisionScope: "routing-only",
    },
  };
  return {
    state: applyEvidenceToSkillState(state, event, evidence.occurredAt),
    reasonCode: `routing-state-updated:${evidenceType}`,
  };
}

export function selectGoldSliceFeedback(
  analysis: GoldSliceAnalysis,
  role: CoreEvidenceRole,
): GoldSliceFeedback {
  const independent = role === "free-production" || role === "near-transfer";
  const success =
    analysis.status === "observed" && analysis.candidate.outcome.kind === "binary"
      ? analysis.candidate.outcome.success
      : false;
  return {
    claims:
      analysis.status === "observed"
        ? [{ code: success ? "target-observed" : "target-not-observed", targetId: analysis.observation.targetId }]
        : [],
    retry: {
      required: independent && !success,
      reasonCode: independent && !success ? "independent-target-missing" : "not-required",
    },
  };
}

export function prescribeDeclarativeRetrieval(input: {
  capability: GoldSliceCapability;
  evidence: CoreEvidenceForRouting;
  now: string;
  provisionalDelayMs: number;
}): RetrievalSchedulePrescription {
  if (input.capability.memoryKind !== "declarative-formulaic-recall") {
    return notEligibleSchedule("not-declarative");
  }
  const independentSuccess =
    input.evidence.role === "free-production" &&
    input.evidence.outcome.kind === "binary" &&
    input.evidence.outcome.success &&
    input.evidence.attempt.supportLevel === 0 &&
    !input.evidence.attempt.revealUsed;
  if (!independentSuccess) return notEligibleSchedule("not-independent-success");

  const now = Date.parse(input.now);
  if (!Number.isFinite(now) || !Number.isFinite(input.provisionalDelayMs) || input.provisionalDelayMs <= 0) {
    return notEligibleSchedule("not-independent-success");
  }
  return {
    status: "scheduled",
    schedulerBoundary: "declarative-retrieval-adapter",
    calibrationState: "provisional",
    dueAt: new Date(now + input.provisionalDelayMs).toISOString(),
    reasonCode: "independent-declarative-success",
  };
}

export function transferContextChanged(original: CoreTaskSpec, transfer: CoreTaskSpec) {
  if (original.targetIds.join("|") !== transfer.targetIds.join("|")) return false;
  if (transfer.transferDistance !== "near-transfer") return false;
  const originalContexts = new Set(original.contextTags);
  return transfer.contextTags.some((tag) => !originalContexts.has(tag));
}

export function runCoreGoldSliceReference(): CoreGoldSliceArtifact {
  const populationTags = ["l1-vi", "adult", "reference-fixture"];
  const supportedTask = fixtureTask("gold-supported", "controlled-production", 1, ["workplace", "reception-desk"], "same-context");
  const independentTask = fixtureTask("gold-independent", "free-production", 0, ["workplace", "team-meeting"], "same-context");
  const transferTask = fixtureTask("gold-near-transfer", "near-transfer", 0, ["remote-call", "connection-problem"], "near-transfer");
  const resolved = resolveGoldSliceTargets(independentTask, goldSliceSkillGraph);
  if (!resolved.ok) throw new Error(`Invalid gold slice fixture: ${resolved.reasonCodes.join(",")}`);

  let state = createEmptyLearnerSkillState(TARGET_ID);
  const transitions: GoldSliceTransition[] = [transition("initial", ["state-unknown"], "not-attempted", state)];

  const unavailable = analyzeGoldSliceResponse(goldSliceCapability, fixtureAttempt({
    attemptId: "unavailable",
    task: independentTask,
    role: "free-production",
    response: null,
    unavailableReason: "evaluator-unavailable",
    supportLevel: 0,
    contextId: "team-meeting:audio-lost",
    populationTags,
    occurredAt: "2026-09-04T00:00:00.000Z",
  }));
  transitions.push(transition("unavailable", [unavailable.reason, "no-evidence-created"], "not-attempted", state));

  const supported = processAttempt(state, goldSliceCapability, fixtureAttempt({
    attemptId: "supported-success",
    task: supportedTask,
    role: "controlled-production",
    response: "Could you say that again?",
    supportLevel: 1,
    contextId: "reception-desk:visible-frame",
    populationTags,
    occurredAt: "2026-09-04T00:01:00.000Z",
  }));
  state = supported.state;
  transitions.push(transition("supported-success", supported.reasonCodes, certificationStatus(supported.certification), state));

  const failure = processAttempt(state, goldSliceCapability, fixtureAttempt({
    attemptId: "independent-failure",
    task: independentTask,
    role: "free-production",
    response: "Please speak slowly.",
    supportLevel: 0,
    contextId: "team-meeting:no-frame",
    populationTags,
    occurredAt: "2026-09-04T00:02:00.000Z",
  }));
  state = failure.state;
  transitions.push(transition("independent-failure", failure.reasonCodes, certificationStatus(failure.certification), state));
  const feedback = selectGoldSliceFeedback(failure.analysis, "free-production");

  const retry = processAttempt(state, goldSliceCapability, fixtureAttempt({
    attemptId: "independent-retry-success",
    task: independentTask,
    role: "free-production",
    response: "Could you say that again?",
    supportLevel: 0,
    contextId: "team-meeting:no-frame",
    populationTags,
    occurredAt: "2026-09-04T00:03:00.000Z",
  }));
  state = retry.state;
  transitions.push(transition("independent-retry-success", retry.reasonCodes, certificationStatus(retry.certification), state));
  if (!retry.certification?.ok) throw new Error("Gold slice retry fixture did not certify");

  const retrievalSchedule = prescribeDeclarativeRetrieval({
    capability: goldSliceCapability,
    evidence: retry.certification.evidence,
    now: retry.certification.evidence.occurredAt,
    provisionalDelayMs: DAY_MS,
  });
  const contextChanged = transferContextChanged(independentTask, transferTask);
  const transferPlan = planSession({
    candidates: [{
      id: "gold-near-transfer-probe",
      targetId: TARGET_ID,
      evidenceType: "transfer",
      importance: 1,
      transferValue: 1,
    }],
    states: [state],
    sessionSize: 1,
    now: "2026-09-05T00:03:00.000Z",
  });
  const plannedTransfer = contextChanged ? transferPlan.opportunities[0] : undefined;

  const transfer = processAttempt(state, goldSliceCapability, fixtureAttempt({
    attemptId: "near-transfer-success",
    task: transferTask,
    role: "near-transfer",
    response: "Could you repeat that, please?",
    supportLevel: 0,
    contextId: "remote-call:connection-problem",
    populationTags,
    occurredAt: "2026-09-05T00:03:00.000Z",
  }));
  state = transfer.state;
  transitions.push(transition("changed-context-transfer", transfer.reasonCodes, certificationStatus(transfer.certification), state));

  return {
    artifactId: "core-gold-slice-v1",
    artifactClass: "deterministic-reference-flow",
    authorityScope: "repository-reference-only",
    promotionDecision: "not-production-authority",
    targetId: TARGET_ID,
    resolvedTargetIds: resolved.targetIds,
    stateModel: "ema-routing-v1",
    stateCalibration: "provisional-routing-only",
    transitions,
    feedback,
    retryAttemptId: "independent-retry-success",
    retrievalSchedule,
    transferPlan: {
      selectedCandidateId: plannedTransfer?.candidate.id ?? null,
      reasonCodes: plannedTransfer?.reasons ?? transferPlan.blocked.flatMap((item) => item.reasons),
      contextChanged,
    },
    finalState: stateSnapshot(state),
    residualUnknowns: [
      "routing-state EMA weights are provisional",
      "one-day retrieval delay is a fixture input, not an empirically optimized interval",
      "reference answer matching does not validate spontaneous learner transfer",
      "repository execution does not grant production authority",
    ],
  };
}

function processAttempt(state: LearnerSkillState, capability: GoldSliceCapability, input: GoldSliceAttempt) {
  const analysis = analyzeGoldSliceResponse(capability, input);
  if (analysis.status === "unavailable") {
    return { state, analysis, certification: null, reasonCodes: [analysis.reason, "no-evidence-created"] };
  }
  const certification = validateReferenceCoreEvidence(
    input.task,
    analysis.observation,
    analysis.candidate,
  );
  if (!certification.ok) {
    return {
      state,
      analysis,
      certification,
      reasonCodes: [analysis.reason, ...certification.problems.map((problem) => `certification:${problem.type}`)],
    };
  }
  const updated = applyValidatedEvidenceToRoutingState(state, certification.evidence);
  return {
    state: updated.state,
    analysis,
    certification,
    reasonCodes: [analysis.reason, "reference-evidence-validated", updated.reasonCode],
  };
}

function fixtureTask(
  id: string,
  role: CoreEvidenceRole,
  supportLevel: number,
  contextTags: string[],
  transferDistance: CoreTaskSpec["transferDistance"],
): CoreTaskSpec {
  return {
    id,
    version: 1,
    targetIds: [TARGET_ID],
    activity: "written-production",
    responseModality: "text",
    allowedEvidenceRoles: [role],
    support: { level: supportLevel, revealAllowed: false },
    transferDistance,
    contextTags,
    timeConstraintMs: null,
    scoringContractId: EVALUATOR_ID,
    sources: [],
  };
}

function fixtureAttempt(
  input: Omit<GoldSliceAttempt, "responseModality" | "revealUsed" | "latencyMs">,
): GoldSliceAttempt {
  return { ...input, responseModality: "text", revealUsed: false, latencyMs: null };
}

function transition(
  step: string,
  reasonCodes: string[],
  certification: GoldSliceTransition["certification"],
  state: LearnerSkillState,
): GoldSliceTransition {
  return {
    step,
    reasonCodes,
    certification,
    production: readLearnerDimension(state, "production"),
    transfer: readLearnerDimension(state, "transfer"),
  };
}

function stateSnapshot(state: LearnerSkillState): GoldSliceStateSnapshot {
  return {
    recognition: readLearnerDimension(state, "recognition"),
    retrieval: readLearnerDimension(state, "retrieval"),
    listening: readLearnerDimension(state, "listening"),
    production: readLearnerDimension(state, "production"),
    repair: readLearnerDimension(state, "repair"),
    transfer: readLearnerDimension(state, "transfer"),
    retention: readLearnerDimension(state, "retention"),
  };
}

function certificationStatus(
  result: ReferenceEvidenceValidationResult | null | undefined,
): GoldSliceTransition["certification"] {
  if (!result) return "not-attempted";
  return result.ok ? "reference-validated" : "rejected";
}

function evidenceTypeForRole(role: CoreEvidenceRole): EvidenceType | null {
  if (role === "cued-recall" || role === "free-recall") return "retrieval";
  if (role === "controlled-production" || role === "free-production") return "production";
  if (role === "near-transfer" || role === "far-transfer") return "transfer";
  if (role === "retention-probe") return "retention";
  return null;
}

function notEligibleSchedule(reasonCode: RetrievalSchedulePrescription["reasonCode"]): RetrievalSchedulePrescription {
  return {
    status: "not-eligible",
    schedulerBoundary: "declarative-retrieval-adapter",
    calibrationState: "provisional",
    dueAt: null,
    reasonCode,
  };
}

function normalizeResponse(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9' ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
