import type { RecordLearningAttemptInput } from "../learning/validation";
import type { NếpEvaluationResult } from "./evaluator";
import type { LessonAction, LessonContract } from "./lesson-contract";
import { remediationHintsForEvaluation } from "./remediation-map.v1";

export type NếpResponseSource = "speech" | "text" | null;

export type EvaluatedNếpAction = {
  lesson: LessonContract;
  action: LessonAction;
  response: string;
  responseSource: NếpResponseSource;
  evaluation: NếpEvaluationResult;
  /** Highest support-ladder rung revealed (0 = none), clamped server-side. */
  supportLevelUsed: number;
  latencyMs: number;
  /**
   * Server-bound flag: a delayed re-observation of an already-introduced
   * lesson. Review-mode attempts mint `retention` evidence instead of the
   * action's own channel — the action's evidence type is preserved in
   * metadata for construct granularity.
   */
  reviewMode?: boolean;
};

function responseModality(action: LessonAction, source: NếpResponseSource) {
  if (action.modality === "choice") return "choice" as const;
  if (source === "speech") return "speech" as const;
  if (source === "text") return "text" as const;
  return "none" as const;
}

function structuredErrorSignals(
  lesson: LessonContract,
  action: LessonAction,
  evaluation: NếpEvaluationResult,
) {
  return {
    version: 1,
    evaluator: evaluation.evaluator,
    observedResponse: evaluation.observedResponse,
    matchedTargetGroupIndexes: evaluation.matchedTargetGroupIndexes,
    missingTargetGroupIndexes: evaluation.missingTargetGroupIndexes,
    errorTags: evaluation.errorTags,
    remediationHints: remediationHintsForEvaluation({ lesson, action, evaluation }),
  };
}

/**
 * Adapts one deterministic Nếp evaluation to the canonical Attempt → Evidence write contract.
 * Raw learner responses are deliberately not persisted. Only derived target-coverage/error
 * signals, response length, modality and task identity cross the persistence boundary.
 */
export function toLearningAttemptRecord(input: EvaluatedNếpAction): RecordLearningAttemptInput | null {
  const {
    lesson,
    action,
    response,
    responseSource,
    evaluation,
    supportLevelUsed,
    latencyMs,
    reviewMode = false,
  } = input;
  const assessment = action.assessment;
  if (!assessment) return null;

  const modality = responseModality(action, responseSource);
  const safeLatency = Math.min(60 * 60 * 1000, Math.max(0, Math.round(latencyMs)));
  const errorSignals = structuredErrorSignals(lesson, action, evaluation);
  // Retry happens after answer-bearing feedback in this contract. It remains attempt-only and
  // must never be replayed by Error Memory as an independent learner failure.
  const revealUsed = action.kind === "retry";
  const metadata = {
    lessonId: lesson.id,
    lessonVersion: lesson.version,
    actionId: action.id,
    actionKind: action.kind,
    responseSource,
    responseLength: evaluation.observedResponse ? response.trim().length : 0,
    rawResponsePersisted: false,
    supportUsed: supportLevelUsed > 0,
    supportLevelUsed,
    changedContext: action.changedContext ?? false,
    reviewMode,
    errorSignals,
  };

  return {
    attempt: {
      capabilityId: assessment.targetCapabilityId,
      exerciseType: `nep:${action.kind}`,
      responseModality: modality,
      promptId: action.id,
      contextId: assessment.contextId,
      responseText: null,
      correct: evaluation.success,
      latencyMs: safeLatency,
      hintCount: 0,
      revealUsed,
      supportLevel: supportLevelUsed,
      metadata,
    },
    candidate: assessment.evidenceType
      ? {
          // A delayed review attempt observes retention of the capability;
          // the action's own channel stays in metadata for granularity.
          type: reviewMode ? "retention" : assessment.evidenceType,
          targetId: assessment.targetCapabilityId,
          success: evaluation.success,
          contextId: assessment.contextId,
          evaluator: assessment.evaluator,
          metadata: {
            lessonId: lesson.id,
            lessonVersion: lesson.version,
            actionId: action.id,
            responseSource,
            rawResponsePersisted: false,
            reviewMode,
            assessmentEvidenceType: assessment.evidenceType,
            errorSignals,
          },
        }
      : null,
  };
}
