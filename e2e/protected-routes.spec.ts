import { test, expect } from "@playwright/test";

/**
 * Authentication routing source of truth:
 * src/lib/supabase/session.ts → protectedRoutes.
 *
 * Guest self-study routes are intentionally excluded from that array.
 */
const PROTECTED_ROUTES = [
  "/me/progress",
  "/me/writing",
  "/me/grammar",
  "/me/pronunciation",
  "/me/speaking",
  "/me/settings",
  "/roadmap",
  "/placement",
  "/checkpoint",
  "/quiz",
];

/**
 * Representative routes intentionally available to unauthenticated learners.
 * `/learn` is prefix-based in session.ts, so test both A0 and A1 lesson slugs.
 */
const GUEST_SELF_STUDY_ROUTES = [
  "/learn",
  "/learn/unit-a0-1",
  "/learn/unit-1",
  "/review",
  "/read",
];

const PUBLIC_ROUTES = [
  { path: "/", titleMatcher: /AtoEnglish/ },
  { path: "/login", titleMatcher: /^Đăng nhập \| AtoEnglish$/ },
];

test.describe("Protected Routes — Unauthenticated Redirects", () => {
  for (const route of PROTECTED_ROUTES) {
    test(`${route} redirects to /login with return context`, async ({
      page,
    }) => {
      await page.goto(route);

      const finalUrl = new URL(page.url());
      expect(finalUrl.pathname).toBe("/login");
      expect(finalUrl.searchParams.get("next")).toBe(route);
      expect(finalUrl.searchParams.get("mode")).toBe("login");
    });
  }
});

test.describe("Guest Self-Study Routes — Accessible Without Auth", () => {
  for (const route of GUEST_SELF_STUDY_ROUTES) {
    test(`${route} remains accessible without login`, async ({ page }) => {
      // domcontentloaded: dev server streams RSC + lazily compiles chunks,
      // so the full "load" event can exceed the test timeout. These tests
      // only assert URL/status, which settle at navigation time.
      const response = await page.goto(route, {
        waitUntil: "domcontentloaded",
      });
      const finalUrl = new URL(page.url());

      expect(finalUrl.pathname).not.toBe("/login");
      expect(response?.status()).toBe(200);
    });
  }
});

test.describe("Public Routes — Accessible Without Auth", () => {
  for (const { path, titleMatcher } of PUBLIC_ROUTES) {
    test(`${path} loads without auth (200)`, async ({ page }) => {
      const response = await page.goto(path);

      if (path !== "/login") {
        expect(new URL(page.url()).pathname).not.toBe("/login");
      }

      await expect(page).toHaveTitle(titleMatcher, { timeout: 8000 });
      expect(response?.status()).toBe(200);
    });
  }
});

test.describe("Landing Page — Key Elements", () => {
  test("has hero heading in Vietnamese", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toContainText("Học tiếng Anh");
  });

  test("has CTA button linking to login", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const cta = page.getByRole("link", { name: /Bắt đầu học/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", /login/);
  });

  test("states the focused 28-day pilot promise", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText("28 ngày", { exact: true }).first(),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText("10–15 phút", { exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByText("A0", { exact: true }).first()).toBeVisible();
  });

  test("footer has privacy and terms links", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: /Bảo mật|Privacy/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Điều khoản|Terms/i }),
    ).toBeVisible();
  });
});

test.describe("Pilot Promise — Consistent Entry Experience", () => {
  test("onboarding repeats the same duration and beginner starting point", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(
      page.getByText("28 ngày", { exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByText(/10–15 phút\/ngày/).first()).toBeVisible();
    await expect(page.getByText(/Bắt đầu từ A0/).first()).toBeVisible();
  });

  test("learn home keeps the continue-learning loop visible", async ({
    page,
  }) => {
    await page.goto("/learn", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("continue-learning")).toBeVisible();
  });
});

test.describe("API Health Check", () => {
  test("/api/health returns valid JSON status", async ({ request }) => {
    const response = await request.get("/api/health");
    expect([200, 503]).toContain(response.status());

    const body = await response.json();
    expect(body).toHaveProperty("status");
    expect(["ok", "degraded", "error"]).toContain(body.status);
    expect(body).toHaveProperty("timestamp");
  });
});
