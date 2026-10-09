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
    await expect(
      page.getByRole("button", { name: "Tìm kiếm và khám phá", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Tìm kiếm và khám phá", exact: true })
      .click();
    await expect(page.getByRole("searchbox")).toHaveCount(1);
    await page.getByRole("searchbox").press("Escape");
    await expect(page.getByText("Đang xem dở")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Khám phá", exact: true }),
    ).toHaveCount(1);
    await expect(
      page.getByRole("link", { name: /Never Gonna Give You Up/ }).first(),
    ).toHaveAttribute("href", `/watch/${VIDEO_ID}`);
    await expect(
      page.getByRole("link", { name: "Đăng nhập", exact: true }),
    ).toBeVisible();
  });

  test("filters combine and reset without losing video links", async ({
    page,
  }) => {
    await page.goto("/discover");
    const catalog = page.getByRole("region", { name: "Thư viện chọn sẵn" });
    await page.getByText("Mức độ", { exact: true }).click();
    await catalog.getByRole("button", { name: "Âm nhạc", exact: true }).click();
    await catalog.getByRole("button", { name: "Dễ", exact: true }).click();
    await expect(catalog.getByRole("link")).toHaveCount(6);
    await expect(
      catalog.getByRole("link", { name: /Never Gonna Give You Up/ }),
    ).toHaveAttribute("href", `/watch/${VIDEO_ID}`);
    await catalog.getByRole("button", { name: "Tin tức", exact: true }).click();
    await expect(catalog.getByText("Không có video phù hợp")).toBeVisible();
    await catalog.getByRole("button", { name: "Xoá bộ lọc" }).click();
    await expect(catalog.getByRole("link")).toHaveCount(39);
  });

  test("home has one document scroll and widgets move with the feed", async ({
    page,
  }) => {
    await page.goto("/discover");
    await expect(
      page.getByRole("heading", { name: "Tiến trình xem", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Tìm kiếm và khám phá", exact: true })
      .press("Control+k");
    await expect(
      page.getByRole("searchbox", {
        name: "Tìm video, kênh hoặc dán link YouTube",
      }),
    ).toBeFocused();
    await page.getByRole("searchbox").press("Escape");
    const viewport = page.viewportSize()!;
    const layout = await page.locator(".discover-home").evaluate((home) => {
      const feed = home.firstElementChild as HTMLElement;
      const rail = home.querySelector("aside")!;
      const bounds = (el: Element) => {
        const rect = el.getBoundingClientRect();
        return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom };
      };
      return {
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        feed: bounds(feed),
        rail: bounds(rail),
        feedOverflow: getComputedStyle(feed).overflowY,
        railOverflow: getComputedStyle(rail).overflowY,
        nestedScrollers: Array.from(home.querySelectorAll("*"))
          .filter((el) => {
            const style = getComputedStyle(el);
            return (
              ["auto", "scroll"].includes(style.overflowY) &&
              el.scrollHeight > el.clientHeight + 1
            );
          })
          .map((el) => el.tagName),
      };
    });
    expect(layout.width).toBeLessThanOrEqual(viewport.width);
    expect(layout.nestedScrollers).toEqual([]);
    if (viewport.width >= 1280) {
      const compact = await page.evaluate(() => ({
        thumbnailY: document
          .querySelector("#video-library a img")!
          .getBoundingClientRect().top,
        statsBottom: [...document.querySelectorAll("aside section")]
          .find((el) => el.querySelector("h2")?.textContent === "Thống kê")!
          .getBoundingClientRect().bottom,
      }));
      // The desktop toolbar should expose video and all statistics in the first screen.
      expect(compact.thumbnailY).toBeLessThan(300);
      expect(compact.statsBottom).toBeLessThan(viewport.height);
    }
    expect(layout.feedOverflow).toBe("visible");
    expect(layout.railOverflow).toBe("visible");
    // xl is Tailwind's desktop two-pane breakpoint (1280px).
    if (viewport.width >= 1280) {
      expect(layout.feed.right).toBeLessThan(layout.rail.x);
      expect(layout.height).toBeGreaterThan(viewport.height);
      // Scrolling while the pointer is over the sidebar must scroll the document.
      await page.mouse.move(layout.rail.x + 20, layout.rail.y + 20);
      await page.mouse.wheel(0, viewport.height / 2);
      await expect
        .poll(() => page.evaluate(() => window.scrollY))
        .toBeGreaterThan(0);
      const positions = await page
        .locator(".discover-home")
        .evaluate((home) => ({
          feed: home.firstElementChild!.getBoundingClientRect().y,
          rail: home.querySelector("aside")!.getBoundingClientRect().y,
        }));
      expect(positions.feed).toBeLessThan(layout.feed.y);
      expect(positions.rail).toBeLessThan(layout.rail.y);
    } else {
      expect(layout.rail.y).toBeGreaterThanOrEqual(layout.feed.bottom);
      await expect(
        viewport.width < 768
          ? page.getByRole("navigation", { name: "Điều hướng chính" }).last()
          : page.getByRole("navigation", { name: "Điều hướng chính" }).first(),
      ).toBeVisible();
    }
  });

  test("sidebar offers usable guidance and unavailable routes do not navigate", async ({
    page,
  }) => {
    await page.goto("/discover");
    const rail = page.getByRole("complementary", { name: "Tổng quan học tập" });
    await expect(rail.locator('[aria-current="date"]')).toHaveCount(1);
    for (const name of [
      "Lịch tuần",
      "Tiến trình xem",
      "Flashcard",
      "Thống kê",
      "Activity",
      "Progress",
      "Học với video",
    ]) {
      await expect(
        rail.getByRole("heading", { name, exact: true }),
      ).toBeVisible();
    }
    await expect(
      rail.getByRole("link", { name: "Đăng nhập", exact: true }),
    ).toHaveAttribute("href", "/login");
    await expect(
      rail.getByText("Đăng nhập để lưu vị trí và xem tiếp lần sau."),
    ).toBeVisible();
    await expect(
      rail.getByText("Video chọn sẵn", { exact: true }),
    ).toBeVisible();
    await expect(
      rail.getByText("Chưa có dữ liệu tiến độ", { exact: true }),
    ).toBeVisible();
    await expect(
      rail.getByRole("img", { name: /^Lịch hoạt động Th/ }),
    ).toBeVisible();
    for (const label of ["PDF", "Gợi ý video dễ"]) {
      await expect(rail.getByText(label, { exact: true })).toHaveCount(0);
    }
    for (const href of ["/read", "/review", "/library", "/me"]) {
      await expect(page.locator(`a[href="${href}"]`)).toHaveCount(0);
    }
    const nav = page.getByRole("navigation", { name: "Điều hướng chính" });
    await expect(
      nav.getByRole("link", { name: "Ôn — sắp ra mắt", exact: true }).first(),
    ).toHaveAttribute("aria-disabled", "true");
  });

  test("title and channel search combine with topics, levels and short sessions", async ({
    page,
  }) => {
    await page.goto("/discover");
    const catalog = page.getByRole("region", { name: "Thư viện chọn sẵn" });
    const search = page.getByRole("searchbox", {
      name: "Tìm video, kênh hoặc dán link YouTube",
    });
    await page
      .getByRole("button", { name: "Tìm kiếm và khám phá", exact: true })
      .click();
    await search.fill("rick astley");
    await search.press("Escape");
    await expect(catalog.getByRole("link")).toHaveCount(1);
    await expect(catalog.getByRole("link")).toHaveAttribute(
      "href",
      `/watch/${VIDEO_ID}`,
    );
    await catalog.getByRole("button", { name: "≤10 phút" }).click();
    await expect(
      catalog.getByRole("button", { name: "≤10 phút" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(catalog.getByRole("link")).toHaveCount(1);
    await page
      .getByRole("button", { name: "Tìm kiếm và khám phá", exact: true })
      .click();
    await search.fill("am nhac");
    await search.press("Escape");
    await expect(catalog.getByRole("link")).toHaveCount(11);
    await catalog
      .getByRole("button", { name: "TED Talks", exact: true })
      .click();
    await expect(catalog.getByText("Không có video phù hợp")).toBeVisible();
    await catalog.getByRole("button", { name: "Xoá bộ lọc" }).click();
    await expect(
      page.getByRole("button", { name: "Tìm kiếm và khám phá", exact: true }),
    ).toContainText("Tìm kiếm và khám phá…");
    await expect(
      catalog.getByRole("button", { name: "≤10 phút" }),
    ).toHaveAttribute("aria-pressed", "false");
    await expect(catalog.getByRole("link")).toHaveCount(39);
    await expect(catalog.getByRole("status")).toHaveText("39 video");
    await page
      .getByRole("button", { name: "Tìm kiếm và khám phá", exact: true })
      .click();
    await search.fill("VLOG DOI SONG");
    await search.press("Escape");
    await expect(catalog.getByRole("link")).toHaveCount(3);
  });

  test("all controls reflow at 320px without a second vertical scroller", async ({
    page,
  }) => {
    // 320 CSS px exercises the WCAG reflow width, including expanded filters.
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto("/discover");
    await page.getByText("Mức độ", { exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Tìm kiếm và khám phá", exact: true }),
    ).toBeVisible();
    const layout = await page.locator(".discover-home").evaluate((home) => ({
      width: document.documentElement.scrollWidth,
      nested: [...home.querySelectorAll("*")].filter(
        (el) =>
          ["auto", "scroll"].includes(getComputedStyle(el).overflowY) &&
          el.scrollHeight > el.clientHeight + 1,
      ).length,
    }));
    expect(layout.width).toBeLessThanOrEqual(320);
    expect(layout.nested).toBe(0);
  });

  test("single picker searches videos and channels, closes with Esc and opens YouTube links", async ({
    page,
  }) => {
    await page.goto("/discover");
    const launcher = page.getByRole("button", {
      name: "Tìm kiếm và khám phá",
      exact: true,
    });
    await launcher.press("Control+k");
    const dialog = page.getByRole("dialog", { name: "Tìm kiếm và khám phá" });
    const search = dialog.getByRole("searchbox");
    await expect(search).toBeFocused();
    await expect
      .poll(() =>
        page.evaluate(
          () => getComputedStyle(document.documentElement).overflowY,
        ),
      )
      .toBe("hidden");
    const bounds = await dialog.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        width: window.innerWidth,
        nested: [...element.querySelectorAll("*")].filter(
          (child) =>
            ["auto", "scroll"].includes(getComputedStyle(child).overflowY) &&
            child.scrollHeight > child.clientHeight + 1,
        ).length,
      };
    });
    expect(bounds.left).toBeGreaterThanOrEqual(0);
    expect(bounds.right).toBeLessThanOrEqual(bounds.width);
    expect(bounds.nested).toBe(0);
    // The input is first and the last channel wraps back to it.
    await expect(dialog.getByRole("status")).toHaveText(/kênh trong thư viện/);
    await expect(dialog.getByRole("link")).toHaveCount(0);
    const lastChannel = dialog.getByRole("button").last();
    await search.press("Shift+Tab");
    await expect(lastChannel).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(search).toBeFocused();
    await expect(dialog.locator("img").first()).toBeVisible();
    await expect(page.getByRole("searchbox")).toHaveCount(1);
    await dialog.getByRole("button", { name: "Kênh", exact: true }).click();
    await dialog
      .getByRole("button", { name: / TED \d+ video trong thư viện$/ })
      .click();
    await expect(search).toHaveValue("TED");
    await expect(dialog.getByRole("status")).toHaveText("10 video phù hợp");
    // The picker caps its list at PICKER_RESULT_LIMIT; Enter applies all 10.
    await expect(dialog.getByRole("link")).toHaveCount(6);
    await search.fill("");
    await expect(dialog.getByRole("status")).toHaveText(
      "23 kênh trong thư viện",
    );
    await expect(dialog.getByRole("link")).toHaveCount(0);
    await dialog
      .getByRole("button", { name: / TED \d+ video trong thư viện$/ })
      .click();
    await expect(dialog.getByRole("link").first().locator("img")).toBeVisible();
    await search.press("Enter");
    await expect(
      page.getByRole("region", { name: "Thư viện chọn sẵn" }).getByRole("link"),
    ).toHaveCount(10);
    await launcher.click();
    await search.fill("rick astley");
    await search.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(launcher).toBeFocused();
    await launcher.click();
    await search.press("Enter");
    await expect(dialog).not.toBeVisible();
    await expect(
      page.getByRole("region", { name: "Thư viện chọn sẵn" }).getByRole("link"),
    ).toHaveCount(1);
    await launcher.click();
    await search.fill(`https://www.youtube.com/watch?v=${VIDEO_ID}`);
    await expect(
      dialog.getByText("Link YouTube hợp lệ. Nhấn Enter để mở video."),
    ).toBeVisible();
    await search.press("Enter");
    await page.waitForURL(`**/watch/${VIDEO_ID}`);
  });

  test("Vietnamese title toggle is shared with search and Vietnamese queries work while hidden", async ({
    page,
  }) => {
    const translationRequests: string[] = [];
    page.on("request", (request) => {
      if (/\/api\/(dictionary|translate)/.test(request.url()))
        translationRequests.push(request.url());
    });
    await page.goto("/discover");
    const catalog = page.getByRole("region", { name: "Thư viện chọn sẵn" });
    const toggle = catalog.getByRole("button", {
      name: "Hiện nghĩa Việt",
      exact: true,
    });
    const meaning = "Trường học có giết chết sự sáng tạo?";
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(catalog.getByText(meaning, { exact: true })).toHaveCount(0);
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(catalog.getByText(meaning, { exact: true })).toBeVisible();
    const original = catalog.getByRole("link", {
      name: /Do Schools Kill Creativity/,
    });
    await expect(original).toHaveAttribute("href", "/watch/iG9CE55wbtY");
    const launcher = page.getByRole("button", {
      name: "Tìm kiếm và khám phá",
      exact: true,
    });
    await launcher.click();
    const dialog = page.getByRole("dialog", { name: "Tìm kiếm và khám phá" });
    const search = dialog.getByRole("searchbox");
    const dialogToggle = dialog.getByRole("button", {
      name: "Hiện nghĩa Việt",
      exact: true,
    });
    await expect(dialogToggle).toHaveAttribute("aria-pressed", "true");
    await search.fill("truong hoc co giet chet su sang tao");
    await expect(dialog.getByRole("link")).toHaveCount(1);
    await expect(dialog.getByText(meaning, { exact: true })).toBeVisible();
    await dialogToggle.click();
    await expect(dialog.getByText(meaning, { exact: true })).toHaveCount(0);
    await expect(
      dialog.getByRole("link", { name: /Do Schools Kill Creativity/ }),
    ).toHaveCount(1);
    await search.press("Escape");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(catalog.getByRole("link")).toHaveCount(1);
    await expect(catalog.getByText(meaning, { exact: true })).toHaveCount(0);
    await toggle.click();
    await catalog.getByRole("button", { name: "Xoá bộ lọc" }).click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(catalog.getByRole("link")).toHaveCount(39);
    await expect(catalog.getByText(meaning, { exact: true })).toBeVisible();
    expect(translationRequests).toEqual([]);
  });

  test("guest paste input rejects bad URLs with Vietnamese error", async ({
    page,
  }) => {
    await page.goto("/discover");
    await page
      .getByRole("button", { name: "Tìm kiếm và khám phá", exact: true })
      .click();
    await page.getByRole("searchbox").fill("https://youtu.be/not-valid");
    await page.getByRole("searchbox").press("Enter");
    await expect(page.getByText(/Link không hợp lệ/)).toBeVisible();
    await expect(page).toHaveURL(/\/discover/);
  });

  test("dictionary drawer has curated meanings, honest misses and guest AI recovery", async ({
    page,
  }) => {
    await page.goto("/discover");
    const launcher = page.getByRole("button", { name: "Tra từ", exact: true });
    await launcher.press("Control+d");
    const panel = page.getByRole("dialog", { name: "Tra từ", exact: true });
    const term = panel.getByLabel("Từ hoặc cụm từ tiếng Anh");
    await expect(term).toBeFocused();
    await expect
      .poll(() =>
        page.evaluate(
          () => getComputedStyle(document.documentElement).overflowY,
        ),
      )
      .toBe("hidden");
    await panel.getByRole("button", { name: "Đóng tra từ" }).focus();
    await page.keyboard.press("Shift+Tab");
    await expect(
      panel.getByRole("button", { name: "Tra bằng AI", exact: true }),
    ).toBeFocused();
    await term.fill("hello");
    await term.press("Enter");
    await expect(panel.getByText("xin chào", { exact: true })).toBeVisible();
    await expect(
      panel.getByText("Từ điển có sẵn", { exact: true }),
    ).toBeVisible();
    await expect(
      panel.getByRole("button", { name: "Nghe cách đọc từ" }),
    ).toBeVisible();
    await term.fill("zzzzq");
    await term.press("Enter");
    await expect(
      panel.getByText(/Chưa có nghĩa trong từ điển có sẵn/),
    ).toBeVisible();
    await panel
      .getByRole("button", { name: "Tra bằng AI", exact: true })
      .click();
    await expect(panel.getByRole("alert")).toContainText(
      "Đăng nhập để tra nghĩa bằng AI.",
    );
    await expect(
      panel.getByRole("link", { name: "Đăng nhập", exact: true }),
    ).toHaveAttribute("href", "/login");
    await term.press("Escape");
    await expect(panel).not.toBeVisible();
    await expect(launcher).toBeFocused();
    await expect
      .poll(() => page.evaluate(() => document.body.style.overflow))
      .not.toBe("hidden");
  });

  test("signed-in viewer sees Đang xem dở and saved video summary", async ({
    page,
  }) => {
    test.skip(
      !hasE2EAdminCredentials(),
      "Needs NEON_AUTH_BASE_URL + DATABASE_URL",
    );
    const userId = await getE2EUserIdByEmail(E2E_TEST_EMAIL);
    test.skip(!userId, "E2E user not seeded by global setup");
    await seedWatchedSource(userId!, VIDEO_ID, "Never Gonna Give You Up");

    await loginAsE2ETestUser(page);
    // Resume banner is the hero "next action" — first match is the banner.
    await expect(
      page.getByRole("heading", { name: "Tiếp tục xem", exact: true }),
    ).toBeVisible();
    const resumeLink = page
      .getByRole("link", { name: /Never Gonna Give You Up/ })
      .first();
    await expect(resumeLink).toHaveAttribute(
      "href",
      `/watch/${VIDEO_ID}?t=65000`,
    );
    await expect(page.getByText(/Xem tiếp từ 1:05/)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Lịch tuần", exact: true }),
    ).toBeVisible();
    // 7-day activity strip renders weekday labels.
    await expect(page.getByText("T2", { exact: true })).toBeVisible();
    const rail = page.getByRole("complementary", { name: "Tổng quan học tập" });
    await expect(rail.getByText("video đã mở", { exact: true })).toBeVisible();
    await expect(
      rail.getByText(/Video đang xem dở nằm ngay phía trên thư viện/),
    ).toBeVisible();
  });
});
