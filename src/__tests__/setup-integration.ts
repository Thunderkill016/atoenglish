/**
 * Integration Test Setup (Neon)
 *
 * Strategy:
 * - Ensure a persistent test user exists in neon_auth.user
 * - Sign in via the Neon Auth API to get a session token
 * - Exchange the session token for a Data API JWT
 * - Build a @neondatabase/neon-js client with that JWT (RLS enforced as the
 *   test user) plus an .auth.getUser() shim
 * - Mock Next.js server-only modules with vi.mock (hoisted)
 * - Mock @/lib/supabase/server via globalThis reference so the factory can
 *   return a client that is set asynchronously in beforeAll
 * - Each test suite cleans up its own DB rows in afterAll
 */

// Load env FIRST — Vitest fork workers don't inherit process.env from config
// Use fs directly for maximum reliability across fork/thread workers
import { readFileSync } from "fs";
import { resolve } from "path";

try {
  const envPath = resolve(process.cwd(), ".env.local");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch { /* .env.local not found — CI uses real env vars */ }

import { neon } from "@neondatabase/serverless";
import { createClient } from "@neondatabase/neon-js";
import { vi, beforeAll, afterAll } from "vitest";
import type { NeonPostgrestClient } from "@neondatabase/neon-js";
import type { Database } from "@/types/supabase";

// ── Env ─────────────────────────────────────────────────────────────────────
const AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL!;
const DATA_API_URL = process.env.NEON_DATA_API_URL!;
const DB_URL = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!;

const TEST_EMAIL = "integration-test@atoenglish.test";
const TEST_PASSWORD = "TestPassword!2026";

// ── SQL (owner role — bypasses RLS, for setup/lookup/cleanup only) ──────────
// Exported as adminSql: test cleanup must bypass RLS because several tables
// intentionally deny DELETE to `authenticated` (e.g. speaking_sessions).
// This mirrors the old Supabase service_role adminClient behavior.
const sql = neon(DB_URL);
export const adminSql = sql;

type AuthUser = { id: string; email: string; name?: string | null };

async function authApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${AUTH_BASE_URL}/${path}`, {
    ...init,
    headers: {
      // The Neon project allows localhost origins (allow_localhost).
      Origin: "http://localhost",
      ...init?.headers,
    },
  });
  const body = (await res.json().catch(() => null)) as T & {
    message?: string;
    code?: string;
  };
  if (!res.ok) {
    throw new Error(
      `Neon Auth ${path} failed (${res.status}): ${body?.message ?? res.statusText}`,
    );
  }
  return body;
}

async function ensureTestUser(): Promise<AuthUser> {
  const existing = await sql`
    SELECT id, email FROM neon_auth."user" WHERE email = ${TEST_EMAIL} LIMIT 1
  `;
  if (existing[0]) return existing[0] as AuthUser;

  const { user } = await authApi<{ user: AuthUser }>("sign-up/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      name: "Integration Test",
      // Absolute URL satisfies the auth service's Origin requirement.
      callbackURL: "http://localhost/auth/callback",
    }),
  });
  return user;
}

async function getDataApiJwt(): Promise<string> {
  const signInRes = await fetch(`${AUTH_BASE_URL}/sign-in/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost",
    },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  });
  if (!signInRes.ok) {
    throw new Error(`Neon Auth sign-in failed (${signInRes.status})`);
  }
  // The /token endpoint authenticates via the session cookie, not Bearer.
  const sessionCookie = (signInRes.headers.getSetCookie?.() ?? [])
    .map((c) => c.split(";")[0])
    .join("; ");
  const { token } = await authApi<{ token: string }>("token", {
    headers: { Cookie: sessionCookie },
  });
  return token;
}

// ── Test user client (set in beforeAll, referenced via globalThis) ─────────
export let testUserId: string;

// Same client surface as adminClient — RLS-scoped to the test user, which is
// the only scope the integration tests operate on.
export let adminClient: NeonPostgrestClient<Database>;

// globalThis bridge: vi.mock factory runs at import time (hoisted),
// but createClient() is called at test runtime — AFTER beforeAll sets the client.
declare global {
   
  var __testSupabaseClient: unknown;
   
  var __testUserId: string | undefined;
}

// ── Mock Next.js modules (hoisted by Vitest) ─────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn: unknown) => fn),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers({
    "x-forwarded-for": "127.0.0.1",
  })),
  cookies: vi.fn().mockResolvedValue(new Map()),
}));

vi.mock("@/lib/security/rate-limit", () => ({
  createRateLimiter: vi.fn(() => ({
    check: vi.fn().mockResolvedValue({ success: true, remaining: 99 }),
  })),
}));

// ── KEY MOCK: @/lib/supabase/server ───────────────────────────────────────
// The factory returns a function — when createClient() is called at test
// runtime, globalThis.__testSupabaseClient is already set by beforeAll.
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => globalThis.__testSupabaseClient),
}));

// ── Setup ────────────────────────────────────────────────────────────────
beforeAll(async () => {
  const user = await ensureTestUser();
  testUserId = user.id;
  globalThis.__testUserId = user.id;

  const jwt = await getDataApiJwt();

  const db = createClient<Database>({
    dataApi: { url: DATA_API_URL, getToken: async () => jwt },
  });

  // Compat surface: tests exercise the same supabase.auth.getUser() shape
  // production code uses via src/lib/supabase/server.ts.
  const client = Object.assign(db, {
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { ...user, user_metadata: {} } },
        error: null,
      })),
      getSession: vi.fn(async () => ({
        data: { session: { user }, user },
        error: null,
      })),
      signOut: vi.fn(async () => ({ error: null })),
    },
  });

  globalThis.__testSupabaseClient = client;
  adminClient = db;

  // Ensure test user has user_progress row (owner SQL — bypasses RLS)
  await sql`
    insert into public.user_progress
      (user_id, current_level, total_xp, streak, last_active_date)
    values (
      ${testUserId}, 'A1', 0, 0, ${new Date().toISOString().split("T")[0]}
    )
    on conflict (user_id) do nothing
  `;

  // Clean onboarding profile for this test user (RLS test will (re)insert)
  await sql`delete from public.user_onboarding_profile where user_id = ${testUserId}`;
});

afterAll(async () => {
  if (!adminClient) return;
  const uid = testUserId;
  for (const table of [
    "user_lesson_progress",
    "speaking_sessions",
    "card_review_logs",
    "challenge_results",
    "quiz_results",
    "user_onboarding_profile",
  ]) {
    await sql.query(`delete from public.${table} where user_id = $1`, [uid]);
  }
  globalThis.__testSupabaseClient = undefined;
});
