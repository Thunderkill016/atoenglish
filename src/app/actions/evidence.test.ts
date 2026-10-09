/**
 * Contract tests for getEvidence (SPEC §9): four honest tiers, each with its
 * denominator — exposure counts, supported ratios, independent ratios, and
 * delayed recall. Aggregation is verified against a fixture of attempts.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getEvidence } from "./evidence";

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

const USER = { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" };
const NOW = "2026-10-20T12:00:00Z";

function attempt(overrides: Record<string, unknown>) {
  return {
    mode: "recall",
    rating: null,
    correct: null,
    word_accuracy: null,
    hints_used: 0,
    interval_days_before: null,
    fsrs_before: null,
    created_at: NOW,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  h.calls.length = 0;
  h.tableHandlers.clear();
  h.getUser.mockResolvedValue({ data: { user: USER } });
  h.tableHandlers.set("study_cards", () => ({ count: 12, error: null }));
  h.tableHandlers.set("content_sources", () => ({ count: 3, error: null }));
  h.tableHandlers.set("practice_attempts", () => ({ data: [], error: null }));
});

describe("getEvidence", () => {
  it("requires a signed-in learner", async () => {
    h.getUser.mockResolvedValue({ data: { user: null } });
    expect(await getEvidence()).toEqual({
      ok: false,
      error: "unauthorized",
    });
  });

  it("scopes every query to the owner", async () => {
    await getEvidence();
    for (const table of [
      "study_cards",
      "content_sources",
      "practice_attempts",
    ]) {
      const eqs = h.calls
        .filter((c) => c.table === table && c.method === "eq")
        .map((c) => c.args);
      expect(eqs).toContainEqual(["user_id", USER.id]);
    }
  });

  it("counts exposure from saved items and watched videos", async () => {
    const result = await getEvidence();
    expect(result.ok && result.data.exposure).toEqual({
      saved_items: 12,
      videos_watched: 3,
    });
  });

  it("tiers attempts correctly with honest denominators", async () => {
    h.tableHandlers.set("practice_attempts", () => ({
      data: [
        // due recall, Good → counts in both numerator and denominator
        attempt({
          mode: "recall",
          rating: 3,
          fsrs_before: { due: "2026-10-19T00:00:00Z" },
        }),
        // due recall, Again → denominator only
        attempt({
          mode: "recall",
          rating: 1,
          fsrs_before: { due: "2026-10-19T00:00:00Z" },
        }),
        // not-yet-due card (future due) → excluded entirely
        attempt({
          mode: "recall",
          rating: 3,
          fsrs_before: { due: "2026-12-01T00:00:00Z" },
        }),
        // new card (due null) counts as due
        attempt({
          mode: "sentence_meaning",
          rating: 4,
          fsrs_before: { due: null },
        }),
        // dictation clean pass ≥90%, no hints → independent
        attempt({
          mode: "sentence_dictation",
          word_accuracy: 0.95,
          hints_used: 0,
          rating: 3,
        }),
        // dictation pass WITH hints → supported
        attempt({
          mode: "sentence_dictation",
          word_accuracy: 0.92,
          hints_used: 2,
          rating: 2,
        }),
        // dictation below bar → denominator only
        attempt({
          mode: "sentence_dictation",
          word_accuracy: 0.5,
          hints_used: 0,
          rating: 1,
        }),
        // listen_fill correct / incorrect
        attempt({ mode: "listen_fill", correct: true, rating: 3 }),
        attempt({ mode: "listen_fill", correct: false, rating: 1 }),
        // write_reuse submission — independent by being submitted
        attempt({ mode: "write_reuse", learner_text: "x" }),
        // delayed recall ≥7d: one Good, one Again
        attempt({
          mode: "recall",
          rating: 3,
          interval_days_before: 10,
          fsrs_before: { due: "2026-10-10T00:00:00Z" },
        }),
        attempt({
          mode: "recall",
          rating: 1,
          interval_days_before: 30,
          fsrs_before: { due: "2026-09-20T00:00:00Z" },
        }),
      ],
      error: null,
    }));

    const result = await getEvidence();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const d = result.data;
    // Tier 2: 5 due self-rated attempts — the 2 delayed reps are due too;
    // Good/Easy on 3 of them. Dictation-with-hints: 1/3.
    expect(d.supported.due_rated).toEqual({ numerator: 3, denominator: 5 });
    expect(d.supported.dictation_with_hints).toEqual({
      numerator: 1,
      denominator: 3,
    });
    // Tier 3
    expect(d.independent.listen_fill).toEqual({ numerator: 1, denominator: 2 });
    expect(d.independent.dictation_clean).toEqual({
      numerator: 1,
      denominator: 3,
    });
    expect(d.independent.write_reuse).toEqual({ numerator: 1, denominator: 1 });
    // Tier 4: the two ≥7-day reps — 1 Good
    expect(d.delayed.good_easy_after_7d).toEqual({
      numerator: 1,
      denominator: 2,
    });
  });
});
