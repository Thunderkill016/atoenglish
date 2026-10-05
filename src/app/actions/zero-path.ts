"use server";

import { cookies, headers } from "next/headers";

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
import { completeUnit } from "@/app/actions/unit";
import {
  legacyContractLessonId,
  resolveLegacyContract,
} from "@/lib/nep/legacy-unit-contract.v1";
import {
  isMissionLesson,
  legacyUnitEntry,
  legacyUnitSlugs,
} from "@/lib/lessons/legacy-unit-registry";
import { nepLessonRegistryV1 } from "@/lib/nep/lesson-registry.v1";
import { createZeroPathSessionPersistence } from "@/lib/nep/zero-path-session-persistence";
import { zeroPathLessonIndex } from "@/lib/nep/zero-path-pilot.v1";
import {
  createRateLimiter,
  getClientIpFromHeaders,
} from "@/lib/security/rate-limit";
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
 * in `zero_path_sessions`/`zero_path_session_submissions`. Anonymous callers
 * have no direct table access — every read/write goes through capability
 * SECURITY DEFINER functions that require either row ownership or the
 * per-session access secret. The secret is delivered to the browser via the
 * HttpOnly `ato_zp_caps` cookie at session start, so it is never enumerable
 * and never JS-readable. Storage failures degrade a session to memory-only
 * instead of failing the learner.
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

/**
 * Guest-session capability cookie: `{ [sessionId]: accessSecret }` for the
 * few most recent sessions. HttpOnly + SameSite=Strict — the secret cannot be
 * read by JS, is never sent cross-site, and lives at most as long as the
 * sessions themselves (4h TTL mirrors SESSION_TTL_MS in the store).
 */
const CAPS_COOKIE = "ato_zp_caps";
const CAPS_MAX_ENTRIES = 12;
const CAPS_MAX_AGE_S = 4 * 60 * 60;

async function readSessionCapabilities(): Promise<Record<string, string>> {
  try {
    const store = await cookies();
    const raw = store.get(CAPS_COOKIE)?.value;
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};
    const caps: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") caps[key] = value;
    }
    return caps;
  } catch {
    return {};
  }
}

async function resolveSessionSecret(sessionId: string): Promise<string | null> {
  const caps = await readSessionCapabilities();
  return caps[sessionId] ?? null;
}

async function storeSessionCapability(
  sessionId: string,
  accessSecret: string,
): Promise<void> {
  try {
    const caps = await readSessionCapabilities();
    const entries = Object.entries({ ...caps, [sessionId]: accessSecret });
    // Bounded map — drop oldest entries; sessions expire within maxAge anyway.
    const pruned = Object.fromEntries(entries.slice(-CAPS_MAX_ENTRIES));
    const store = await cookies();
    store.set(CAPS_COOKIE, JSON.stringify(pruned), {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: CAPS_MAX_AGE_S,
    });
  } catch {
    // Cookie write outside a mutable context degrades to no-capability —
    // the session remains usable in-memory for the current request path.
  }
}

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
  const ip = getClientIpFromHeaders(reqHeaders);
  const rateLimitCheck = await zeroPathStartLimiter.check(ip);
  if (!rateLimitCheck.success) return { sessionId: null };

  const lesson =
    zeroPathLessonIndex().find((entry) => entry.lessonId === lessonId) ??
    resolveLegacyContract(lessonId);
  if (!lesson) return { sessionId: null };
  const resolvedLessonId = "lessonId" in lesson ? lesson.lessonId : lesson.id;
  const resolvedLessonVersion =
    "lessonVersion" in lesson ? lesson.lessonVersion : lesson.version;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const persistence = createZeroPathSessionPersistence(supabase);
  const { sessionId, accessSecret } = await startZeroPathSession({
    mode: mode === "review" ? "review" : "learn",
    userId: user?.id ?? null,
    lessonId: resolvedLessonId,
    lessonVersion: resolvedLessonVersion,
    persistence,
  });
  // The capability is the guest authorization boundary — it must reach the
  // browser via HttpOnly cookie, never through the response payload.
  if (accessSecret) await storeSessionCapability(sessionId, accessSecret);
  return { sessionId };
}

export async function submitZeroPathResponse(
  sessionId: string,
  input: NếpPracticeSubmission,
): Promise<ZeroPathSubmissionResult> {
  const reqHeaders = await headers();
  const ip = getClientIpFromHeaders(reqHeaders);
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
  const persistence = createZeroPathSessionPersistence(
    supabase,
    resolveSessionSecret,
  );
  const lookup = await getZeroPathSession(
    sessionId,
    user?.id ?? null,
    persistence,
    await resolveSessionSecret(sessionId),
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
  const persistence = createZeroPathSessionPersistence(
    supabase,
    resolveSessionSecret,
  );
  const lookup = await getZeroPathSession(
    sessionId,
    user?.id ?? null,
    persistence,
    await resolveSessionSecret(sessionId),
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
  const persistence = createZeroPathSessionPersistence(
    supabase,
    resolveSessionSecret,
  );
  // The capability RPC returns the row only when the caller proved ownership
  // or presented the session secret — no row collapses missing/forbidden.
  const row = await persistence.getSession(sessionId);
  if (
    !row ||
    row.status !== "open" ||
    new Date(row.expires_at).getTime() <= Date.now()
  ) {
    return { status: "absent" };
  }
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

  // Review scheduling spans both canonical registry lessons and compiled
  // legacy units — a learner's attempt history is the single source either
  // way, so the queue must watch every resolvable lesson id.
  const lessonIds = [
    ...nepLessonRegistryV1.map((lesson) => lesson.id),
    ...legacyUnitSlugs()
      .filter((slug) => {
        const entry = legacyUnitEntry(slug);
        return entry ? !isMissionLesson(entry.data) : false;
      })
      .map(legacyContractLessonId),
  ];
  return {
    signedIn: true,
    states: deriveZeroPathReviewStates(attempts, { lessonIds }),
  };
}

/**
 * Unit-completion bridge for legacy lessons running in the canonical session
 * runtime. Stars are derived server-side from persisted submission outcomes —
 * the client cannot claim a performance level.
 *
 * - Session must exist, belong to the caller, and match `legacy.<unitSlug>`.
 * - Review-mode sessions never re-award unit XP.
 * - Star ratio counts only evaluated outcomes (self-reports and rejected
 *   submissions are ignored); units with no assessed actions award the
 *   minimum honestly.
 */
export async function completeZeroPathUnitSession(
  sessionId: string,
  unitSlug: string,
): Promise<{ success: boolean; error?: string }> {
  const reqHeaders = await headers();
  const ip = getClientIpFromHeaders(reqHeaders);
  const rateLimitCheck = await zeroPathLimiter.check(ip);
  if (!rateLimitCheck.success) {
    return { success: false, error: "Yêu cầu quá thường xuyên." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Bạn cần đăng nhập." };

  const persistence = createZeroPathSessionPersistence(
    supabase,
    resolveSessionSecret,
  );
  const sessionRow = await persistence.getSession(sessionId);
  if (!sessionRow || sessionRow.user_id !== user.id) {
    return { success: false, error: "Phiên không hợp lệ." };
  }
  if (sessionRow.lesson_id !== legacyContractLessonId(unitSlug)) {
    return { success: false, error: "Phiên không khớp bài học." };
  }
  if (sessionRow.mode !== "learn") return { success: true };

  const submissions = await persistence.listSubmissions(sessionId);
  const evaluated = submissions.filter((row) =>
    ["attempt-only", "evidence", "invalid-evidence"].includes(row.outcome_kind),
  );
  const correct = evaluated.filter(
    (row) =>
      (row.outcome as { evaluation?: { success?: boolean } } | null)?.evaluation
        ?.success === true,
  ).length;
  const ratio = evaluated.length > 0 ? correct / evaluated.length : 0;
  const stars =
    evaluated.length === 0 ? 1 : ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;

  return completeUnit(unitSlug, stars);
}
