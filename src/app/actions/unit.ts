"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { UNIT_VOCABULARY } from "@/lib/constants/vocabulary";
import { UNITS } from "@/lib/constants/units";
import {
  getNextUnitFromProgress,
  getNextUnitRoute,
} from "@/lib/placement/starting-unit";
/**
 * Server Action lấy trạng thái hoàn thành của một unit cụ thể.
 */
export async function getUnitCompletionStatus(unitId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, completed: false };
    }

    const { data, error } = await supabase
      .from("user_lesson_progress")
      .select("id, completed_at, xp_earned")
      .eq("user_id", user.id)
      .eq("unit_id", unitId)
      .maybeSingle();

    if (error) {
      return { success: false, completed: false };
    }

    return {
      success: true,
      completed: !!data,
      completedAt: data?.completed_at || null,
      xpEarned: data?.xp_earned || 0,
    };
  } catch {
    return { success: false, completed: false };
  }
}

/**
 * Bulk version of getUnitCompletionStatus — fetches ALL completed units
 * for the current user in a single DB query instead of N queries.
 * Returns a Map<unitId, { completedAt, xpEarned }> for O(1) lookups.
 */
export async function getAllUnitCompletionStatuses(): Promise<{
  success: boolean;
  completedMap: Map<string, { completedAt: string | null; xpEarned: number }>;
}> {
  const emptyResult = {
    success: false,
    completedMap: new Map<
      string,
      { completedAt: string | null; xpEarned: number }
    >(),
  };
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return emptyResult;

    const { data, error } = await supabase
      .from("user_lesson_progress")
      .select("unit_id, completed_at, xp_earned")
      .eq("user_id", user.id);

    if (error) return emptyResult;

    const completedMap = new Map<
      string,
      { completedAt: string | null; xpEarned: number }
    >();
    for (const row of data ?? []) {
      if (row.unit_id) {
        completedMap.set(row.unit_id, {
          completedAt: row.completed_at ?? null,
          xpEarned: row.xp_earned ?? 0,
        });
      }
    }
    return { success: true, completedMap };
  } catch {
    return emptyResult;
  }
}

/**
 * Server Action lấy số lượng unit đã hoàn thành của user.
 */
export async function getCompletedUnitsCount() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, count: 0 };
    }

    const { count, error } = await supabase
      .from("user_lesson_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (error) {
      return { success: false, count: 0 };
    }
    return { success: true, count: count || 0 };
  } catch {
    return { success: false, count: 0 };
  }
}

/**
 * Server Action reset toàn bộ tiến trình của một unit (xóa progress và cards SRS liên quan).
 */
export async function resetUnitProgress(unitId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để reset tiến trình.",
      };
    }

    // user_lesson_progress writes are revoked from the authenticated role
    // (ATO-004) — reset goes through the auth_uid-bound SECURITY DEFINER RPC.
    const { error: deleteProgressError } = await supabase.rpc(
      "reset_unit_progress",
      { p_unit_id: unitId },
    );

    if (deleteProgressError) {
      return {
        success: false,
        error: `Lỗi khi xóa tiến trình: ${deleteProgressError.message}`,
      };
    }

    const vocabList = UNIT_VOCABULARY[unitId] || [];
    if (vocabList.length > 0) {
      const wordList = vocabList.map((v) => v.word.toLowerCase().trim());
      await supabase
        .from("cards")
        .delete()
        .eq("user_id", user.id)
        .in("word", wordList);
    }

    revalidatePath("/learn");
    revalidatePath("/learn");
    revalidatePath("/review");

    return {
      success: true,
      message: `Đã reset thành công toàn bộ tiến trình bài học ${unitId}.`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Lỗi hệ thống: ${errorMessage}`,
    };
  }
}

/**
 * Server Action lấy thông tin Unit đang học hiện tại của người dùng.
 * Selection uses getNextUnitFromProgress + getNextUnitRoute so ContinueCard always gets canonical next full lesson route (unify w/ roadmap, no ?mini).
 */
export async function getCurrentUnit() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const u1 = UNITS[0];
      return {
        success: true,
        unitId: u1.id,
        title: u1.title,
        description: u1.description,
        currentPhase: "Pha 1: Input",
        progress: 0,
        completed: false,
        route: u1.route,
      };
    }

    const allWords = UNITS.flatMap((unit) =>
      (UNIT_VOCABULARY[unit.id] || []).map((v) => v.word.toLowerCase().trim()),
    );

    const [progressRes, completedRes, cardsRes] = await Promise.all([
      supabase
        .from("user_progress")
        .select("starting_unit_index")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("user_lesson_progress")
        .select("unit_id")
        .eq("user_id", user.id),
      supabase
        .from("cards")
        .select("word")
        .eq("user_id", user.id)
        .in("word", allWords),
    ]);

    if (completedRes.error) {
      return {
        success: false,
        error: `Lỗi truy vấn database: ${completedRes.error.message}`,
      };
    }

    const completedUnitIds = completedRes.data?.map((l) => l.unit_id) || [];
    const savedWords = new Set(
      cardsRes.data?.map((c) => c.word.toLowerCase().trim()) || [],
    );
    const startingUnitIndex = progressRes.data?.starting_unit_index ?? 0;

    const unitStatuses = UNITS.map((unit) => {
      const isCompleted = completedUnitIds.includes(unit.id);
      const vocab = UNIT_VOCABULARY[unit.id] || [];
      const savedCount = vocab.filter((v) =>
        savedWords.has(v.word.toLowerCase().trim()),
      ).length;

      let progress = 0;
      let phase = "Pha 1: Input";
      if (vocab.length > 0 && savedCount > 0) {
        if (savedCount < vocab.length) {
          progress = 40;
          phase = "Pha 2: Processing";
        } else {
          progress = 75;
          phase = "Pha 3: Output";
        }
      }

      return {
        unitId: unit.id,
        title: unit.title,
        description: unit.description,
        currentPhase: isCompleted ? "Hoàn thành" : phase,
        progress: isCompleted ? 100 : progress,
        completed: isCompleted,
        route: unit.route,
      };
    });

    const nextMeta = getNextUnitFromProgress(
      completedUnitIds,
      startingUnitIndex,
    );
    const canonicalRoute = getNextUnitRoute(
      completedUnitIds,
      startingUnitIndex,
    );
    let activeUnit = nextMeta
      ? unitStatuses.find((u) => u.unitId === nextMeta.id)
      : undefined;
    if (!activeUnit) {
      activeUnit = unitStatuses.find((u) => !u.completed);
    }
    if (!activeUnit) activeUnit = unitStatuses[unitStatuses.length - 1];

    const route = canonicalRoute || activeUnit?.route || "/learn";
    return {
      success: true,
      ...(activeUnit || {}),
      route,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Lỗi hệ thống: ${errorMessage}`,
    };
  }
}
