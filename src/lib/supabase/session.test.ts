import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  processAuthMiddleware: vi.fn(),
  handleAuthProxyRequest: vi.fn(),
  next: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@neondatabase/auth/server", () => ({
  processAuthMiddleware: mocks.processAuthMiddleware,
  handleAuthProxyRequest: mocks.handleAuthProxyRequest,
  NEON_AUTH_SESSION_COOKIE_NAME: "neon_auth.session_token",
}));

vi.mock("next/server", () => ({
  NextResponse: {
    next: mocks.next,
    redirect: mocks.redirect,
  },
}));

import { updateSession } from "./session";

type MockHeaders = { append: ReturnType<typeof vi.fn> };
type MockResponse = { headers: MockHeaders };

const originalEnv = {
  baseUrl: process.env.NEON_AUTH_BASE_URL,
  cookieSecret: process.env.NEON_AUTH_COOKIE_SECRET,
};

function createResponse(): MockResponse {
  return { headers: { append: vi.fn() } };
}

function createRequest(pathname: string, search = "") {
  return {
    headers: new Headers({ cookie: "neon_auth.session_token=tok" }),
    nextUrl: {
      pathname,
      searchParams: new URL(`http://localhost${pathname}${search}`).searchParams,
      clone: () => new URL(`http://localhost${pathname}${search}`),
    },
  };
}

function arrangeAuthResult(
  action: "allow" | "redirect_login" | "redirect_oauth",
  overrides: Record<string, unknown> = {},
) {
  if (action === "redirect_login") {
    mocks.processAuthMiddleware.mockResolvedValue({
      action,
      redirectUrl: new URL("http://localhost/login?mode=login"),
      cookies: ["session_data=refreshed; Path=/; HttpOnly"],
      ...overrides,
    });
    return;
  }
  if (action === "redirect_oauth") {
    mocks.processAuthMiddleware.mockResolvedValue({
      action,
      redirectUrl: new URL("http://localhost/auth/callback?next=%2Fdashboard"),
      cookies: ["neon_auth.session_token=tok; Path=/; HttpOnly"],
      ...overrides,
    });
    return;
  }
  mocks.processAuthMiddleware.mockResolvedValue({
    action,
    cookies: ["session_data=refreshed; Path=/; HttpOnly"],
    ...overrides,
  });
}

function arrangeSession(user: { id: string } | null) {
  const setCookies = ["session_data=refreshed; Path=/; HttpOnly"];
  mocks.handleAuthProxyRequest.mockResolvedValue({
    ok: true,
    json: async () => (user ? { user, session: { id: "s1" } } : null),
    headers: { getSetCookie: () => setCookies },
  });
}

describe("updateSession", () => {
  let nextResponses: MockResponse[];
  let redirectResponses: MockResponse[];
  let redirectUrls: string[];

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEON_AUTH_BASE_URL = "https://auth.example.neon.tech";
    process.env.NEON_AUTH_COOKIE_SECRET = "test-secret-test-secret-test-secret-01";

    nextResponses = [];
    redirectResponses = [];
    redirectUrls = [];

    mocks.next.mockImplementation(() => {
      const response = createResponse();
      nextResponses.push(response);
      return response;
    });

    mocks.redirect.mockImplementation((url: URL) => {
      redirectUrls.push(url.toString());
      const response = createResponse();
      redirectResponses.push(response);
      return response;
    });
  });

  afterEach(() => {
    for (const [key, value] of [
      ["NEON_AUTH_BASE_URL", originalEnv.baseUrl],
      ["NEON_AUTH_COOKIE_SECRET", originalEnv.cookieSecret],
    ] as const) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("passes through without auth work when environment variables are missing", async () => {
    delete process.env.NEON_AUTH_BASE_URL;
    delete process.env.NEON_AUTH_COOKIE_SECRET;
    const request = createRequest("/progress");

    const response = await updateSession(request as never);

    expect(response).toBe(nextResponses[0]);
    expect(mocks.processAuthMiddleware).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("does not perform an auth lookup for a public route", async () => {
    const request = createRequest("/");

    const response = await updateSession(request as never);

    expect(response).toBe(nextResponses[0]);
    expect(mocks.processAuthMiddleware).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("redirects an unauthenticated protected request to login and preserves refreshed cookies", async () => {
    arrangeAuthResult("redirect_login");
    const request = createRequest("/progress");

    const response = await updateSession(request as never);

    expect(response).toBe(redirectResponses[0]);
    expect(redirectUrls[0]).toBe(
      "http://localhost/login?mode=login&next=%2Fprogress",
    );
    expect(response.headers.append).toHaveBeenCalledWith(
      "set-cookie",
      "session_data=refreshed; Path=/; HttpOnly",
    );
  });

  it("redirects an authenticated login request to the dashboard", async () => {
    arrangeAuthResult("allow", { cookies: undefined });
    arrangeSession({ id: "user-1" });
    const request = createRequest("/login");

    const response = await updateSession(request as never);

    expect(response).toBe(redirectResponses[0]);
    expect(redirectUrls[0]).toBe("http://localhost/dashboard");
    expect(response.headers.append).toHaveBeenCalledWith(
      "set-cookie",
      "session_data=refreshed; Path=/; HttpOnly",
    );
  });

  it("returns the pass-through response for an authenticated protected request", async () => {
    arrangeAuthResult("allow");
    const request = createRequest("/settings");

    const response = await updateSession(request as never);

    expect(response).toBe(nextResponses[0]);
    expect(response.headers.append).toHaveBeenCalledWith(
      "set-cookie",
      "session_data=refreshed; Path=/; HttpOnly",
    );
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("exchanges an OAuth session verifier and redirects to the clean URL", async () => {
    arrangeAuthResult("redirect_oauth");
    const request = createRequest(
      "/auth/callback",
      "?neon_auth_session_verifier=abc&next=%2Fdashboard",
    );

    const response = await updateSession(request as never);

    expect(mocks.processAuthMiddleware).toHaveBeenCalled();
    expect(response).toBe(redirectResponses[0]);
    expect(redirectUrls[0]).toBe(
      "http://localhost/auth/callback?next=%2Fdashboard",
    );
    expect(response.headers.append).toHaveBeenCalledWith(
      "set-cookie",
      "neon_auth.session_token=tok; Path=/; HttpOnly",
    );
  });
});
