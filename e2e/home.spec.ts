import { expect, test } from "@playwright/test";

import {
  E2E_TEST_EMAIL,
  getE2EUserIdByEmail,
  hasE2EAdminCredentials,
  loginAsE2ETestUser,
  seedWatchedSource,
} from "./helpers/auth";

const VIDEO_ID = "dQw4w9WgXcQ";

test.describe("landing /", () => {
  test("hero paste input navigates straight to /watch", async ({ page }) => {
    await page.goto("/");
    await page
      .getByPlaceholder(/link YouTube/i)
      .fill(`https://www.youtube.com/watch?v=${VIDEO_ID}`);
    await page.getByRole("button", { name: "Xem" }).click();
    await page.waitForURL(`**/watch/${VIDEO_ID}`);
  });

  test("sample videos link into /watch and FAQ is visible", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Câu hỏi thường gặp" }),
    ).toBeVisible();
    await expect(
      page.getByText(/Miễn phí · Không cần tài khoản/),
    ).toBeVisible();
    const sample = page
      .getByRole("link")
      .filter({ hasText: "Never Gonna Give You Up" })
      .first();
    await expect(sample).toHaveAttribute("href", `/watch/${VIDEO_ID}`);
  });
});

test.describe("/discover", () => {
  test("guest sees paste input + catalog grid, no personal sections", async ({
    page,
  }) => {
    await page.goto("/discover");
    await expect(page.getByPlaceholder(/link YouTube/i)).toBeVisible();
    await expect(page.getByText("Đang xem dở")).toHaveCount(0);
    await expect(page.getByText("Thư viện chọn sẵn")).toBeVisible();
    // "Bắt đầu từ đây" guest widget also links this easy-level video.
    await expect(
      page.getByRole("link", { name: /Never Gonna Give You Up/ }).first(),
    ).toHaveAttribute("href", `/watch/${VIDEO_ID}`);
    await expect(
      page.getByRole("link", { name: "Đăng nhập", exact: true }),
    ).toBeVisible();
  });

  test("guest paste input rejects bad URLs with Vietnamese error", async ({
    page,
  }) => {
    await page.goto("/discover");
    await page.getByPlaceholder(/link YouTube/i).fill("not a url");
    await page.getByRole("button", { name: "Xem" }).click();
    await expect(page.getByText(/Link không hợp lệ/)).toBeVisible();
    await expect(page).toHaveURL(/\/discover/);
  });

  test("signed-in viewer sees Đang xem dở + week counter", async ({ page }) => {
    test.skip(
      !hasE2EAdminCredentials(),
      "Needs NEON_AUTH_BASE_URL + DATABASE_URL",
    );
    const userId = await getE2EUserIdByEmail(E2E_TEST_EMAIL);
    test.skip(!userId, "E2E user not seeded by global setup");
    await seedWatchedSource(userId!, VIDEO_ID, "Never Gonna Give You Up");

    await loginAsE2ETestUser(page);
    // Resume banner is the hero "next action" — first match is the banner.
    await expect(page.getByText("Đang xem dở").first()).toBeVisible();
    const resumeLink = page
      .getByRole("link", { name: /Never Gonna Give You Up/ })
      .first();
    await expect(resumeLink).toHaveAttribute(
      "href",
      `/watch/${VIDEO_ID}?t=65000`,
    );
    await expect(page.getByText(/Xem tiếp từ 1:05/)).toBeVisible();
    await expect(page.getByText("Tuần này")).toBeVisible();
    // 7-day activity strip renders weekday labels.
    await expect(page.getByText("T2", { exact: true })).toBeVisible();
    await expect(page.getByText(/video$/)).toBeVisible();
  });
});
