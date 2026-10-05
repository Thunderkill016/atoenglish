import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders honest 28-day headline", async ({ page }) => {
    await expect(page).toHaveTitle(/AtoEnglish/);
    await expect(
      page.getByRole("heading", { level: 1, name: /28 ngày/ }),
    ).toBeVisible();
  });

  test("primary CTA opens the free first lesson", async ({ page }) => {
    const cta = page
      .getByRole("link", { name: /Học bài đầu tiên/i })
      .first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/learn/unit-a0-1");
  });

  test("has navigation with logo", async ({ page }) => {
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("nav").getByText("AtoEnglish")).toBeVisible();
  });

  test("shows the honest 28-day scope section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /28 ngày nói được gì/i }),
    ).toBeVisible();
    await expect(page.getByText(/28 ngày không làm được/)).toBeVisible();
  });

  test("footer has links to privacy and terms", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /Bảo mật|Privacy/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Điều khoản|Terms/i }),
    ).toBeVisible();
  });
});
