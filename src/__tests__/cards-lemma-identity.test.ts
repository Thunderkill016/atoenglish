import {
  saveCardToSRS,
  scheduleWrongWordsForReview,
  seedUnitVocabToSRS,
} from "@/app/actions/cards";

/**
 * Lemma-identity tests for the cards SRS actions. The Supabase client is faked
 * behind real table semantics (one card row per user+word) so the tests
 * exercise dedupe/scheduling logic — not the transport. SRS identity must be
 * lemma-level: a saved "books" and a later "Book" are the same card.
 */

interface CardRow {
  id: number;
  user_id: string;
  word: string;
  meaning_vn?: string;
  state?: number;
  [key: string]: unknown;
}

let nextId = 1;
const cards: CardRow[] = [];
const rpcCalls: Array<{ fn: string; args: Record<string, unknown> }> = [];
let currentUserId: string | null = "user-1";

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "10.0.0.1" }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: () => undefined,
}));

vi.mock("@/lib/security/rate-limit", () => ({
  createRateLimiter: () => ({ check: async () => ({ success: true }) }),
  getClientIpFromHeaders: () => "10.0.0.1",
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({
        data: { user: currentUserId ? { id: currentUserId } : null },
        error: null,
      }),
    },
    from(table: string) {
      if (table !== "cards") throw new Error(`unexpected table ${table}`);
      return {
        select: () => ({
          eq: (_column: string, value: unknown) => ({
            limit: async () => ({
              data: cards.filter((c) => c.user_id === value),
              error: null,
            }),
          }),
        }),
        insert: async (row: Record<string, unknown>) => {
          cards.push({ id: nextId++, ...row } as CardRow);
          return { error: null };
        },
        upsert: async (
          rows: Record<string, unknown>[],
          _options: { onConflict: string; ignoreDuplicates: boolean },
        ) => {
          for (const row of rows) {
            const exists = cards.some(
              (c) => c.user_id === row.user_id && c.word === row.word,
            );
            if (!exists) cards.push({ id: nextId++, ...row } as CardRow);
          }
          return { error: null };
        },
      };
    },
    // apply_fsrs_card_review resolves auth_uid() from the request JWT, so it
    // must be invoked on this user-scoped client — not the service path.
    rpc: async (fn: string, args: Record<string, unknown>) => {
      rpcCalls.push({ fn, args });
      return { data: "ok", error: null };
    },
  }),
}));

beforeEach(() => {
  cards.length = 0;
  rpcCalls.length = 0;
  currentUserId = "user-1";
  nextId = 1;
});

const vocabItem = (word: string) => ({
  word,
  meaning_vn: `nghĩa của ${word}`,
});

describe("saveCardToSRS lemma identity", () => {
  it("treats an inflected form of a stored word as the same card", async () => {
    cards.push({ id: nextId++, user_id: "user-1", word: "books" });

    const result = await saveCardToSRS({
      word: "Book",
      meaning_vn: "sách",
    });

    expect(result).toMatchObject({ success: true, existed: true });
    expect(cards).toHaveLength(1);
  });

  it("stores the normalized surface word for a fresh lemma", async () => {
    const result = await saveCardToSRS({
      word: "  Apple  ",
      meaning_vn: "quả táo",
    });

    expect(result).toMatchObject({ success: true, existed: false });
    expect(cards.map((c) => c.word)).toEqual(["apple"]);
  });
});

describe("seedUnitVocabToSRS lemma identity", () => {
  it("skips lemmas already in the deck, even under another inflection", async () => {
    cards.push({ id: nextId++, user_id: "user-1", word: "books" });

    const result = await seedUnitVocabToSRS({
      vocab: [vocabItem("book"), vocabItem("study")],
      topic: "t",
    });

    expect(result).toEqual({ success: true, added: 1 });
    expect(cards.map((c) => c.word)).toEqual(["books", "study"]);
  });

  it("dedupes inflections inside one seed batch", async () => {
    const result = await seedUnitVocabToSRS({
      vocab: [vocabItem("play"), vocabItem("played"), vocabItem("plays")],
      topic: "t",
    });

    expect(result).toEqual({ success: true, added: 1 });
    expect(cards).toHaveLength(1);
    expect(cards[0].word).toBe("play");
  });
});

describe("scheduleWrongWordsForReview lemma identity", () => {
  it("schedules the stored card whose lemma matches a failed inflection", async () => {
    const now = new Date().toISOString();
    cards.push({
      id: nextId++,
      user_id: "user-1",
      word: "books",
      state: 0,
      difficulty: 0,
      stability: 0,
      due_date: now,
      last_review: null,
      next_review: now,
      interval: 0,
      repetitions: 0,
      learning_steps: 0,
    });
    cards.push({ id: nextId++, user_id: "user-1", word: "apple" });

    const result = await scheduleWrongWordsForReview(["Book"]);

    expect(result).toEqual({ success: true, updated: 1 });
    expect(rpcCalls).toHaveLength(1);
    expect(rpcCalls[0].fn).toBe("apply_fsrs_card_review");
    expect(rpcCalls[0].args.p_card_id).toBe(1);
  });

  it("does nothing when no stored lemma matches", async () => {
    cards.push({ id: nextId++, user_id: "user-1", word: "book" });

    const result = await scheduleWrongWordsForReview(["apple"]);

    expect(result).toEqual({ success: true, updated: 0 });
    expect(rpcCalls).toHaveLength(0);
  });
});
