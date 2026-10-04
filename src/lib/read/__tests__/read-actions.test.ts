import {
  clearReadWordStatus,
  getReadWordCounts,
  getReadWordStates,
  setReadWordStatus,
} from "@/app/actions/read";

/**
 * Server-action boundary tests. The Supabase client is faked behind the real
 * table semantics (one status row per user+word, upsert on conflict) so the
 * tests exercise the action logic — normalization, auth gating, status
 * round-trip — rather than the transport.
 */

type Row = { user_id: string; word: string; status: "learning" | "known" };
const rows: Row[] = [];
let currentUserId: string | null = "user-1";

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "10.0.0.1" }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({
        data: {
          user: currentUserId ? { id: currentUserId } : null,
        },
      }),
    },
    from(table: string) {
      if (table !== "learner_known_words")
        throw new Error(`unexpected table ${table}`);
      return {
        select: (columns: string) => ({
          in: async (_column: string, values: readonly string[]) => ({
            data: rows
              .filter(
                (r) => r.user_id === currentUserId && values.includes(r.word),
              )
              .map((r) => ({ word: r.word, status: r.status })),
            error: null,
          }),
          eq: async (_column: string, value: unknown) => ({
            data: rows
              .filter((r) => r.user_id === value)
              .map((r) => ({ word: r.word, status: r.status })),
            error: null,
          }),
        }),
        upsert: async (row: Row) => {
          const i = rows.findIndex(
            (r) => r.user_id === row.user_id && r.word === row.word,
          );
          if (i >= 0) rows[i] = row;
          else rows.push(row);
          return { error: null };
        },
        delete: () => ({
          eq: (_c1: string, v1: unknown) => ({
            eq: async (_c2: string, v2: unknown) => {
              const i = rows.findIndex(
                (r) => r.user_id === v1 && r.word === v2,
              );
              if (i >= 0) rows.splice(i, 1);
              return { error: null };
            },
            in: async (_c2: string, values: readonly string[]) => {
              for (let i = rows.length - 1; i >= 0; i -= 1) {
                if (rows[i].user_id === v1 && values.includes(rows[i].word)) {
                  rows.splice(i, 1);
                }
              }
              return { error: null };
            },
          }),
        }),
      };
    },
  }),
}));

beforeEach(() => {
  rows.length = 0;
  currentUserId = "user-1";
});

describe("read word-state actions", () => {
  it("round-trips a status: set → states → clear → implicit unknown", async () => {
    expect(await setReadWordStatus("Hello", "known")).toEqual({ ok: true });

    const states = await getReadWordStates(["hello", "goodbye"]);
    expect(states).toEqual({ signedIn: true, states: { hello: "known" } });

    expect(await clearReadWordStatus("HELLO")).toEqual({ ok: true });
    const after = await getReadWordStates(["hello"]);
    expect(after).toEqual({ signedIn: true, states: {} });
  });

  it("treats words without a row as implicitly unknown, not an error", async () => {
    const states = await getReadWordStates(["never-marked"]);
    expect(states).toEqual({ signedIn: true, states: {} });
  });

  it("rejects anonymous callers without half-personalised state", async () => {
    currentUserId = null;
    expect(await getReadWordStates(["hello"])).toEqual({ signedIn: false });
    expect(await setReadWordStatus("hello", "known")).toEqual({
      ok: false,
      reason: "unauthenticated",
    });
    expect(await getReadWordCounts()).toEqual({ signedIn: false });
  });

  it("rejects invalid words and statuses", async () => {
    expect(await setReadWordStatus("hello world", "known")).toEqual({
      ok: false,
      reason: "invalid",
    });
    expect(await setReadWordStatus("hello", "mastered" as never)).toEqual({
      ok: false,
      reason: "invalid",
    });
  });

  it("counts known vs learning for the signed-in user only", async () => {
    await setReadWordStatus("a", "known");
    await setReadWordStatus("b", "learning");
    rows.push({ user_id: "other-user", word: "c", status: "known" });

    expect(await getReadWordCounts()).toEqual({
      signedIn: true,
      known: 1,
      learning: 1,
    });
  });

  it("writes the canonical lemma, not the marked surface form", async () => {
    expect(await setReadWordStatus("Books", "known")).toEqual({ ok: true });
    expect(rows).toEqual([
      { user_id: "user-1", word: "book", status: "known" },
    ]);
    // Both inflections resolve to the same self-reported mark.
    expect(await getReadWordStates(["book", "books"])).toEqual({
      signedIn: true,
      states: { book: "known", books: "known" },
    });
  });

  it("resolves legacy surface-form rows through their lemma", async () => {
    rows.push({ user_id: "user-1", word: "played", status: "learning" });
    expect(await getReadWordStates(["play", "played"])).toEqual({
      signedIn: true,
      states: { play: "learning", played: "learning" },
    });
  });

  it("lets a canonical row win over a stale surface row of the same lemma", async () => {
    rows.push({ user_id: "user-1", word: "book", status: "known" });
    rows.push({ user_id: "user-1", word: "books", status: "learning" });
    expect(await getReadWordStates(["book"])).toEqual({
      signedIn: true,
      states: { book: "known" },
    });
  });

  it("re-marking a surface form replaces the legacy row with the canonical one", async () => {
    rows.push({ user_id: "user-1", word: "books", status: "learning" });
    expect(await setReadWordStatus("books", "known")).toEqual({ ok: true });
    expect(rows).toEqual([
      { user_id: "user-1", word: "book", status: "known" },
    ]);
  });

  it("clearing a word also removes its legacy surface row", async () => {
    rows.push({ user_id: "user-1", word: "books", status: "known" });
    expect(await clearReadWordStatus("book")).toEqual({ ok: true });
    expect(rows).toEqual([]);
    expect(await getReadWordStates(["book", "books"])).toEqual({
      signedIn: true,
      states: {},
    });
  });
});
