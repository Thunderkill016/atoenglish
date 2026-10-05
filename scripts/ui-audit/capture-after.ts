// Re-capture changed surfaces after the refactor (same viewports as baseline).
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import {
  E2E_TEST_EMAIL,
  E2E_TEST_PASSWORD,
  ensureE2ETestUser,
  setE2EStartingUnit,
} from "../../e2e/helpers/auth";

const BASE = process.env.BASE ?? "http://localhost:3001";
const OUT = join(process.cwd(), "artifacts/ui-audit/after");
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const TARGETS = [
  { name: "login", path: "/login?mode=login", auth: false },
  { name: "zero-path", path: "/zero-path", auth: false },
  { name: "learn", path: "/learn", auth: true },
  { name: "quiz", path: "/quiz", auth: true },
  { name: "read", path: "/read", auth: true, settleMs: 2000 },
  { name: "me-progress", path: "/me/progress", auth: true },
  { name: "me-writing", path: "/me/writing", auth: true },
];

async function main() {
  const userId = await ensureE2ETestUser();
  await setE2EStartingUnit(userId, 10, "B1");
  mkdirSync(join(OUT, "desktop"), { recursive: true });
  mkdirSync(join(OUT, "mobile"), { recursive: true });
  mkdirSync(join(OUT, "states"), { recursive: true });

  const b = await chromium.launch();
  // Login once → storage state
  const ac = await b.newContext({ viewport: DESKTOP });
  const ap = await ac.newPage();
  await ap.goto(`${BASE}/login?mode=login`, { waitUntil: "networkidle" });
  await ap.getByLabel("Email").fill(E2E_TEST_EMAIL);
  await ap.getByLabel("Mật khẩu").fill(E2E_TEST_PASSWORD);
  await ap.getByRole("button", { name: /Đăng nhập bằng Email/i }).click();
  await ap.waitForURL(/\/(learn|me|placement)/, { timeout: 25_000 });
  const statePath = join(OUT, ".auth-state.json");
  await ac.storageState({ path: statePath });
  await ac.close();

  const results: Record<string, unknown>[] = [];
  for (const t of TARGETS) {
    for (const [label, vp] of [["desktop", DESKTOP], ["mobile", MOBILE]] as const) {
      const ctx = await b.newContext({
        viewport: vp,
        storageState: t.auth ? statePath : undefined,
      });
      const p = await ctx.newPage();
      const res = await p.goto(`${BASE}${t.path}`, {
        waitUntil: "networkidle",
        timeout: 30000,
      });
      await p.waitForTimeout(t.settleMs ?? 800);
      await p.screenshot({
        path: join(OUT, label, `${t.name}.png`),
        fullPage: true,
      });
      results.push({ name: t.name, viewport: label, status: res?.status() });
      await ctx.close();
    }
    console.log(`captured ${t.name}`);
  }

  // Login error state (fresh anon context, wrong password)
  for (const [label, vp] of [["desktop", DESKTOP], ["mobile", MOBILE]] as const) {
    const ctx = await b.newContext({ viewport: vp });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/login?mode=login`, { waitUntil: "networkidle" });
    await p.getByLabel("Email").fill(E2E_TEST_EMAIL);
    await p.getByLabel("Mật khẩu").fill("WrongPassword!999");
    await p.getByRole("button", { name: /Đăng nhập bằng Email/i }).click();
    await p.waitForTimeout(3500);
    await p.screenshot({ path: join(OUT, "states", `${label}-login-error.png`) });
    await ctx.close();
    console.log(`captured ${label}-login-error`);
  }

  writeFileSync(join(OUT, "CAPTURE_INDEX.json"), JSON.stringify(results, null, 2));
  await b.close();
  console.log("after-capture done");
}
main().catch((e) => { console.error(e); process.exit(1); });
