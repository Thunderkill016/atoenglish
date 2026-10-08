// Live caption check on a deployed Worker preview (PLAN.md §1 item 1b).
// Usage: node scripts/smoke-preview.mjs <baseUrl>   (default localhost:3000)
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text().slice(0, 300));
});
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

await page.goto(`${base}/watch/dQw4w9WgXcQ`, {
  waitUntil: "domcontentloaded",
  timeout: 45_000,
});
await page.waitForTimeout(3000);

const btn = page.getByRole("button", { name: /Lấy phụ đề/i }).first();
const hasBtn = await btn.count();
console.log("fetch button present:", hasBtn > 0);
if (hasBtn) {
  await btn.click();
  // Wait for either transcript sentences or an error/empty state.
  const result = await page
    .waitForFunction(
      () => {
        const b = document.body.innerText;
        return (
          b.includes("Phụ đề tự động") ||
          b.includes("Phụ đề thủ công") ||
          b.includes("Không có phụ đề") ||
          b.includes("bị chặn") ||
          b.includes("Đã xảy ra lỗi") ||
          b.includes("quá nhiều yêu cầu")
        );
      },
      { timeout: 40_000 },
    )
    .catch(() => null);
  console.log("terminal state reached:", !!result);
}
const text = (await page.locator("body").innerText()).slice(0, 2500);
console.log("=== BODY ===\n" + text);
console.log("=== CONSOLE ERRORS ===");
for (const e of errors.slice(0, 10)) console.log("-", e);
await browser.close();
