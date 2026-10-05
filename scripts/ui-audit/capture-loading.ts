import { chromium } from "playwright";
import { join } from "path";
const BASE = "http://localhost:3001";
const OUT = "artifacts/ui-audit/current/states";
async function main() {
  const b = await chromium.launch();
  const ctx = await b.newContext({
    viewport: { width: 1440, height: 900 },
    storageState: join(process.cwd(), "artifacts/ui-audit/current/.auth-state.json"),
  });
  const p = await ctx.newPage();
  const session = await ctx.newCDPSession(p);
  await session.send("Network.enable");
  await session.send("Network.emulateNetworkConditions", {
    offline: false, latency: 1500, downloadThroughput: 200000, uploadThroughput: 100000,
  });
  await p.goto(`${BASE}/learn`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForTimeout(2500); // mid-hydration / data fetch
  await p.screenshot({ path: join(OUT, "desktop-learn-loading.png") });
  console.log("captured desktop-learn-loading");
  await b.close();
}
main();
