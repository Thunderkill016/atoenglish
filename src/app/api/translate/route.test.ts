import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { NEON_AUTH_SESSION_COOKIE_NAME } from "@neondatabase/auth/server";
import { createClient } from "@/lib/supabase/server";
import { POST } from "./route";
import { translationTextHash } from "@/lib/video/translation-cache";
const { check, binding } = vi.hoisted(() => ({
  check: vi.fn(),
  binding: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/video/workers-ai-binding", () => ({
  workersAiBinding: binding,
}));
vi.mock("@/lib/security/rate-limit", () => ({
  createRateLimiter: () => ({ check }),
  getClientIp: () => "203.0.113.10",
}));
const input = {
  language: "vi",
  lines: [
    { i: 2, text: "I did not sell it." },
    { i: 4, text: "It cost $12.50." },
  ],
  before: [],
  after: [],
};
function request(
  body: unknown = input,
  cookie = true,
  origin = "http://localhost:3000",
) {
  return new NextRequest("http://localhost:3000/api/translate", {
    method: "POST",
    headers: {
      origin,
      "Content-Type": "application/json",
      ...(cookie ? { cookie: `${NEON_AUTH_SESSION_COOKIE_NAME}=test` } : {}),
    },
    body: JSON.stringify(body),
  });
}
function model(lines: unknown, finishReason = "STOP") {
  return new Response(
    JSON.stringify({
      candidates: [
        {
          finishReason,
          content: {
            parts: [
              { thought: true, text: "private reasoning" },
              { text: JSON.stringify(lines) },
            ],
          },
        },
      ],
    }),
    { status: 200 },
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("SUBTITLE_LOCAL_ENABLED", "false");
  vi.stubEnv("GEMINI_API_KEY", "test-only");
  vi.stubEnv("SUBTITLE_GEMINI_ENABLED", "true");
  check.mockResolvedValue({ success: true });
  vi.mocked(createClient).mockResolvedValue({
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: { id: "owner" } }, error: null }),
    },
  } as unknown as Awaited<ReturnType<typeof createClient>>);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("optional cloud subtitles", () => {
  it("uses only the explicitly selected local model with contextual source IDs", async () => {
    vi.stubEnv("SUBTITLE_LOCAL_ENABLED", "true");
    vi.stubEnv(
      "SUBTITLE_LOCAL_URL",
      "http://127.0.0.1:8089/v1/chat/completions",
    );
    vi.stubEnv("SUBTITLE_LOCAL_KEY", "local-test-key");
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          model: "hymt2-1.8b-q4",
          choices: [
            {
              finish_reason: "stop",
              message: { content: "Tôi không bán nó." },
            },
          ],
        }),
      ),
    );
    vi.stubGlobal("fetch", fetcher);
    const response = await POST(request({ ...input, lines: [input.lines[0]] }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ok: true,
      source: "ai",
      model: "hymt2-1.8b-q4",
      lines: [{ i: 2, vi: "Tôi không bán nó." }],
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][0].toString()).toContain("127.0.0.1:8089");
  });
  it("lets guests reach the engine with the narrower limit and rejects oversized local batches before auth or provider work", async () => {
    vi.stubEnv("SUBTITLE_LOCAL_ENABLED", "true");
    vi.stubEnv(
      "SUBTITLE_LOCAL_URL",
      "http://127.0.0.1:8089/v1/chat/completions",
    );
    vi.stubEnv("SUBTITLE_LOCAL_KEY", "local-test-key");
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          model: "hymt2-1.8b-q4",
          choices: [
            {
              finish_reason: "stop",
              message: { content: "Khách vẫn dịch được." },
            },
          ],
        }),
      ),
    );
    vi.stubGlobal("fetch", fetcher);
    // Guest (no session cookie) now falls through to the engine — mission 008.
    expect(
      (await POST(request({ ...input, lines: [input.lines[0]] }, false)))
        .status,
    ).toBe(200);
    expect((await POST(request())).status).toBe(400);
    // createClient ran once — for the guest request; the 400 never reaches auth.
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("does not call Gemini when the selected local backend fails", async () => {
    vi.stubEnv("SUBTITLE_LOCAL_ENABLED", "true");
    vi.stubEnv(
      "SUBTITLE_LOCAL_URL",
      "http://127.0.0.1:8089/v1/chat/completions",
    );
    vi.stubEnv("SUBTITLE_LOCAL_KEY", "local-test-key");
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response("local unavailable", { status: 503 }));
    vi.stubGlobal("fetch", fetcher);
    expect(
      (await POST(request({ ...input, lines: [input.lines[0]] }))).status,
    ).toBe(502);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("never contacts an external provider by default, even with a configured key", async () => {
    vi.stubEnv("SUBTITLE_GEMINI_ENABLED", "");
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect((await POST(request())).status).toBe(503);
    expect(fetcher).not.toHaveBeenCalled();
    expect(createClient).not.toHaveBeenCalled();
  });
  it("rejects invalid IDs and cross-origin before auth/provider work, guests reach the engine", async () => {
    expect(
      (
        await POST(
          request({ ...input, lines: [input.lines[0], input.lines[0]] }),
        )
      ).status,
    ).toBe(400);
    expect(
      (await POST(request(input, true, "https://other.example"))).status,
    ).toBe(403);
    expect(createClient).not.toHaveBeenCalled();
    // Guest path: rate-limited per IP but not blocked — mobile browsers have
    // no Translator API and no shell bridge (mission 008).
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(model([{ i: 2, vi: "Khách." }])),
    );
    const guest = await POST(
      request({ ...input, lines: [input.lines[0]] }, false),
    );
    expect(guest.status).toBe(200);
    expect(await guest.json()).toMatchObject({
      ok: true,
      lines: [{ i: 2, vi: "Khách." }],
    });
  });
  it("validates returned IDs without inventing missing translations", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(model([{ i: 4, vi: "Giá 12,50 đô la." }]));
    vi.stubGlobal("fetch", fetcher);
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ok: true,
      source: "ai",
      lines: [{ i: 4, vi: "Giá 12,50 đô la." }],
    });
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = JSON.parse(fetcher.mock.calls[0][1].body);
    expect(JSON.parse(body.contents[0].parts[0].text)).toEqual(input);
  });
  it.each([
    [{ i: 99, vi: "Sai" }],
    [
      { i: 2, vi: "A" },
      { i: 2, vi: "B" },
    ],
    [{ i: 2, vi: "" }],
  ])("rejects misaligned output", async (...lines) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(model(lines)));
    expect((await POST(request())).status).toBe(502);
  });
  it("stops at quota and reports retry timing without repeating calls", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response("quota", { status: 429 }));
    vi.stubGlobal("fetch", fetcher);
    const response = await POST(request());
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("does not publish a truncated candidate", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(model([{ i: 2, vi: "Một phần" }], "MAX_TOKENS")),
    );
    expect((await POST(request())).status).toBe(502);
  });
  describe("Workers AI engine", () => {
    beforeEach(() => vi.stubEnv("SUBTITLE_WORKERS_AI_ENABLED", "true"));
    const one = { ...input, lines: [input.lines[0]] };
    function aiReply(content: string) {
      return {
        run: vi.fn().mockResolvedValue({
          choices: [{ finish_reason: "stop", message: { content } }],
        }),
      };
    }

    it("translates through the AI binding with pinned provenance and no Gemini call", async () => {
      const ai = aiReply('[{"i": 2, "vi": "Tôi không bán nó."}]');
      binding.mockResolvedValue(ai);
      const fetcher = vi.fn();
      vi.stubGlobal("fetch", fetcher);
      const response = await POST(request(one));
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        ok: true,
        model: "@cf/google/gemma-4-26b-a4b-it",
        profile: "gemma-4-26b-a4b-it@workers-ai/nothink-t0.2/p1",
        lines: [{ i: 2, vi: "Tôi không bán nó." }],
      });
      expect(ai.run).toHaveBeenCalledTimes(1);
      expect(fetcher).not.toHaveBeenCalled();
    });

    it("rejects multi-cue batches before auth or model work", async () => {
      expect((await POST(request())).status).toBe(400);
      expect(createClient).not.toHaveBeenCalled();
      expect(binding).not.toHaveBeenCalled();
    });

    it("reports unavailable when the binding is missing, without falling back to Gemini", async () => {
      binding.mockResolvedValue(null);
      const fetcher = vi.fn();
      vi.stubGlobal("fetch", fetcher);
      const response = await POST(request(one));
      expect(response.status).toBe(503);
      expect(await response.json()).toMatchObject({ error: "ai_unavailable" });
      expect(fetcher).not.toHaveBeenCalled();
    });

    it("maps unusable output to invalid_output and model errors to ai_failed", async () => {
      binding.mockResolvedValue(aiReply('[{"i": 99, "vi": "Sai"}]'));
      const bad = await POST(request(one));
      expect(bad.status).toBe(502);
      expect(await bad.json()).toMatchObject({ error: "invalid_output" });
      binding.mockResolvedValue({
        run: vi.fn().mockRejectedValue(new Error("3040: out of capacity")),
      });
      const failed = await POST(request(one));
      expect(failed.status).toBe(502);
      expect(await failed.json()).toMatchObject({ error: "ai_failed" });
    });
  });

  describe("m2m100 engine (mobile fallback, mission 008)", () => {
    beforeEach(() => {
      vi.stubEnv("SUBTITLE_M2M100_ENABLED", "true");
      vi.stubEnv("SUBTITLE_GEMINI_ENABLED", "");
      vi.stubEnv("SUBTITLE_WORKERS_AI_ENABLED", "");
      vi.stubEnv("SUBTITLE_LOCAL_ENABLED", "");
    });
    const one = { ...input, lines: [input.lines[0]] };

    it("translates with the dedicated MT model and source/target language params", async () => {
      const ai = {
        run: vi
          .fn()
          .mockResolvedValue({ translated_text: "Tôi không bán nó." }),
      };
      binding.mockResolvedValue(ai);
      const fetcher = vi.fn();
      vi.stubGlobal("fetch", fetcher);
      const response = await POST(request(one));
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        ok: true,
        model: "@cf/meta/m2m100-1.2b",
        profile: "m2m100-1.2b@workers-ai/en-vi-v1",
        lines: [{ i: 2, vi: "Tôi không bán nó." }],
      });
      expect(ai.run).toHaveBeenCalledWith("@cf/meta/m2m100-1.2b", {
        text: input.lines[0].text,
        source_lang: "en",
        target_lang: "vi",
      });
      expect(fetcher).not.toHaveBeenCalled();
    });

    it("translates a small batch in one request with per-line degradation", async () => {
      const ai = {
        run: vi
          .fn()
          .mockResolvedValueOnce({ translated_text: "A" })
          .mockRejectedValueOnce(new Error("one bad cue")),
      };
      binding.mockResolvedValue(ai);
      const response = await POST(request());
      expect(response.status).toBe(200);
      const body = await response.json();
      // One failed cue degrades to a null line; it never sinks the batch.
      expect(body.lines).toEqual([
        { i: 2, vi: "A" },
        { i: 4, vi: null },
      ]);
      expect(ai.run).toHaveBeenCalledTimes(2);
    });

    it("rejects batches larger than the engine's bounded batch size", async () => {
      const ai = { run: vi.fn() };
      binding.mockResolvedValue(ai);
      const lines = Array.from({ length: 9 }, (_, n) => ({
        i: n * 2,
        text: `Cue ${n}.`,
      }));
      expect((await POST(request({ ...input, lines }))).status).toBe(400);
      expect(ai.run).not.toHaveBeenCalled();
    });

    it("maps binding errors to ai_failed and missing binding to ai_unavailable", async () => {
      binding.mockResolvedValue({
        run: vi.fn().mockRejectedValue(new Error("capacity")),
      });
      expect((await POST(request(one))).status).toBe(502);
      binding.mockResolvedValue(null);
      const missing = await POST(request(one));
      expect(missing.status).toBe(503);
      expect(await missing.json()).toMatchObject({ error: "ai_unavailable" });
    });

    it("degrades an oversized model output to a retryable null line", async () => {
      const ai = {
        run: vi
          .fn()
          .mockResolvedValueOnce({ translated_text: "A" })
          .mockResolvedValueOnce({ translated_text: "x".repeat(7000) }),
      };
      binding.mockResolvedValue(ai);
      const response = await POST(request());
      expect(response.status).toBe(200);
      expect((await response.json()).lines).toEqual([
        { i: 2, vi: "A" },
        { i: 4, vi: null },
      ]);
    });
  });

  describe("persisted subtitle cache", () => {
    const videoId = "a1b2c3d4e5f";
    const cachedBody = { ...input, videoId };
    function table(rows: object[]) {
      const upsert = vi.fn().mockResolvedValue({ error: null });
      // select().eq().eq().eq().in() chain — every filter returns the same chain.
      const chain: Record<string, unknown> = {};
      chain.eq = vi.fn().mockReturnValue(chain);
      chain.in = vi.fn().mockResolvedValue({ data: rows, error: null });
      chain.select = vi.fn().mockReturnValue(chain);
      chain.upsert = upsert;
      const tableMock = vi.fn().mockImplementation((name: string) => {
        expect(name).toBe("subtitle_translations");
        return chain;
      });
      vi.mocked(createClient).mockResolvedValueOnce({
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from: tableMock,
      } as never);
      return { tableMock, upsert };
    }

    it("serves cache hits without provider calls and stores only the miss", async () => {
      const hash = await translationTextHash(input.lines[0].text);
      const { upsert } = table([
        { line_i: 2, text_hash: hash, vi: "Đã cache." },
      ]);
      const fetcher = vi
        .fn()
        .mockResolvedValue(model([{ i: 4, vi: "Đáp lại." }]));
      vi.stubGlobal("fetch", fetcher);
      const response = await POST(request(cachedBody));
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.lines).toEqual([
        { i: 2, vi: "Đã cache." },
        { i: 4, vi: "Đáp lại." },
      ]);
      const envelope = JSON.parse(fetcher.mock.calls[0][1].body);
      const sent = JSON.parse(envelope.contents[0].parts[0].text);
      expect(sent.lines).toEqual([{ i: 4, text: input.lines[1].text }]);
      // The cache key is ours — providers get the transcript, not the video id.
      expect(sent.videoId).toBeUndefined();
      // Persisted the fresh miss under the user+video+profile+hash key.
      expect(upsert).toHaveBeenCalledTimes(1);
      const [rows] = upsert.mock.calls[0];
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        user_id: "user-1",
        video_id: videoId,
        line_i: 4,
        vi: "Đáp lại.",
      });
      expect(rows[0].text_hash).toBe(
        await translationTextHash(input.lines[1].text),
      );
    });

    it("re-translates when the source text changed under the same line id", async () => {
      const stale = await translationTextHash("an older caption text");
      const { upsert } = table([
        { line_i: 2, text_hash: stale, vi: "Bản cũ." },
      ]);
      const fetcher = vi
        .fn()
        .mockResolvedValue(model([{ i: 2, vi: "Bản mới." }]));
      vi.stubGlobal("fetch", fetcher);
      const response = await POST(
        request({ ...cachedBody, lines: [input.lines[0]] }),
      );
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.lines).toEqual([{ i: 2, vi: "Bản mới." }]);
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(upsert).toHaveBeenCalledTimes(1);
    });

    it("guests skip the persisted cache entirely", async () => {
      // Free engine — guests are 401 on the billed Gemini path.
      vi.stubEnv("SUBTITLE_GEMINI_ENABLED", "");
      vi.stubEnv("SUBTITLE_M2M100_ENABLED", "true");
      binding.mockResolvedValue({
        run: vi.fn().mockResolvedValue({ translated_text: "Khách." }),
      });
      const guestFrom = vi.fn();
      vi.mocked(createClient).mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
        from: guestFrom,
      } as never);
      const response = await POST(request(cachedBody, false));
      expect(response.status).toBe(200);
      expect(guestFrom).not.toHaveBeenCalled();
    });
  });

  it("does not contact a provider after the user rate limit", async () => {
    check.mockResolvedValue({ success: false });
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect((await POST(request())).status).toBe(429);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("rate-limits guests per IP on the narrower guest limiter", async () => {
    check.mockResolvedValue({ success: false });
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect((await POST(request(input, false))).status).toBe(429);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("keeps the billed Gemini engine account-bound — guests get 401 before any budget spend", async () => {
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as never);
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const response = await POST(request(input, false));
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ error: "unauthorized" });
    // Rejected before the limiter — a doomed request must not burn budget.
    expect(check).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("maps auth-infrastructure failures to auth_unavailable, not ai_failed", async () => {
    vi.mocked(createClient).mockRejectedValueOnce(new Error("auth down"));
    expect((await POST(request())).status).toBe(503);
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockRejectedValue(new Error("session store down")),
      },
    } as never);
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      error: "auth_unavailable",
    });
  });
});
