import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders placeholder headline", async ({ page }) => {
    await expect(page).toHaveTitle(/AtoEnglish/);
    await expect(
      page.getByRole("heading", { level: 1, name: "AtoEnglish" }),
    ).toBeVisible();
    await expect(page.getByText("đang được cập nhật")).toBeVisible();
  });

  test("has Start Learning CTA button", async ({ page }) => {
    const cta = page.getByRole("link", { name: /Bắt đầu học/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", /login/);
  });

  test("has navigation with logo", async ({ page }) => {
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("nav").getByText("AtoEnglish")).toBeVisible();
  });

  test("has no marketing sections while placeholder is active", async ({
    page,
  }) => {
    await expect(page.locator("text=Open Beta")).toHaveCount(0);
    await expect(page.locator("text=28 ngày")).toHaveCount(0);
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
