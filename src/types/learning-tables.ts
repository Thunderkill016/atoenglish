/**
 * Hand-maintained row types for the learning-evidence schema.
 *
 * `src/types/supabase.ts` is generated and currently predates the September
 * learning-evidence migrations — these tables are missing from it, so code
 * was compensating with `as unknown as RpcClient` casts. This module is the
 * honest typed boundary until the generated file is refreshed; keep it in
 * sync with `supabase/migrations/`.
 *
 * Row types only — each call site declares the narrow client interface for
 * the exact chained calls it makes (matching existing repo convention).
 */

export type LearningAttemptRow = {
  readonly id: number;
  readonly user_id: string;
  readonly session_id: string;
  readonly lesson_id: string;
  readonly activity_id: string;
  readonly modality: string;
  readonly status: "scored" | "unscored" | "unavailable" | "skipped";
  readonly score: number | null;
  readonly error_tags: readonly string[];
  readonly evaluator: string;
  readonly evaluator_version: string;
  readonly latency_ms: number | null;
  readonly created_at: string;
};

/** Read shape consumed by the zero-path review-derivation path. */
export type LearningAttemptSelectRow = {
  readonly exercise_type: string;
  readonly correct: boolean | null;
  readonly created_at: string;
  readonly metadata: { lessonId?: string; reviewMode?: boolean } | null;
};

export type ZeroPathSessionRow = {
  readonly id: string;
  readonly user_id: string | null;
  readonly lesson_id: string;
  readonly lesson_version: number;
  readonly mode: "learn" | "review";
  readonly status: "open" | "closed" | "expired";
  readonly created_at: string;
  readonly updated_at: string;
  readonly expires_at: string;
};

export type ZeroPathSessionSubmissionRow = {
  readonly id: number;
  readonly session_id: string;
  readonly seq: number;
  readonly action_id: string;
  readonly idempotency_key: string;
  readonly outcome_kind:
    | "rejected"
    | "self-report"
    | "attempt-only"
    | "evidence"
    | "invalid-evidence";
  readonly outcome: Record<string, unknown>;
  readonly created_at: string;
};

export type ZeroPathSessionInsert = Omit<
  ZeroPathSessionRow,
  "created_at" | "updated_at" | "status"
>;

export type LearnerKnownWordRow = {
  readonly id: number;
  readonly user_id: string;
  readonly word: string;
  readonly status: "learning" | "known";
  readonly created_at: string;
  readonly updated_at: string;
};
export type ZeroPathSessionSubmissionInsert = Omit<
  ZeroPathSessionSubmissionRow,
  "id" | "created_at"
>;
