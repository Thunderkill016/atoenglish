"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  createRateLimiter,
  getClientIpFromHeaders,
} from "@/lib/security/rate-limit";
import { RecordFlashcardSessionSchema } from "@/lib/security/validation";
import type { Database } from "@/types/supabase";

const flashcardWriteLimiter = createRateLimiter(
  20,
  60 * 1000,
  "flashcard-session",
);

// Use auto-generated types — no more `as any` casts
type FlashcardProgressRow =
  Database["public"]["Tables"]["user_flashcard_progress"]["Row"];
type FlashcardProgressInsert =
  Database["public"]["Tables"]["user_flashcard_progress"]["Insert"];

export type FlashcardStats = Pick<
  FlashcardProgressRow,
  | "cards_reviewed_today"
  | "total_cards_reviewed"
  | "total_sessions"
  | "streak_days"
  | "best_streak"
  | "last_session_at"
>;

const EMPTY_STATS: FlashcardStats = {
  cards_reviewed_today: 0,
  total_cards_reviewed: 0,
  total_sessions: 0,
  streak_days: 0,
  best_streak: 0,
  last_session_at: null,
};

/**
 * Lấy thống kê flashcard của user hiện tại.
 * Trả về zeros nếu chưa có record.
 */
export async function getFlashcardStats(): Promise<{
  success: boolean;
  stats?: FlashcardStats;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthenticated" };

  const { data, error } = await supabase
    .from("user_flashcard_progress")
    .select(
      "cards_reviewed_today, total_cards_reviewed, total_sessions, streak_days, best_streak, last_session_at",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  if (!data) return { success: true, stats: EMPTY_STATS };

  return { success: true, stats: data };
}

/**
 * Ghi nhận 1 session flashcard hoàn thành.
 * Tự động tính streak (liên tiếp ngày, reset nếu bỏ ngày).
 */
export async function recordFlashcardSession(
  cardsReviewed: number,
): Promise<{ success: boolean; stats?: FlashcardStats; error?: string }> {
  // Rate limiting
  const ip = getClientIpFromHeaders(await headers());
  const rateLimitCheck = await flashcardWriteLimiter.check(ip);
  if (!rateLimitCheck.success)
    return { success: false, error: "Tốc độ quá giới hạn." };

  // Input validation
  const validated = RecordFlashcardSessionSchema.safeParse({ cardsReviewed });
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
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthenticated" };

  // Use Vietnam timezone consistently — UTC dates cause off-by-one at night
  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
  const d = new Date(today);
  d.setDate(d.getDate() - 1);
  const yesterday = d.toLocaleDateString("sv-SE", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

  // Fetch existing row
  const { data: existing } = await supabase
    .from("user_flashcard_progress")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const lastDate = existing?.last_session_date ?? null;

  // Streak logic
  let newStreak: number;
  if (!lastDate || !existing) {
    newStreak = 1; // First session ever
  } else if (lastDate === today) {
    newStreak = existing.streak_days; // Same day — keep streak
  } else if (lastDate === yesterday) {
    newStreak = existing.streak_days + 1; // Consecutive day
  } else {
    newStreak = 1; // Gap > 1 day — reset
  }

  const isNewDay = lastDate !== today;

  const upsertData: FlashcardProgressInsert = {
    user_id: user.id,
    cards_reviewed_today: isNewDay
      ? cleanParams.cardsReviewed
      : (existing?.cards_reviewed_today ?? 0) + cleanParams.cardsReviewed,
    total_cards_reviewed:
      (existing?.total_cards_reviewed ?? 0) + cleanParams.cardsReviewed,
    total_sessions: (existing?.total_sessions ?? 0) + 1,
    streak_days: newStreak,
    best_streak: Math.max(newStreak, existing?.best_streak ?? 0),
    last_session_date: today,
    last_session_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("user_flashcard_progress")
    .upsert(upsertData, { onConflict: "user_id" })
    .select(
      "cards_reviewed_today, total_cards_reviewed, total_sessions, streak_days, best_streak, last_session_at",
    )
    .single();

  if (error) return { success: false, error: error.message };

  // Sync user_progress.last_active_date + streak so flashcard-only days
  // count toward the dashboard streak (best-effort, fire-and-forget)
  void (async () => {
    const { data: up } = await supabase
      .from("user_progress")
      .select("total_xp, streak, last_active_date")
      .eq("user_id", user.id)
      .maybeSingle();
    if (up) {
      let nextStreak = 1;
      if (up.last_active_date === today) {
        nextStreak = up.streak;
      } else if (up.last_active_date === yesterday) {
        nextStreak = up.streak + 1;
      }
      await supabase
        .from("user_progress")
        .update({ streak: nextStreak, last_active_date: today })
        .eq("user_id", user.id);
    } else {
      await supabase.from("user_progress").insert({
        user_id: user.id,
        current_level: "A0",
        streak: 1,
        total_xp: 0,
        last_active_date: today,
      });
    }
  })();

  return { success: true, stats: data };
}
