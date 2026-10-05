"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  createRateLimiter,
  getClientIpFromHeaders,
} from "@/lib/security/rate-limit";
import { z } from "zod";
import { quizXpFromPct } from "@/lib/quiz-scoring";

const quizLimiter = createRateLimiter(30, 60 * 1000, "quiz");

const QuizResultSchema = z.object({
  unitId: z.string().min(1).max(20),
  score: z.number().int().min(0),
  total: z.number().int().min(1).max(50),
});

function vnToday(): string {
  return new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

async function awardQuizXp(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  xpDelta: number,
  today: string,
) {
  if (xpDelta <= 0) return;

  const { data: userProgress } = await supabase
    .from("user_progress")
    .select("total_xp, streak, last_active_date")
    .eq("user_id", userId)
    .maybeSingle();

  if (userProgress) {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    const yesterday = d.toLocaleDateString("sv-SE", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
    let nextStreak = 1;
    if (userProgress.last_active_date === today) {
      nextStreak = userProgress.streak;
    } else if (userProgress.last_active_date === yesterday) {
      nextStreak = userProgress.streak + 1;
    }
    await supabase
      .from("user_progress")
      .update({
        total_xp: userProgress.total_xp + xpDelta,
        streak: nextStreak,
        last_active_date: today,
      })
      .eq("user_id", userId);
  } else {
    await supabase.from("user_progress").insert({
      user_id: userId,
      current_level: "A0",
      streak: 1,
      total_xp: xpDelta,
      last_active_date: today,
    });
  }
}

/**
 * Server Action: lưu kết quả quiz từ vựng và thưởng XP theo điểm số.
 * Một dòng mỗi (user, unit, VN-day); làm lại có thể cải thiện điểm/XP.
 */
export async function saveQuizResult(params: {
  unitId: string;
  score: number;
  total: number;
}) {
  try {
    const reqHeaders = await headers();
    const ip = getClientIpFromHeaders(reqHeaders);
    const rateLimitCheck = await quizLimiter.check(ip);
    if (!rateLimitCheck.success) {
      return { success: false, error: "Yêu cầu quá thường xuyên." };
    }

    const validated = QuizResultSchema.safeParse(params);
    if (!validated.success) {
      return { success: false, error: "Dữ liệu không hợp lệ." };
    }
    const clean = validated.data;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Bạn cần đăng nhập." };
    }

    const pct = Math.round((clean.score / clean.total) * 100);
    const xpForAttempt = quizXpFromPct(pct);
    const today = vnToday();

    const { data: existing } = await supabase
      .from("quiz_results")
      .select("score, total, pct, xp_earned")
      .eq("user_id", user.id)
      .eq("unit_id", clean.unitId)
      .eq("quiz_date", today)
      .maybeSingle();

    if (existing) {
      const bestScore = Math.max(existing.score, clean.score);
      const bestPct = Math.round((bestScore / clean.total) * 100);
      const bestXp = Math.max(existing.xp_earned, quizXpFromPct(bestPct));
      const xpDelta = bestXp - existing.xp_earned;
      const improved = bestScore > existing.score || xpDelta > 0;

      if (!improved) {
        return {
          success: true,
          xpEarned: 0,
          pct: existing.pct,
          alreadyRecorded: true,
        };
      }

      const { error: updateError } = await supabase
        .from("quiz_results")
        .update({
          score: bestScore,
          total: clean.total,
          pct: bestPct,
          xp_earned: bestXp,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("unit_id", clean.unitId)
        .eq("quiz_date", today);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      await awardQuizXp(supabase, user.id, xpDelta, today);

      revalidatePath("/learn");
      revalidatePath("/quiz");
      revalidatePath("/me/progress");

      return { success: true, xpEarned: xpDelta, pct: bestPct };
    }

    const { error: insertError } = await supabase.from("quiz_results").insert({
      user_id: user.id,
      unit_id: clean.unitId,
      score: clean.score,
      total: clean.total,
      pct,
      xp_earned: xpForAttempt,
      quiz_date: today,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        const { data: raced } = await supabase
          .from("quiz_results")
          .select("score, pct, xp_earned")
          .eq("user_id", user.id)
          .eq("unit_id", clean.unitId)
          .eq("quiz_date", today)
          .maybeSingle();

        return {
          success: true,
          xpEarned: 0,
          pct: raced?.pct ?? pct,
          alreadyRecorded: true,
        };
      }
      return { success: false, error: insertError.message };
    }

    await awardQuizXp(supabase, user.id, xpForAttempt, today);

    revalidatePath("/learn");
    revalidatePath("/quiz");
    revalidatePath("/me/progress");

    return { success: true, xpEarned: xpForAttempt, pct };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
