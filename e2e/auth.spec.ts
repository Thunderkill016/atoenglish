import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("renders login page without crashing", async ({ page }) => {
    await expect(page).toHaveURL(/login/);
    // Should not show a 500 error
    await expect(page.locator("body")).not.toContainText(
      "Internal Server Error",
    );
    await expect(page.locator("body")).not.toContainText("Application error");
  });

  test("shows the auth form", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Đăng nhập");
    await expect(
      page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i)),
    ).toBeVisible({ timeout: 5000 });
  });
});

// /discover, /watch and /read stay open for guests by design (viewing needs
// no account). These routes hold learner data and are auth-gated per
// PROTECTED_ROUTES in src/lib/supabase/session.ts.
test.describe("Auth Redirects", () => {
  for (const route of ["/library", "/review", "/me"]) {
    test(`unauthenticated user visiting ${route} is redirected to /login`, async ({
      page,
    }) => {
      await page.goto(route);
      await page.waitForURL(/login/, { timeout: 15000 });
      const finalUrl = new URL(page.url());
      expect(finalUrl.pathname).toBe("/login");
      expect(finalUrl.searchParams.get("next")).toBe(route);
    });
  }
});
