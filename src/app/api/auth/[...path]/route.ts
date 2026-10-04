import type { NextRequest } from "next/server";
import { getAuth } from "@/lib/auth";

// Same-origin proxy to the Neon Auth service. The browser SDK calls
// /api/auth/* so session cookies are set on our domain.
type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, context: RouteContext) {
  const auth = await getAuth();
  const handlers = auth.handler() as Record<
    string,
    (req: NextRequest, ctx: RouteContext) => Promise<Response>
  >;
  return handlers[request.method]?.(request, context) ?? new Response(null, { status: 405 });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
