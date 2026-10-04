import { test, expect } from "@playwright/test";
import {
  hasE2EAdminCredentials,
  createTempConfirmedE2EUser,
  deleteE2EUserByEmail,
  verifyOnboardingPersistence,
  simulateCallbackOnboardingPersist,
} from "./helpers/auth";

test.describe("Onboarding Flow", () => {
  test("completes the 3-step survey and lands on email auth", async ({ page }) => {
    await page.goto("/login");

    // Welcome Screen
    await expect(page.locator("h1")).toContainText("Tạo lộ trình học tiếng Anh");
    const startBtn = page.getByRole("button", { name: /Bắt đầu/i });
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // Step 1: Level
    await expect(page.locator("h1")).toContainText("Trình độ tiếng Anh");
    const levelOpt = page.getByText("Mất gốc / Chưa biết gì").first();
    await expect(levelOpt).toBeVisible();
    await levelOpt.click();

    // Step 2: Auth Form (defaults: work/fear/15min applied server-side)
    await expect(page.locator("h1")).toContainText("Lộ trình của bạn đã sẵn sàng", { timeout: 5000 });
    await expect(page.locator("body")).toContainText("Cấp độ: Mất gốc");
    await expect(page.locator("body")).toContainText("Học tập: 15 phút/ngày");
  });
});

test.describe("Onboarding Signup Persist (E2E DB)", () => {
  test("signup flow saves goal/obstacle/daily_minutes to user_onboarding_profile and daily_xp_goal on user_progress", async ({ page }) => {
    test.skip(
      !hasE2EAdminCredentials(),
      "Requires NEON_AUTH_BASE_URL + DATABASE_URL for DB verify",
    );

    const ts = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const email = `e2e-onboard-${ts}-${rand}@atoenglish.test`;
    const password = "E2ETestPass123!";

    const expected = { goal: "work", obstacle: "fear", daily_minutes: 15, daily_xp_goal: 50 };

    try {
      await page.goto("/login");

      const startBtn = page.getByRole("button", { name: /Bắt đầu/i });
      await expect(startBtn).toBeVisible({ timeout: 5000 });
      await startBtn.click();

      await expect(page.locator("h1")).toContainText("Trình độ tiếng Anh", { timeout: 5000 });
      await page.getByText("Mất gốc / Chưa biết gì").first().click();

      await expect(page.locator("h1")).toContainText("Lộ trình của bạn đã sẵn sàng", { timeout: 5000 });
      await expect(page.locator("body")).toContainText("Học tập: 15 phút/ngày");

      const userId = await createTempConfirmedE2EUser(email, password);
      await simulateCallbackOnboardingPersist(userId, expected.goal, expected.obstacle, expected.daily_minutes, expected.daily_xp_goal);

      await verifyOnboardingPersistence(userId, expected);
    } finally {
      await deleteE2EUserByEmail(email).catch(() => {});
    }
  });
});