import { NextResponse, type NextRequest } from "next/server";
import { getAuth } from "@/lib/auth";
import { createRateLimiter, getClientIp } from "@/lib/security/rate-limit";

// Same-origin proxy to the Neon Auth service. The browser SDK calls
// /api/auth/* so session cookies are set on our domain.
//
// Rate limiting lives HERE, not only in src/proxy.ts: under vinext/Workers
// the proxy middleware is not guaranteed to run for route handlers (it
// demonstrably doesn't on production — 45 rapid sign-in requests returned
// 401×45 with zero 429s). The route handler is the trusted boundary.
const authRateLimiter = createRateLimiter(
  30,
  60 * 1000,
  "auth",
  "AUTH_RATE_LIMITER",
);

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, context: RouteContext) {
  const clientKey = getClientIp(request);
  const { success, limit, remaining, resetTime, backend } =
    await authRateLimiter.check(clientKey);
  const backendHeader: Record<string, string> = backend
    ? { "X-RateLimit-Backend": backend, "X-RateLimit-Key": clientKey }
    : {};
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
          ...backendHeader,
        },
      },
    );
  }

  const auth = await getAuth();
  const handlers = auth.handler() as Record<
    string,
    (req: NextRequest, ctx: RouteContext) => Promise<Response>
  >;
  const response =
    (await handlers[request.method]?.(request, context)) ??
    new Response(null, { status: 405 });
  if (!backend) return response;
  const headers = new Headers(response.headers);
  headers.set("X-RateLimit-Backend", backend);
  headers.set("X-RateLimit-Key", clientKey);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
