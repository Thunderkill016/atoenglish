import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { NEON_AUTH_SESSION_COOKIE_NAME } from "@neondatabase/auth/server";
import { createClient } from "@/lib/supabase/server";
import { POST } from "./route";
const { check } = vi.hoisted(() => ({ check: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/security/rate-limit", () => ({
  createRateLimiter: () => ({ check }),
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
  it("keeps the guest boundary and rejects oversized local batches before auth or provider work", async () => {
    vi.stubEnv("SUBTITLE_LOCAL_ENABLED", "true");
    vi.stubEnv(
      "SUBTITLE_LOCAL_URL",
      "http://127.0.0.1:8089/v1/chat/completions",
    );
    vi.stubEnv("SUBTITLE_LOCAL_KEY", "local-test-key");
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect(
      (await POST(request({ ...input, lines: [input.lines[0]] }, false)))
        .status,
    ).toBe(401);
    expect((await POST(request())).status).toBe(400);
    expect(createClient).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
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
  it("rejects invalid IDs, cross-origin and guests before auth/provider work", async () => {
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
    expect((await POST(request(input, false))).status).toBe(401);
    expect(createClient).not.toHaveBeenCalled();
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
  it("does not contact a provider after the user rate limit", async () => {
    check.mockResolvedValue({ success: false });
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect((await POST(request())).status).toBe(429);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
