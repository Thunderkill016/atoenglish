import { createClient as createDataClient } from "@neondatabase/neon-js";
import { NEON_AUTH_SESSION_COOKIE_NAME } from "@neondatabase/auth/server";
import { cookies } from "next/headers";
import { getAuth } from "@/lib/auth";

import type { Database } from "@/types/supabase";

// Server-side data client. The external-auth form of `createClient` injects
// the caller's JWT (from `auth.getAccessToken()`) into every Data API
// request, so RLS is enforced per user exactly as with the Supabase SSR
// client it replaces.
//
// An `.auth` compatibility surface is attached so existing call sites that
// use `supabase.auth.getUser()` / `signOut()` keep working. Better Auth users
// carry `name`/`email` at top level; `user_metadata.full_name` is mapped for
// the few Supabase-shaped field reads that remain.

type NeonUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  [key: string]: unknown;
};

function toCompatUser(user: NeonUser) {
  return {
    ...user,
    user_metadata: {
      avatar_url: (user.image as string | null | undefined) ?? undefined,
      display_name: user.name,
      full_name: user.name,
    },
  };
}

// Anonymous Data API token (Neon's equivalent of the Supabase anon-key JWT).
// The managed auth service issues short-lived JWTs with role "anonymous" from
// an unauthenticated endpoint, so cache one per isolate until near expiry.
let anonymousToken: { token: string; expiresAt: number } | null = null;

async function getAnonymousToken(): Promise<string | null> {
  if (anonymousToken && anonymousToken.expiresAt - 60 > Date.now() / 1000) {
    return anonymousToken.token;
  }
  try {
    const res = await fetch(`${process.env.NEON_AUTH_BASE_URL}/token/anonymous`);
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: string; expires_at?: number };
    if (!data.token || !data.expires_at) return null;
    anonymousToken = { token: data.token, expiresAt: data.expires_at };
    return data.token;
  } catch {
    return null;
  }
}

async function getCompatSession() {
  // Anonymous callers (the majority for this guest-first app) have no session
  // cookie — skip the upstream auth round-trip entirely. When cookies() is
  // unavailable (static generation) there is likewise no session.
  try {
    const jar = await cookies();
    if (!jar.get(NEON_AUTH_SESSION_COOKIE_NAME)) {
      return { user: null, error: null };
    }
  } catch {
    return { user: null, error: null };
  }

  const auth = await getAuth();
  const { data, error } = await auth.getSession();
  const session = data as { user?: NeonUser } | null;
  return { user: session?.user ?? null, error };
}

export async function createClient() {
  const db = createDataClient<Database>({
    dataApi: {
      url: process.env.NEON_DATA_API_URL!,
      getToken: async () => {
        // No session cookie → anonymous request. Neon still requires a JWT
        // carrying role "anonymous" (RLS keeps enforcing row isolation).
        try {
          const jar = await cookies();
          if (!jar.get(NEON_AUTH_SESSION_COOKIE_NAME)) return getAnonymousToken();
        } catch {
          return getAnonymousToken();
        }
        // Neon Auth `GET /token` returns the Data API JWT for the session.
        const { data } = await (await getAuth()).token({});
        const token = data as { token?: string } | null | undefined;
        return token?.token ?? null;
      },
    },
  });

  return Object.assign(db, {
    auth: {
      async getUser() {
        const { user, error } = await getCompatSession();
        return {
          data: { user: user ? toCompatUser(user) : null },
          error: user
            ? null
            : (error ?? {
                message: "Auth session missing!",
                status: 401,
              }),
        };
      },
      async getSession() {
        const { data, error } = await (await getAuth()).getSession();
        return {
          data: { session: data?.session ?? null, user: data?.user ?? null },
          error: error ?? null,
        };
      },
      // Better Auth completes OAuth through its own callback before the app
      // callback runs, so the "code" exchange is just a session read.
      async exchangeCodeForSession(_code: string) {
        const { user, error } = await getCompatSession();
        return {
          data: {
            session: user ? {} : null,
            user: user ? toCompatUser(user) : null,
          },
          error: user
            ? null
            : (error ?? { message: "OAuth callback missing session", status: 401 }),
        };
      },
      async signOut() {
        const { error } = await (await getAuth()).signOut();
        return { error: error ?? null };
      },
    },
  });
}
