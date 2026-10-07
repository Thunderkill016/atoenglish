import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

const BASE = "http://localhost:3000";

function req(qs: string) {
  return new NextRequest(`${BASE}/share${qs}`);
}

describe("GET /share (PWA share_target intake)", () => {
  it("redirects a shared YouTube URL inside `text` to /watch", async () => {
    const res = await GET(
      req(`?text=${encodeURIComponent("https://youtu.be/8DfvwZ812dM")}`),
    );
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(`${BASE}/watch/8DfvwZ812dM`);
  });

  it("extracts the URL token from `title text url` share format", async () => {
    // Android share sheet: text often carries "Title <url>".
    const text = encodeURIComponent(
      "Build and Deploy https://www.youtube.com/watch?v=8jPQjjsBbIc",
    );
    const res = await GET(req(`?text=${text}`));
    expect(res.headers.get("location")).toBe(`${BASE}/watch/8jPQjjsBbIc`);
  });

  it("uses `url` when text is absent", async () => {
    const res = await GET(
      req(`?url=${encodeURIComponent("https://youtu.be/8DfvwZ812dM")}`),
    );
    expect(res.headers.get("location")).toBe(`${BASE}/watch/8DfvwZ812dM`);
  });

  it("rejects a lookalike host — no open-redirect through the id", async () => {
    const res = await GET(
      req(
        `?text=${encodeURIComponent("https://youtube.com.evil.tld/watch?v=x")}`,
      ),
    );
    expect(res.headers.get("location")).toBe(`${BASE}/discover`);
  });

  it("falls back to /discover for unparseable shares", async () => {
    const res = await GET(req(`?text=${encodeURIComponent("hello world")}`));
    expect(res.headers.get("location")).toBe(`${BASE}/discover`);
  });

  it("falls back to /discover when params are empty", async () => {
    const res = await GET(req(""));
    expect(res.headers.get("location")).toBe(`${BASE}/discover`);
  });
});
