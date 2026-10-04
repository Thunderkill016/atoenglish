import type { ReferenceCoreEvidence } from "../core/certified-evidence";
import type { LearnerStateProjection } from "../core/learner-state";
import type { OntologyGraph } from "../core/ontology";
import { buildEnglishOntologyV1 } from "../core/ontology-seed";
import type { NếpEvaluationResult } from "./evaluator";
import {
  buildSessionReadModel,
  projectSessionEvidence,
  type SessionConstructRead,
  type ZeroPathSessionReadModel,
} from "./session-read-model";
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
      readonly kind: "duplicate";
      readonly actionId: string;
      /** The outcome the original submission produced; replayed unchanged. */
      readonly prior: Exclude<
        SessionSubmissionOutcome,
        { readonly kind: "duplicate" }
      >;
    }
  | {
      readonly kind: "self-report";
      readonly actionId: string;
      readonly feedback: string;
    }
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
      /**
       * Server-side only: the minted reference evidence record. Durable
       * session stores persist its plain JSON fields for hydration; it must
       * never be serialized through the learner-facing action boundary.
       */
      readonly evidence: ReferenceCoreEvidence;
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

export type {
  SessionConstructRead,
  ZeroPathSessionReadModel,
} from "./session-read-model";

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
  /**
   * Durable-session hydration: plain-data accumulators rebuilt from stored
   * outcome snapshots. Restored records are projection inputs only — nothing
   * is re-evaluated, re-certified or re-written on restore.
   */
  readonly restored?: {
    readonly outcomesByKey: ReadonlyMap<
      string,
      Exclude<SessionSubmissionOutcome, { kind: "duplicate" }>
    >;
    readonly accepted: readonly ReferenceCoreEvidence[];
    readonly rejectedEvidence: readonly {
      claim: ZeroPathClaimId;
      problems: readonly unknown[];
    }[];
    readonly claimsByTarget: ReadonlyMap<string, ReadonlySet<ZeroPathClaimId>>;
    readonly counters: {
      readonly submissions: number;
      readonly skippedAttemptOnly: number;
      readonly selfReports: number;
      readonly sequence: number;
    };
  };
};

export function createZeroPathSession(
  options: ZeroPathSessionOptions,
): ZeroPathSessionRunner {
  const now = options.now ?? (() => new Date().toISOString());
  const ontology = options.ontology ?? defaultOntology();
  const accepted: ReferenceCoreEvidence[] = [
    ...(options.restored?.accepted ?? []),
  ];
  const rejectedEvidence: {
    claim: ZeroPathClaimId;
    problems: readonly unknown[];
  }[] = [...(options.restored?.rejectedEvidence ?? [])];
  const claimsByTarget = new Map<string, Set<ZeroPathClaimId>>(
    [...(options.restored?.claimsByTarget ?? [])].map(([key, value]) => [
      key,
      new Set(value),
    ]),
  );
  const outcomesByKey = new Map<
    string,
    Exclude<SessionSubmissionOutcome, { kind: "duplicate" }>
  >(options.restored?.outcomesByKey);
  let submissions = options.restored?.counters.submissions ?? 0;
  let skippedAttemptOnly = options.restored?.counters.skippedAttemptOnly ?? 0;
  let selfReports = options.restored?.counters.selfReports ?? 0;
  let sequence = options.restored?.counters.sequence ?? 0;

  function recordSubmission(
    submission: NếpPracticeSubmission,
    occurredAt?: string,
  ): SessionSubmissionOutcome {
    const prior = outcomesByKey.get(submission.idempotencyKey);
    if (prior) {
      return { kind: "duplicate", actionId: submission.actionId, prior };
    }

    const compiled = compileCanonicalNếpPracticeAttempt(submission);
    if (!compiled) {
      const outcome = {
        kind: "rejected",
        reason: "unresolvable-submission",
      } as const;
      outcomesByKey.set(submission.idempotencyKey, outcome);
      return outcome;
    }

    submissions += 1;

    if (!compiled.evaluation) {
      selfReports += 1;
      const outcome = {
        kind: "self-report",
        actionId: compiled.action.id,
        feedback: compiled.feedback,
      } as const;
      outcomesByKey.set(submission.idempotencyKey, outcome);
      return outcome;
    }

    const input: ZeroPathEvidenceInput = {
      lesson: compiled.lesson,
      action: compiled.action,
      response: submission.response,
      responseSource: submission.responseSource,
      evaluation: compiled.evaluation,
      supportLevelUsed: compiled.supportLevelUsed,
      latencyMs: submission.latencyMs,
      occurredAt: occurredAt ?? now(),
      eventId: `idem:${submission.idempotencyKey}`,
      sequence: sequence++,
    };

    const result = toLearnerStateEvidence(input);
    const base = {
      actionId: compiled.action.id,
      evaluation: compiled.evaluation,
      feedback: compiled.feedback,
    };
    let outcome: Exclude<SessionSubmissionOutcome, { kind: "duplicate" }>;
    if (!result) {
      skippedAttemptOnly += 1;
      outcome = { kind: "attempt-only", ...base };
    } else if (!result.ok) {
      rejectedEvidence.push({ claim: result.claim, problems: result.problems });
      outcome = {
        kind: "invalid-evidence",
        claim: result.claim,
        problems: result.problems,
        ...base,
      };
    } else {
      accepted.push(result.evidence);
      const claims =
        claimsByTarget.get(result.evidence.targetId) ??
        new Set<ZeroPathClaimId>();
      claims.add(result.claim);
      claimsByTarget.set(result.evidence.targetId, claims);
      outcome = {
        kind: "evidence",
        claim: result.claim,
        evidence: result.evidence,
        ...base,
      };
    }
    outcomesByKey.set(submission.idempotencyKey, outcome);
    return outcome;
  }

  function projection(): LearnerStateProjection {
    return projectSessionEvidence(ontology, accepted);
  }

  function readModel(): ZeroPathSessionReadModel {
    return buildSessionReadModel({
      sessionId: options.sessionId,
      submissions,
      skippedAttemptOnly,
      selfReports,
      rejectedBeforeProjection: rejectedEvidence.length,
      accepted,
      claimsByTarget,
      ontology,
    });
  }

  return {
    sessionId: options.sessionId,
    recordSubmission,
    projection,
    readModel,
  };
}

function defaultOntology(): OntologyGraph {
  const result = buildEnglishOntologyV1();
  if (!result.ok)
    throw new Error("canonical English ontology V1 failed to build");
  return result.graph;
}
