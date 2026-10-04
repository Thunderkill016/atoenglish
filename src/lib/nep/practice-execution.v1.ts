import { z } from "zod";

import { evaluateNếpAction, feedbackForNếpEvaluation } from "./evaluator";
import type { LessonAction } from "./lesson-contract";
import { resolveLegacyContract } from "./legacy-unit-contract.v1";
import { resolveNếpLessonFromRegistry } from "./lesson-registry.v1";
import {
  toLearningAttemptRecord,
  type NếpResponseSource,
} from "./learning-evidence-adapter";
import { nepSessionCatalogV1 } from "./session-catalog.v1";

export const NếpPracticeSubmissionSchema = z.object({
  lessonId: z.string().trim().min(1).max(160),
  lessonVersion: z.number().int().positive(),
  actionId: z.string().trim().min(1).max(120),
  /**
   * Client-minted attempt idempotency key: retrying the same submission must
   * not mint evidence twice. Also used as the evidence eventId.
   */
  idempotencyKey: z.string().uuid(),
  response: z.string().max(1200),
  responseSource: z.enum(["speech", "text"]).nullable(),
  /**
   * Highest support-ladder rung the learner revealed (0 = none). Server clamps
   * this to the action's canonical ladder length — the client cannot claim a
   * level that does not exist.
   */
  supportLevelUsed: z.number().int().min(0).max(16),
  latencyMs: z
    .number()
    .finite()
    .min(0)
    .max(60 * 60 * 1000),
  /**
   * Marks a delayed re-observation of a previously introduced lesson.
   * Only trusted callers may set this — the zero-path action injects it from
   * the server-bound session mode, so a client cannot relabel its own attempts.
   */
  reviewMode: z.boolean().optional(),
});

export type NếpPracticeSubmission = z.infer<typeof NếpPracticeSubmissionSchema>;

export type NếpPracticeEnvelope = {
  candidateId: string;
  lessonId: string;
  lessonVersion: number;
  actionId: string;
  kind: LessonAction["kind"];
  modality: LessonAction["modality"];
  title: string;
  instruction: string;
  prompt: string | null;
  choices: string[];
  supportVi: string | null;
  changedContext: boolean;
};

export function resolveNếpLesson(lessonId: string, lessonVersion: number) {
  return (
    resolveNếpLessonFromRegistry(lessonId, lessonVersion) ??
    (lessonVersion === 1 ? resolveLegacyContract(lessonId) : null)
  );
}

export function resolveNếpAction(
  lessonId: string,
  lessonVersion: number,
  actionId: string,
) {
  const lesson = resolveNếpLesson(lessonId, lessonVersion);
  if (!lesson) return null;
  const action = lesson.actions.find((item) => item.id === actionId) ?? null;
  if (!action) return null;
  return { lesson, action };
}

/**
 * Resolve a planner candidate to a learner-safe presentation envelope.
 * Hidden evaluator targets, expected target signals, evidence type/target and remediation rules
 * are deliberately excluded from this DTO. Choice labels are learner-visible content, but no
 * correctness marker is exposed.
 */
export function resolveNếpPlannedPractice(
  candidateId: string,
): NếpPracticeEnvelope | null {
  const candidate = nepSessionCatalogV1.find((item) => item.id === candidateId);
  if (!candidate) return null;

  const lessonId = metadataString(candidate.metadata, "lessonId");
  const actionId = metadataString(candidate.metadata, "actionId");
  const versionValue = candidate.metadata?.lessonVersion;
  const lessonVersion =
    typeof versionValue === "number"
      ? versionValue
      : typeof versionValue === "string"
        ? Number(versionValue)
        : Number.NaN;
  if (!lessonId || !actionId || !Number.isInteger(lessonVersion)) return null;

  const resolved = resolveNếpAction(lessonId, lessonVersion, actionId);
  if (!resolved || !resolved.action.assessment?.evidenceType) return null;

  return {
    candidateId: candidate.id,
    lessonId: resolved.lesson.id,
    lessonVersion: resolved.lesson.version,
    actionId: resolved.action.id,
    kind: resolved.action.kind,
    modality: resolved.action.modality,
    title: resolved.action.title,
    instruction: resolved.action.instruction,
    prompt: resolved.action.prompt ?? null,
    choices: [...(resolved.action.choices ?? [])],
    supportVi: resolved.action.supportVi ?? null,
    changedContext: resolved.action.changedContext ?? false,
  };
}

/** Canonical support-ladder length for an action (supportVi counts as one rung). */
export function nepSupportLadderLength(action: LessonAction): number {
  return action.supportLadder?.length ?? (action.supportVi ? 1 : 0);
}

/**
 * Server-authoritative compilation of one learner response.
 * The caller supplies only observed interaction data. Correctness, learning target, evidence type,
 * evaluator identity, reveal semantics and remediation metadata are all recomputed from canonical
 * content on the server.
 *
 * Returns `evaluation: null` for unassessed respondable actions (self-report
 * channel such as reflect): the response is recorded as a submission but can
 * never mint evidence.
 */
export function compileCanonicalNếpPracticeAttempt(
  input: NếpPracticeSubmission,
) {
  const resolved = resolveNếpAction(
    input.lessonId,
    input.lessonVersion,
    input.actionId,
  );
  if (!resolved) return null;

  const supportLevelUsed = Math.min(
    input.supportLevelUsed,
    nepSupportLadderLength(resolved.action),
  );

  if (!resolved.action.assessment) {
    if (!resolved.action.collectsResponse) return null;
    return {
      lesson: resolved.lesson,
      action: resolved.action,
      evaluation: null,
      feedback: "Đã ghi nhận tự đánh giá của bạn.",
      record: null,
      supportLevelUsed,
    };
  }

  const evaluation = evaluateNếpAction(resolved.action, input.response);
  const feedback = feedbackForNếpEvaluation(resolved.action, evaluation);
  const record = toLearningAttemptRecord({
    lesson: resolved.lesson,
    action: resolved.action,
    response: input.response,
    responseSource: input.responseSource as NếpResponseSource,
    evaluation,
    supportLevelUsed,
    latencyMs: input.latencyMs,
    reviewMode: input.reviewMode === true,
  });
  if (!record) return null;

  return {
    lesson: resolved.lesson,
    action: resolved.action,
    evaluation,
    feedback,
    record,
    supportLevelUsed,
  };
}

function metadataString(
  metadata: Record<string, unknown> | undefined,
  key: string,
) {
  const value = metadata?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}
