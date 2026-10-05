"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Server Action lấy thông tin tiến trình tổng thể của người dùng (streak, XP, level).
 */
export async function getUserProgress() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để lấy thông tin tiến trình.",
      };
    }
    const { data, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return { success: false, error: `Lỗi truy vấn: ${error.message}` };
    }

    // display_name: dùng user_metadata (Auth) — không query bảng users không tồn tại
    const displayName =
      user.user_metadata?.display_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Học viên";

    return {
      success: true,
      progress: {
        user_id: user.id,
        current_level: data?.current_level || "A0",
        starting_unit_index: data?.starting_unit_index ?? 0,
        placement_completed_at: data?.placement_completed_at ?? null,
        streak: data?.streak || 0,
        total_xp: data?.total_xp || 0,
        last_active_date: data?.last_active_date || null,
        daily_xp_goal: data?.daily_xp_goal ?? 50,
        display_name: displayName,
      },
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return { success: false, error: errMsg };
  }
}

/**
 * Server Action cập nhật mục tiêu XP hàng ngày của người dùng.
 * P3-5 Fix: daily_xp_goal is localStorage-only (no DB column) — validate + return.
 * The client persists the goal in localStorage; no DB round-trip needed.
 */
export async function updateDailyXpGoal(goal: number) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để cập nhật mục tiêu XP.",
      };
    }

    const validGoals = [30, 50, 80, 100];
    if (!validGoals.includes(goal)) {
      return { success: false, error: "Mục tiêu XP không hợp lệ." };
    }

    // Goal is stored in localStorage by the client — no DB write needed.
    return {
      success: true,
      message: `Đã cập nhật mục tiêu XP hàng ngày thành ${goal} XP.`,
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return { success: false, error: errMsg };
  }
}

/**
 * Lấy dữ liệu XP theo 7 ngày gần nhất từ user_lesson_progress.
 */
export async function getWeeklyXpData() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, data: [] };

    const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const days: { day: string; label: string; xp: number; pct: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("sv-SE", {
        timeZone: "Asia/Ho_Chi_Minh",
      });
      days.push({ day: dateStr, label: dayLabels[d.getDay()], xp: 0, pct: 0 });
    }

    const startDate = days[0].day;
    // +07:00 so Postgres interprets startDate as VN midnight, not UTC midnight
    const startUtc = startDate + "T00:00:00+07:00";

    // Fetch lesson XP and speaking sessions in parallel
    const [lessonsRes, speakingRes] = await Promise.all([
      supabase
        .from("user_lesson_progress")
        .select("xp_earned, completed_at")
        .eq("user_id", user.id)
        .gte("completed_at", startUtc),
      supabase
        .from("speaking_sessions")
        .select("practice_type, created_at")
        .eq("user_id", user.id)
        .gte("created_at", startUtc),
    ]);

    // Add lesson XP per day
    if (!lessonsRes.error && lessonsRes.data) {
      for (const row of lessonsRes.data) {
        const rowDate = new Date(row.completed_at).toLocaleDateString("sv-SE", {
          timeZone: "Asia/Ho_Chi_Minh",
        });
        const day = days.find((d) => d.day === rowDate);
        if (day) day.xp += row.xp_earned || 0;
      }
    }

    // Add speaking XP per day (estimated from practice_type)
    const SPEAKING_XP: Record<string, number> = {
      shadowing: 5,
      roleplay: 8,
      journal: 5,
    };
    if (!speakingRes.error && speakingRes.data) {
      for (const row of speakingRes.data) {
        const rowDate = new Date(row.created_at).toLocaleDateString("sv-SE", {
          timeZone: "Asia/Ho_Chi_Minh",
        });
        const day = days.find((d) => d.day === rowDate);
        if (day) day.xp += SPEAKING_XP[row.practice_type] ?? 5;
      }
    }

    const maxXp = Math.max(...days.map((d) => d.xp), 1);
    return {
      success: true,
      data: days.map((d) => ({ ...d, pct: Math.round((d.xp / maxXp) * 100) })),
    };
  } catch {
    return { success: false, data: [] };
  }
}

/**
 * Lấy thống kê tổng hợp cho trang Progress.
 */
export async function getProgressStats() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, stats: null };

    const [progressRes, cardsRes, completedRes, speakingRes] =
      await Promise.all([
        supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase.from("cards").select("state").eq("user_id", user.id),
        supabase
          .from("user_lesson_progress")
          .select("unit_id", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("speaking_sessions")
          .select("id", { count: "exact" })
          .eq("user_id", user.id),
      ]);

    const progress = progressRes.data;
    const cards = cardsRes.data || [];
    const totalCards = cards.length;
    const cardsByState = {
      new: cards.filter((c) => c.state === 0).length,
      learning: cards.filter((c) => c.state === 1).length,
      review: cards.filter((c) => c.state === 2).length,
      relearning: cards.filter((c) => c.state === 3).length,
    };

    return {
      success: true,
      stats: {
        totalXp: progress?.total_xp || 0,
        streak: progress?.streak || 0,
        bestStreak: progress?.best_streak || 0,
        currentLevel: progress?.current_level || "A0",
        placementCompletedAt:
          (progress as { placement_completed_at?: string | null } | null)
            ?.placement_completed_at ?? null,
        totalCards,
        cardsByState,
        completedUnits: completedRes.count || 0,
        totalSpeakingSessions: speakingRes.count || 0,
        streakFreezeCount:
          (progress as { streak_freeze_count?: number } | null)
            ?.streak_freeze_count ?? 0,
      },
    };
  } catch {
    return { success: false, stats: null };
  }
}

export interface DayActivity {
  date: string; // YYYY-MM-DD (VN timezone)
  xp: number;
  level: 0 | 1 | 2 | 3 | 4; // 0=none, 1-4=intensity
}

/**
 * S5-2: Activity Heatmap — returns 364 days of XP data (52 complete weeks)
 * aggregated per day, in VN timezone.
 */
export async function getDailyActivity(): Promise<{
  success: boolean;
  days: DayActivity[];
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, days: [] };

    // Build 364-day window (52 weeks, starting on the Monday 51 weeks ago)
    const today = new Date();
    const todayVN = today.toLocaleDateString("sv-SE", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
    // Start from 363 days ago
    const startD = new Date(today);
    startD.setDate(startD.getDate() - 363);
    const startDate = startD.toLocaleDateString("sv-SE", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
    const startUtc = startDate + "T00:00:00+07:00";

    // Fetch lessons + speaking in parallel
    const [lessonsRes, speakingRes] = await Promise.all([
      supabase
        .from("user_lesson_progress")
        .select("xp_earned, completed_at")
        .eq("user_id", user.id)
        .gte("completed_at", startUtc),
      supabase
        .from("speaking_sessions")
        .select("practice_type, created_at")
        .eq("user_id", user.id)
        .gte("created_at", startUtc),
    ]);

    // Aggregate XP per day
    const xpMap: Record<string, number> = {};
    const SPEAKING_XP: Record<string, number> = {
      shadowing: 5,
      roleplay: 8,
      journal: 5,
    };

    if (!lessonsRes.error && lessonsRes.data) {
      for (const row of lessonsRes.data) {
        const d = new Date(row.completed_at).toLocaleDateString("sv-SE", {
          timeZone: "Asia/Ho_Chi_Minh",
        });
        xpMap[d] = (xpMap[d] ?? 0) + (row.xp_earned || 0);
      }
    }
    if (!speakingRes.error && speakingRes.data) {
      for (const row of speakingRes.data) {
        const d = new Date(row.created_at).toLocaleDateString("sv-SE", {
          timeZone: "Asia/Ho_Chi_Minh",
        });
        xpMap[d] = (xpMap[d] ?? 0) + (SPEAKING_XP[row.practice_type] ?? 5);
      }
    }

    // Compute intensity thresholds from non-zero days
    const xpValues = Object.values(xpMap).filter((x) => x > 0);
    const p25 = xpValues.length
      ? (xpValues.sort((a, b) => a - b)[Math.floor(xpValues.length * 0.25)] ??
        1)
      : 30;
    const p50 = xpValues.length
      ? (xpValues[Math.floor(xpValues.length * 0.5)] ?? 1)
      : 60;
    const p75 = xpValues.length
      ? (xpValues[Math.floor(xpValues.length * 0.75)] ?? 1)
      : 100;

    // Build 364-day array
    const days: DayActivity[] = [];
    for (let i = 363; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("sv-SE", {
        timeZone: "Asia/Ho_Chi_Minh",
      });
      if (dateStr > todayVN) continue;
      const xp = xpMap[dateStr] ?? 0;
      const level =
        xp === 0 ? 0 : xp <= p25 ? 1 : xp <= p50 ? 2 : xp <= p75 ? 3 : 4;
      days.push({ date: dateStr, xp, level: level as DayActivity["level"] });
    }

    return { success: true, days };
  } catch {
    return { success: false, days: [] };
  }
}

export type TodayMissionFlags = {
  srsReviewedToday: boolean;
  quizDoneToday: boolean;
  speakingDoneToday: boolean;
  lessonCompletedToday: boolean;
  lessonCompletedOnCurrentUnit: boolean;
};

/**
 * Server-side completion flags for daily missions (no localStorage).
 */
export async function getTodayMissionFlags(
  currentUnitId: string,
): Promise<{ success: boolean; flags: TodayMissionFlags }> {
  const empty: TodayMissionFlags = {
    srsReviewedToday: false,
    quizDoneToday: false,
    speakingDoneToday: false,
    lessonCompletedToday: false,
    lessonCompletedOnCurrentUnit: false,
  };

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, flags: empty };

    const today = new Date().toLocaleDateString("sv-SE", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
    const startUtc = `${today}T00:00:00+07:00`;

    const [flashcardRes, quizRes, speakingRes, lessonsRes] = await Promise.all([
      supabase
        .from("user_flashcard_progress")
        .select("last_session_date, cards_reviewed_today")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("quiz_results")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("quiz_date", today),
      supabase
        .from("speaking_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", startUtc),
      supabase
        .from("user_lesson_progress")
        .select("unit_id, completed_at")
        .eq("user_id", user.id)
        .gte("completed_at", startUtc),
    ]);

    const flashcard = flashcardRes.data;
    const lessonsToday = lessonsRes.data ?? [];

    return {
      success: true,
      flags: {
        srsReviewedToday:
          flashcard?.last_session_date === today &&
          (flashcard.cards_reviewed_today ?? 0) > 0,
        quizDoneToday: (quizRes.count ?? 0) > 0,
        speakingDoneToday: (speakingRes.count ?? 0) > 0,
        lessonCompletedToday: lessonsToday.length > 0,
        lessonCompletedOnCurrentUnit: lessonsToday.some(
          (row) => row.unit_id === currentUnitId,
        ),
      },
    };
  } catch {
    return { success: false, flags: empty };
  }
}

/**
 * Server Action đọc hồ sơ onboarding (goal, obstacle, daily_minutes) từ user_onboarding_profile.
 * Dùng cho dashboard/settings personalization. Null nếu chưa có (legacy user).
 * Pattern: getUserProgress.
 */
export async function getOnboardingProfile() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: true, profile: null };
    }

    const { data, error } = await supabase
      .from("user_onboarding_profile")
      .select("goal, obstacle, daily_minutes, created_at, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return { success: false, error: `Lỗi truy vấn: ${error.message}` };
    }

    if (!data) {
      return { success: true, profile: null };
    }

    return {
      success: true,
      profile: {
        goal: data.goal,
        obstacle: data.obstacle,
        daily_minutes: data.daily_minutes,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return { success: false, error: errMsg };
  }
}

export type OnboardingProfile = {
  goal: string;
  obstacle: string;
  daily_minutes: number;
  created_at?: string;
  updated_at?: string;
};
