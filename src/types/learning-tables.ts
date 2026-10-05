/**
 * Hand-maintained row types for the learning-evidence schema.
 *
 * `src/types/supabase.ts` IS regenerated from the live schema (`npm run
 * db:types`) and does contain these tables/functions — but PostgREST
 * introspection cannot express function-argument nullability, so generated
 * RPC Args types mark nullable parameters as required `string`. The narrow
 * `as unknown as RpcClient` client interfaces at call sites remain the
 * honest typed boundary for nullable RPC args; keep this file in sync with
 * `supabase/migrations/`.
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
