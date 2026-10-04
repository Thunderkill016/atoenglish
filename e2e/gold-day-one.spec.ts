import { expect, test } from "@playwright/test";

test.describe("Gold Day 1 guest journey", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "SpeechRecognition", {
        configurable: true,
        value: undefined,
      });
      Object.defineProperty(window, "webkitSpeechRecognition", {
        configurable: true,
        value: undefined,
      });
    });
  });

  test("finishes mission, mandatory retry and reaches checkpoint login", async ({
    page,
  }) => {
    await page.goto("/learn/unit-a0-1");

    await expect(
      page.getByRole("heading", { name: "Gặp đồng nghiệp mới" }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Bắt đầu nhiệm vụ/ }).click();

    await expect(
      page.getByRole("heading", { name: "6 cụm dùng ngay" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: /Thực hành có hướng dẫn/ })
      .click();

    await expect(
      page.getByRole("heading", { name: "Xem 4 lượt hội thoại" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: /Bỏ câu mẫu, bắt đầu roleplay/ })
      .click();

    const replies = [
      "Hi, I'm Minh.",
      "I work as a developer.",
      "What's your name?",
      "Could you say that again?",
    ];

    for (const reply of replies) {
      await page
        .getByPlaceholder("Nhập lại câu bạn vừa tự nói...")
        .fill(reply);
      await page.getByRole("button", { name: /Gửi câu vừa nói/ }).click();
    }

    await expect(page.getByText("100% mục tiêu giao tiếp")).toBeVisible();
    await expect(page.getByText("Đã thể hiện 4/4 mục tiêu bắt buộc.")).toBeVisible();
    await page
      .getByRole("button", { name: /Nói lại toàn bộ nhiệm vụ/ })
      .click();

    await page
      .getByPlaceholder("Tự thực hiện lại toàn bộ nhiệm vụ rồi nhập lại...")
      .fill(
        "Hi, I'm Minh. I work as a developer. What's your name? Sorry, I didn't catch that. Could you say that again?",
      );
    await page.getByRole("button", { name: /Gửi câu vừa nói/ }).click();

    await expect(
      page.getByRole("heading", { name: "Hoàn thành vòng luyện tập" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: /Làm checkpoint xác nhận/ })
      .click();

    await expect(page).toHaveURL(
      /\/login\?mode=login&next=%2Flearn%2Funit-a0-1%2Fcheckpoint/,
    );
  });
});
