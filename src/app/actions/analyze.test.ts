/**
 * Contract tests for analyzeSentence (B2): auth gate, ai_results cache hit,
 * Gemini miss → validated insert, rate limit, and honest error mapping.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { analyzeSentence } from "./analyze";

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

const USER = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" };

const ANALYSIS = {
  translation_vi: "Cần có sự kiên trì để tiếp tục.",
  structure: {
    subject: "It",
    main_verb: "takes",
    clauses: ["to keep going"],
  },
  phrases: [{ text: "keep going", meaning_vi: "tiếp tục" }],
  grammar_point: "Cấu trúc 'It takes + danh từ + to V'.",
};

function geminiResponse(payload: unknown, status = 200) {
  return new Response(
    status === 200
      ? JSON.stringify({
          candidates: [
            {
              finishReason: "STOP",
              content: { parts: [{ text: JSON.stringify(payload) }] },
            },
          ],
        })
      : "{}",
    { status },
  );
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  h.calls.length = 0;
  h.tableHandlers.clear();
  h.getUser.mockResolvedValue({ data: { user: USER } });
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("GEMINI_API_KEY", "test-only");
});

describe("analyzeSentence", () => {
  it("requires a signed-in learner and a non-empty sentence", async () => {
    h.getUser.mockResolvedValue({ data: { user: null } });
    expect(await analyzeSentence({ sentence: "Hi." })).toEqual({
      ok: false,
      error: "unauthorized",
    });
    expect(await analyzeSentence({ sentence: "  " })).toEqual({
      ok: false,
      error: "invalid_input",
    });
  });

  it("replays the cached analysis without calling Gemini", async () => {
    h.tableHandlers.set("ai_results", () => ({
      data: { output: ANALYSIS },
      error: null,
    }));
    const result = await analyzeSentence({
      sentence: "It takes resilience to keep going.",
    });
    expect(result).toEqual({
      ok: true,
      analysis: ANALYSIS,
      cached: true,
    });
    expect(fetchMock).not.toHaveBeenCalled();
    // Cache lookup must be scoped to kind + model + the learner's hash.
    const eqs = h.calls
      .filter((c) => c.table === "ai_results" && c.method === "eq")
      .map((c) => c.args);
    expect(eqs).toContainEqual(["kind", "sentence_analysis"]);
    expect(eqs).toContainEqual(["model", "gemini-2.5-flash"]);
  });

  it("calls Gemini on a miss, validates the shape and caches it", async () => {
    fetchMock.mockResolvedValue(geminiResponse(ANALYSIS));
    const result = await analyzeSentence({
      sentence: "It takes resilience to keep going.",
    });
    expect(result).toEqual({
      ok: true,
      analysis: ANALYSIS,
      cached: false,
    });
    const insert = h.calls.find(
      (c) => c.table === "ai_results" && c.method === "insert",
    );
    expect(insert?.args[0]).toMatchObject({
      user_id: USER.id,
      kind: "sentence_analysis",
      model: "gemini-2.5-flash",
    });
    expect((insert?.args[0] as { input_hash: string }).input_hash).toMatch(
      /^[0-9a-f]{64}$/,
    );
  });

  it("maps a Gemini 429 to rate_limited and bad JSON to unavailable", async () => {
    fetchMock.mockResolvedValueOnce(geminiResponse({}, 429));
    expect(await analyzeSentence({ sentence: "Rate me." })).toEqual({
      ok: false,
      error: "rate_limited",
    });

    fetchMock.mockResolvedValueOnce(geminiResponse({ translation_vi: 42 }));
    expect(await analyzeSentence({ sentence: "Bad shape." })).toEqual({
      ok: false,
      error: "unavailable",
    });
  });
});
