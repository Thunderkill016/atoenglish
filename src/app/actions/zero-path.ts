"use server";

import { headers } from "next/headers";

import type { NếpEvaluationResult } from "@/lib/nep/evaluator";
import {
  NếpPracticeSubmissionSchema,
  type NếpPracticeSubmission,
} from "@/lib/nep/practice-execution.v1";
import { recordNếpPracticeAttempt } from "@/app/actions/learning-evidence";
import type { ZeroPathClaimId } from "@/lib/nep/core-evidence-wiring.v1";
import type { ZeroPathSessionReadModel } from "@/lib/nep/session-read-model";
import {
  deriveZeroPathReviewStates,
  type NếpAttemptRow,
  type ZeroPathReviewState,
} from "@/lib/nep/review-state.v1";
import {
  getZeroPathSession,
  listOpenZeroPathSessions,
  persistSessionOutcome,
  startZeroPathSession,
  type ZeroPathSessionLookup,
} from "@/lib/nep/zero-path-session-store.v1";
import { createZeroPathSessionPersistence } from "@/lib/nep/zero-path-session-persistence";
import { zeroPathLessonIndex } from "@/lib/nep/zero-path-pilot.v1";
import { createRateLimiter } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";
import type { ZeroPathSessionRow } from "@/types/learning-tables";

/**
 * Zero-path pilot boundary: the browser submits only observed interaction data
 * plus a server-minted session id. Canonical recompute, evidence certification
 * and projection all happen server-side — certified evidence records carry a
 * symbol brand that cannot cross the action boundary, so only plain outcomes
 * and the read-model DTO are returned.
 *
 * Session state is durable: sessions + per-submission outcome snapshots live
 * in `zero_path_sessions`/`zero_path_session_submissions` (RLS owner-checked;
 * anonymous sessions are reachable by holder-of-id only). Storage failures
 * degrade a session to memory-only instead of failing the learner.
 *
 * Assessed outcomes are additionally persisted through the canonical
 * `record_learning_attempt` boundary for signed-in learners.
 */

const zeroPathLimiter = createRateLimiter(
  180,
  60 * 1000,
  "zero-path-submission",
);
const zeroPathStartLimiter = createRateLimiter(
  60,
  60 * 1000,
  "zero-path-start",
);

export type ZeroPathSubmissionResult =
  | { readonly kind: "rate-limited" }
  | { readonly kind: "invalid-input"; readonly error: string }
  | { readonly kind: "no-session" }
  | { readonly kind: "forbidden" }
  | { readonly kind: "unresolvable" }
  | {
      readonly kind: "duplicate";
      readonly evaluation: NếpEvaluationResult | null;
      readonly feedback: string;
    }
  | {
      readonly kind: "self-report";
      readonly feedback: string;
    }
  | {
      readonly kind: "attempt-only";
      readonly evaluation: NếpEvaluationResult;
      readonly feedback: string;
      readonly persisted: boolean;
    }
  | {
      readonly kind: "evidence";
      readonly claim: ZeroPathClaimId;
      readonly evaluation: NếpEvaluationResult;
      readonly feedback: string;
      readonly persisted: boolean;
    }
  | {
      readonly kind: "invalid-evidence";
      readonly claim: ZeroPathClaimId;
      readonly problems: readonly string[];
      readonly evaluation: NếpEvaluationResult;
      readonly feedback: string;
      readonly persisted: boolean;
    };

export async function startZeroPathPilotSession(
  lessonId: string,
  mode?: "review",
): Promise<{ sessionId: string | null }> {
  const reqHeaders = await headers();
  const ip =
    reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
  const rateLimitCheck = await zeroPathStartLimiter.check(ip);
  if (!rateLimitCheck.success) return { sessionId: null };

  const lesson = zeroPathLessonIndex().find(
    (entry) => entry.lessonId === lessonId,
  );
  if (!lesson) return { sessionId: null };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const persistence = createZeroPathSessionPersistence(supabase);
  const { sessionId } = await startZeroPathSession({
    mode: mode === "review" ? "review" : "learn",
    userId: user?.id ?? null,
    lessonId: lesson.lessonId,
    lessonVersion: lesson.lessonVersion,
    persistence,
  });
  return { sessionId };
}

export async function submitZeroPathResponse(
  sessionId: string,
  input: NếpPracticeSubmission,
): Promise<ZeroPathSubmissionResult> {
  const reqHeaders = await headers();
  const ip =
    reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
  const rateLimitCheck = await zeroPathLimiter.check(ip);
  if (!rateLimitCheck.success) return { kind: "rate-limited" };

  const parsed = NếpPracticeSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      kind: "invalid-input",
      error: parsed.error.issues.map((issue) => issue.message).join(", "),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const persistence = createZeroPathSessionPersistence(supabase);
  const lookup = await getZeroPathSession(
    sessionId,
    user?.id ?? null,
    persistence,
  );
  if (lookup.status === "forbidden") return { kind: "forbidden" };
  if (lookup.status === "absent") return { kind: "no-session" };
  const entry = lookup.entry;

  // The session's server-bound mode decides review labeling — the client's
  // own `reviewMode` claim is overwritten, never trusted.
  const submission: NếpPracticeSubmission = {
    ...parsed.data,
    reviewMode: entry.mode === "review",
  };
  const outcome = entry.runner.recordSubmission(submission);
  if (outcome.kind !== "duplicate") {
    // Write-through snapshot for crash-safe hydration. Failure degrades to
    // memory-only for the remainder of this session — never blocks the learner.
    await persistSessionOutcome(
      entry,
      {
        actionId: "actionId" in outcome ? outcome.actionId : "",
        idempotencyKey: submission.idempotencyKey,
        outcome,
      },
      persistence,
    );
  }
  switch (outcome.kind) {
    case "rejected":
      return { kind: "unresolvable" };
    case "duplicate": {
      const prior = outcome.prior;
      return {
        kind: "duplicate",
        evaluation: "evaluation" in prior ? prior.evaluation : null,
        feedback:
          "feedback" in prior
            ? prior.feedback
            : "Lượt này đã được ghi nhận trước đó.",
      };
    }
    case "self-report":
      return { kind: "self-report", feedback: outcome.feedback };
    case "attempt-only": {
      const persisted = await persistAssessedOutcome(submission);
      return {
        kind: "attempt-only",
        evaluation: outcome.evaluation,
        feedback: outcome.feedback,
        persisted,
      };
    }
    case "evidence": {
      const persisted = await persistAssessedOutcome(submission);
      return {
        kind: "evidence",
        claim: outcome.claim,
        evaluation: outcome.evaluation,
        feedback: outcome.feedback,
        persisted,
      };
    }
    case "invalid-evidence": {
      const persisted = await persistAssessedOutcome(submission);
      return {
        kind: "invalid-evidence",
        claim: outcome.claim,
        problems: outcome.problems.map((problem) => JSON.stringify(problem)),
        evaluation: outcome.evaluation,
        feedback: outcome.feedback,
        persisted,
      };
    }
  }
}

/**
 * Persist an assessed attempt through the canonical durable boundary.
 * Self-reports and duplicate replays never reach this function — the first
 * (non-duplicate) call is the single write for a given idempotency key.
 * A persistence failure never downgrades the in-session outcome; it only
 * marks the result as not durably stored.
 */
async function persistAssessedOutcome(
  input: NếpPracticeSubmission,
): Promise<boolean> {
  const result = await recordNếpPracticeAttempt(input);
  return result.success && result.persistence === "database";
}

export async function getZeroPathReadModel(
  sessionId: string,
): Promise<ZeroPathSessionReadModel | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const persistence = createZeroPathSessionPersistence(supabase);
  const lookup = await getZeroPathSession(
    sessionId,
    user?.id ?? null,
    persistence,
  );
  return lookup.status === "ok" ? lookup.entry.runner.readModel() : null;
}

export type ZeroPathResumeState =
  | {
      readonly status: "ok";
      readonly lessonId: string;
      readonly mode: "learn" | "review";
      /** Action ids with a stored outcome — the client resumes at the first action not in this set. */
      readonly completedActionIds: readonly string[];
    }
  | { readonly status: "absent" }
  | { readonly status: "forbidden" };

/**
 * Learner-safe resume descriptor for `/zero-path?session=<id>`. Returns the
 * position a session should continue from — never evaluator internals or
 * raw learner responses.
 */
export async function getZeroPathResumeState(
  sessionId: string,
): Promise<ZeroPathResumeState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const persistence = createZeroPathSessionPersistence(supabase);
  const row = await persistence.getSession(sessionId);
  if (
    !row ||
    row.status !== "open" ||
    new Date(row.expires_at).getTime() <= Date.now()
  ) {
    return { status: "absent" };
  }
  if (row.user_id !== null && row.user_id !== user?.id)
    return { status: "forbidden" };
  const rows = await persistence.listSubmissions(sessionId);
  return {
    status: "ok",
    lessonId: row.lesson_id,
    mode: row.mode,
    completedActionIds: rows
      .filter((stored) => stored.outcome_kind !== "rejected")
      .map((stored) => stored.action_id),
  };
}

/**
 * Resume index for signed-in learners — their own open sessions, newest
 * first. Anonymous sessions are holder-of-id and intentionally absent:
 * resuming them requires the original session id, not a listing.
 */
export async function listZeroPathOpenSessions(): Promise<
  readonly ZeroPathSessionRow[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  return listOpenZeroPathSessions(
    user.id,
    createZeroPathSessionPersistence(supabase),
  );
}

type AttemptsTableClient = {
  from(table: "learning_attempts"): {
    select(columns: string): {
      like(
        column: string,
        pattern: string,
      ): {
        order(
          column: string,
          options: { ascending: boolean },
        ): {
          limit(count: number): PromiseLike<{
            data: readonly Record<string, unknown>[] | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
  };
};

export type ZeroPathReviewIndex =
  | { readonly signedIn: false }
  | {
      readonly signedIn: true;
      readonly states: readonly ZeroPathReviewState[];
    };

/**
 * Per-lesson review state for the zero-path picker, derived from the
 * learner's append-only attempt history (RLS-scoped read — never a write).
 * Anonymous callers get `signedIn: false`; review scheduling needs an
 * identity to attach history to.
 */
export async function getZeroPathReviewIndex(): Promise<ZeroPathReviewIndex> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { signedIn: false };

  const { data, error } = await (supabase as unknown as AttemptsTableClient)
    .from("learning_attempts")
    .select("exercise_type, correct, created_at, metadata")
    .like("exercise_type", "nep:%")
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error || !data) return { signedIn: true, states: [] };

  const attempts: NếpAttemptRow[] = data
    .map((row) => ({
      exerciseType:
        typeof row.exercise_type === "string" ? row.exercise_type : "",
      correct: typeof row.correct === "boolean" ? row.correct : null,
      createdAt: typeof row.created_at === "string" ? row.created_at : "",
      metadata:
        row.metadata && typeof row.metadata === "object"
          ? (row.metadata as NếpAttemptRow["metadata"])
          : null,
    }))
    .filter((row) => row.exerciseType.length > 0 && row.createdAt.length > 0);

  return { signedIn: true, states: deriveZeroPathReviewStates(attempts) };
}
