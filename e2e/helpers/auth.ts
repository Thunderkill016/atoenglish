import { readFileSync } from "fs";
import { resolve } from "path";
import { neon } from "@neondatabase/serverless";
import type { Page } from "@playwright/test";

try {
  const envPath = resolve(process.cwd(), ".env.local");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch {
  /* CI provides env vars directly */
}

/** Separate from integration-test@ to avoid cross-polluting DB state. */
export const E2E_TEST_EMAIL =
  process.env.E2E_TEST_EMAIL ?? "e2e-test@atoenglish.test";
export const E2E_TEST_PASSWORD =
  process.env.E2E_TEST_PASSWORD ?? "TestPassword!2026";

export function hasE2EAdminCredentials(): boolean {
  return Boolean(
    process.env.NEON_AUTH_BASE_URL &&
    (process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL),
  );
}

function db() {
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) throw new Error("Missing DATABASE_URL for E2E setup");
  return neon(url);
}

function authBaseUrl(): string {
  const url = process.env.NEON_AUTH_BASE_URL;
  if (!url) throw new Error("Missing NEON_AUTH_BASE_URL for E2E setup");
  return url;
}

type NeonUser = { id: string; email: string };

async function findUserByEmail(email: string): Promise<NeonUser | null> {
  const rows = await db()`
    SELECT id, email FROM neon_auth."user" WHERE email = ${email} LIMIT 1
  `;
  return (rows[0] as NeonUser | undefined) ?? null;
}

async function signUpUser(email: string, password: string): Promise<NeonUser> {
  const res = await fetch(`${authBaseUrl()}/sign-up/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Neon Auth requires an absolute callbackURL or a trusted Origin.
      Origin: "http://localhost",
    },
    body: JSON.stringify({
      email,
      password,
      name: "E2E Test",
      callbackURL: "http://localhost/auth/callback",
    }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.user?.id) {
    throw new Error(
      `sign-up failed (${res.status}): ${body?.message ?? res.statusText}`,
    );
  }
  return body.user as NeonUser;
}

/** Ensure persistent E2E user exists (idempotent). */
export async function ensureE2ETestUser(): Promise<string> {
  const user =
    (await findUserByEmail(E2E_TEST_EMAIL)) ??
    (await signUpUser(E2E_TEST_EMAIL, E2E_TEST_PASSWORD));
  return user.id;
}

export async function loginAsE2ETestUser(page: Page): Promise<void> {
  await page.goto("/login?mode=login");
  await page.getByLabel("Email").fill(E2E_TEST_EMAIL);
  await page.getByLabel("Mật khẩu").fill(E2E_TEST_PASSWORD);
  await page.getByRole("button", { name: /Đăng nhập bằng Email/i }).click();
  await page.waitForURL(/\/discover/, { timeout: 20_000 });
}

/** Find user id by email (for post-signup verification). */
export async function getE2EUserIdByEmail(
  email: string,
): Promise<string | null> {
  return (await findUserByEmail(email))?.id ?? null;
}

/** Create temp confirmed user via sign-up (avoids client rate limits in E2E). */
export async function createTempConfirmedE2EUser(
  email: string,
  password: string,
): Promise<string> {
  await deleteE2EUserByEmail(email);
  const user = await signUpUser(email, password);
  await forceConfirmE2EUserEmail(user.id);
  return user.id;
}

/** Force email verify so sign-in flows work without a mailbox. */
export async function forceConfirmE2EUserEmail(userId: string): Promise<void> {
  await db()`
    UPDATE neon_auth."user" SET email_verified = true WHERE id = ${userId}
  `;
}

/** Seed a youtube content_sources row with a resume position (idempotent). */
export async function seedWatchedSource(
  userId: string,
  externalId: string,
  title: string,
): Promise<void> {
  await db()`
    insert into public.content_sources
      (user_id, kind, external_id, title, channel, duration_ms, last_position_ms)
    values
      (${userId}, 'youtube', ${externalId}, ${title}, 'E2E Channel', 600000, 65000)
    on conflict (user_id, kind, external_id)
    do update set
      last_position_ms = 65000,
      title = excluded.title,
      channel = excluded.channel,
      duration_ms = excluded.duration_ms,
      updated_at = now()
  `;
}

/** Delete a temp E2E signup user (cascades to neon_auth session/account rows). */
export async function deleteE2EUserByEmail(email: string): Promise<void> {
  const user = await findUserByEmail(email);
  if (!user?.id) return;
  await db()`DELETE FROM neon_auth.session WHERE user_id = ${user.id}`;
  await db()`DELETE FROM neon_auth.account WHERE user_id = ${user.id}`;
  await db()`DELETE FROM neon_auth.verification WHERE identifier = ${email}`;
  await db()`DELETE FROM user_onboarding_profile WHERE user_id = ${user.id}`;
  await db()`DELETE FROM user_progress WHERE user_id = ${user.id}`;
  await db()`DELETE FROM neon_auth."user" WHERE id = ${user.id}`;
}
