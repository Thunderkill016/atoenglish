import type { ReferenceCoreEvidence } from "../core/certified-evidence";
import {
  projectLearnerState,
  type LearnerStateProjection,
} from "../core/learner-state";
import type { OntologyGraph } from "../core/ontology";
import { buildEnglishOntologyV1 } from "../core/ontology-seed";
import {
  readConstructFromLearnerState,
  type LearnerConstructRead,
} from "../learning/learner-state-read";
import type { NếpEvaluationResult } from "./evaluator";
import {
  toLearnerStateEvidence,
  type ZeroPathClaimId,
  type ZeroPathEvidenceInput,
} from "./core-evidence-wiring.v1";
import {
  compileCanonicalNếpPracticeAttempt,
  type NếpPracticeSubmission,
} from "./practice-execution.v1";

/**
 * Zero-path session runner: accumulates evaluated Nếp submissions within one
 * learner session and projects them into the learner evidence state.
 *
 * Deliberately pure and host-agnostic — the session state lives wherever the
 * host keeps it (a client session store, a test harness, or a future route).
 * Persistence across sittings is a separate decision and is out of scope.
 *
 * Boundaries preserved from `core-evidence-wiring.v1.ts`:
 * - canonical recompute only: the caller never supplies correctness, targets,
 *   evidence types or evaluator identity;
 * - attempt-only actions mint nothing;
 * - raw learner text never enters the projection or the read model;
 * - every record stays `repository-reference` — no durable authority.
 */

export type SessionSubmissionOutcome =
  | { readonly kind: "rejected"; readonly reason: "unresolvable-submission" }
  | {
      readonly kind: "attempt-only";
      readonly actionId: string;
      readonly evaluation: NếpEvaluationResult;
      readonly feedback: string;
    }
  | {
      readonly kind: "evidence";
      readonly actionId: string;
      readonly claim: ZeroPathClaimId;
      readonly evaluation: NếpEvaluationResult;
      readonly feedback: string;
    }
  | {
      readonly kind: "invalid-evidence";
      readonly actionId: string;
      readonly claim: ZeroPathClaimId;
      readonly problems: readonly unknown[];
      readonly evaluation: NếpEvaluationResult;
      readonly feedback: string;
    };

export type SessionConstructRead = {
  readonly targetId: string;
  readonly read: LearnerConstructRead;
  readonly claims: readonly ZeroPathClaimId[];
};

/**
 * Learner-safe session read model. Reports evidence counts and sufficiency
 * status only — never a mastery/proficiency claim, never raw responses.
 */
export type ZeroPathSessionReadModel = {
  readonly sessionId: string;
  readonly modelVersion: "nep.learner-evidence-state.v1";
  readonly submissions: number;
  readonly evidenceMinted: number;
  readonly skippedAttemptOnly: number;
  readonly rejectedCount: number;
  readonly constructs: readonly SessionConstructRead[];
};

export type ZeroPathSessionRunner = {
  readonly sessionId: string;
  recordSubmission(
    submission: NếpPracticeSubmission,
    occurredAt?: string,
  ): SessionSubmissionOutcome;
  projection(): LearnerStateProjection;
  readModel(): ZeroPathSessionReadModel;
};

export type ZeroPathSessionOptions = {
  readonly sessionId: string;
  /** Clock injection for deterministic tests; defaults to the host clock. */
  readonly now?: () => string;
  readonly ontology?: OntologyGraph;
};

export function createZeroPathSession(options: ZeroPathSessionOptions): ZeroPathSessionRunner {
  const now = options.now ?? (() => new Date().toISOString());
  const ontology = options.ontology ?? defaultOntology();
  const accepted: ReferenceCoreEvidence[] = [];
  const rejectedEvidence: { claim: ZeroPathClaimId; problems: readonly unknown[] }[] = [];
  const claimsByTarget = new Map<string, Set<ZeroPathClaimId>>();
  let submissions = 0;
  let skippedAttemptOnly = 0;
  let sequence = 0;

  function recordSubmission(
    submission: NếpPracticeSubmission,
    occurredAt?: string,
  ): SessionSubmissionOutcome {
    const compiled = compileCanonicalNếpPracticeAttempt(submission);
    if (!compiled) return { kind: "rejected", reason: "unresolvable-submission" };

    submissions += 1;
    const input: ZeroPathEvidenceInput = {
      lesson: compiled.lesson,
      action: compiled.action,
      response: submission.response,
      responseSource: submission.responseSource,
      evaluation: compiled.evaluation,
      supportUsed: submission.supportUsed,
      latencyMs: submission.latencyMs,
      occurredAt: occurredAt ?? now(),
      sequence: sequence++,
    };

    const result = toLearnerStateEvidence(input);
    const base = {
      actionId: compiled.action.id,
      evaluation: compiled.evaluation,
      feedback: compiled.feedback,
    };
    if (!result) {
      skippedAttemptOnly += 1;
      return { kind: "attempt-only", ...base };
    }
    if (!result.ok) {
      rejectedEvidence.push({ claim: result.claim, problems: result.problems });
      return { kind: "invalid-evidence", claim: result.claim, problems: result.problems, ...base };
    }
    accepted.push(result.evidence);
    const claims = claimsByTarget.get(result.evidence.targetId) ?? new Set<ZeroPathClaimId>();
    claims.add(result.claim);
    claimsByTarget.set(result.evidence.targetId, claims);
    return { kind: "evidence", claim: result.claim, ...base };
  }

  function projection(): LearnerStateProjection {
    return projectLearnerState(ontology, accepted);
  }

  function readModel(): ZeroPathSessionReadModel {
    const projected = projection();
    const constructs: SessionConstructRead[] = Object.keys(projected.constructs)
      .sort()
      .map((targetId) => ({
        targetId,
        read: readConstructFromLearnerState(projected, targetId),
        claims: [...(claimsByTarget.get(targetId) ?? [])].sort(),
      }));
    return {
      sessionId: options.sessionId,
      modelVersion: "nep.learner-evidence-state.v1",
      submissions,
      evidenceMinted: accepted.length,
      skippedAttemptOnly,
      rejectedCount: rejectedEvidence.length + projected.rejectedEvents.length,
      constructs,
    };
  }

  return { sessionId: options.sessionId, recordSubmission, projection, readModel };
}

function defaultOntology(): OntologyGraph {
  const result = buildEnglishOntologyV1();
  if (!result.ok) throw new Error("canonical English ontology V1 failed to build");
  return result.graph;
}
