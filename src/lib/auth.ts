import type { createNeonAuth } from "@neondatabase/neon-js/auth/next/server";

type NeonAuth = ReturnType<typeof createNeonAuth>;

// Lazily-created Neon Auth (Managed Better Auth) server instance.
// The dynamic import keeps `next/headers` (pulled in transitively by the
// adapter) out of the module graph at import time — test environments that
// statically import server actions would otherwise fail to resolve it.
//
// - `auth.getSession()` reads the signed session cookies via next/headers
//   inside RSCs, server actions and route handlers.
// - `auth.handler()` powers /api/auth/[...path] (browser-facing auth endpoints).
// - `auth.middleware()` exists but we keep our own route rules in
//   src/lib/supabase/session.ts — see updateSession.
let instance: NeonAuth | null = null;

export async function getAuth(): Promise<NeonAuth> {
  if (!instance) {
    const { createNeonAuth } = await import(
      "@neondatabase/neon-js/auth/next/server"
    );
    instance = createNeonAuth({
      baseUrl: process.env.NEON_AUTH_BASE_URL!,
      cookies: {
        secret: process.env.NEON_AUTH_COOKIE_SECRET!,
      },
    });
  }
  return instance;
}
