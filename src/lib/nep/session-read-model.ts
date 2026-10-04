import {
  projectLearnerState,
  type LearnerStateProjection,
} from "../core/learner-state";
import type { OntologyGraph } from "../core/ontology";
import {
  readConstructFromLearnerState,
  type LearnerConstructRead,
} from "../learning/learner-state-read";
import type { ReferenceCoreEvidence } from "../core/certified-evidence";
import type { ZeroPathClaimId } from "./core-evidence-wiring.v1";

/**
 * Learner-safe session read model, derivable by any host that accumulates
 * accepted evidence (in-process runner, browser client, test harness).
 *
 * Pure and free of lesson-content imports — safe for client bundles: it never
 * ships evaluator targets, never carries raw learner text, and reports
 * sufficiency status rather than mastery claims.
 */

export type SessionConstructRead = {
  readonly targetId: string;
  readonly read: LearnerConstructRead;
  readonly claims: readonly ZeroPathClaimId[];
};

export type ZeroPathSessionReadModel = {
  readonly sessionId: string;
  readonly modelVersion: "nep.learner-evidence-state.v1";
  readonly submissions: number;
  readonly evidenceMinted: number;
  readonly skippedAttemptOnly: number;
  /** Unassessed self-report responses (reflect channel). Never evidence. */
  readonly selfReports: number;
  readonly rejectedCount: number;
  readonly constructs: readonly SessionConstructRead[];
};

export type SessionReadModelInput = {
  readonly sessionId: string;
  readonly submissions: number;
  readonly skippedAttemptOnly: number;
  readonly selfReports: number;
  readonly rejectedBeforeProjection: number;
  readonly accepted: readonly ReferenceCoreEvidence[];
  readonly claimsByTarget: ReadonlyMap<string, ReadonlySet<ZeroPathClaimId>>;
  readonly ontology: OntologyGraph;
};

export function projectSessionEvidence(
  ontology: OntologyGraph,
  accepted: readonly ReferenceCoreEvidence[],
): LearnerStateProjection {
  return projectLearnerState(ontology, accepted);
}

export function buildSessionReadModel(input: SessionReadModelInput): ZeroPathSessionReadModel {
  const projected = projectLearnerState(input.ontology, input.accepted);
  const constructs: SessionConstructRead[] = Object.keys(projected.constructs)
    .sort()
    .map((targetId) => ({
      targetId,
      read: readConstructFromLearnerState(projected, targetId),
      claims: [...(input.claimsByTarget.get(targetId) ?? [])].sort(),
    }));
  return {
    sessionId: input.sessionId,
    modelVersion: "nep.learner-evidence-state.v1",
    submissions: input.submissions,
    evidenceMinted: input.accepted.length,
    skippedAttemptOnly: input.skippedAttemptOnly,
    selfReports: input.selfReports,
    rejectedCount: input.rejectedBeforeProjection + projected.rejectedEvents.length,
    constructs,
  };
}
