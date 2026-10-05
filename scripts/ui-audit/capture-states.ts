// Capture key interactive states for the UI/UX audit baseline.
// Usage: BASE=http://localhost:3001 npx tsx scripts/ui-audit/capture-states.ts
import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { join } from "path";
import {
  E2E_TEST_EMAIL,
  E2E_TEST_PASSWORD,
  ensureE2ETestUser,
  setE2EStartingUnit,
} from "../../e2e/helpers/auth";

const BASE = process.env.BASE ?? "http://localhost:3001";
const OUT = join(process.cwd(), "artifacts/ui-audit/current/states");
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

async function main() {
  mkdirSync(OUT, { recursive: true });
  const userId = await ensureE2ETestUser();
  await setE2EStartingUnit(userId, 10, "B1");
  const b = await chromium.launch();

  // --- 1. Login error (anon): submit wrong password ---
  for (const [label, vp] of [["desktop", DESKTOP], ["mobile", MOBILE]] as const) {
    const ctx = await b.newContext({ viewport: vp });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/login?mode=login`, { waitUntil: "networkidle" });
    await p.getByLabel("Email").fill(E2E_TEST_EMAIL);
    await p.getByLabel("Mật khẩu").fill("WrongPassword!999");
    await p.getByRole("button", { name: /Đăng nhập bằng Email/i }).click();
    await p.waitForTimeout(3500);
    await p.screenshot({ path: join(OUT, `${label}-login-error.png`) });
    await ctx.close();
    console.log(`captured ${label}-login-error`);
  }

  // --- Auth context reused for remaining states ---
  for (const [label, vp] of [["desktop", DESKTOP], ["mobile", MOBILE]] as const) {
    const ctx = await b.newContext({ viewport: vp });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/login?mode=login`, { waitUntil: "networkidle" });
    await p.getByLabel("Email").fill(E2E_TEST_EMAIL);
    await p.getByLabel("Mật khẩu").fill(E2E_TEST_PASSWORD);
    await p.getByRole("button", { name: /Đăng nhập bằng Email/i }).click();
    await p.waitForURL(/\/(learn|me|placement)/, { timeout: 25_000 });

    // 2. Command palette open
    await p.goto(`${BASE}/learn`, { waitUntil: "networkidle" });
    await p.keyboard.press("Control+k");
    await p.waitForTimeout(1200);
    await p.screenshot({ path: join(OUT, `${label}-command-palette.png`) });
    console.log(`captured ${label}-command-palette`);
    await p.keyboard.press("Escape");

    // 3. Dark mode on dashboard
    const themeBtn = p.locator("header button").last();
    await themeBtn.click().catch(() => {});
    await p.waitForTimeout(800);
    await p.screenshot({ path: join(OUT, `${label}-learn-dark.png`), fullPage: true });
    console.log(`captured ${label}-learn-dark`);
    await ctx.close();
  }

  // --- 4. Loading state on a data-heavy page (throttled) ---
  const ctx = await b.newContext({ viewport: DESKTOP });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/login?mode=login`, { waitUntil: "networkidle" });
  await p.getByLabel("Email").fill(E2E_TEST_EMAIL);
  await p.getByLabel("Mật khẩu").fill(E2E_TEST_PASSWORD);
  await p.getByRole("button", { name: /Đăng nhập bằng Email/i }).click();
  await p.waitForURL(/\/(learn|me|placement)/, { timeout: 25_000 });
  const session = await ctx.newCDPSession(p);
  await session.send("Network.enable");
  await session.send("Network.emulateNetworkConditions", {
    offline: false, latency: 3000, downloadThroughput: 65536, uploadThroughput: 32768,
  });
  await p.goto(`${BASE}/learn`);
  await p.waitForTimeout(1200); // mid-load
  await p.screenshot({ path: join(OUT, "desktop-learn-loading.png") });
  console.log("captured desktop-learn-loading");
  await ctx.close();

  await b.close();
  console.log("states done");
}
main().catch((e) => { console.error(e); process.exit(1); });
