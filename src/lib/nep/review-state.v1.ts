import { nepLessonRegistryV1 } from "./lesson-registry.v1";

/**
 * Zero-path review scheduling — derived state, not stored truth.
 *
 * `learning_attempts` is the append-only source of truth; a lesson's review
 * schedule is recomputed from its attempt history, so it can never disagree
 * with what was actually observed. A lesson becomes reviewable once the
 * learner has a successful assessed attempt; each successful review doubles
 * the interval (capped), a failed review shortens it to a quick retry.
 *
 * Deliberately simple for the pilot: scheduling is lesson-level because
 * attempts carry lesson identity, not per-chunk identity. Chunk-level
 * spacing would pretend precision the data cannot support.
 */

export const ZERO_PATH_REVIEW_FIRST_INTERVAL_DAYS = 3;
export const ZERO_PATH_REVIEW_RETRY_DAYS = 1;
export const ZERO_PATH_REVIEW_MAX_INTERVAL_DAYS = 45;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Minimal row shape read back from `learning_attempts` (exercise-scoped). */
export type NếpAttemptRow = {
  readonly exerciseType: string;
  readonly correct: boolean | null;
  readonly createdAt: string;
  readonly metadata: {
    readonly lessonId?: string;
    readonly reviewMode?: boolean;
  } | null;
};

export type ZeroPathReviewState = {
  readonly lessonId: string;
  /** Whether any successful assessed attempt introduced the lesson's items. */
  readonly introduced: boolean;
  readonly lastLearnedAt: string | null;
  readonly lastReviewedAt: string | null;
  /** Count of successful review-mode assessed attempts (retentions observed). */
  readonly successfulReviews: number;
  readonly nextReviewAt: string | null;
  readonly due: boolean;
};

/**
 * Derive per-lesson review state from attempt rows ordered newest-first.
 * Rows without `metadata.lessonId` or a non-`nep:` exercise type are ignored;
 * assessed attempts are identified by a non-null `correct` flag.
 */
export function deriveZeroPathReviewStates(
  attempts: readonly NếpAttemptRow[],
  options: { now?: string; lessonIds?: readonly string[] } = {},
): ZeroPathReviewState[] {
  const now = new Date(options.now ?? new Date().toISOString()).getTime();
  const lessonIds = options.lessonIds ?? nepLessonRegistryV1.map((lesson) => lesson.id);

  return lessonIds.map((lessonId) => {
    const rows = attempts.filter(
      (row) =>
        row.metadata?.lessonId === lessonId
        && row.exerciseType.startsWith("nep:")
        && row.correct !== null,
    );

    const lastLearned = rows.find(
      (row) => row.metadata?.reviewMode !== true && row.correct === true,
    );
    if (!lastLearned) {
      return {
        lessonId,
        introduced: false,
        lastLearnedAt: null,
        lastReviewedAt: null,
        successfulReviews: 0,
        nextReviewAt: null,
        due: false,
      };
    }

    const reviews = rows.filter((row) => row.metadata?.reviewMode === true);
    const lastReview = reviews[0];

    let nextReviewAt: string;
    if (!lastReview) {
      nextReviewAt = addDays(lastLearned.createdAt, ZERO_PATH_REVIEW_FIRST_INTERVAL_DAYS);
    } else if (lastReview.correct) {
      const successes = reviews.filter((row) => row.correct === true).length;
      const intervalDays = Math.min(
        ZERO_PATH_REVIEW_FIRST_INTERVAL_DAYS * 2 ** successes,
        ZERO_PATH_REVIEW_MAX_INTERVAL_DAYS,
      );
      nextReviewAt = addDays(lastReview.createdAt, intervalDays);
    } else {
      nextReviewAt = addDays(lastReview.createdAt, ZERO_PATH_REVIEW_RETRY_DAYS);
    }

    return {
      lessonId,
      introduced: true,
      lastLearnedAt: lastLearned.createdAt,
      lastReviewedAt: lastReview?.createdAt ?? null,
      successfulReviews: reviews.filter((row) => row.correct === true).length,
      nextReviewAt,
      due: new Date(nextReviewAt).getTime() <= now,
    };
  });
}

function addDays(iso: string, days: number): string {
  return new Date(new Date(iso).getTime() + days * DAY_MS).toISOString();
}
