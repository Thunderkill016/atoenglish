import type {
  CoreEvidenceCandidate,
  ReferenceCoreEvidence,
} from "../core/certified-evidence";
import { validateReferenceCoreEvidence } from "../core/certified-evidence";
import type { CoreObservation } from "../core/observation";
import type { CoreTaskSpec, TransferDistance } from "../core/task";
import type { CommunicationActivity } from "../core/domain";
import type { CoreEvidenceRole } from "../core/evidence-role";
import type { ResponseModality } from "../learning/evidence";
import type { EvaluatedNếpAction } from "./learning-evidence-adapter";
import type { LessonAction, LessonModality } from "./lesson-contract";
import type { EvidenceType } from "../learning/evidence";

/**
 * Zero-path wiring: deterministic Nếp evaluation → typed core evidence input.
 *
 * Claim alignment with the vidlish `claim-beta-v1.2` projector
 * (NEP/07_GITHUB_REPOSITORIES/vidlish/src/engine/core.js):
 *   understand_written  → evidenceType "recognition" on a read/choice action
 *   recognize_audio     → evidenceType "recognition" on a listen action
 *   retrieve_form       → evidenceType "retrieval" (cued form recall)
 *   use_novel_context   → evidenceType "transfer" (changedContext actions)
 * Production and repair have no v4 claim counterpart; they keep their
 * evidenceType as the claim tag.
 *
 * Contract notes / deliberate gaps (ontology V1, do not silently "fix"):
 * - No V1 ontology node allows the `cued-recall` role, so retrieval evidence is
 *   recorded as `controlled-production` on the production activity node with the
 *   cue carried in supportLevel. This is honest: the learner produced the form;
 *   the cue is a support dimension, not a different construct.
 * - Repair evidence binds to interaction nodes (`interactional-repair` is not
 *   allowed on production nodes).
 * - All records are `repository-reference` scope: deterministic lesson
 *   evaluation is not a calibrated durable authority.
 */

const ACTIVITY_NODE_PREFIX = "nep.en.v1.communication-activity." as const;

export type ZeroPathClaimId =
  | "understand_written"
  | "recognize_audio"
  | "retrieve_form"
  | "produce_in_context"
  | "interactional_repair"
  | "use_novel_context";

type EvidenceBinding = {
  readonly role: CoreEvidenceRole;
  readonly activity: CommunicationActivity;
  readonly targetId: string;
  readonly transferDistance: TransferDistance;
  readonly claim: ZeroPathClaimId;
};

function productionActivity(responseModality: ResponseModality): CommunicationActivity {
  return responseModality === "speech" ? "spoken-production" : "written-production";
}

function interactionActivity(responseModality: ResponseModality): CommunicationActivity {
  return responseModality === "speech" ? "spoken-interaction" : "written-interaction";
}

function bindEvidence(
  action: LessonAction,
  evidenceType: EvidenceType,
  responseModality: ResponseModality,
): EvidenceBinding {
  const modality = action.modality;
  switch (evidenceType) {
    case "recognition": {
      const audio = modality === "listen";
      const activity: CommunicationActivity = audio ? "listening-reception" : "reading-reception";
      return {
        role: "meaning-recognition",
        activity,
        targetId: `${ACTIVITY_NODE_PREFIX}${activity}`,
        transferDistance: "same-context",
        claim: audio ? "recognize_audio" : "understand_written",
      };
    }
    case "retrieval": {
      const activity = productionActivity(responseModality);
      return {
        role: "controlled-production",
        activity,
        targetId: `${ACTIVITY_NODE_PREFIX}${activity}`,
        transferDistance: "same-context",
        claim: "retrieve_form",
      };
    }
    case "production": {
      const activity = productionActivity(responseModality);
      return {
        role: "controlled-production",
        activity,
        targetId: `${ACTIVITY_NODE_PREFIX}${activity}`,
        transferDistance: "same-context",
        claim: "produce_in_context",
      };
    }
    case "repair": {
      const activity = interactionActivity(responseModality);
      return {
        role: "interactional-repair",
        activity,
        targetId: `${ACTIVITY_NODE_PREFIX}${activity}`,
        transferDistance: "same-context",
        claim: "interactional_repair",
      };
    }
    case "transfer": {
      const activity = productionActivity(responseModality);
      return {
        role: "near-transfer",
        activity,
        targetId: `${ACTIVITY_NODE_PREFIX}${activity}`,
        transferDistance: "near-transfer",
        claim: "use_novel_context",
      };
    }
    default: {
      const activity = productionActivity(responseModality);
      return {
        role: "controlled-production",
        activity,
        targetId: `${ACTIVITY_NODE_PREFIX}${activity}`,
        transferDistance: "same-context",
        claim: "produce_in_context",
      };
    }
  }
}

function responseModalityFor(action: LessonAction, source: "speech" | "text" | null): ResponseModality {
  if (action.modality === "choice") return "choice";
  if (source === "speech") return "speech";
  if (source === "text") return "text";
  return "none";
}

export type ZeroPathEvidenceInput = EvaluatedNếpAction & {
  /** ISO 8601 occurrence time — explicit input, never an ambient clock. */
  readonly occurredAt: string;
  /** Caller-supplied idempotency key preferred; falls back to a deterministic derivation. */
  readonly eventId?: string;
  /** Disambiguator for repeated attempts at the same action. */
  readonly sequence?: number;
};

export type CoreEvidenceTriple = {
  readonly task: CoreTaskSpec;
  readonly observation: CoreObservation;
  readonly candidate: CoreEvidenceCandidate;
  readonly claim: ZeroPathClaimId;
};

/**
 * Builds the task/observation/candidate triple for one evaluated Nếp action.
 * Returns null for attempt-only actions (no assessment or null evidenceType —
 * e.g. post-reveal retries), which must not mint evidence.
 */
export function toCoreEvidenceTriple(input: ZeroPathEvidenceInput): CoreEvidenceTriple | null {
  const { lesson, action, responseSource, evaluation, supportUsed, latencyMs } = input;
  const assessment = action.assessment;
  if (!assessment || !assessment.evidenceType) return null;

  const responseModality = responseModalityFor(action, responseSource);
  const binding = bindEvidence(action, assessment.evidenceType, responseModality);
  const sequence = input.sequence ?? 0;
  const taskId = `nep:${lesson.id}@v${lesson.version}:${action.id}`;
  const eventId = input.eventId ?? `evt:${taskId}:${input.occurredAt}:${sequence}`;
  const observationId = `obs:${taskId}:${input.occurredAt}:${sequence}`;
  const supportLevel = supportUsed ? 1 : 0;
  const contextTags = [
    `lesson:${lesson.id}`,
    `cap:${assessment.targetCapabilityId}`,
    `claim:${binding.claim}`,
    `kind:${action.kind}`,
  ];

  const task: CoreTaskSpec = {
    id: taskId,
    version: lesson.version,
    targetIds: [binding.targetId],
    activity: binding.activity,
    responseModality,
    allowedEvidenceRoles: [binding.role],
    support: {
      level: supportLevel,
      revealAllowed: action.revealsAnswer === true,
    },
    transferDistance: binding.transferDistance,
    contextTags,
    timeConstraintMs: null,
    scoringContractId: "nep.evaluator.v2",
    sources: [],
  };

  const observation: CoreObservation = {
    observationId,
    targetId: binding.targetId,
    activity: binding.activity,
    payload: {
      kind: "comprehension",
      taskId,
      responseCorrect: evaluation.observedResponse ? evaluation.success : null,
      responseLatencyMs: Math.min(60 * 60 * 1000, Math.max(0, Math.round(latencyMs))),
      supportLevel,
      targetedConstructs: [binding.targetId],
    },
    confidence: null,
    calibration: {
      validationState: "unvalidated",
      decision: "shadow",
      benchmarkId: null,
      modelFingerprint: assessment.evaluator,
      scope: {
        activity: binding.activity,
        construct: assessment.targetCapabilityId,
        requiredPopulationTags: ["vi-adult-zero-path"],
      },
      metrics: { sampleSize: 0 },
    },
    authority: "none",
    provenance: {
      evaluator: assessment.evaluator,
      evaluatorKind: "deterministic",
    },
    context: {
      construct: assessment.targetCapabilityId,
      populationTags: ["vi-adult-zero-path"],
    },
    contextId: assessment.contextId,
    createdAt: input.occurredAt,
  };

  const candidate: CoreEvidenceCandidate = {
    eventId,
    taskId,
    targetId: binding.targetId,
    role: binding.role,
    observationId,
    outcome: { kind: "binary", success: evaluation.success },
    evaluatorConfidence: null,
    attempt: {
      supportLevel,
      revealUsed: action.kind === "retry",
      responseLatencyMs: Math.min(60 * 60 * 1000, Math.max(0, Math.round(latencyMs))),
      responseModality,
      contextId: assessment.contextId,
    },
    occurredAt: input.occurredAt,
  };

  return { task, observation, candidate, claim: binding.claim };
}

export type LearnerStateEvidenceResult =
  | { readonly ok: true; readonly evidence: ReferenceCoreEvidence; readonly claim: ZeroPathClaimId }
  | { readonly ok: false; readonly problems: readonly unknown[]; readonly claim: ZeroPathClaimId };

/**
 * Full wiring for one evaluated action: build the triple and run reference-scope
 * validation. Returns null for attempt-only actions; rejects with problems when
 * the evidence cannot be certified as repository-reference.
 */
export function toLearnerStateEvidence(input: ZeroPathEvidenceInput): LearnerStateEvidenceResult | null {
  const triple = toCoreEvidenceTriple(input);
  if (!triple) return null;
  const result = validateReferenceCoreEvidence(triple.task, triple.observation, triple.candidate);
  if (!result.ok) return { ok: false, problems: result.problems, claim: triple.claim };
  return { ok: true, evidence: result.evidence, claim: triple.claim };
}

export type SessionEvidenceBatch = {
  readonly evidence: readonly ReferenceCoreEvidence[];
  readonly skippedAttemptOnly: number;
  readonly rejected: readonly { readonly claim: ZeroPathClaimId; readonly problems: readonly unknown[] }[];
};

/** Converts a whole session of evaluated actions into reference evidence, keeping rejects auditable. */
export function sessionEvidenceBatch(inputs: readonly ZeroPathEvidenceInput[]): SessionEvidenceBatch {
  const evidence: ReferenceCoreEvidence[] = [];
  const rejected: { claim: ZeroPathClaimId; problems: readonly unknown[] }[] = [];
  let skippedAttemptOnly = 0;
  for (const input of inputs) {
    const result = toLearnerStateEvidence(input);
    if (!result) {
      skippedAttemptOnly += 1;
      continue;
    }
    if (result.ok) evidence.push(result.evidence);
    else rejected.push({ claim: result.claim, problems: result.problems });
  }
  return { evidence, skippedAttemptOnly, rejected };
}
