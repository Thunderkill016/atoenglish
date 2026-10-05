import { chromium } from "playwright";
import { join } from "path";
const BASE = "http://localhost:3001";
const OUT = "artifacts/ui-audit/current/states";
async function main() {
  const b = await chromium.launch();
  for (const [label, vp] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]] as const) {
    const ctx = await b.newContext({
      viewport: vp,
      storageState: join(process.cwd(), "artifacts/ui-audit/current/.auth-state.json"),
    });
    await ctx.addInitScript(() => localStorage.setItem("ato-ui-white", "dark"));
    const p = await ctx.newPage();
    await p.goto(`${BASE}/learn`, { waitUntil: "networkidle", timeout: 30000 });
    await p.waitForTimeout(1200);
    await p.screenshot({ path: join(OUT, `${label}-learn-dark.png`), fullPage: true });
    console.log(`captured ${label}-learn-dark`);
    await ctx.close();
  }
  await b.close();
}
main();
