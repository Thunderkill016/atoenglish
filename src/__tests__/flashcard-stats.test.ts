import { recordFlashcardSession } from "@/app/actions/flashcard-stats";

/**
 * Durability tests for the post-response streak sync in
 * recordFlashcardSession(). The sync must be registered with the runtime's
 * pending-work mechanism (next/server after() → ctx.waitUntil on Workers)
 * instead of an unawaited IIFE that the isolate can drop once the response
 * completes — while still never blocking the response path.
 */

const USER_ID = "00000000-0000-0000-0000-0000000000bb";

// Tasks captured by the mocked after(); tests drain them explicitly.
const afterTasks: Array<() => unknown> = [];
let currentUserId: string | null = USER_ID;
let existingRow: Record<string, unknown> | null = null;
let upsertError: { message: string } | null = null;
const rpcCalls: Array<{ fn: string; args: Record<string, unknown> }> = [];

vi.mock("next/server", () => ({
  after: (task: () => unknown) => {
    afterTasks.push(task);
  },
}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "10.0.0.1" }),
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
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: existingRow, error: null }),
        }),
      }),
      upsert: (row: Record<string, unknown>) => ({
        select: () => ({
          single: async () =>
            upsertError
              ? { data: null, error: upsertError }
              : { data: row, error: null },
        }),
      }),
    }),
  }),
}));

vi.mock("@/lib/supabase/service", () => ({
  rpcService: async (fn: string, args: Record<string, unknown>) => {
    rpcCalls.push({ fn, args });
    return { data: null, error: null };
  },
}));

// Mirror the action's Vietnam-timezone date math for arg assertions.
function vnDate(offsetDays = 0): string {
  const d = new Date(
    new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }),
  );
  d.setDate(d.getDate() - offsetDays);
  return d.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
}

beforeEach(() => {
  currentUserId = USER_ID;
  existingRow = null;
  upsertError = null;
  afterTasks.length = 0;
  rpcCalls.length = 0;
});

describe("recordFlashcardSession() streak sync durability", () => {
  it("registers the streak sync via after() without blocking the response", async () => {
    const result = await recordFlashcardSession(10);

    expect(result.success).toBe(true);
    // Registered with the pending-work mechanism…
    expect(afterTasks).toHaveLength(1);
    // …but not awaited on the response path — the RPC has not run yet.
    expect(rpcCalls).toHaveLength(0);
  });

  it("registered task awards 0 XP with the streak dates", async () => {
    const result = await recordFlashcardSession(10);
    expect(result.success).toBe(true);
    expect(afterTasks).toHaveLength(1);

    await afterTasks[0]();

    expect(rpcCalls).toHaveLength(1);
    expect(rpcCalls[0].fn).toBe("award_user_xp");
    expect(rpcCalls[0].args).toEqual({
      p_user_id: USER_ID,
      p_xp_amount: 0,
      p_today: vnDate(0),
      p_yesterday: vnDate(1),
    });
  });

  it("does not register the sync when the session upsert fails", async () => {
    upsertError = { message: "upsert failed" };
    const result = await recordFlashcardSession(10);

    expect(result.success).toBe(false);
    expect(afterTasks).toHaveLength(0);
    expect(rpcCalls).toHaveLength(0);
  });

  it("does not register the sync for unauthenticated callers", async () => {
    currentUserId = null;
    const result = await recordFlashcardSession(10);

    expect(result.success).toBe(false);
    expect(afterTasks).toHaveLength(0);
    expect(rpcCalls).toHaveLength(0);
  });
});
