import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("renders login page without crashing", async ({ page }) => {
    await expect(page).toHaveURL(/login/);
    // Should not show a 500 error
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
    await expect(page.locator("body")).not.toContainText("Application error");
  });

  test("shows welcome screen by default", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Bắt đầu hành trình nói");
  });

  test("?mode=login skips survey to auth form", async ({ page }) => {
    await page.goto("/login?mode=login");
    // Should show email input directly
    await expect(page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i))).toBeVisible({ timeout: 5000 });
  });
});

// NOTE: /dashboard, /learn, /flashcards, /speaking are guest self-study
// routes by product design (see e2e/protected-routes.spec.ts). The routes
// below are genuinely auth-gated per PROTECTED_ROUTES in
// src/lib/supabase/session.ts.
test.describe("Auth Redirects", () => {
  for (const route of ["/settings", "/progress", "/checkpoint"]) {
    test(`unauthenticated user visiting ${route} is redirected to /login`, async ({ page }) => {
      await page.goto(route);
      await page.waitForURL(/login/, { timeout: 15000 });
      const finalUrl = new URL(page.url());
      expect(finalUrl.pathname).toBe("/login");
      expect(finalUrl.searchParams.get("next")).toBe(route);
    });
  }
});
