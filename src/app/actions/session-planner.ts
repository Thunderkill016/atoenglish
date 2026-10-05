"use server";

import { headers } from "next/headers";

import {
  ERROR_MEMORY_ATTEMPT_SELECT,
  buildErrorMemory,
  type ErrorMemoryAttemptRow,
} from "@/lib/learning/error-memory";
import { LEARNER_STATE_MODEL_VERSION } from "@/lib/learning/learner-state-read";
import {
  buildLearnerEvidenceCoverage,
  collectPlannerTargetIds,
  deriveRecentPlannerHistory,
  mapLearnerSkillStateRow,
  normalizeSessionSize,
  PLANNER_RECENT_ATTEMPT_SELECT,
  PLANNER_SKILL_STATE_SELECT,
  type LearnerEvidenceCoverageRow,
  type LearnerSkillStateRow,
  type RecentLearningAttemptRow,
} from "@/lib/learning/session-input";
import { planSession, type SessionPlan } from "@/lib/learning/session-planner";
import {
  resolveNếpPlannedPractice,
  type NếpPracticeEnvelope,
} from "@/lib/nep/practice-execution.v1";
import { nepSessionCatalogV1 } from "@/lib/nep/session-catalog.v1";
import {
  createRateLimiter,
  getClientIpFromHeaders,
} from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

const plannerReadLimiter = createRateLimiter(
  90,
  60 * 1000,
  "session-planner-read",
);

type QueryError = { message: string } | null;
type QueryResult<T> = Promise<{ data: T[] | null; error: QueryError }>;

type PlannerQuery<T> = {
  select: (columns: string) => PlannerQuery<T>;
  eq: (column: string, value: string) => PlannerQuery<T>;
  in: (column: string, values: string[]) => PlannerQuery<T>;
  order: (column: string, options: { ascending: boolean }) => PlannerQuery<T>;
  limit: (count: number) => QueryResult<T>;
};

type PlannerReadClient = {
  from: <T>(table: string) => PlannerQuery<T>;
  rpc: <T>(
    functionName: string,
    args: Record<string, unknown>,
  ) => QueryResult<T>;
};

export type GetNếpSessionPlanInput = {
  sessionSize?: number;
};

export type GetNếpSessionPlanResult =
  | {
      success: false;
      error: string;
    }
  | {
      success: true;
      plan: SessionPlan;
      practices: NếpPracticeEnvelope[];
      diagnostics: {
        sessionSize: number;
        catalogSize: number;
        practiceEnvelopeCount: number;
        stateCount: number;
        evidenceCoverageRowCount: number;
        learnerStateModelVersion: typeof LEARNER_STATE_MODEL_VERSION;
        learnerStateConfidenceCalibrated: false;
        recentAttemptCount: number;
        errorMemoryAttemptCount: number;
        recurringErrorCount: number;
        rawResponseSelected: false;
        fullMetadataSelected: false;
        hiddenEvaluatorTargetsExposedInPractices: false;
      };
    };

/**
 * Read-only authenticated boundary for Session Planner V1.
 * It deliberately selects no raw response/transcript content and does not mutate learner state.
 * Alongside diagnostic planner data it returns learner-safe practice envelopes whose hidden
 * evaluator targets/evidence metadata have been stripped by the canonical execution compiler.
 */
export async function getNếpSessionPlan(
  input: GetNếpSessionPlanInput = {},
): Promise<GetNếpSessionPlanResult> {
  try {
    const reqHeaders = await headers();
    const ip = getClientIpFromHeaders(reqHeaders);
    const rateLimitCheck = await plannerReadLimiter.check(ip);
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
        error: "Bạn cần đăng nhập để tạo session học thích ứng.",
      };
    }

    const sessionSize = normalizeSessionSize(
      typeof input.sessionSize === "number" ? input.sessionSize : undefined,
    );
    const targetIds = collectPlannerTargetIds(nepSessionCatalogV1);
    const readClient = supabase as unknown as PlannerReadClient;

    const stateQuery = readClient
      .from<LearnerSkillStateRow>("learner_skill_states")
      .select(PLANNER_SKILL_STATE_SELECT)
      .eq("user_id", user.id)
      .in("target_id", targetIds)
      .limit(100);

    // Aggregate coverage comes from append-only evidence history, not the EMA routing snapshot.
    const evidenceCoverageQuery = readClient.rpc<LearnerEvidenceCoverageRow>(
      "get_learner_evidence_coverage",
      { p_target_ids: targetIds },
    );

    // Recent attempts are exposure history only. Project semantic planner keys, not raw content.
    const recentAttemptQuery = readClient
      .from<RecentLearningAttemptRow>("learning_attempts")
      .select(PLANNER_RECENT_ATTEMPT_SELECT)
      .eq("user_id", user.id)
      .in("capability_id", targetIds)
      .order("created_at", { ascending: false })
      .limit(40);

    // Error memory needs a wider history window, but still only derived structured metadata.
    const errorMemoryQuery = readClient
      .from<ErrorMemoryAttemptRow>("learning_attempts")
      .select(ERROR_MEMORY_ATTEMPT_SELECT)
      .eq("user_id", user.id)
      .in("capability_id", targetIds)
      .order("created_at", { ascending: false })
      .limit(200);

    const [
      stateResult,
      evidenceCoverageResult,
      recentAttemptResult,
      errorMemoryResult,
    ] = await Promise.all([
      stateQuery,
      evidenceCoverageQuery,
      recentAttemptQuery,
      errorMemoryQuery,
    ]);
    if (stateResult.error) {
      return {
        success: false,
        error: `Không thể đọc learner state: ${stateResult.error.message}`,
      };
    }
    if (evidenceCoverageResult.error) {
      return {
        success: false,
        error: `Không thể đọc evidence coverage: ${evidenceCoverageResult.error.message}`,
      };
    }
    if (recentAttemptResult.error) {
      return {
        success: false,
        error: `Không thể đọc lịch sử practice gần đây: ${recentAttemptResult.error.message}`,
      };
    }
    if (errorMemoryResult.error) {
      return {
        success: false,
        error: `Không thể đọc error memory: ${errorMemoryResult.error.message}`,
      };
    }

    const evidenceCoverage = buildLearnerEvidenceCoverage(
      evidenceCoverageResult.data ?? [],
    );
    const states = (stateResult.data ?? []).map((row) =>
      mapLearnerSkillStateRow(row, evidenceCoverage.get(row.target_id) ?? {}),
    );
    const recentHistory = deriveRecentPlannerHistory(
      recentAttemptResult.data ?? [],
    );
    const errorMemory = buildErrorMemory(errorMemoryResult.data ?? []);
    const plan = planSession({
      candidates: nepSessionCatalogV1,
      states,
      sessionSize,
      now: new Date().toISOString(),
      recentTargetIds: recentHistory.recentTargetIds,
      recentCandidateIds: recentHistory.recentCandidateIds,
      errorMemory: errorMemory.entries,
    });
    const practices = plan.opportunities.flatMap((opportunity) => {
      const practice = resolveNếpPlannedPractice(opportunity.candidate.id);
      return practice ? [practice] : [];
    });

    return {
      success: true,
      plan,
      practices,
      diagnostics: {
        sessionSize,
        catalogSize: nepSessionCatalogV1.length,
        practiceEnvelopeCount: practices.length,
        stateCount: states.length,
        evidenceCoverageRowCount: evidenceCoverageResult.data?.length ?? 0,
        learnerStateModelVersion: LEARNER_STATE_MODEL_VERSION,
        learnerStateConfidenceCalibrated: false,
        recentAttemptCount: recentAttemptResult.data?.length ?? 0,
        errorMemoryAttemptCount: errorMemoryResult.data?.length ?? 0,
        recurringErrorCount: errorMemory.recurring.length,
        rawResponseSelected: false,
        fullMetadataSelected: false,
        hiddenEvaluatorTargetsExposedInPractices: false,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Lỗi hệ thống khi tạo session plan: ${message}`,
    };
  }
}
