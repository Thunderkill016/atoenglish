import { test, expect } from "@playwright/test";
import {
  ensureE2ETestUser,
  loginAsE2ETestUser,
  resetE2EPlacementState,
  hasE2EAdminCredentials,
} from "./helpers/auth";

/**
 * P0 baseline — time-to-lesson metric (research-backed redesign).
 * Target after P2: ≤2 taps, ≤10s to section 1 (Khởi động).
 */
test.describe("Time-to-lesson baseline", () => {
  test.skip(
    !hasE2EAdminCredentials(),
    "Requires Neon admin credentials for E2E user",
  );

  test.beforeEach(async () => {
    const userId = await ensureE2ETestUser();
    await resetE2EPlacementState(userId);
  });

  test("learn → warmup section in ≤2 taps and ≤15s", async ({ page }) => {
    const start = Date.now();
    let taps = 0;

    await loginAsE2ETestUser(page);
    await page.waitForURL(/\/learn/, { timeout: 20_000 });

    await expect(page.getByTestId("continue-learning")).toBeVisible({
      timeout: 10_000,
    });

    await page.getByTestId("continue-learning").click();
    taps += 1;

    await page.waitForURL(/\/learn\/unit-/, { timeout: 20_000 });
    await expect(page.getByTestId("lesson-section-warmup")).toBeVisible({
      timeout: 15_000,
    });

    const elapsedMs = Date.now() - start;

    // Log baseline for P0 comparison (CI artifact / local debug)
    console.log(
      JSON.stringify({
        metric: "time-to-lesson",
        taps,
        elapsedMs,
        targetTaps: 2,
        targetMs: 10_000,
      }),
    );

    expect(taps).toBeLessThanOrEqual(2);
    // P0 baseline gate — tighten to 10_000 after P2 stabilizes
    expect(elapsedMs).toBeLessThanOrEqual(15_000);
  });

  test("learn home has single primary CTA (no amber mini)", async ({
    page,
  }) => {
    await loginAsE2ETestUser(page);
    await page.waitForURL(/\/learn/, { timeout: 20_000 });

    await expect(page.getByTestId("continue-learning")).toBeVisible();
    await expect(page.getByRole("link", { name: /Học nhanh/i })).toHaveCount(0);
  });

  test("4-tab bottom nav: Học · Ôn · Lộ trình · Tôi", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await loginAsE2ETestUser(page);
    await page.waitForURL(/\/learn/, { timeout: 20_000 });

    const nav = page.getByRole("navigation", { name: "Điều hướng chính" });
    await expect(nav.getByText("Học")).toBeVisible();
    await expect(nav.getByText("Ôn")).toBeVisible();
    await expect(nav.getByText("Lộ trình")).toBeVisible();
    await expect(nav.getByText("Tôi")).toBeVisible();
  });
});
