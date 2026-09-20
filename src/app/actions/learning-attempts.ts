"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { seedUnitVocabToSRS } from "@/app/actions/cards";
import { completeUnit } from "@/app/actions/unit";
import {
  compileLegacyAttemptRpcArgs,
  type LegacyAttemptRpcArgs,
} from "@/lib/learning/legacy-attempt-adapter";
import {
  LearningAttemptBatchSchema,
  type LearningAttemptBatchInput,
} from "@/lib/lessons/learning-attempt";
import {
  TRIAL_CHECKPOINT_QUESTIONS,
  scoreTrialCheckpoint,
} from "@/lib/lessons/trial-checkpoint";
import { GOLD_MISSION_01 } from "@/lib/missions/gold-mission-01";
import { createRateLimiter } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

const attemptLimiter = createRateLimiter(60, 60_000, "learning-attempts");

type RpcError = { message: string } | null;
type RpcClient = {
  rpc: (
    fn: "record_learning_attempt",
    args: LegacyAttemptRpcArgs,
  ) => Promise<{ data: unknown; error: RpcError }>;
};

/**
 * Compatibility boundary for legacy mission/checkpoint callers.
 *
 * The September learning-core migration replaced the old lesson/activity/score table shape with
 * the canonical Attempt → Evidence → LearnerSkillState model and revoked direct authenticated
 * inserts. Legacy callers do not carry enough canonical semantic identity to create trustworthy
 * mastery evidence, so we preserve them as attempt-only history through the canonical RPC.
 */
export async function recordLearningAttempts(input: LearningAttemptBatchInput) {
  const parsed = LearningAttemptBatchSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Dữ liệu lần học không hợp lệ.", inserted: 0 };
  }

  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "127.0.0.1";
  const rateCheck = await attemptLimiter.check(ip);
  if (!rateCheck.success) {
    return {
      success: false as const,
      error: "Quá nhiều lần ghi nhận. Vui lòng thử lại sau.",
      inserted: 0,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false as const, error: "Bạn cần đăng nhập để lưu tiến độ.", inserted: 0 };
  }

  const rpcClient = supabase as unknown as RpcClient;
  let inserted = 0;

  // Compatibility attempts are intentionally evidence-free. Sequential writes make any partial
  // failure explicit to the caller; a partial failure cannot mutate canonical learner state.
  for (const attempt of parsed.data.attempts) {
    const args = compileLegacyAttemptRpcArgs({
      sessionId: parsed.data.sessionId,
      lessonId: parsed.data.lessonId,
      attempt,
    });
    const { error } = await rpcClient.rpc("record_learning_attempt", args);
    if (error) {
      return {
        success: false as const,
        error: `Không thể lưu attempt tương thích (${inserted}/${parsed.data.attempts.length}): ${error.message}`,
        inserted,
      };
    }
    inserted += 1;
  }

  return { success: true as const, inserted };
}

const trialCheckpointClaimSchema = z
  .object({
    sessionId: z.string().uuid(),
    answers: z.record(z.string(), z.string()),
  })
  .strict();

export async function claimTrialCheckpoint(input: unknown) {
  const parsed = trialCheckpointClaimSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Kết quả checkpoint không hợp lệ." };
  }

  const allAnswered = TRIAL_CHECKPOINT_QUESTIONS.every(
    (question) => parsed.data.answers[question.id] !== undefined,
  );
  if (!allAnswered) {
    return {
      success: false as const,
      error: "Bạn cần trả lời đủ ba câu checkpoint.",
    };
  }

  const { correctCount, passed } = scoreTrialCheckpoint(parsed.data.answers);
  const attemptResult = await recordLearningAttempts({
    sessionId: parsed.data.sessionId,
    lessonId: "unit-a0-1",
    attempts: TRIAL_CHECKPOINT_QUESTIONS.map((question) => {
      const correct = parsed.data.answers[question.id] === question.answer;
      return {
        activityId: `unit-a0-1:checkpoint:${question.id}`,
        modality: "checkpoint" as const,
        status: "scored" as const,
        score: correct ? 100 : 0,
        errorTags: correct ? [] : ["answer_mismatch"],
        evaluator: "deterministic-answer-key",
        evaluatorVersion: "1.1.0",
        latencyMs: null,
      };
    }),
  });

  if (!attemptResult.success) return attemptResult;

  if (!passed) {
    return {
      success: true as const,
      passed: false,
      correctCount,
      masteryRecorded: false,
    };
  }

  const completion = await completeUnit(
    "unit-a0-1",
    correctCount === 3 ? 3 : 2,
  );
  if (!completion.success) {
    return {
      success: false as const,
      error: completion.error || "Không thể ghi nhận kết quả checkpoint.",
    };
  }

  // Reuse the existing FSRS deck for communicative chunks after the legacy checkpoint gate passes.
  // This remains separate from canonical capability mastery evidence.
  const reviewSeed = await seedUnitVocabToSRS({
    vocab: GOLD_MISSION_01.targetChunks.map((chunk) => ({
      word: chunk.english,
      phonetic: null,
      meaning_vn: `${chunk.vietnamese} — ${chunk.useWhenVi}`,
      example_en: chunk.english.replace("...", "Minh"),
    })),
    topic: GOLD_MISSION_01.titleVi,
    level: "A0",
  });

  return {
    success: true as const,
    passed: true,
    correctCount,
    masteryRecorded: true,
    reviewTargetsAdded: reviewSeed.success ? reviewSeed.added : 0,
  };
}
