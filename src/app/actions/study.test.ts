/**
 * Contract tests for saveStudyItem (C2 — idempotent save with context).
 *
 * Only the Supabase module boundary is mocked: a duck-typed chainable query
 * builder resolves per-table handlers, mirroring captions.test.ts so the
 * tests survive internal refactors of the action.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSavedWordStates, saveStudyItem, saveTextSource } from "./study";

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

function input(overrides: Record<string, unknown> = {}) {
  return {
    kind: "word",
    key: "Resilience",
    display: "resilience",
    meaning_vi: "khả năng phục hồi",
    meaning_origin: "dictionary",
    context: {
      video_id: "dQw4w9WgXcQ",
      sentence_index: 12,
      token_start: 3,
      token_count: 1,
      sentence_text: "It takes resilience to keep going.",
      start_ms: 41000,
      end_ms: 43000,
      origin: "watch_lookup",
    },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  h.calls.length = 0;
  h.tableHandlers.clear();
  h.getUser.mockResolvedValue({ data: { user: USER } });
});

describe("saveStudyItem", () => {
  it("rejects invalid input before touching auth", async () => {
    expect(await saveStudyItem({ kind: "word" })).toEqual({
      ok: false,
      error: "invalid_input",
    });
    expect(h.getUser).not.toHaveBeenCalled();
  });

  it("requires a signed-in learner", async () => {
    h.getUser.mockResolvedValue({ data: { user: null } });
    expect(await saveStudyItem(input())).toEqual({
      ok: false,
      error: "unauthorized",
    });
  });

  it("creates source (upsert), card and context on first save", async () => {
    h.tableHandlers.set("content_sources", (steps) => {
      const last = steps.at(-1)?.method;
      if (last === "upsert" || steps.some((s) => s.method === "upsert"))
        return { data: { id: 77 }, error: null };
      return { data: null, error: null };
    });
    h.tableHandlers.set("study_cards", (steps) => {
      if (steps.some((s) => s.method === "insert"))
        return { data: { id: 5 }, error: null };
      return { data: null, error: null }; // select -> no existing card
    });
    h.tableHandlers.set("card_contexts", () => ({
      data: { id: 9 },
      error: null,
    }));

    const result = await saveStudyItem(input());
    expect(result).toEqual({
      ok: true,
      card_id: 5,
      card_created: true,
      context_created: true,
    });
    // Source row upserted with the youtube external id.
    const upsertCall = h.calls.find(
      (c) => c.table === "content_sources" && c.method === "upsert",
    );
    expect(upsertCall?.args[0]).toMatchObject({
      user_id: USER.id,
      kind: "youtube",
      external_id: "dQw4w9WgXcQ",
    });
    // Card row carries normalized lowercase key + meaning.
    const insertCall = h.calls.find(
      (c) => c.table === "study_cards" && c.method === "insert",
    );
    expect(insertCall?.args[0]).toMatchObject({
      user_id: USER.id,
      kind: "word",
      key: "resilience",
      meaning_vi: "khả năng phục hồi",
      meaning_origin: "dictionary",
    });
  });

  it("adopts an existing card and never clobbers a stored meaning with null", async () => {
    h.tableHandlers.set("content_sources", () => ({
      data: { id: 77 },
      error: null,
    }));
    h.tableHandlers.set("study_cards", (steps) => {
      if (steps.some((s) => s.method === "update"))
        return { data: null, error: null };
      return { data: { id: 5 }, error: null }; // select -> existing card
    });
    h.tableHandlers.set("card_contexts", () => ({
      data: null,
      error: { code: "23505", message: "duplicate key" },
    }));

    const result = await saveStudyItem(
      input({ meaning_vi: undefined, meaning_origin: undefined }),
    );
    expect(result).toEqual({
      ok: true,
      card_id: 5,
      card_created: false,
      context_created: false, // dedupe no-op, not an error
    });
    const updateCall = h.calls.find(
      (c) => c.table === "study_cards" && c.method === "update",
    );
    expect(updateCall?.args[0]).not.toHaveProperty("meaning_vi");
    expect(updateCall?.args[0]).toMatchObject({ display: "resilience" });
  });

  it("rejects a source_id the learner does not own", async () => {
    h.tableHandlers.set("content_sources", () => ({
      data: null,
      error: null,
    }));
    const result = await saveStudyItem(
      input({
        context: {
          source_id: 999,
          sentence_index: 0,
          sentence_text: "Some sentence.",
          origin: "watch_lookup",
        },
      }),
    );
    expect(result).toEqual({ ok: false, error: "invalid_context" });
  });

  it("collapses a concurrent first-save race onto the winning card", async () => {
    h.tableHandlers.set("content_sources", () => ({
      data: { id: 77 },
      error: null,
    }));
    let insertSeen = false;
    h.tableHandlers.set("study_cards", (steps) => {
      if (steps.some((s) => s.method === "insert")) {
        insertSeen = true;
        return { data: null, error: { code: "23505" } };
      }
      // select before insert: miss; select after 23505: winner's row
      return { data: insertSeen ? { id: 6 } : null, error: null };
    });
    h.tableHandlers.set("card_contexts", () => ({
      data: { id: 9 },
      error: null,
    }));
    const result = await saveStudyItem(input());
    expect(result).toEqual({
      ok: true,
      card_id: 6,
      card_created: false,
      context_created: true,
    });
  });
});

describe("getSavedWordStates", () => {
  it("requires a signed-in learner", async () => {
    h.getUser.mockResolvedValue({ data: { user: null } });
    expect(await getSavedWordStates()).toEqual({
      ok: false,
      error: "unauthorized",
    });
  });

  it("returns key/state for word+phrase cards only", async () => {
    h.tableHandlers.set("study_cards", (steps) => {
      const inArgs = steps.find((s) => s.method === "in")?.args[1];
      expect(inArgs).toEqual(["word", "phrase"]);
      return {
        data: [
          { key: "resilience", state: 2 },
          { key: "keep going", state: 0 },
        ],
        error: null,
      };
    });
    const result = await getSavedWordStates();
    expect(result).toEqual({
      ok: true,
      states: [
        { key: "resilience", state: 2 },
        { key: "keep going", state: 0 },
      ],
    });
  });
});

describe("saveTextSource", () => {
  it("rejects invalid input before touching auth", async () => {
    expect(await saveTextSource({ text: 42 })).toEqual({
      ok: false,
      error: "invalid_input",
    });
    expect(await saveTextSource({ text: "   " })).toEqual({
      ok: false,
      error: "invalid_input",
    });
    expect(h.getUser).not.toHaveBeenCalled();
  });

  it("requires a signed-in learner", async () => {
    h.getUser.mockResolvedValue({ data: { user: null } });
    expect(await saveTextSource({ text: "Some text." })).toEqual({
      ok: false,
      error: "unauthorized",
    });
  });

  it("upserts a kind=text source keyed by the text hash", async () => {
    h.tableHandlers.set("content_sources", () => ({
      data: { id: 31 },
      error: null,
    }));
    const result = await saveTextSource({
      text: "It takes resilience to keep going. Keep going anyway.",
    });
    expect(result).toEqual({ ok: true, source_id: 31 });
    const upsertCall = h.calls.find(
      (c) => c.table === "content_sources" && c.method === "upsert",
    );
    expect(upsertCall?.args[0]).toMatchObject({
      user_id: USER.id,
      kind: "text",
      // sha256 hex — 64 chars, inside the external_id <= 64 constraint.
      external_id: expect.stringMatching(/^[0-9a-f]{64}$/),
      title: "It takes resilience to keep going. Keep going anyway.",
    });
  });
});
