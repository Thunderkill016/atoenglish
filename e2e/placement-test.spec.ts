import { test, expect } from "@playwright/test";
import {
  hasE2EAdminCredentials,
  loginAsE2ETestUser,
  resetE2EPlacementState,
  ensureE2ETestUser,
  setE2EStartingUnit,
} from "./helpers/auth";

test.describe("Placement Test Flow", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(
      !hasE2EAdminCredentials(),
      "Requires NEON_AUTH_BASE_URL + DATABASE_URL",
    );

    const userId = await ensureE2ETestUser();
    await resetE2EPlacementState(userId);
    await loginAsE2ETestUser(page);
  });

  test("starts the test and answers first few questions", async ({ page }) => {
    await page.goto("/placement");

    await expect(page.locator("h1")).toContainText("Chọn Điểm Bắt Đầu Học");
    const startBtn = page.getByRole("button", { name: /Làm Bài Test Đầy Đủ/i });
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    await expect(page.getByText(/^1\/\d+$/)).toBeVisible();

    const firstOption = page.getByRole("button", { name: /^A / }).first();
    await expect(firstOption).toBeVisible();
    await firstOption.click();

    const nextBtn = page.getByRole("button", { name: /Câu tiếp theo/i });
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();

    await expect(page.getByText(/^2\/\d+$/)).toBeVisible();
  });

  test("self-select B1 unlocks unit-19 on /learn", async ({ page }) => {
    await page.goto("/placement");
    await expect(page.locator("h1")).toContainText("Chọn Điểm Bắt Đầu Học");

    const b1Option = page
      .getByRole("button")
      .filter({ hasText: "B1" })
      .filter({ hasText: "Trung cấp" });
    await expect(b1Option).toBeVisible();
    await b1Option.click();

    await expect(
      page.getByRole("link", { name: /Bắt đầu học ngay/i }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("body")).not.toContainText("chưa lưu được DB");

    await page.goto("/learn");
    await expect(page.locator("h1")).toContainText("Học tiếng Anh");

    const unit1Card = page
      .locator("div")
      .filter({ hasText: "Unit 1:" })
      .filter({ hasText: "Đã xác định" })
      .first();
    await expect(unit1Card).toBeVisible({ timeout: 10_000 });

    const unit19Heading = page.getByRole("heading", {
      name: /Unit 19: Stories & Narratives/i,
    });
    await unit19Heading.scrollIntoViewIfNeeded();
    await expect(unit19Heading).toBeVisible();

    const unit19Card = unit19Heading.locator(
      "xpath=ancestor::div[contains(@class,'rounded-2xl')][1]",
    );
    await expect(
      unit19Card.getByRole("link", { name: /Học tiếp|Bắt đầu/i }),
    ).toBeVisible();
    await expect(unit19Card.getByText("Chưa mở khóa")).toHaveCount(0);

    const unit20Heading = page.getByRole("heading", {
      name: /Unit 20: News & Current Events/i,
    });
    await unit20Heading.scrollIntoViewIfNeeded();
    const unit20Card = unit20Heading.locator(
      "xpath=ancestor::div[contains(@class,'rounded-2xl')][1]",
    );
    await expect(unit20Card.getByText("Chưa mở khóa")).toBeVisible();
  });

  test("roadmap Học CTA points to unit-19 after B1 placement", async ({
    page,
  }) => {
    await page.goto("/placement");
    const b1Option = page
      .getByRole("button")
      .filter({ hasText: "B1" })
      .filter({ hasText: "Trung cấp" });
    await b1Option.click();
    await expect(
      page.getByRole("link", { name: /Bắt đầu học ngay/i }),
    ).toBeVisible({ timeout: 15_000 });

    await page.goto("/roadmap");
    await expect(page.locator("h1")).toContainText("Lộ Trình");

    const learnCta = page.locator('main a[href="/learn/unit-19"]');
    await expect(learnCta).toBeVisible();
    await expect(learnCta).toContainText("Học");

    await expect(page.locator("body")).toContainText("Bài tiếp theo:");
    await expect(page.locator("body")).toContainText("Unit 19:");
    await expect(page.locator("body")).toContainText("Đang ở đây");
  });
});

test.describe("Learn canonical session — Phase 4 runtime", () => {
  test("B1 user opens /learn/unit-19, session starts and first actions render", async ({
    page,
  }) => {
    test.skip(
      !hasE2EAdminCredentials(),
      "Requires NEON_AUTH_BASE_URL + DATABASE_URL",
    );

    const userId = await ensureE2ETestUser();
    // Ensure B1 starting so roadmap would show unlocked; unit page loads on auth alone
    await setE2EStartingUnit(userId, 18, "B1");

    await loginAsE2ETestUser(page);

    await page.goto("/learn/unit-19");
    await page.waitForLoadState("domcontentloaded").catch(() => {});

    // Canonical session: start card → begin → session runner mounts.
    await page
      .getByRole("button", { name: "Bắt đầu" })
      .click({ timeout: 8000 });

    const session = page.locator('section[aria-label="Bài học zero-path"]');
    await expect(session).toBeVisible({ timeout: 10000 });

    // Presentation actions advance via Tiếp tục until the first respondable
    // action (choice buttons or a text input + Kiểm tra).
    for (let i = 0; i < 12; i++) {
      const hasInput = (await session
        .locator("textarea")
        .count()
        .catch(() => 0)) > 0;
      const cont = session
        .getByRole("button", { name: /Tiếp tục/ })
        .first();
      if (hasInput || (await cont.count().catch(() => 0)) === 0) break;
      await cont.click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(150);
    }

    // No crash mid-session.
    await expect(session).toBeVisible();
    await expect(page.locator("body")).not.toContainText(
      /error|crash|undefined/i,
      { timeout: 1500 },
    );
  });
});
