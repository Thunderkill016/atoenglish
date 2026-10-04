import { NextResponse, type NextRequest } from "next/server";
import {
  handleAuthProxyRequest,
  NEON_AUTH_SESSION_COOKIE_NAME,
  processAuthMiddleware,
} from "@neondatabase/auth/server";

// Neon Auth session gate for src/proxy.ts.
// Replaces @supabase/ssr updateSession: delegates OAuth verifier exchange and
// session validation to Neon's middleware processor (cookie-cache fast path,
// session refresh Set-Cookie forwarding), while keeping the app's own
// protected-route list and redirect contract (?next + mode=login).
const PROTECTED_ROUTES = [
  // Guests may self-study the trial lesson surface (/learn, /review stay open).
  // /me covers progress, speaking, writing, grammar, pronunciation, settings.
  "/me",
  "/roadmap",
  "/placement",
  "/checkpoint",
  "/quiz",
];

const NEON_AUTH_VERIFIER_PARAM = "neon_auth_session_verifier";

function appendCookies(response: NextResponse, cookies: string[] | undefined) {
  cookies?.forEach((cookie) => response.headers.append("set-cookie", cookie));
  return response;
}

function middlewareConfig(
  request: NextRequest,
  pathname: string,
  needsAuth: boolean,
) {
  return {
    request: request as unknown as Request,
    pathname,
    // Public routes list themselves as skipped so checkSessionRequired allows
    // them; protected routes get an empty skip list and must have a session.
    skipRoutes: needsAuth ? ([] as const) : ([pathname] as const),
    loginUrl: "/login?mode=login",
    baseUrl: process.env.NEON_AUTH_BASE_URL!,
    cookieSecret: process.env.NEON_AUTH_COOKIE_SECRET!,
  };
}

export async function updateSession(request: NextRequest) {
  if (!process.env.NEON_AUTH_BASE_URL || !process.env.NEON_AUTH_COOKIE_SECRET) {
    return NextResponse.next({ request });
  }

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isLoginRoute = pathname === "/login";

  // Skip auth work for public routes (like the landing page) to minimize TTFB —
  // except OAuth returns, which carry the session verifier and must be exchanged.
  const hasVerifier = request.nextUrl.searchParams.has(
    NEON_AUTH_VERIFIER_PARAM,
  );
  if (!isProtectedRoute && !isLoginRoute && !hasVerifier) {
    return NextResponse.next({ request });
  }

  const result = await processAuthMiddleware(
    middlewareConfig(request, pathname, isProtectedRoute),
  );

  if (result.action === "redirect_oauth") {
    return appendCookies(
      NextResponse.redirect(result.redirectUrl),
      result.cookies,
    );
  }

  if (result.action === "redirect_login") {
    // Preserve the intended destination like the previous Supabase flow did.
    result.redirectUrl.searchParams.set("next", pathname);
    return appendCookies(
      NextResponse.redirect(result.redirectUrl),
      result.cookies,
    );
  }

  // allow — authenticated user hitting /login goes to the dashboard instead.
  // Skip the upstream session call when no session cookie is present at all.
  const hasSessionCookie = (request.headers.get("cookie") ?? "").includes(
    NEON_AUTH_SESSION_COOKIE_NAME,
  );
  if (isLoginRoute && hasSessionCookie) {
    const sessionResponse = await handleAuthProxyRequest({
      request: request as unknown as Request,
      path: "get-session",
      baseUrl: process.env.NEON_AUTH_BASE_URL,
      cookieSecret: process.env.NEON_AUTH_COOKIE_SECRET,
    });
    const session = sessionResponse.ok
      ? ((await sessionResponse.json().catch(() => null)) as {
          user?: { id: string } | null;
        } | null)
      : null;
    if (session?.user) {
      const url = request.nextUrl.clone();
      url.pathname = "/learn";
      url.search = "";
      return appendCookies(
        NextResponse.redirect(url),
        sessionResponse.headers.getSetCookie(),
      );
    }
  }

  const response = NextResponse.next({ request });
  return appendCookies(response, result.cookies);
}
