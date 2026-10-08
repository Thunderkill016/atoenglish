import { expect, test } from "@playwright/test";
import { loginAsE2ETestUser, hasE2EAdminCredentials } from "./helpers/auth";

/**
 * Live smoke for the local Hy-MT2 engine — NOT part of CI.
 * Requires a running llama.cpp server + SUBTITLE_LOCAL_* in .env.local:
 *   llama-server --model Hy-MT2-1.8B-Q4_K_M.gguf --alias hymt2-1.8b-q4 \
 *     --host 127.0.0.1 --port 8321 --threads 2 --ctx-size 2048 \
 *     --parallel 1 --api-key <SUBTITLE_LOCAL_KEY>
 * Run: LIVE_TRANSLATE_SMOKE=1 npx playwright test e2e/live-translate.smoke.spec.ts
 */
const SRT = `1
00:00:00,000 --> 00:00:02,000
My father taught me everything I know.

2
00:00:02,500 --> 00:00:04,500
He was the best teacher in the world.

3
00:00:05,000 --> 00:00:07,000
I miss him every single day.

4
00:00:07,500 --> 00:00:09,500
And I will never forget his lessons.`;

test("live local translation via llama.cpp Hy-MT2", async ({ page }) => {
  test.skip(
    process.env.LIVE_TRANSLATE_SMOKE !== "1" || !hasE2EAdminCredentials(),
    "Set LIVE_TRANSLATE_SMOKE=1 with llama-server + NEON_AUTH env",
  );
  await loginAsE2ETestUser(page);
  await page.goto("/watch/dQw4w9WgXcQ");
  // Signed-in users persist pasted transcripts — reuse if a previous run
  // already saved one, otherwise paste fresh.
  const pasteButton = page.getByRole("button", { name: "Dán hoặc tải phụ đề" });
  if (await pasteButton.isVisible({ timeout: 10_000 }).catch(() => false)) {
    await pasteButton.click();
    await page.getByPlaceholder(/Dán phụ đề/).fill(SRT);
    await page.getByRole("button", { name: "Dùng phụ đề này" }).click();
  }
  await expect(page.locator("[data-sentence]").first()).toBeVisible({
    timeout: 15_000,
  });
  await page.getByRole("button", { name: /Dùng Hy-MT2/ }).click();
  // First VI cue from the real local model (4-8s/cue on CPU).
  const firstVi = page.locator('[data-sentence] [lang="vi"]').first();
  await expect(firstVi).not.toContainText("Chưa có bản dịch", {
    timeout: 120_000,
  });
});
