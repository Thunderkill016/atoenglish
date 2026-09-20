"use server";

import { z } from "zod";

import { seedUnitVocabToSRS } from "@/app/actions/cards";
import { recordLearningAttempts } from "@/app/actions/learning-attempts";
import { getMissionForLesson } from "@/lib/missions/mission-catalog";
import { createClient } from "@/lib/supabase/server";

const missionCheckpointClaimSchema = z
  .object({
    sessionId: z.string().uuid(),
    lessonId: z.string().min(1),
    answers: z.record(z.string(), z.string()),
  })
  .strict();

interface TrustedCheckpointResult {
  success: boolean;
  passed: boolean;
  correct_count: number;
  total_count: number;
  mastery_recorded: boolean;
  already_completed?: boolean;
  xp_earned?: number;
  stars?: number;
}

type RpcFn = (
  name: "claim_unit_checkpoint_transaction",
  args: {
    p_user_id: string;
    p_unit_id: string;
    p_answers: Record<string, string>;
  },
) => Promise<{ data: unknown; error: { message: string } | null }>;

export async function claimMissionCheckpoint(input: unknown) {
  const parsed = missionCheckpointClaimSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Kết quả checkpoint không hợp lệ." };
  }

  const mission = getMissionForLesson(parsed.data.lessonId);
  if (!mission) {
    return { success: false as const, error: "Không tìm thấy mission tương ứng." };
  }

  const allAnswered = mission.checkpoint.questions.every(
    (question) => parsed.data.answers[question.id] !== undefined,
  );
  if (!allAnswered) {
    return {
      success: false as const,
      error: "Bạn cần trả lời đủ các câu checkpoint.",
    };
  }

  const attemptResult = await recordLearningAttempts({
    sessionId: parsed.data.sessionId,
    lessonId: mission.lessonId,
    attempts: mission.checkpoint.questions.map((question) => {
      const correct = parsed.data.answers[question.id] === question.answer;
      return {
        activityId: `${mission.lessonId}:checkpoint:${question.id}`,
        modality: "checkpoint" as const,
        status: "scored" as const,
        score: correct ? 100 : 0,
        errorTags: correct ? [] : ["answer_mismatch"],
        evaluator: "deterministic-answer-key",
        evaluatorVersion: "2.1.0",
        latencyMs: null,
      };
    }),
  });

  if (!attemptResult.success) return attemptResult;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false as const, error: "Bạn cần đăng nhập để ghi nhận mastery." };
  }

  const { data, error } = await (supabase.rpc as unknown as RpcFn)(
    "claim_unit_checkpoint_transaction",
    {
      p_user_id: user.id,
      p_unit_id: mission.lessonId,
      p_answers: parsed.data.answers,
    },
  );

  if (error) {
    return {
      success: false as const,
      error: `Không thể xác minh checkpoint: ${error.message}`,
    };
  }

  const trusted = data as TrustedCheckpointResult;
  if (!trusted.passed) {
    return {
      success: true as const,
      passed: false,
      correctCount: trusted.correct_count,
      totalCount: trusted.total_count,
      masteryRecorded: false,
      reviewTargetsAdded: 0,
    };
  }

  const reviewSeed = await seedUnitVocabToSRS({
    vocab: mission.targetChunks.map((chunk) => ({
      word: chunk.english,
      phonetic: null,
      meaning_vn: `${chunk.vietnamese} — ${chunk.useWhenVi}`,
      example_en: chunk.english.replace("...", "Minh"),
    })),
    topic: mission.titleVi,
    level: "A0",
  });

  return {
    success: true as const,
    passed: true,
    correctCount: trusted.correct_count,
    totalCount: trusted.total_count,
    masteryRecorded: trusted.mastery_recorded,
    reviewTargetsAdded: reviewSeed.success ? reviewSeed.added : 0,
  };
}
