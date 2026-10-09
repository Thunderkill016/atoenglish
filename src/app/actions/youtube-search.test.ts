/**
 * Contract tests for the opt-in YouTube search action (SPEC §10,
 * TASK_CONTRACT slice-6): hidden without a key, `search.list` only,
 * `type=video&videoCaption=closedCaption`, bounded maxResults — with fetch
 * and the rate limiter mocked at the module boundary.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { searchYoutube } from "./youtube-search";

const h = vi.hoisted(() => ({
  limiterCheck: vi.fn(async () => ({ success: true })),
  getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "cf-connecting-ip": "203.0.113.9" }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: h.getUser } }),
}));

vi.mock("@/lib/security/rate-limit", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/security/rate-limit")>();
  return {
    ...actual,
    createRateLimiter: () => ({ check: h.limiterCheck }),
  };
});

const VALID_ITEM = {
  id: { videoId: "dQw4w9WgXcQ" },
  snippet: {
    title: "Never Gonna Give You Up",
    channelTitle: "Rick Astley",
  },
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.stubEnv("YOUTUBE_DATA_API_KEY", "test-key");
  h.limiterCheck.mockClear();
  h.limiterCheck.mockResolvedValue({ success: true });
  h.getUser.mockResolvedValue({ data: { user: null }, error: null });
});

describe("searchYoutube", () => {
  it("refuses without YOUTUBE_DATA_API_KEY and never touches upstream", async () => {
    vi.stubEnv("YOUTUBE_DATA_API_KEY", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const r = await searchYoutube("hello");
    expect(r).toEqual({ ok: false, error: "unavailable" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("calls only search.list with the required params and a bounded maxResults", async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse(200, { items: [VALID_ITEM] }),
    );
    vi.stubGlobal("fetch", fetchSpy);
    const r = await searchYoutube("english conversation");
    expect(r.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url] = fetchSpy.mock.calls[0] as unknown as [string];
    expect(url).toContain("googleapis.com/youtube/v3/search?");
    const params = new URL(url).searchParams;
    expect(params.get("part")).toBe("snippet");
    expect(params.get("type")).toBe("video");
    expect(params.get("videoCaption")).toBe("closedCaption");
    expect(params.get("videoEmbeddable")).toBe("true");
    expect(Number(params.get("maxResults"))).toBeLessThanOrEqual(10);
    expect(params.get("q")).toBe("english conversation");
    expect(params.get("key")).toBe("test-key");
    if (r.ok) {
      expect(r.videos).toEqual([
        {
          id: "dQw4w9WgXcQ",
          title: "Never Gonna Give You Up",
          channel: "Rick Astley",
        },
      ]);
    }
  });

  it("drops malformed items instead of failing the whole list", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(200, {
          items: [
            {
              id: { videoId: "bad id!" },
              snippet: { title: "x", channelTitle: "y" },
            },
            { kind: "youtube#playlist", id: { playlistId: "PL123" } },
            VALID_ITEM,
          ],
        }),
      ),
    );
    const r = await searchYoutube("rick astley");
    expect(r).toEqual({
      ok: true,
      videos: [
        {
          id: "dQw4w9WgXcQ",
          title: "Never Gonna Give You Up",
          channel: "Rick Astley",
        },
      ],
    });
  });

  it("maps YouTube quota exhaustion to the honest quota error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(403, {
          error: { errors: [{ reason: "quotaExceeded" }] },
        }),
      ),
    );
    expect(await searchYoutube("anything")).toEqual({
      ok: false,
      error: "quota",
    });
  });

  it("maps other upstream failures to upstream without leaking detail", async () => {
    for (const status of [400, 500]) {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => jsonResponse(status, { error: {} })),
      );
      expect(await searchYoutube("anything")).toEqual({
        ok: false,
        error: "upstream",
      });
    }
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("socket hangup");
      }),
    );
    expect(await searchYoutube("anything")).toEqual({
      ok: false,
      error: "upstream",
    });
  });

  it("honours the rate limiter before spending quota upstream", async () => {
    h.limiterCheck.mockResolvedValue({ success: false });
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    expect(await searchYoutube("anything")).toEqual({
      ok: false,
      error: "rate_limited",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects empty or trivial queries before rate-limit or upstream work", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    expect(await searchYoutube("  ")).toEqual({
      ok: false,
      error: "invalid_query",
    });
    expect(await searchYoutube("a")).toEqual({
      ok: false,
      error: "invalid_query",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(h.limiterCheck).not.toHaveBeenCalled();
  });

  it("bounds the result count even when upstream returns more", async () => {
    const items = Array.from({ length: 25 }, (_, i) => ({
      id: { videoId: `abc${String(i).padStart(8, "0")}` },
      snippet: { title: `v${i}`, channelTitle: "ch" },
    }));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(200, { items })),
    );
    const r = await searchYoutube("many results");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.videos.length).toBeLessThanOrEqual(10);
  });
});
