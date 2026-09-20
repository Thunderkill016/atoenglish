import type { LearningAttemptItem } from "@/lib/lessons/learning-attempt";

export type CanonicalResponseModality =
  | "choice"
  | "text"
  | "speech"
  | "gesture"
  | "none";

export type LegacyAttemptRpcArgs = {
  p_knowledge_item_id: string;
  p_capability_id: null;
  p_session_id: string;
  p_exercise_type: string;
  p_response_modality: CanonicalResponseModality;
  p_prompt_id: string;
  p_context_id: null;
  p_response_text: null;
  p_correct: boolean | null;
  p_latency_ms: number | null;
  p_hint_count: 0;
  p_reveal_used: false;
  p_support_level: 0;
  p_metadata: {
    compatibilitySource: "legacy-learning-attempt-v1";
    lessonId: string;
    activityId: string;
    legacyModality: LearningAttemptItem["modality"];
    legacyStatus: LearningAttemptItem["status"];
    legacyScore: number | null;
    legacyErrorTags: string[];
    legacyEvaluator: string;
    legacyEvaluatorVersion: string;
  };
  p_evidence_type: null;
  p_evidence_target_id: null;
  p_evidence_success: null;
  p_evidence_confidence: null;
  p_evidence_context_id: null;
  p_evaluator: null;
  p_evidence_metadata: Record<string, never>;
};

function responseModalityForLegacyAttempt(
  modality: LearningAttemptItem["modality"],
): CanonicalResponseModality {
  switch (modality) {
    case "speaking":
    case "shadowing":
      return "speech";
    case "writing":
      return "text";
    case "quiz":
    case "checkpoint":
      return "choice";
    case "vocabulary":
    case "grammar":
    case "listening":
    case "reading":
      return "none";
  }
}

function binaryCorrectness(score: number | null): boolean | null {
  if (score === 100) return true;
  if (score === 0) return false;
  return null;
}

/**
 * Compatibility bridge for legacy lesson/mission callers.
 *
 * These callers do not carry enough canonical semantic identity to create trustworthy mastery
 * evidence. Preserve their observations as immutable attempts through the canonical RPC, but do
 * not fabricate capability/evidence events or mutate learner_skill_states.
 */
export function compileLegacyAttemptRpcArgs(input: {
  sessionId: string;
  lessonId: string;
  attempt: LearningAttemptItem;
}): LegacyAttemptRpcArgs {
  const { sessionId, lessonId, attempt } = input;

  return {
    p_knowledge_item_id: `legacy:${attempt.activityId}`,
    p_capability_id: null,
    p_session_id: sessionId,
    p_exercise_type: `legacy:${attempt.modality}`,
    p_response_modality: responseModalityForLegacyAttempt(attempt.modality),
    p_prompt_id: attempt.activityId,
    p_context_id: null,
    p_response_text: null,
    p_correct: attempt.status === "scored" ? binaryCorrectness(attempt.score) : null,
    p_latency_ms: attempt.latencyMs,
    p_hint_count: 0,
    p_reveal_used: false,
    p_support_level: 0,
    p_metadata: {
      compatibilitySource: "legacy-learning-attempt-v1",
      lessonId,
      activityId: attempt.activityId,
      legacyModality: attempt.modality,
      legacyStatus: attempt.status,
      legacyScore: attempt.score,
      legacyErrorTags: attempt.errorTags,
      legacyEvaluator: attempt.evaluator,
      legacyEvaluatorVersion: attempt.evaluatorVersion,
    },
    p_evidence_type: null,
    p_evidence_target_id: null,
    p_evidence_success: null,
    p_evidence_confidence: null,
    p_evidence_context_id: null,
    p_evaluator: null,
    p_evidence_metadata: {},
  };
}
