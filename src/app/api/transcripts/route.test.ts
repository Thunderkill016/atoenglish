import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

const { importYoutubeCaptions } = vi.hoisted(() => ({
  importYoutubeCaptions: vi.fn(),
}));
vi.mock("@/app/actions/captions", () => ({ importYoutubeCaptions }));

const VALID_ID = "8DfvwZ812dM";

function req(body: unknown, raw = false) {
  return new NextRequest("http://localhost:3000/api/transcripts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: raw ? (body as string) : JSON.stringify(body),
  });
}

describe("POST /api/transcripts (extension sync endpoint)", () => {
  it("400 on malformed JSON", async () => {
    const res = await POST(req("{not json", true));
    expect(res.status).toBe(400);
    expect(importYoutubeCaptions).not.toHaveBeenCalled();
  });

  it("400 on an invalid video id — action never runs", async () => {
    const res = await POST(req({ videoId: "nope", payload: {} }));
    expect(res.status).toBe(400);
    expect(importYoutubeCaptions).not.toHaveBeenCalled();
  });

  it("401 when the action reports unauthorized", async () => {
    importYoutubeCaptions.mockResolvedValueOnce({
      ok: false,
      error: "unauthorized",
    });
    const res = await POST(req({ videoId: VALID_ID, payload: {} }));
    expect(res.status).toBe(401);
  });

  it("429 when rate limited", async () => {
    importYoutubeCaptions.mockResolvedValueOnce({
      ok: false,
      error: "rate_limited",
    });
    const res = await POST(req({ videoId: VALID_ID, payload: {} }));
    expect(res.status).toBe(429);
  });

  it("400 when the payload fails validation", async () => {
    importYoutubeCaptions.mockResolvedValueOnce({
      ok: false,
      error: "invalid_file",
    });
    const res = await POST(req({ videoId: VALID_ID, payload: {} }));
    expect(res.status).toBe(400);
  });

  it("200 + summary on success", async () => {
    importYoutubeCaptions.mockResolvedValueOnce({
      ok: true,
      sentences: [{ i: 0 }],
      origin: "youtube_manual",
      saved: true,
    });
    const res = await POST(
      req({ videoId: VALID_ID, payload: { videoId: VALID_ID } }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      ok: true,
      videoId: VALID_ID,
      sentenceCount: 1,
      origin: "youtube_manual",
    });
    expect(importYoutubeCaptions).toHaveBeenCalledWith(VALID_ID, {
      videoId: VALID_ID,
    });
  });
});
