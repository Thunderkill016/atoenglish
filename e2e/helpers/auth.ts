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

/** Reset placement state so each test starts from A0 / unit 1. */
export async function resetE2EPlacementState(userId: string): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  await db()`
    INSERT INTO user_progress (user_id, current_level, starting_unit_index, placement_completed_at, total_xp, streak, last_active_date)
    VALUES (${userId}, 'A0', 0, NULL, 0, 0, ${today})
    ON CONFLICT (user_id) DO UPDATE SET
      current_level = 'A0',
      starting_unit_index = 0,
      placement_completed_at = NULL,
      total_xp = 0,
      streak = 0,
      last_active_date = ${today}
  `;
}

/** Set user to B1+ so /learn/unit-19 is in unlocked range (UI + for test realism). */
export async function setE2EStartingUnit(
  userId: string,
  startingIndex: number,
  level = "B1",
): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  await db()`
    INSERT INTO user_progress (user_id, current_level, starting_unit_index, total_xp, streak, last_active_date)
    VALUES (${userId}, ${level}, ${startingIndex}, 300, 1, ${today})
    ON CONFLICT (user_id) DO UPDATE SET
      current_level = ${level},
      starting_unit_index = ${startingIndex},
      total_xp = 300,
      streak = 1,
      last_active_date = ${today}
  `;
}

export async function loginAsE2ETestUser(page: Page): Promise<void> {
  await page.goto("/login?mode=login");
  await page.getByPlaceholder("Email của bạn").fill(E2E_TEST_EMAIL);
  await page.getByPlaceholder("Mật khẩu").fill(E2E_TEST_PASSWORD);
  await page.getByRole("button", { name: /Đăng nhập bằng Email/i }).click();
  await page.waitForURL(/\/learn/, { timeout: 20_000 });
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

/** Verify the persisted values from signup flow. */
export async function verifyOnboardingPersistence(
  userId: string,
  expected: {
    goal: string;
    obstacle: string;
    daily_minutes: number;
    daily_xp_goal: number;
  },
): Promise<void> {
  const profiles = await db()`
    SELECT goal, obstacle, daily_minutes FROM user_onboarding_profile WHERE user_id = ${userId}
  `;
  const profile = profiles[0] as
    | { goal: string; obstacle: string; daily_minutes: number }
    | undefined;
  if (!profile) {
    throw new Error("user_onboarding_profile not found");
  }
  if (
    profile.goal !== expected.goal ||
    profile.obstacle !== expected.obstacle ||
    profile.daily_minutes !== expected.daily_minutes
  ) {
    throw new Error(
      `profile mismatch: got ${JSON.stringify(profile)} want ${JSON.stringify(expected)}`,
    );
  }

  const rows = await db()`
    SELECT daily_xp_goal FROM user_progress WHERE user_id = ${userId}
  `;
  const progress = rows[0] as { daily_xp_goal: number } | undefined;
  if (!progress) {
    throw new Error("user_progress not found");
  }
  if (progress.daily_xp_goal !== expected.daily_xp_goal) {
    throw new Error(
      `daily_xp_goal mismatch: got ${progress.daily_xp_goal} want ${expected.daily_xp_goal}`,
    );
  }
}

/** Simulate the persist side-effect that /auth/callback performs for new onboarding signups. */
export async function simulateCallbackOnboardingPersist(
  userId: string,
  target: string,
  obstacle: string,
  dailyMinutes: number,
  dailyXpGoal: number,
  mappedLevel = "A0",
): Promise<void> {
  const sql = db();
  await sql`DELETE FROM user_onboarding_profile WHERE user_id = ${userId}`;
  await sql`DELETE FROM user_progress WHERE user_id = ${userId}`;
  await sql`
    INSERT INTO user_progress (user_id, current_level, starting_unit_index, streak, total_xp, daily_xp_goal)
    VALUES (${userId}, ${mappedLevel}, 0, 0, 0, ${dailyXpGoal})
    ON CONFLICT (user_id) DO NOTHING
  `;
  await sql`
    INSERT INTO user_onboarding_profile (user_id, goal, obstacle, daily_minutes)
    VALUES (${userId}, ${target}, ${obstacle}, ${dailyMinutes})
    ON CONFLICT (user_id) DO NOTHING
  `;
}
