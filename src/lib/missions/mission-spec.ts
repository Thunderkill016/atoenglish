export const MISSION_STAGES = [
  "scenario",
  "model",
  "guided_roleplay",
  "independent_roleplay",
  "feedback",
  "retry",
  "transfer",
  "completed",
] as const;

export type MissionStage = (typeof MISSION_STAGES)[number];

export interface MissionChunk {
  id: string;
  english: string;
  vietnamese: string;
  useWhenVi: string;
}

export interface MissionIntent {
  id: string;
  descriptionVi: string;
  required: boolean;
  /** Whether this intent demonstrates interaction rather than only supplying facts. */
  interactional: boolean;
  examples: string[];
  /** Lower-case phrases or regular-expression source strings. */
  matchers: string[];
}

export interface MissionFeedbackRule {
  code: string;
  pattern: string;
  suggestion: string;
  explanationVi: string;
}

export interface MissionRoleplayTurn {
  id: string;
  partnerLine: string;
  partnerLineVi: string;
  expectedIntentIds: string[];
  hintVi: string;
}

export interface MissionCheckpointQuestion {
  id: string;
  questionVi: string;
  options: string[];
  answer: string;
  explanationVi: string;
  evidenceIntentIds: string[];
}

export interface MissionTransferVariant {
  id: string;
  dueAfterDays: 1 | 7 | 30;
  scenarioVi: string;
  changedConditions: string[];
  /** A complete changed dialogue frame, one partner line per mission roleplay turn. */
  partnerLines: string[];
}

export interface MissionSpecV1 {
  schemaVersion: 1;
  id: string;
  lessonId: string;
  titleVi: string;
  canDoVi: string;
  estimatedMinutes: number;
  scenarioVi: string;
  learnerRoleVi: string;
  partnerName: string;
  partnerRoleVi: string;
  targetChunks: MissionChunk[];
  intents: MissionIntent[];
  feedbackRules: MissionFeedbackRule[];
  roleplayTurns: MissionRoleplayTurn[];
  checkpoint: {
    passThreshold: number;
    questions: MissionCheckpointQuestion[];
  };
  evaluation: {
    requiredIntentPassRatio: number;
    maxCorrections: 2;
    pronunciationFromTranscript: false;
  };
  retry: {
    requiredAfterFeedback: true;
    maxAttemptsPerSession: number;
  };
  review: {
    transferAfterDays: readonly [1, 7, 30];
  };
  transferVariants: MissionTransferVariant[];
}

/**
 * Learner-facing mission view — the checkpoint answer key and explanations
 * never enter the client bundle. Correctness data reaches the client only
 * post-submit through `claimMissionCheckpoint`/`revealTrialCheckpointAnswer`.
 * If the spec ever gains another secret-bearing field, strip it here too.
 */
export type MissionLearnerSpecV1 = Omit<MissionSpecV1, "checkpoint">;

export function toLearnerMission(mission: MissionSpecV1): MissionLearnerSpecV1 {
  const { checkpoint: _checkpoint, ...learnerMission } = mission;
  return learnerMission;
}

export function validateMissionSpec(mission: MissionSpecV1): string[] {
  const failures: string[] = [];
  const intentIds = new Set(mission.intents.map((intent) => intent.id));
  const chunkIds = mission.targetChunks.map((chunk) => chunk.id);
  const roleplayIntentIds = mission.roleplayTurns.flatMap(
    (turn) => turn.expectedIntentIds,
  );
  const transferDays = new Set(
    mission.transferVariants.map((variant) => variant.dueAfterDays),
  );
  const checkpointIntentIds = mission.checkpoint.questions.flatMap(
    (question) => question.evidenceIntentIds,
  );

  if (!mission.canDoVi.trim()) failures.push("missing_can_do");
  if (!mission.partnerName.trim()) failures.push("missing_partner_name");
  if (mission.targetChunks.length < 4 || mission.targetChunks.length > 8) {
    failures.push("target_chunks_out_of_range");
  }
  if (new Set(chunkIds).size !== chunkIds.length) {
    failures.push("duplicate_chunk_id");
  }
  if (!mission.intents.some((intent) => intent.required)) {
    failures.push("missing_required_intent");
  }
  if (
    !mission.intents.some((intent) => intent.required && intent.interactional)
  ) {
    failures.push("missing_interactional_intent");
  }
  if (
    mission.roleplayTurns.some((turn) =>
      turn.expectedIntentIds.some((intentId) => !intentIds.has(intentId)),
    )
  ) {
    failures.push("roleplay_references_unknown_intent");
  }
  const requiredIntentIds = mission.intents
    .filter((intent) => intent.required)
    .map((intent) => intent.id);
  if (
    requiredIntentIds.some((intentId) => !roleplayIntentIds.includes(intentId))
  ) {
    failures.push("roleplay_missing_required_intent_evidence");
  }
  if (mission.feedbackRules.length > mission.evaluation.maxCorrections * 3) {
    failures.push("too_many_feedback_rules");
  }
  if (mission.checkpoint.questions.length < 3) {
    failures.push("checkpoint_too_short");
  }
  if (
    mission.checkpoint.passThreshold < 1 ||
    mission.checkpoint.passThreshold > mission.checkpoint.questions.length
  ) {
    failures.push("invalid_checkpoint_threshold");
  }
  if (checkpointIntentIds.some((intentId) => !intentIds.has(intentId))) {
    failures.push("checkpoint_references_unknown_intent");
  }
  if (
    requiredIntentIds.some(
      (intentId) => !checkpointIntentIds.includes(intentId),
    )
  ) {
    failures.push("checkpoint_missing_required_intent_evidence");
  }
  if (mission.evaluation.maxCorrections !== 2) {
    failures.push("feedback_must_be_bounded_to_two_corrections");
  }
  if (mission.evaluation.pronunciationFromTranscript !== false) {
    failures.push("transcript_cannot_score_pronunciation");
  }
  if (!mission.retry.requiredAfterFeedback) {
    failures.push("retry_must_follow_feedback");
  }
  if (!mission.review.transferAfterDays.every((day) => transferDays.has(day))) {
    failures.push("missing_transfer_window");
  }
  if (
    mission.transferVariants.some(
      (variant) => variant.partnerLines.length !== mission.roleplayTurns.length,
    )
  ) {
    failures.push("transfer_turn_count_mismatch");
  }

  return failures;
}
