import { describe, expect, it } from "vitest";

import {
  deriveZeroPathReviewStates,
  type NếpAttemptRow,
  ZERO_PATH_REVIEW_FIRST_INTERVAL_DAYS,
  ZERO_PATH_REVIEW_MAX_INTERVAL_DAYS,
} from "../review-state.v1";

const LESSON = "LESSON-TEST-REVIEW-V1";
const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-10-10T12:00:00.000Z");

function daysAgo(days: number): string {
  return new Date(NOW.getTime() - days * DAY_MS).toISOString();
}

function attempt(
  overrides: Partial<NếpAttemptRow> & { createdAt: string },
): NếpAttemptRow {
  return {
    exerciseType: "nep:produce",
    correct: true,
    metadata: { lessonId: LESSON },
    ...overrides,
  };
}

function stateFor(attempts: NếpAttemptRow[]) {
  const states = deriveZeroPathReviewStates(attempts, {
    now: NOW.toISOString(),
    lessonIds: [LESSON],
  });
  return states[0];
}

describe("deriveZeroPathReviewStates", () => {
  it("treats a lesson with no attempts as not introduced", () => {
    const state = stateFor([]);
    expect(state.introduced).toBe(false);
    expect(state.due).toBe(false);
    expect(state.nextReviewAt).toBeNull();
  });

  it("ignores attempts from other lessons and non-nep exercises", () => {
    const state = stateFor([
      attempt({ metadata: { lessonId: "OTHER-LESSON" }, createdAt: daysAgo(10) }),
      attempt({ exerciseType: "vocab:card", createdAt: daysAgo(10) }),
    ]);
    expect(state.introduced).toBe(false);
  });

  it("ignores attempts that only failed during learning", () => {
    const state = stateFor([
      attempt({ correct: false, createdAt: daysAgo(10) }),
    ]);
    expect(state.introduced).toBe(false);
  });

  it("schedules the first review after the initial interval once learning succeeded", () => {
    const learnedAt = daysAgo(1);
    const state = stateFor([attempt({ createdAt: learnedAt })]);

    expect(state.introduced).toBe(true);
    expect(state.lastLearnedAt).toBe(learnedAt);
    expect(state.successfulReviews).toBe(0);
    expect(state.due).toBe(false);
    expect(new Date(state.nextReviewAt!).getTime()).toBeCloseTo(
      new Date(learnedAt).getTime() + ZERO_PATH_REVIEW_FIRST_INTERVAL_DAYS * DAY_MS,
      -3,
    );
  });

  it("marks a lesson due once the initial interval elapsed", () => {
    const state = stateFor([attempt({ createdAt: daysAgo(4) })]);
    expect(state.due).toBe(true);
  });

  it("doubling the interval after a successful review", () => {
    const state = stateFor([
      attempt({ metadata: { lessonId: LESSON, reviewMode: true }, createdAt: daysAgo(1) }),
      attempt({ createdAt: daysAgo(5) }),
    ]);

    expect(state.successfulReviews).toBe(1);
    expect(state.lastReviewedAt).toBe(daysAgo(1));
    // interval = 3 * 2^1 = 6 days from the review → not yet due
    expect(state.due).toBe(false);
    expect(new Date(state.nextReviewAt!).getTime()).toBeCloseTo(
      NOW.getTime() - DAY_MS + 6 * DAY_MS,
      -3,
    );
  });

  it("marks a reviewed lesson due when the grown interval elapsed", () => {
    const state = stateFor([
      attempt({ metadata: { lessonId: LESSON, reviewMode: true }, createdAt: daysAgo(7) }),
      attempt({ createdAt: daysAgo(14) }),
    ]);
    expect(state.due).toBe(true);
  });

  it("schedules a quick retry after a failed review", () => {
    const reviewAt = daysAgo(0.5);
    const state = stateFor([
      attempt({
        correct: false,
        metadata: { lessonId: LESSON, reviewMode: true },
        createdAt: reviewAt,
      }),
      attempt({ createdAt: daysAgo(10) }),
    ]);

    expect(state.successfulReviews).toBe(0);
    expect(new Date(state.nextReviewAt!).getTime()).toBeCloseTo(
      new Date(reviewAt).getTime() + DAY_MS,
      -3,
    );
    expect(state.due).toBe(false);
  });

  it("caps the interval at the maximum", () => {
    const successes: NếpAttemptRow[] = Array.from({ length: 6 }, (_, i) =>
      attempt({
        metadata: { lessonId: LESSON, reviewMode: true },
        createdAt: daysAgo(50 - i),
      }),
    );
    const state = stateFor([...successes, attempt({ createdAt: daysAgo(60) })]);

    const latestReview = new Date(successes[0].createdAt).getTime();
    const intervalMs = new Date(state.nextReviewAt!).getTime() - latestReview;
    expect(intervalMs).toBeLessThanOrEqual(ZERO_PATH_REVIEW_MAX_INTERVAL_DAYS * DAY_MS);
  });
});
