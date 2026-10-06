import { describe, expect, it } from "vitest";
import { mapDbCardToFSRSCard } from "@/lib/srs/fsrs";
import type { Card } from "@/types/database";

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: "card-1",
    user_id: "user-1",
    word: "borrow",
    phonetic: null,
    meaning_vn: "mượn",
    example_en: null,
    topic: null,
    level: "A1",
    interval: 7,
    due_date: "2026-09-10T00:00:00.000Z",
    repetitions: 4,
    created_at: "2026-08-01T00:00:00.000Z",
    updated_at: "2026-09-02T00:00:00.000Z",
    state: 2,
    difficulty: 5.1,
    stability: 8.2,
    last_review: "2026-09-01T00:00:00.000Z",
    next_review: "2026-09-10T00:00:00.000Z",
    elapsed_days: 12,
    scheduled_days: 9,
    lapses: 3,
    learning_steps: 2,
    ...overrides,
  };
}

describe("FSRS database mapping", () => {
  it("reconstructs persisted history instead of resetting it", () => {
    const mapped = mapDbCardToFSRSCard(makeCard());
    expect(mapped.elapsed_days).toBe(12);
    expect(mapped.scheduled_days).toBe(9);
    expect(mapped.lapses).toBe(3);
    expect(mapped.learning_steps).toBe(2);
  });

  it("does not infer elapsed days from next due minus last review", () => {
    const mapped = mapDbCardToFSRSCard(
      makeCard({
        elapsed_days: 20,
        last_review: "2026-09-01T00:00:00.000Z",
        next_review: "2026-09-05T00:00:00.000Z",
      }),
    );
    expect(mapped.elapsed_days).toBe(20);
  });
});
