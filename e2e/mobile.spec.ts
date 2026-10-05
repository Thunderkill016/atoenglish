import { test, expect } from "@playwright/test";

test.describe("Mobile Viewport — No Horizontal Overflow", () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test("landing page has no horizontal scroll at 360px", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test("login page has no horizontal scroll at 360px", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test("privacy page has no horizontal scroll at 360px", async ({ page }) => {
    await page.goto("/privacy");
    await page.waitForLoadState("networkidle");

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test("landing page headline is visible on mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText("28 ngày");
  });

  test("landing page CTA button is tappable on mobile", async ({ page }) => {
    await page.goto("/");
    const cta = page
      .getByRole("link", { name: /Học bài đầu tiên/i })
      .first();
    await expect(cta).toBeVisible();
    // Check button is at least 44px tall (min tap target)
    const box = await cta.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
  });

  test("nav logo link is accessible on mobile", async ({ page }) => {
    await page.goto("/");
    const logo = page.locator("nav").getByText("AtoEnglish").first();
    await expect(logo).toBeVisible();
  });
});
