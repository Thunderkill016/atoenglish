import { chromium } from "playwright";
const BASE = "http://localhost:3001";
async function main() {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 30000 });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  await p.setViewportSize({ width: 1440, height: h });
  await p.waitForTimeout(2500);
  const sections = await p.evaluate(() =>
    [...document.querySelectorAll("main section, main > div, body section")].map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        tag: el.tagName,
        cls: (el.className || "").toString().slice(0, 80),
        top: Math.round(r.top), h: Math.round(r.height),
        opacity: cs.opacity, text: (el.textContent || "").slice(0, 60).trim(),
      };
    })
  );
  for (const s of sections.slice(0, 40)) console.log(JSON.stringify(s));
  await b.close();
}
main();
