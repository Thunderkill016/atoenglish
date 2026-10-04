import { describe, it, expect, afterEach, vi } from "vitest";
import { checkHasSession } from "@/lib/auth-check";

// checkHasSession() asks the Better Auth session endpoint because the
// Neon session cookies are HttpOnly and invisible to document.cookie.

describe("checkHasSession", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function mockFetch(status: number, body: unknown) {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), { status }),
    );
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("returns true when the session endpoint returns a session", async () => {
    const fetchMock = mockFetch(200, {
      session: { id: "s1" },
      user: { id: "u1" },
    });
    await expect(checkHasSession()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/get-session", {
      credentials: "include",
    });
  });

  it("returns false when the endpoint returns null (anonymous)", async () => {
    mockFetch(200, null);
    await expect(checkHasSession()).resolves.toBe(false);
  });

  it("returns false on non-OK responses", async () => {
    mockFetch(401, { error: "unauthorized" });
    await expect(checkHasSession()).resolves.toBe(false);
  });

  it("returns false when fetch rejects (network error)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );
    await expect(checkHasSession()).resolves.toBe(false);
  });

  it("returns false when the payload is not an object", async () => {
    mockFetch(200, "unexpected");
    await expect(checkHasSession()).resolves.toBe(false);
  });

  it("returns false early if window is undefined", async () => {
    const originalWindow = global.window;
    // @ts-expect-error - overriding window for test
    delete global.window;
    try {
      await expect(checkHasSession()).resolves.toBe(false);
    } finally {
      global.window = originalWindow;
    }
  });
});
