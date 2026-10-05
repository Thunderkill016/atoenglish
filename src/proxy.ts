import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/session";
import { createRateLimiter, getClientIp } from "@/lib/security/rate-limit";

// Rate limit auth routes (login, callback, credential endpoints) to 30
// requests per minute per client IP. `/api/auth/` is the Better Auth route
// group — sign-in/sign-up/reset POSTs land here and must be throttled too.
// AUTH_RATE_LIMITER is the Workers rate-limit binding (cloudflare.config.ts);
// without it, in-memory counting is per-isolate and never trips in prod.
const authRateLimiter = createRateLimiter(30, 60 * 1000, "auth", {
  durableObject: "AUTH_RATE_LIMIT_DO",
  rateLimit: "AUTH_RATE_LIMITER",
});

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname === "/login" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/auth")
  ) {
    const ip = getClientIp(request);
    const { success, limit, remaining, resetTime } =
      await authRateLimiter.check(ip);

    if (!success) {
      return new NextResponse(
        "Too Many Requests. Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi và thử lại sau.",
        {
          status: 429,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": resetTime.toString(),
          },
        },
      );
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|sw.js|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
