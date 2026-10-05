// scripts/ui-audit/capture.ts — baseline screenshot capture for the UI/UX
// audit (research/AuditUIUX.md). Captures every user-facing route at
// desktop + mobile viewports, anonymous and authenticated.
//
// Usage:
//   BASE=http://localhost:3001 npx tsx scripts/ui-audit/capture.ts
//
// Output: artifacts/ui-audit/current/{desktop,mobile}/NNN-<route>.png

import { chromium, type Browser, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import {
  E2E_TEST_EMAIL,
  E2E_TEST_PASSWORD,
  ensureE2ETestUser,
  setE2EStartingUnit,
} from "../../e2e/helpers/auth";

const BASE = process.env.BASE ?? "http://localhost:3001";
const OUT = join(process.cwd(), "artifacts/ui-audit/current");

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

interface Target {
  name: string;
  path: string;
  auth: boolean;
  // settleMs gives client-side flows (audio init, data fetch) time to render
  settleMs?: number;
}

const TARGETS: Target[] = [
  { name: "landing", path: "/", auth: false },
  { name: "login", path: "/login?mode=login", auth: false },
  { name: "signup", path: "/login?mode=signup", auth: false },
  { name: "zero-path", path: "/zero-path", auth: false },
  { name: "privacy", path: "/privacy", auth: false },
  { name: "terms", path: "/terms", auth: false },
  { name: "learn-unit-trial-anon", path: "/learn/unit-a0-1", auth: false },
  { name: "learn", path: "/learn", auth: true },
  { name: "learn-unit", path: "/learn/unit-a0-1", auth: true, settleMs: 2500 },
  {
    name: "learn-unit-checkpoint",
    path: "/learn/unit-a0-1/checkpoint",
    auth: true,
    settleMs: 1500,
  },
  { name: "checkpoint-trial", path: "/checkpoint/trial", auth: true },
  { name: "placement", path: "/placement", auth: true, settleMs: 1500 },
  { name: "quiz", path: "/quiz", auth: true },
  { name: "read", path: "/read", auth: true, settleMs: 2000 },
  { name: "review", path: "/review", auth: true },
  { name: "review-cards", path: "/review/cards", auth: true },
  { name: "review-hard", path: "/review/hard", auth: true },
  { name: "roadmap", path: "/roadmap", auth: true },
  { name: "me", path: "/me", auth: true },
  { name: "me-grammar", path: "/me/grammar", auth: true },
  { name: "me-progress", path: "/me/progress", auth: true },
  { name: "me-pronunciation", path: "/me/pronunciation", auth: true },
  { name: "me-settings", path: "/me/settings", auth: true },
  { name: "me-speaking", path: "/me/speaking", auth: true },
  { name: "me-speaking-journal", path: "/me/speaking/journal", auth: true },
  { name: "me-speaking-phoneme", path: "/me/speaking/phoneme", auth: true },
  { name: "me-speaking-roleplay", path: "/me/speaking/roleplay", auth: true },
  { name: "me-speaking-shadowing", path: "/me/speaking/shadowing", auth: true },
  { name: "me-writing", path: "/me/writing", auth: true },
  { name: "me-writing-history", path: "/me/writing/history", auth: true },
];

async function login(page: Page): Promise<void> {
  await page.goto(`${BASE}/login?mode=login`);
  await page.getByLabel("Email").fill(E2E_TEST_EMAIL);
  await page.getByLabel("Mật khẩu").fill(E2E_TEST_PASSWORD);
  await page
    .getByRole("button", { name: /Đăng nhập bằng Email/i })
    .click();
  await page.waitForURL(/\/(learn|me|placement)/, { timeout: 25_000 });
}

async function shoot(
  browser: Browser,
  target: Target,
  viewport: { width: number; height: number },
  label: string,
  idx: number,
  results: Record<string, unknown>[],
  storageState?: string,
) {
  const context = await browser.newContext({ viewport, storageState });
  const page = await context.newPage();
  try {
    const res = await page.goto(`${BASE}${target.path}`, {
      waitUntil: "networkidle",
      timeout: 30_000,
    });
    await page.waitForTimeout(target.settleMs ?? 800);
    // Scroll through the page so IntersectionObserver-driven scroll-reveal
    // sections render, then return to top for the full-page screenshot.
    await page.evaluate(async () => {
      const step = window.innerHeight;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(400);
    const file = `${String(idx).padStart(3, "0")}-${target.name}.png`;
    await page.screenshot({
      path: join(OUT, label, file),
      fullPage: true,
    });
    results.push({
      name: target.name,
      path: target.path,
      viewport: label,
      auth: target.auth,
      status: res?.status(),
      finalUrl: page.url().replace(BASE, ""),
      file: `${label}/${file}`,
    });
  } catch (e) {
    results.push({
      name: target.name,
      path: target.path,
      viewport: label,
      auth: target.auth,
      error: e instanceof Error ? e.message.split("\n")[0] : String(e),
    });
  }
  await context.close();
}

async function main() {
  // Auth-enabled pages need a real user with unlocked content (B1/A0 units).
  const userId = await ensureE2ETestUser();
  await setE2EStartingUnit(userId, 10, "B1");
  for (const dir of ["desktop", "mobile"]) {
    mkdirSync(join(OUT, dir), { recursive: true });
  }
  const browser = await chromium.launch();
  // Authenticate once, reuse the session storage state for every context.
  const authCtx = await browser.newContext({ viewport: DESKTOP });
  const authPage = await authCtx.newPage();
  await login(authPage);
  const statePath = join(OUT, ".auth-state.json");
  await authCtx.storageState({ path: statePath });
  await authCtx.close();

  const results: Record<string, unknown>[] = [];
  let idx = 0;
  for (const target of TARGETS) {
    idx++;
    await shoot(
      browser,
      target,
      DESKTOP,
      "desktop",
      idx,
      results,
      target.auth ? statePath : undefined,
    );
    await shoot(
      browser,
      target,
      MOBILE,
      "mobile",
      idx,
      results,
      target.auth ? statePath : undefined,
    );
    console.log(`captured ${target.name}`);
  }
  writeFileSync(
    join(OUT, "CAPTURE_INDEX.json"),
    JSON.stringify(results, null, 2),
  );
  await browser.close();
  const failed = results.filter((r) => r.error);
  console.log(`done: ${results.length - failed.length} ok, ${failed.length} failed`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
