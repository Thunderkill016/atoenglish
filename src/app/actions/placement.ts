"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  createRateLimiter,
  getClientIpFromHeaders,
} from "@/lib/security/rate-limit";
import {
  getPlacementLearnPath,
  getStartingUnitIndex,
  getStartingUnitSlug,
  normalizePlacementLevel,
} from "@/lib/placement/starting-unit";
import { TOTAL_QUESTIONS } from "@/lib/data/placement-test";

const placementLimiter = createRateLimiter(3, 60 * 60 * 1000, "placement-test");

type PlacementSource = "test" | "self-select";

export type PlacementSaveResult =
  | {
      success: true;
      message: string;
      level: string;
      startingUnitIndex: number;
      learnPath: string;
    }
  | { success: false; error: string };

async function persistPlacementLevel(
  level: string,
  score: number,
  source: PlacementSource,
): Promise<PlacementSaveResult> {
  const cefr = normalizePlacementLevel(level);
  if (!cefr) {
    return { success: false as const, error: "Trình độ không hợp lệ." };
  }

  if (
    typeof score !== "number" ||
    score < 0 ||
    score > TOTAL_QUESTIONS ||
    !Number.isFinite(score)
  ) {
    return { success: false as const, error: "Điểm số không hợp lệ." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false as const, error: "Bạn cần đăng nhập." };
  }

  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
  const startingUnitIndex = getStartingUnitIndex(cefr);
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("user_progress")
    .select("user_id, total_xp, streak")
    .eq("user_id", user.id)
    .maybeSingle();

  const basePayload = {
    current_level: cefr,
    starting_unit_index: startingUnitIndex,
    placement_completed_at: now,
    last_active_date: today,
  };

  if (existing) {
    const { error } = await supabase
      .from("user_progress")
      .update(basePayload)
      .eq("user_id", user.id);

    if (error) {
      return {
        success: false as const,
        error: `Lỗi lưu kết quả: ${error.message}`,
      };
    }
  } else {
    const seedXp = source === "test" && score > 0 ? Math.round(score * 5) : 0;
    const { error } = await supabase.from("user_progress").insert({
      user_id: user.id,
      ...basePayload,
      total_xp: seedXp,
      streak: 0,
    });

    if (error) {
      return {
        success: false as const,
        error: `Lỗi lưu kết quả: ${error.message}`,
      };
    }
  }

  revalidatePath("/learn");
  revalidatePath("/learn");
  revalidatePath("/roadmap");

  return {
    success: true,
    message: `Đã đặt trình độ ${cefr} — bắt đầu từ ${getStartingUnitSlug(cefr)}.`,
    level: cefr,
    startingUnitIndex,
    learnPath: getPlacementLearnPath(cefr, false),
  } satisfies PlacementSaveResult;
}

/** Save scored placement test result and unlock curriculum from matching level. */
export async function savePlacementResult(
  level: string,
  score: number,
): Promise<PlacementSaveResult> {
  try {
    const reqHeaders = await headers();
    const ip = getClientIpFromHeaders(reqHeaders);
    const rateLimitCheck = await placementLimiter.check(ip);
    if (!rateLimitCheck.success) {
      return {
        success: false,
        error: "Vui lòng chờ trước khi làm lại test.",
      } satisfies PlacementSaveResult;
    }

    return await persistPlacementLevel(level, score, "test");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg } satisfies PlacementSaveResult;
  }
}

/** Self-select level without taking the full test (quick path). */
export async function setPlacementLevel(
  level: string,
): Promise<PlacementSaveResult> {
  try {
    const reqHeaders = await headers();
    const ip = getClientIpFromHeaders(reqHeaders);
    const rateLimitCheck = await placementLimiter.check(ip);
    if (!rateLimitCheck.success) {
      return {
        success: false,
        error: "Vui lòng chờ trước khi thử lại.",
      } satisfies PlacementSaveResult;
    }

    return await persistPlacementLevel(level, 0, "self-select");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg } satisfies PlacementSaveResult;
  }
}
