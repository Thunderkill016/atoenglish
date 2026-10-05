import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

// updateSession delegates OAuth verifier exchange + session checks to Neon's
// middleware processor — mock the boundary so the routing contract is tested
// without the auth service.
const processAuthMiddleware = vi.fn();
const handleAuthProxyRequest = vi.fn();

vi.mock("@neondatabase/auth/server", () => ({
  NEON_AUTH_SESSION_COOKIE_NAME: "neon_auth_session",
  processAuthMiddleware: (...args: unknown[]) => processAuthMiddleware(...args),
  handleAuthProxyRequest: (...args: unknown[]) =>
    handleAuthProxyRequest(...args),
}));

import { updateSession } from "@/lib/supabase/session";

const BASE = "https://atoenglish.thunderkill016.workers.dev";

function req(path: string) {
  return new NextRequest(`${BASE}${path}`);
}

describe("updateSession", () => {
  beforeEach(() => {
    vi.stubEnv("NEON_AUTH_BASE_URL", "https://auth.example.test");
    vi.stubEnv("NEON_AUTH_COOKIE_SECRET", "test-secret");
    processAuthMiddleware.mockReset();
    handleAuthProxyRequest.mockReset();
  });

  it("passes public routes through without touching the auth processor", async () => {
    const res = await updateSession(req("/"));
    expect(res.status).toBe(200);
    expect(processAuthMiddleware).not.toHaveBeenCalled();
  });

  it("reroutes an OAuth verifier landing on / through /auth/callback", async () => {
    // Neon managed OAuth returns the user to the trusted-domain root with the
    // session verifier; after the exchange Neon resolves the redirect target
    // to "/". The post-auth destination belongs to the app callback route so
    // user_progress seeding and the next= contract still run.
    processAuthMiddleware.mockResolvedValue({
      action: "redirect_oauth",
      redirectUrl: new URL(`${BASE}/`),
      cookies: ["neon_auth_session=abc; Path=/; HttpOnly"],
    });

    const res = await updateSession(req("/?neon_auth_session_verifier=xyz"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(`${BASE}/auth/callback`);
    expect(res.headers.get("set-cookie")).toContain("neon_auth_session");
  });

  it("preserves a verifier exchange that already targets /auth/callback", async () => {
    processAuthMiddleware.mockResolvedValue({
      action: "redirect_oauth",
      redirectUrl: new URL(`${BASE}/auth/callback?next=%2Flearn`),
      cookies: [],
    });

    const res = await updateSession(
      req("/auth/callback?next=%2Flearn&neon_auth_session_verifier=xyz"),
    );
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      `${BASE}/auth/callback?next=%2Flearn`,
    );
  });

  it("redirects anonymous users on protected routes to /login with context", async () => {
    const redirectUrl = new URL(`${BASE}/login?mode=login`);
    processAuthMiddleware.mockResolvedValue({
      action: "redirect_login",
      redirectUrl,
      cookies: [],
    });

    const res = await updateSession(req("/me/progress"));
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("next")).toBe("/me/progress");
    expect(location.searchParams.get("mode")).toBe("login");
  });
});
