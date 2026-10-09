/**
 * Contract tests for the /library actions (C5): getLibrary assembles videos +
 * saved items with deep-link context; updateCardMeaning / deleteStudyCard /
 * deleteLibrarySource are owner-scoped mutations.
 *
 * The Supabase boundary is mocked with the same duck-typed chainable query
 * builder as study.test.ts.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  deleteLibrarySource,
  deleteStudyCard,
  getLibrary,
  updateCardMeaning,
} from "./library";

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

const USER = { id: "77777777-7777-4777-8777-777777777777" };

beforeEach(() => {
  vi.clearAllMocks();
  h.calls.length = 0;
  h.tableHandlers.clear();
  h.getUser.mockResolvedValue({ data: { user: USER } });
});

describe("getLibrary", () => {
  it("requires a signed-in learner", async () => {
    h.getUser.mockResolvedValue({ data: { user: null } });
    expect(await getLibrary()).toEqual({
      ok: false,
      error: "unauthorized",
    });
  });

  it("returns videos only for kind=youtube and attaches newest context to cards", async () => {
    h.tableHandlers.set("content_sources", (steps) => {
      const kindFilter = steps
        .filter((s) => s.method === "eq")
        .find((s) => s.args[0] === "kind");
      expect(kindFilter?.args[1]).toBe("youtube");
      return {
        data: [
          {
            id: 9,
            kind: "youtube",
            external_id: "dQw4w9WgXcQ",
            title: "Demo",
            channel: "Chan",
            last_position_ms: 12000,
            updated_at: "2026-10-20T00:00:00Z",
          },
        ],
        error: null,
      };
    });
    h.tableHandlers.set("study_cards", () => ({
      data: [
        {
          id: 1,
          kind: "word",
          display: "resilience",
          meaning_vi: "sức bật",
          state: 0,
          due: null,
        },
        {
          id: 2,
          kind: "sentence",
          display: "It takes resilience.",
          meaning_vi: null,
          state: 2,
          due: "2026-10-21T00:00:00Z",
        },
      ],
      error: null,
    }));
    h.tableHandlers.set("card_contexts", () => ({
      data: [
        {
          card_id: 1,
          source_id: 9,
          sentence_text: "It takes resilience to keep going.",
          start_ms: 41000,
          created_at: "2026-10-20T01:00:00Z",
        },
      ],
      error: null,
    }));

    const result = await getLibrary();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.videos).toHaveLength(1);
    expect(result.videos[0].saved_count).toBe(1);
    expect(result.words).toHaveLength(1);
    expect(result.sentences).toHaveLength(1);
    const item = result.words[0];
    expect(item.context?.video_id).toBe("dQw4w9WgXcQ");
    expect(item.context?.start_ms).toBe(41000);
    // Card without a context still appears, just without a deep link.
    expect(result.sentences[0].context).toBeNull();
  });

  it("keeps only the newest context per card", async () => {
    h.tableHandlers.set("content_sources", () => ({ data: [], error: null }));
    h.tableHandlers.set("study_cards", () => ({
      data: [
        {
          id: 1,
          kind: "word",
          display: "go",
          meaning_vi: null,
          state: 0,
          due: null,
        },
      ],
      error: null,
    }));
    h.tableHandlers.set("card_contexts", () => ({
      data: [
        {
          card_id: 1,
          source_id: null,
          sentence_text: "newest",
          start_ms: 2,
          created_at: "2026-10-20T02:00:00Z",
        },
        {
          card_id: 1,
          source_id: null,
          sentence_text: "oldest",
          start_ms: 1,
          created_at: "2026-10-20T01:00:00Z",
        },
      ],
      error: null,
    }));
    const result = await getLibrary();
    expect(result.ok && result.words[0].context?.sentence_text).toBe("newest");
  });
});

describe("updateCardMeaning", () => {
  it("rejects empty meaning and requires auth", async () => {
    expect(await updateCardMeaning({ card_id: 1, meaning_vi: "  " })).toEqual({
      ok: false,
      error: "invalid_input",
    });
    h.getUser.mockResolvedValue({ data: { user: null } });
    expect(
      await updateCardMeaning({ card_id: 1, meaning_vi: "nghĩa" }),
    ).toEqual({ ok: false, error: "unauthorized" });
  });

  it("flips meaning_origin to learner and scopes update to the owner", async () => {
    h.tableHandlers.set("study_cards", () => ({ data: null, error: null }));
    expect(
      await updateCardMeaning({ card_id: 7, meaning_vi: "kiên trì" }),
    ).toEqual({ ok: true });
    const update = h.calls.find(
      (c) => c.table === "study_cards" && c.method === "update",
    );
    expect(update?.args[0]).toMatchObject({
      meaning_vi: "kiên trì",
      meaning_origin: "learner",
    });
    const eqs = h.calls.filter(
      (c) => c.table === "study_cards" && c.method === "eq",
    );
    expect(eqs.map((e) => e.args)).toEqual([
      ["id", 7],
      ["user_id", USER.id],
    ]);
  });
});

describe("deleteStudyCard / deleteLibrarySource", () => {
  it("deletes the card scoped to the owner", async () => {
    h.tableHandlers.set("study_cards", () => ({ data: null, error: null }));
    expect(await deleteStudyCard(3)).toEqual({ ok: true });
    const eqs = h.calls
      .filter((c) => c.table === "study_cards" && c.method === "eq")
      .map((c) => c.args);
    expect(eqs).toEqual([
      ["id", 3],
      ["user_id", USER.id],
    ]);
  });

  it("deletes the source scoped to the owner and rejects bad ids", async () => {
    h.tableHandlers.set("content_sources", () => ({
      data: null,
      error: null,
    }));
    expect(await deleteLibrarySource(9)).toEqual({ ok: true });
    const eqs = h.calls
      .filter((c) => c.table === "content_sources" && c.method === "eq")
      .map((c) => c.args);
    expect(eqs).toEqual([
      ["id", 9],
      ["user_id", USER.id],
    ]);
    expect(await deleteLibrarySource(-1)).toEqual({
      ok: false,
      error: "invalid_input",
    });
  });
});
