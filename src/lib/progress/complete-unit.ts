import { createClient } from "@/lib/supabase/server";
import { rpcService } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";
import { UNIT_VOCABULARY } from "@/lib/constants/vocabulary";
import { UNITS } from "@/lib/constants/units";
import { headers } from "next/headers";
import {
  createRateLimiter,
  getClientIpFromHeaders,
} from "@/lib/security/rate-limit";
import { CompleteUnitSchema } from "@/lib/security/validation";

const completeUnitLimiter = createRateLimiter(10, 60 * 1000, "complete-unit");

const CEFR_LEVEL_ORDER = ["A0", "A1", "A2", "B1", "B2", "C1"] as const;
type CEFRAutoLevel = (typeof CEFR_LEVEL_ORDER)[number];
void CEFR_LEVEL_ORDER;

interface TransactionResult {
  success: boolean;
  already_completed?: boolean;
  xp_earned?: number;
  new_streak?: number;
  new_total_xp?: number;
  completed_count?: number;
  current_level?: string;
  leveled_up?: boolean;
}

/**
 * Internal completion boundary — deliberately NOT a server action. Callers
 * must prove learning evidence before invoking this: the canonical zero-path
 * session runtime verifies session ownership and full submission coverage of
 * the compiled contract, the trial checkpoint scores answers server-side, and
 * mission checkpoints validate against DB-held answer keys. Nothing else may
 * write `user_lesson_progress` rows, so completion count stays evidence-bound.
 *
 * Trusted completion boundary — XP/streak/level compatibility writes go
 * through `complete_unit_transaction` (service_role-only in the database).
 * Stars remain a legacy behavior metric derived by the caller from evaluated
 * outcomes, never a client-supplied performance claim.
 */
export async function completeUnit(unitId: string, starCount: number = 3) {
  try {
    const reqHeaders = await headers();
    const ip = getClientIpFromHeaders(reqHeaders);
    const rateLimitCheck = await completeUnitLimiter.check(ip);
    if (!rateLimitCheck.success) {
      return {
        success: false,
        error: "Yêu cầu quá thường xuyên. Vui lòng thử lại sau.",
      };
    }

    const validated = CompleteUnitSchema.safeParse({ unitId, starCount });
    if (!validated.success) {
      return {
        success: false,
        error: `Dữ liệu không hợp lệ: ${validated.error.issues.map((e) => e.message).join(", ")}`,
      };
    }
    const cleanParams = validated.data;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để hoàn thành chương học.",
      };
    }

    const today = new Date().toLocaleDateString("sv-SE", {
      timeZone: "Asia/Ho_Chi_Minh",
    });

    // Keep the trusted transaction contract intact for now. The database still
    // validates authoritative completion and derives legacy compatibility data.
    const unitDef = UNITS.find((u) => u.id === cleanParams.unitId);
    const BASE_XP = unitDef?.xp ?? 80;
    const xpMultiplier =
      cleanParams.starCount === 3
        ? 1.0
        : cleanParams.starCount === 2
          ? 0.85
          : 0.7;
    const xpEarned = Math.round(BASE_XP * xpMultiplier);

    // complete_unit_transaction is granted to service_role only (hardened XP
    // trust boundary) — invoke it through the owner-side service path, not
    // the user-scoped Data API client.
    const { data: txResult, error: txError } =
      await rpcService<TransactionResult>("complete_unit_transaction", {
        p_user_id: user.id,
        p_unit_id: cleanParams.unitId,
        p_xp_earned: xpEarned,
        p_stars: cleanParams.starCount,
        p_today: today,
      });

    if (txError) {
      return {
        success: false,
        error: `Lỗi giao dịch hoàn thành bài học: ${txError.message}`,
      };
    }

    const resultData = txResult;

    if (resultData.already_completed) {
      return {
        success: true,
        message: "Unit này đã được bạn hoàn thành trước đó.",
        alreadyCompleted: true,
      };
    }

    const nextStreak = resultData.new_streak ?? 1;
    const newLevel = (resultData.current_level || "A0") as CEFRAutoLevel;
    const leveledUp = resultData.leveled_up ?? false;

    const vocabList = UNIT_VOCABULARY[cleanParams.unitId] || [];
    let addedCount = 0;

    if (vocabList.length > 0) {
      const now = new Date().toISOString();
      const cardsToInsert = vocabList.map((vocab) => ({
        user_id: user.id,
        word: vocab.word.toLowerCase().trim(),
        phonetic: vocab.phonetic,
        meaning_vn: vocab.meaning_vn,
        example_en: vocab.example_en,
        topic: vocab.topic,
        level: vocab.level,
        interval: 0,
        repetitions: 0,
        due_date: now,
        state: 0,
        difficulty: 0.0,
        stability: 0.0,
        last_review: null,
        next_review: now,
      }));

      const { data: upserted, error: upsertError } = await supabase
        .from("cards")
        .upsert(cardsToInsert, {
          onConflict: "user_id,word",
          ignoreDuplicates: true,
        })
        .select("id");

      if (!upsertError) addedCount = upserted?.length ?? 0;
    }

    revalidatePath("/learn");
    revalidatePath("/learn");
    revalidatePath("/review");
    revalidatePath("/me/progress");

    return {
      success: true,
      message: "Hoàn thành bài học thành công!",
      xpEarned,
      newStreak: nextStreak,
      newTotalXp: resultData.new_total_xp ?? 0,
      completedCount: resultData.completed_count ?? 1,
      vocabAddedCount: addedCount,
      leveledUp: leveledUp ? newLevel : null,
      newLevel,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Lỗi hệ thống: ${errorMessage}`,
    };
  }
}
