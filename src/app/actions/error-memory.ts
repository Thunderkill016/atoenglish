"use server";

import { headers } from "next/headers";

import {
  ERROR_MEMORY_ATTEMPT_SELECT,
  buildErrorMemory,
  type ErrorMemoryAttemptRow,
} from "@/lib/learning/error-memory";
import { collectPlannerTargetIds } from "@/lib/learning/session-input";
import { nepSessionCatalogV1 } from "@/lib/nep/session-catalog.v1";
import {
  createRateLimiter,
  getClientIpFromHeaders,
} from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

const errorMemoryReadLimiter = createRateLimiter(
  60,
  60 * 1000,
  "error-memory-read",
);

type QueryError = { message: string } | null;
type QueryResult<T> = Promise<{ data: T[] | null; error: QueryError }>;
type ErrorMemoryQuery<T> = {
  select: (columns: string) => ErrorMemoryQuery<T>;
  eq: (column: string, value: string) => ErrorMemoryQuery<T>;
  in: (column: string, values: string[]) => ErrorMemoryQuery<T>;
  order: (
    column: string,
    options: { ascending: boolean },
  ) => ErrorMemoryQuery<T>;
  limit: (count: number) => QueryResult<T>;
};
type ErrorMemoryReadClient = {
  from: <T>(table: string) => ErrorMemoryQuery<T>;
};

/**
 * Read-only authenticated boundary for Error Memory V1.
 * Reads derived structured error metadata only; raw response_text/full metadata are excluded.
 */
export async function getNếpErrorMemory() {
  try {
    const reqHeaders = await headers();
    const ip = getClientIpFromHeaders(reqHeaders);
    const rateLimitCheck = await errorMemoryReadLimiter.check(ip);
    if (!rateLimitCheck.success) {
      return {
        success: false,
        error: "Yêu cầu quá thường xuyên. Vui lòng thử lại sau.",
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để đọc error memory.",
      };
    }

    const targetIds = collectPlannerTargetIds(nepSessionCatalogV1);
    const readClient = supabase as unknown as ErrorMemoryReadClient;
    const result = await readClient
      .from<ErrorMemoryAttemptRow>("learning_attempts")
      .select(ERROR_MEMORY_ATTEMPT_SELECT)
      .eq("user_id", user.id)
      .in("capability_id", targetIds)
      .order("created_at", { ascending: false })
      .limit(200);

    if (result.error) {
      return {
        success: false,
        error: `Không thể đọc error memory: ${result.error.message}`,
      };
    }

    const memory = buildErrorMemory(result.data ?? []);
    return {
      success: true,
      memory,
      diagnostics: {
        attemptCount: result.data?.length ?? 0,
        recurringCount: memory.recurring.length,
        observedCount: memory.observed.length,
        repairedCount: memory.repaired.length,
        rawResponseSelected: false,
        fullMetadataSelected: false,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Lỗi hệ thống khi dựng error memory: ${message}`,
    };
  }
}
