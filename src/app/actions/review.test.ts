/**
 * Contract tests for the review queue and recordPracticeAttempt (C3).
 * Same module-boundary mock as study.test.ts: a duck-typed chainable builder
 * resolves per-table handlers so the tests survive internal refactors.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getReviewQueue, recordPracticeAttempt } from "./review";

const h = vi.hoisted(() => {
  interface QueryStep {
    method: string;
    args: unknown[];
  }
  type TableHandler = (steps: QueryStep[]) => unknown;

  const calls: { table: string; method: string; args: unknown[] }[] = [];
  const tableHandlers = new Map<string, TableHandler>();

  function makeQueryBuilder(table: string) {
    const steps: QueryStep[] = [];
    const builder: Record<PropertyKey, unknown> = new Proxy(
      {},
      {
        get(_target, prop) {
          if (prop === "then") {
            return (
              onFulfilled?: ((value: unknown) => unknown) | null,
              onRejected?: ((reason: unknown) => unknown) | null,
            ) => {
              const handler = tableHandlers.get(table);
              const result = handler
                ? handler(steps)
                : { data: null, error: null };
              return Promise.resolve(result).then(onFulfilled, onRejected);
            };
          }
          if (typeof prop === "symbol") return undefined;
          return (...args: unknown[]) => {
            steps.push({ method: prop, args });
            calls.push({ table, method: prop, args });
            return builder;
          };
        },
      },
    );
    return builder;
  }

  const getUser = vi.fn();
  const supabase = {
    auth: { getUser },
    from: (table: string) => makeQueryBuilder(table),
  };
  return { calls, tableHandlers, getUser, supabase };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => h.supabase,
}));

const USER = { id: "66666666-6666-4666-8666-666666666666" };

const CARD = {
  id: 5,
  kind: "word",
  key: "resilience",
  display: "resilience",
  meaning_vi: "khả năng phục hồi",
  meaning_origin: "dictionary",
  state: 0,
  stability: 0,
  difficulty: 0,
  elapsed_days: 0,
  scheduled_days: 0,
  learning_steps: 0,
  reps: 0,
  lapses: 0,
  due: null,
  last_review: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  h.calls.length = 0;
  h.tableHandlers.clear();
  h.getUser.mockResolvedValue({ data: { user: USER } });
});

describe("getReviewQueue", () => {
  it("requires a signed-in learner", async () => {
    h.getUser.mockResolvedValue({ data: { user: null } });
    expect(await getReviewQueue()).toEqual({
      ok: false,
      error: "unauthorized",
    });
  });

  it("returns an empty queue without touching contexts", async () => {
    h.tableHandlers.set("study_cards", () => ({ data: [], error: null }));
    const result = await getReviewQueue();
    expect(result).toEqual({ ok: true, items: [], total_due: 0 });
    expect(h.calls.some((c) => c.table === "card_contexts")).toBe(false);
  });

  it("joins the newest context and youtube source for the deep link", async () => {
    h.tableHandlers.set("study_cards", () => ({ data: [CARD], error: null }));
    h.tableHandlers.set("card_contexts", () => ({
      data: [
        {
          card_id: 5,
          source_id: 77,
          sentence_index: 12,
          token_start: 3,
          token_count: 1,
          sentence_text: "It takes resilience to keep going.",
          sentence_vi: "Cần sự kiên cường để tiếp tục.",
          start_ms: 41000,
          end_ms: 43000,
          created_at: "2026-10-16T00:00:01Z",
        },
        {
          // Older encounter — the newest wins the cue.
          card_id: 5,
          source_id: 78,
          sentence_index: 1,
          token_start: null,
          token_count: null,
          sentence_text: "Resilience matters.",
          sentence_vi: null,
          start_ms: 1000,
          end_ms: 2000,
          created_at: "2026-10-16T00:00:00Z",
        },
      ],
      error: null,
    }));
    h.tableHandlers.set("content_sources", () => ({
      data: [
        { id: 77, kind: "youtube", external_id: "dQw4w9WgXcQ", title: "Talk" },
        { id: 78, kind: "text", external_id: "note-1", title: "Note" },
      ],
      error: null,
    }));

    const result = await getReviewQueue();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items).toHaveLength(1);
    const item = result.items[0];
    expect(item.mode).toBe("recall"); // New card → base mode (spec §8)
    expect(item.context).toMatchObject({
      sentence_text: "It takes resilience to keep going.",
      sentence_vi: "Cần sự kiên cường để tiếp tục.",
      token_start: 3,
      video_id: "dQw4w9WgXcQ",
      source_title: "Talk",
    });
  });

  it("still queues a card that has no context rows", async () => {
    h.tableHandlers.set("study_cards", () => ({ data: [CARD], error: null }));
    h.tableHandlers.set("card_contexts", () => ({ data: [], error: null }));
    const result = await getReviewQueue();
    if (!result.ok) throw new Error("expected ok");
    expect(result.items[0].context).toBeNull();
    expect(result.items[0].mode).toBe("recall");
  });
});

describe("recordPracticeAttempt", () => {
  it("rejects invalid input before touching auth", async () => {
    expect(await recordPracticeAttempt({ card_id: 5 })).toEqual({
      ok: false,
      error: "invalid_input",
    });
    expect(h.getUser).not.toHaveBeenCalled();
  });

  it("requires rating for self-rated modes", async () => {
    expect(
      await recordPracticeAttempt({ card_id: 5, mode: "recall" }),
    ).toEqual({ ok: false, error: "invalid_input" });
  });

  it("requires learner_text for write_reuse", async () => {
    expect(
      await recordPracticeAttempt({ card_id: 5, mode: "write_reuse" }),
    ).toEqual({ ok: false, error: "invalid_input" });
  });

  it("requires a signed-in learner", async () => {
    h.getUser.mockResolvedValue({ data: { user: null } });
    expect(
      await recordPracticeAttempt({ card_id: 5, mode: "recall", rating: 3 }),
    ).toEqual({ ok: false, error: "unauthorized" });
  });

  it("returns not_found for a missing or foreign card", async () => {
    h.tableHandlers.set("study_cards", () => ({ data: null, error: null }));
    expect(
      await recordPracticeAttempt({ card_id: 999, mode: "recall", rating: 3 }),
    ).toEqual({ ok: false, error: "not_found" });
  });

  it("reschedules the card and logs fsrs before/after on a graded rep", async () => {
    h.tableHandlers.set("study_cards", (steps) => {
      if (steps.some((s) => s.method === "update"))
        return { data: null, error: null };
      return { data: CARD, error: null };
    });
    h.tableHandlers.set("practice_attempts", () => ({
      data: { id: 42 },
      error: null,
    }));

    const result = await recordPracticeAttempt({
      card_id: 5,
      mode: "recall",
      rating: 3,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.due).not.toBeNull();

    const update = h.calls.find(
      (c) => c.table === "study_cards" && c.method === "update",
    );
    expect(update?.args[0]).toMatchObject({ reps: 1 });
    expect(typeof update?.args[0]).toBe("object");

    const insert = h.calls.find(
      (c) => c.table === "practice_attempts" && c.method === "insert",
    );
    expect(insert?.args[0]).toMatchObject({
      user_id: USER.id,
      card_id: 5,
      mode: "recall",
      rating: 3,
    });
    expect(insert?.args[0]).toHaveProperty("fsrs_before");
    expect(insert?.args[0]).toHaveProperty("fsrs_after");
  });

  it("derives rating server-side for auto-graded modes", async () => {
    h.tableHandlers.set("study_cards", (steps) => {
      if (steps.some((s) => s.method === "update"))
        return { data: null, error: null };
      return { data: CARD, error: null };
    });
    h.tableHandlers.set("practice_attempts", () => ({
      data: { id: 43 },
      error: null,
    }));

    // Hints cap dictation at Hard even when accuracy clears the bar.
    await recordPracticeAttempt({
      card_id: 5,
      mode: "sentence_dictation",
      word_accuracy: 0.95,
      hints_used: 1,
      learner_text: "it takes resilienc to keep going",
    });
    const insert = h.calls.find(
      (c) => c.table === "practice_attempts" && c.method === "insert",
    );
    expect(insert?.args[0]).toMatchObject({ rating: 2, mode: "sentence_dictation" });
  });

  it("never lets a client-supplied rating stick on an auto-graded mode", async () => {
    h.tableHandlers.set("study_cards", (steps) => {
      if (steps.some((s) => s.method === "update"))
        return { data: null, error: null };
      return { data: CARD, error: null };
    });
    h.tableHandlers.set("practice_attempts", () => ({
      data: { id: 44 },
      error: null,
    }));

    // listen_fill wrong answer must log Again even if the client claims Easy.
    await recordPracticeAttempt({
      card_id: 5,
      mode: "listen_fill",
      correct: false,
      rating: 4,
    });
    const insert = h.calls.find(
      (c) => c.table === "practice_attempts" && c.method === "insert",
    );
    expect(insert?.args[0]).toMatchObject({ rating: 1 });
  });

  it("logs without rescheduling for evidence-only modes", async () => {
    h.tableHandlers.set("study_cards", (steps) => {
      if (steps.some((s) => s.method === "update"))
        return { data: null, error: null };
      return { data: CARD, error: null };
    });
    h.tableHandlers.set("practice_attempts", () => ({
      data: { id: 45 },
      error: null,
    }));

    const result = await recordPracticeAttempt({
      card_id: 5,
      mode: "speak_repeat",
      similarity: 0.72,
      rating: 4, // ignored — speak_repeat never reschedules
    });
    expect(result.ok).toBe(true);
    const insert = h.calls.find(
      (c) => c.table === "practice_attempts" && c.method === "insert",
    );
    expect(insert?.args[0]).toMatchObject({
      mode: "speak_repeat",
      similarity: 0.72,
      rating: null,
      fsrs_before: null,
      fsrs_after: null,
    });
    expect(
      h.calls.some(
        (c) => c.table === "study_cards" && c.method === "update",
      ),
    ).toBe(false);
  });
});
