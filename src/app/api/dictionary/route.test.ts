import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { NEON_AUTH_SESSION_COOKIE_NAME } from "@neondatabase/auth/server";
import { createClient } from "@/lib/supabase/server";
import { POST } from "./route";

const { check, dictRows, aiRows, tableCalls } = vi.hoisted(() => ({
  check: vi.fn(),
  dictRows: { value: [] as unknown[] },
  aiRows: { value: null as { output: unknown } | null },
  tableCalls: [] as { table: string; method: string; args: unknown[] }[],
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/security/rate-limit", () => ({
  createRateLimiter: () => ({ check }),
}));
function makeBuilder(table: string) {
  const builder: Record<PropertyKey, unknown> = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "then") {
          return (
            onFulfilled?: ((value: unknown) => unknown) | null,
            onRejected?: ((reason: unknown) => unknown) | null,
          ) => {
            const data =
              table === "dictionary_entries"
                ? dictRows.value
                : table === "ai_results"
                  ? aiRows.value
                  : null;
            return Promise.resolve({ data, error: null }).then(
              onFulfilled,
              onRejected,
            );
          };
        }
        if (typeof prop === "symbol") return undefined;
        return (...args: unknown[]) => {
          tableCalls.push({ table, method: prop, args });
          return builder;
        };
      },
    },
  );
  return builder;
}
function request(body: unknown, origin = "http://localhost:3000") {
  return new NextRequest("http://localhost:3000/api/dictionary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: `${NEON_AUTH_SESSION_COOKIE_NAME}=test-session`,
      origin,
    },
    body: JSON.stringify(body),
  });
}
function user(value: { id: string } | null, status = 401) {
  vi.mocked(createClient).mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: value },
        error: value ? null : { status },
      }),
    },
    from: (table: string) => makeBuilder(table),
  } as unknown as Awaited<ReturnType<typeof createClient>>);
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("GEMINI_API_KEY", "test-only-key");
  check.mockResolvedValue({ success: true });
  dictRows.value = [];
  aiRows.value = null;
  tableCalls.length = 0;
  user({ id: "learner-a" });
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("quick dictionary", () => {
  it("serves curated meaning and explicit misses without auth, AI or data writes", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const hit = await POST(request({ term: "HELLO" }));
    expect(await hit.json()).toMatchObject({
      ok: true,
      source: "curated",
      entry: { word: "hello", meaning_vn: "xin chào" },
    });
    const miss = await POST(request({ term: "zzzzq" }));
    expect(await miss.json()).toEqual({
      ok: true,
      source: "dictionary",
      entry: null,
    });
    // The curated map answered the hit without a client; the miss consulted
    // the wide-coverage dictionary table.
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(fetcher).not.toHaveBeenCalled();
    expect(hit.headers.get("cache-control")).toBe("no-store");
  });
  it("falls through curated misses to the shared dictionary table", async () => {
    dictRows.value = [
      {
        word: "serendipity",
        pos: "noun",
        senses: [{ glosses: ["Khả năng cầu may."] }],
        ipa: null,
        audio_url: null,
      },
    ];
    const response = await POST(request({ term: "serendipity" }));
    const body = await response.json();
    expect(body).toMatchObject({
      ok: true,
      source: "dictionary",
      entry: {
        word: "serendipity",
        meaning_vn: "Khả năng cầu may.",
        part_of_speech: "noun",
      },
    });
    expect(createClient).toHaveBeenCalledTimes(1);
  });
  it.each([
    { term: "" },
    { term: "a".repeat(121) },
    { term: "a", context: "x".repeat(1001) },
    { term: "a", mode: "unknown" },
  ])("rejects invalid intake before auth", async (body) => {
    expect((await POST(request(body))).status).toBe(400);
    expect(createClient).not.toHaveBeenCalled();
  });
  it("rejects cross-origin requests and oversized bodies", async () => {
    expect(
      (await POST(request({ term: "hello" }, "https://elsewhere.example")))
        .status,
    ).toBe(403);
    expect((await POST(request({ term: "x".repeat(9000) }))).status).toBe(413);
  });
  it("recognises the browser origin when dev internally binds 0.0.0.0 and rejects guests before constructing a client", async () => {
    const req = new NextRequest("http://0.0.0.0:3000/api/dictionary", {
      method: "POST",
      headers: {
        host: "localhost:3000",
        origin: "http://localhost:3000",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ term: "hello", mode: "ai" }),
    });
    expect(await (await POST(req)).json()).toEqual({
      ok: false,
      error: "unauthorized",
    });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("requires a session for explicit AI and distinguishes auth outage", async () => {
    user(null);
    expect((await POST(request({ term: "a", mode: "ai" }))).status).toBe(401);
    user(null, 503);
    expect(
      await (await POST(request({ term: "a", mode: "ai" }))).json(),
    ).toEqual({ ok: false, error: "auth_unavailable" });
    expect(check).not.toHaveBeenCalled();
  });
  it("reports absent AI configuration without calling provider", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect(
      await (await POST(request({ term: "a", mode: "ai" }))).json(),
    ).toEqual({ ok: false, error: "ai_unavailable" });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("enforces a per-user AI limiter", async () => {
    check.mockResolvedValue({ success: false });
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect((await POST(request({ term: "a", mode: "ai" }))).status).toBe(429);
    expect(check).toHaveBeenCalledWith("dictionary:learner-a");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("labels validated contextual AI output and supplies only term/context as learner data", async () => {
    const entry = {
      word: "a",
      meaning_vn: "một",
      example_en: "I saw a dog.",
      example_vn: "Tôi thấy một con chó.",
    };
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [
            { content: { parts: [{ text: JSON.stringify(entry) }] } },
          ],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetcher);
    const response = await POST(
      request({ term: "a", context: "I saw a dog.", mode: "ai" }),
    );
    expect(await response.json()).toEqual({ ok: true, source: "ai", entry });
    const payload = JSON.parse(fetcher.mock.calls[0][1].body);
    expect(JSON.parse(payload.contents[0].parts[0].text)).toEqual({
      term: "a",
      context: "I saw a dog.",
    });
    expect(payload.generationConfig.responseMimeType).toBe("application/json");
  });
  it.each([
    "bad json",
    JSON.stringify({ word: "a" }),
    JSON.stringify({ word: "a", meaning_vn: "một", unexpected: "field" }),
  ])("rejects invalid model output", async (text) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            candidates: [{ content: { parts: [{ text }] } }],
          }),
        ),
      ),
    );
    expect(
      await (await POST(request({ term: "a", mode: "ai" }))).json(),
    ).toEqual({ ok: false, error: "ai_failed" });
  });
  it("keeps model misses and timeouts explicit", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            candidates: [{ content: { parts: [{ text: "null" }] } }],
          }),
        ),
      ),
    );
    expect(
      await (await POST(request({ term: "unknown", mode: "ai" }))).json(),
    ).toEqual({ ok: true, source: "ai", entry: null });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("Timeout", "TimeoutError")),
    );
    expect((await POST(request({ term: "a", mode: "ai" }))).status).toBe(504);
  });
});

describe("context_gloss cache (ai_results)", () => {
  const CACHED_ENTRY = {
    word: "bank",
    meaning_vn: "bờ sông",
  };
  it("replays a cached gloss without calling Gemini", async () => {
    aiRows.value = { output: { entry: CACHED_ENTRY } };
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const res = await POST(request({ term: "bank", mode: "ai" }));
    expect(await res.json()).toEqual({
      ok: true,
      source: "ai",
      entry: CACHED_ENTRY,
    });
    expect(fetcher).not.toHaveBeenCalled();
    // The cache read is scoped to the learner + kind + model.
    const eqs = tableCalls
      .filter((c) => c.table === "ai_results" && c.method === "eq")
      .map((c) => c.args);
    expect(eqs).toContainEqual(["kind", "context_gloss"]);
    expect(eqs).toContainEqual(["model", "gemini-2.5-flash"]);
    expect(eqs).toContainEqual(["user_id", "learner-a"]);
  });

  it("caches a fresh gloss into ai_results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: JSON.stringify(CACHED_ENTRY) }],
                },
              },
            ],
          }),
        ),
      ),
    );
    const res = await POST(request({ term: "bank", mode: "ai" }));
    expect(await res.json()).toMatchObject({
      ok: true,
      source: "ai",
      entry: CACHED_ENTRY,
    });
    const insert = tableCalls.find(
      (c) => c.table === "ai_results" && c.method === "insert",
    );
    expect(insert?.args[0]).toMatchObject({
      kind: "context_gloss",
      model: "gemini-2.5-flash",
      output: { entry: CACHED_ENTRY },
    });
    expect((insert?.args[0] as { input_hash: string }).input_hash).toMatch(
      /^[0-9a-f]{64}$/,
    );
  });
});
