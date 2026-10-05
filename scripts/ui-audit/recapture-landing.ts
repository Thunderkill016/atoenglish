import { chromium } from "playwright";
import { join } from "path";
const BASE = "http://localhost:3001";
const OUT = "artifacts/ui-audit/current";

async function shoot(label: string, width: number, height: number) {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width, height } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 30000 });
  // Trigger all lazy/reveal content at native viewport.
  await p.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.documentElement.scrollHeight + step; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(800);
  // Expand the viewport well beyond the placeholder height so every
  // content-visibility:auto section paints, then measure the real height.
  await p.setViewportSize({ width, height: 12000 });
  await p.waitForTimeout(1500);
  const finalH = await p.evaluate(() => document.documentElement.scrollHeight);
  await p.setViewportSize({ width, height: finalH });
  await p.waitForTimeout(600);
  await p.screenshot({ path: join(OUT, label, "001-landing.png") });
  await b.close();
  console.log(`recaptured ${label} at ${width}x${finalH}`);
}
async function main() {
  await shoot("desktop", 1440, 900);
  await shoot("mobile", 390, 844);
}
main();
