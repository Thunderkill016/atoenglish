import { test, expect, type Page } from "@playwright/test";

/**
 * /watch/[videoId] — deterministic guest coverage.
 *
 * `use-youtube-player.ts` resolves early when `window.YT?.Player` already
 * exists, so predefining it via `addInitScript` (before `goto`) means the
 * real https://www.youtube.com/iframe_api is never requested and no YouTube
 * network iframe is ever created (a local blank iframe models replacement and size). A `page.route` fulfil serves the same stub source
 * as a fallback, and a broad abort guarantees no request reaches YouTube.
 */

const VIDEO_ID = "dQw4w9WgXcQ"; // 11-char valid id (rickroll, ~3:32)

/** Globals the stub exposes for assertions. */
interface SeekRecord {
  seconds: number;
  allowSeekAhead: boolean;
}

// Mirrors the YTPlayer surface used by use-youtube-player.ts
// (see src/lib/video/youtube-player.d.ts). Constructor fires `onReady`
// asynchronously like the real API; seeks land in `window.__seeks` and move
// the controllable clock `window.__t` (seconds) returned by getCurrentTime.
const PLAYER_STUB_SOURCE = `(() => {
  window.__seeks = [];
  window.__t = 0;
  window.__playerMounts = 0;
  window.__duration = 212; // rickroll length in seconds
  var PlayerState = {
    UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5,
  };
  function FakePlayer(el, cfg) {
    window.__playerMounts += 1;
    var frame = document.createElement("iframe");
    frame.title = "YouTube test player";
    frame.setAttribute("width", cfg.width || "640");
    frame.setAttribute("height", cfg.height || "390");
    el.replaceWith(frame);
    this.el = frame;
    this._cfg = cfg || {};
    this._rate = 1;
    this._state = PlayerState.UNSTARTED;
    window.__player = this;
    var self = this;
    setTimeout(function () {
      var onReady = self._cfg.events && self._cfg.events.onReady;
      if (onReady) onReady({ target: self });
    }, 0);
  }
  FakePlayer.prototype._fireState = function (data) {
    this._state = data;
    var onStateChange = this._cfg.events && this._cfg.events.onStateChange;
    if (onStateChange) onStateChange({ target: this, data: data });
  };
  FakePlayer.prototype.playVideo = function () {
    this._fireState(PlayerState.PLAYING);
  };
  FakePlayer.prototype.pauseVideo = function () {
    this._fireState(PlayerState.PAUSED);
  };
  FakePlayer.prototype.seekTo = function (seconds, allowSeekAhead) {
    window.__seeks.push({ seconds: seconds, allowSeekAhead: allowSeekAhead });
    window.__t = seconds;
  };
  FakePlayer.prototype.getCurrentTime = function () { return window.__t; };
  FakePlayer.prototype.getDuration = function () { return window.__duration; };
  FakePlayer.prototype.getPlayerState = function () { return this._state; };
  FakePlayer.prototype.setPlaybackRate = function (rate) {
    this._rate = rate;
    var changed = this._cfg.events && this._cfg.events.onPlaybackRateChange;
    if (changed) changed({ target: this, data: rate });
  };
  FakePlayer.prototype.getAvailablePlaybackRates = function () { return [0.5, 0.75, 1, 1.25]; };
  FakePlayer.prototype.getPlaybackRate = function () { return this._rate; };
  FakePlayer.prototype.destroy = function () { this.el.remove(); };
  window.YT = { Player: FakePlayer, PlayerState: PlayerState };
  if (typeof window.onYouTubeIframeAPIReady === "function") {
    window.onYouTubeIframeAPIReady();
  }
})();`;

async function stubYouTubePlayer(page: Page): Promise<void> {
  // Automatic intake must never reach production telemetry/DB in fixture tests.
  await page.route("**/watch/*", (route) => {
    if (
      route.request().method() !== "POST" ||
      !route.request().headers()["next-action"]
    )
      return route.continue();
    return route.fulfill({
      contentType: "text/x-component",
      body: '0:{"a":"$1","f":[],"b":"fixture"}\n1:{"ok":false,"error":"no_captions"}\n',
    });
  });
  // Broad abort registered first — Playwright consults routes in reverse
  // registration order, so the narrower iframe_api fulfil below wins.
  await page.route(
    /:\/\/([^/]+\.)?(youtube|youtube-nocookie|ytimg|googlevideo)\.com\//,
    (route) => route.abort(),
  );
  await page.route("**/www.youtube.com/iframe_api*", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: PLAYER_STUB_SOURCE,
    }),
  );
  await page.addInitScript({ content: PLAYER_STUB_SOURCE });
}

function getSeeks(page: Page): Promise<SeekRecord[]> {
  return page.evaluate(
    () => (window as unknown as { __seeks: SeekRecord[] }).__seeks,
  );
}

async function pasteTranscript(page: Page, raw: string): Promise<void> {
  await page.getByRole("button", { name: "Dán hoặc tải phụ đề" }).click();
  await page
    .getByRole("textbox", { name: "Nội dung phụ đề", exact: true })
    .fill(raw);
  await page.getByRole("button", { name: "Dùng phụ đề này" }).click();
}

/** Upload the large fixture through the same supported parser; avoid measuring
 * Chromium textarea insertion time as part of the virtual-list regression. */
async function uploadTranscript(page: Page, raw: string): Promise<void> {
  await page.getByRole("button", { name: "Dán hoặc tải phụ đề" }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: "fixture.txt",
    mimeType: "text/plain",
    buffer: Buffer.from(raw),
  });
}

// Two timed cues → two sentences (i=0: 1.0–3.0s, i=1: 3.5–5.0s).
const SRT = [
  "1",
  "00:00:01,000 --> 00:00:03,000",
  "First line.",
  "",
  "2",
  "00:00:03,500 --> 00:00:05,000",
  "Second line.",
].join("\n");

test.describe("/watch/[videoId]", () => {
  test.beforeEach(async ({ page }) => {
    await stubYouTubePlayer(page);
  });

  test("guest sees the player and the empty-transcript options", async ({
    page,
  }) => {
    await page.goto(`/watch/${VIDEO_ID}`);
    await expect(
      page.getByRole("button", { name: "Thử lấy lại phụ đề" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Dán hoặc tải phụ đề" }),
    ).toBeVisible();
    // Stub fired onReady: the loading placeholder clears and the fake
    // duration (212 s → 3:32) shows in the control bar.
    await expect(page.getByText("Đang tải trình phát")).toBeHidden();
    await expect(page.getByText("0:00 / 3:32")).toBeVisible();
    // Guest-only hint about persistence.
    await expect(
      page.getByText("Đăng nhập để lưu phụ đề và tiếp tục xem"),
    ).toBeVisible();
  });

  test("fetch from YouTube yields a transcript or a mapped error", async ({
    page,
  }) => {
    await page.unroute("**/watch/*");
    await page.goto(`/watch/${VIDEO_ID}`);
    await page.getByRole("button", { name: "Thử lấy lại phụ đề" }).click();
    // The dev server makes a real upstream call here — either outcome is a
    // valid upstream result; this explicit integration case can emit server telemetry. The regex covers every error mapped in
    // watch-client.tsx ERROR_MESSAGES except "unauthorized" (guests may
    // fetch; and its text would false-match the always-visible guest hint).
    const rail = page.getByTestId("transcript-rail");
    const errorText = page.getByText(
      /Link video không hợp lệ|không có phụ đề tiếng Anh|đang chặn yêu cầu từ máy chủ|lấy phụ đề quá nhiều lần|Không đọc được phụ đề này|Có lỗi khi lấy phụ đề/,
    );
    await expect(rail.or(errorText)).toBeVisible({ timeout: 60_000 });
    if (await rail.isVisible()) {
      await expect(rail.locator("[data-sentence]").first()).toBeVisible();
    } else {
      // After a handled error the manual fallback stays usable.
      await expect(
        page.getByRole("button", { name: "Dán hoặc tải phụ đề" }),
      ).toBeEnabled();
    }
  });

  test("guest paste of plain text renders a read-only transcript", async ({
    page,
  }) => {
    await page.goto(`/watch/${VIDEO_ID}`);
    // Guest paste parses fully client-side; persistence is skipped when
    // loggedIn=false (watch-client.tsx handleParsed).
    await pasteTranscript(
      page,
      "Hello world. This is a test sentence. Another one here.",
    );
    const rail = page.getByTestId("transcript-rail");
    await expect(rail).toBeVisible();
    await expect(rail.locator("[data-sentence]")).toHaveCount(3);
    await expect(
      page.getByText("Văn bản không đồng bộ — chỉ để đọc."),
    ).toBeVisible();
    // Untimed sentences (start_ms=null) must not seek.
    await rail.locator('[data-sentence="1"]').click();
    await expect(rail.getByRole("button", { name: /^Nghe câu/ })).toHaveCount(
      0,
    );
    expect(await getSeeks(page)).toHaveLength(0);
  });

  test("clicking a timed sentence seeks the player", async ({ page }) => {
    await page.goto(`/watch/${VIDEO_ID}`);
    await pasteTranscript(page, SRT);
    const rail = page.getByTestId("transcript-rail");
    await expect(rail.locator("[data-sentence]")).toHaveCount(2);
    // Learner transcript, not persisted for guests.
    await expect(page.getByText("Phụ đề của bạn")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Đăng nhập để lưu" }),
    ).toBeVisible();

    await rail
      .locator('[data-sentence="1"]')
      .getByRole("button", { name: "Nghe câu 0:03", exact: true })
      .click();
    await expect
      .poll(() => getSeeks(page))
      .toEqual([{ seconds: 3.5, allowSeekAhead: true }]);
    // Clicked line becomes active (clock now sits inside its cue).
    await expect(rail.locator('[data-sentence="1"]')).toHaveAttribute(
      "aria-current",
      "true",
    );
    // Caption strip under the player mirrors the active sentence.
    await expect(
      page.getByTestId("active-caption").getByTestId("sentence-text"),
    ).toHaveText("Second line.");
    await expect(page.getByTestId("active-caption")).toContainText(
      "Chưa có bản dịch cho câu này.",
    );
  });

  test("keyboard shortcuts navigate between sentences", async ({ page }) => {
    await page.goto(`/watch/${VIDEO_ID}`);
    await pasteTranscript(page, SRT);
    const rail = page.getByTestId("transcript-rail");
    await expect(rail.locator("[data-sentence]")).toHaveCount(2);

    await rail
      .locator('[data-sentence="0"]')
      .getByRole("button", { name: "Nghe câu 0:01", exact: true })
      .click();
    await expect.poll(async () => (await getSeeks(page)).length).toBe(1);

    // "d" = next sentence, "a" = previous (watch-client.tsx keydown map).
    await page.keyboard.press("d");
    await expect
      .poll(async () => (await getSeeks(page)).map((s) => s.seconds))
      .toEqual([1, 3.5]);
    await expect(rail.locator('[data-sentence="1"]')).toHaveAttribute(
      "aria-current",
      "true",
    );

    await page.keyboard.press("a");
    await expect
      .poll(async () => (await getSeeks(page)).map((s) => s.seconds))
      .toEqual([1, 3.5, 1]);
    await expect(rail.locator('[data-sentence="0"]')).toHaveAttribute(
      "aria-current",
      "true",
    );

    // "?" toggles the shortcut help panel.
    await page.keyboard.press("?");
    await expect(page.getByText("Phím tắt:")).toBeVisible();
  });

  test("read mode hides timestamps and toggles back", async ({ page }) => {
    await page.goto(`/watch/${VIDEO_ID}`);
    await pasteTranscript(page, SRT);
    const rail = page.getByTestId("transcript-rail");
    await expect(rail.locator("[data-sentence]")).toHaveCount(2);

    // Theater mode: timestamp column visible (0:01 / 0:03).
    await expect(rail.getByText("0:01")).toBeVisible();

    await page.getByRole("button", { name: "Chế độ đọc" }).click();
    // Label flips, per-line timestamps disappear (prose hides the column).
    await expect(
      page.getByRole("button", { name: "Chế độ rạp" }),
    ).toBeVisible();
    await expect(rail.getByText("0:01")).toBeHidden();
    await expect(rail.getByText("0:03")).toBeHidden();
    // Sentences still render and remain clickable.
    await expect(rail.locator("[data-sentence]")).toHaveCount(2);
    await rail
      .locator('[data-sentence="1"]')
      .getByRole("button", { name: "Nghe câu 0:03", exact: true })
      .click();
    await expect
      .poll(async () => (await getSeeks(page)).map((s) => s.seconds))
      .toEqual([3.5]);

    // Toggle back to theater.
    await page.getByRole("button", { name: "Chế độ rạp" }).click();
    await expect(rail.getByText("0:01")).toBeVisible();
  });

  test("?t= deep link seeks the player once it is ready", async ({ page }) => {
    await page.goto(`/watch/${VIDEO_ID}?t=65000`);
    await expect(page.getByText("Đang tải trình phát")).toBeHidden();
    // page.tsx treats ?t as milliseconds → seekTo(65s) on onReady.
    await expect
      .poll(async () => (await getSeeks(page)).map((s) => s.seconds))
      .toEqual([65]);
    await expect(page.getByText("1:05 / 3:32")).toBeVisible();
  });

  test("catalog title and responsive iframe fill the centered stage", async ({
    page,
  }) => {
    await page.goto("/watch/UF8uR6Z6KLc");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Steve Jobs' 2005 Stanford Commencement Address",
    );
    await expect(page.getByText("Stanford", { exact: true })).toBeVisible();
    const frame = page.getByTestId("video-frame");
    const iframe = frame.locator("iframe");
    await expect(iframe).toHaveAttribute("width", "100%");
    const box = await frame.boundingBox();
    const embed = await iframe.boundingBox();
    expect(box).not.toBeNull();
    expect(embed).not.toBeNull();
    expect(Math.abs(embed!.width - box!.width)).toBeLessThan(2);
    expect(Math.abs(embed!.height - box!.height)).toBeLessThan(2);
    const stage = await page.getByTestId("player-stage").boundingBox();
    expect(
      Math.abs(box!.x + box!.width / 2 - stage!.x - stage!.width / 2),
    ).toBeLessThan(2);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (page.viewportSize()!.width >= 1024) {
      expect(
        await page.evaluate(
          () => document.documentElement.scrollHeight <= innerHeight,
        ),
      ).toBe(true);
    } else {
      // Preserve the YouTube minimum viewport on narrow phones.
      expect(box!.height).toBeGreaterThanOrEqual(200);
    }
  });

  test("progress slider seeks without forcing playback; native Space toggles once", async ({
    page,
  }) => {
    await page.goto(`/watch/${VIDEO_ID}`);
    const slider = page.getByRole("slider", { name: "Vị trí phát video" });
    await expect(slider).toBeEnabled();
    await slider.fill("65000");
    await expect
      .poll(async () => (await getSeeks(page)).map((s) => s.seconds))
      .toEqual([65]);
    await expect(
      page.getByRole("button", { name: "Phát video", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Phát video", exact: true }).focus();
    await page.keyboard.press("Space");
    await expect(
      page.getByRole("button", { name: "Dừng video", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Space");
    await expect(
      page.getByRole("button", { name: "Phát video", exact: true }),
    ).toBeVisible();
  });

  test("manual scrolling pauses follow; read/mobile use only document scrolling", async ({
    page,
  }) => {
    await page.goto(`/watch/${VIDEO_ID}`);
    // Synthetic timed lines test navigation, not the real video's caption content.
    const lines = Array.from(
      { length: 80 },
      (_, i) =>
        `[${Math.floor(i / 60)}:${String(i % 60).padStart(2, "0")}] Fixture sentence ${i}.`,
    ).join("\n");
    await pasteTranscript(page, lines);
    const rail = page.getByTestId("transcript-rail");
    await expect(rail.locator("[data-sentence]")).toHaveCount(80);
    if (page.viewportSize()!.width >= 1024) {
      expect(
        await rail.evaluate((el) => el.scrollHeight > el.clientHeight),
      ).toBe(true);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollHeight <= innerHeight,
        ),
      ).toBe(true);
      await page.evaluate(() => {
        (window as unknown as { __t: number }).__t = 70;
      });
      await expect
        .poll(() => rail.evaluate((el) => el.scrollTop))
        .toBeGreaterThan(0);
      await rail.hover();
      await page.mouse.wheel(0, -200);
      const resume = page.getByRole("button", {
        name: "Theo câu đang phát",
        exact: true,
      });
      await expect(resume).toHaveAttribute("aria-pressed", "false");
      await page.evaluate(() => {
        (window as unknown as { __t: number }).__t = 0;
      });
      await expect(rail.locator('[data-sentence="0"]')).toHaveAttribute(
        "aria-current",
        "true",
      );
      expect(await rail.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
      await resume.click();
      await expect
        .poll(() =>
          rail.locator('[data-sentence="0"]').evaluate((el) => {
            const container = el.closest('[data-testid="transcript-rail"]')!;
            const line = el.getBoundingClientRect();
            const bounds = container.getBoundingClientRect();
            return line.top >= bounds.top && line.bottom <= bounds.bottom;
          }),
        )
        .toBe(true);
      await expect(
        page.getByTestId("video-frame").locator("iframe"),
      ).toHaveCount(1);
    } else {
      expect(
        await rail.evaluate((el) => el.scrollHeight <= el.clientHeight),
      ).toBe(true);
    }
    await page.getByRole("button", { name: "Chế độ đọc" }).click();
    expect(
      await rail.evaluate((el) => el.scrollHeight <= el.clientHeight),
    ).toBe(true);
    await expect(page.getByTestId("video-frame").locator("iframe")).toHaveCount(
      1,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

  test("next starts at the first cue and switching modes preserves the player", async ({
    page,
  }) => {
    await page.goto(`/watch/${VIDEO_ID}`);
    await pasteTranscript(page, SRT);
    await page
      .getByRole("button", { name: "Câu sau (D)", exact: true })
      .click();
    await expect
      .poll(async () => (await getSeeks(page)).map((s) => s.seconds))
      .toEqual([1]);
    await page.getByRole("slider", { name: "Vị trí phát video" }).focus();
    await page.keyboard.press("d");
    expect((await getSeeks(page)).map((s) => s.seconds)).toEqual([1]);
    await page.getByRole("button", { name: "Chế độ đọc" }).click();
    if (page.viewportSize()!.width < 640) {
      await page
        .getByRole("button", { name: "Điều khiển", exact: true })
        .click();
    }
    await expect(page.getByText("0:01 / 3:32")).toBeVisible();
    await page.getByRole("button", { name: "Chế độ rạp" }).click();
    await expect(page.getByText("0:01 / 3:32")).toBeVisible();
    expect(
      await page.evaluate(
        () => (window as unknown as { __playerMounts: number }).__playerMounts,
      ),
    ).toBe(1);
  });

  test("word lookup keeps source context, pauses and restores focus without seeking", async ({
    page,
  }) => {
    const requests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/dictionary"))
        requests.push(request.url());
    });
    await page.goto(`/watch/${VIDEO_ID}`);
    await pasteTranscript(
      page,
      "[00:01] I work here.\n[00:05] We take a break.",
    );
    const row = page
      .getByTestId("transcript-rail")
      .locator('[data-sentence="0"]');
    await row
      .getByRole("button", { name: "Nghe câu 0:01", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Dừng video", exact: true }),
    ).toBeVisible();
    const word = row.getByRole("button", {
      name: "Tra từ “work”",
      exact: true,
    });
    await word.click();
    const panel = page.getByRole("dialog", { name: "Tra từ", exact: true });
    await expect(panel).toBeVisible();
    await expect(
      panel.getByRole("region", { name: "Câu nguồn" }),
    ).toContainText("I work here.");
    await expect(panel.getByText("Câu đang học · 0:01")).toBeVisible();
    await expect(
      panel.getByText("Từ điển có sẵn · nghĩa chung", { exact: true }),
    ).toBeVisible();
    expect(await getSeeks(page)).toEqual([
      { seconds: 1, allowSeekAhead: true },
    ]);
    await panel
      .getByRole("button", { name: "Đóng tra từ", exact: true })
      .click();
    await expect(word).toBeFocused();
    await expect(
      page.getByRole("button", { name: "Phát video", exact: true }),
    ).toBeVisible();
    expect(requests).toHaveLength(0);
    expect(
      await page.evaluate(
        () => (window as unknown as { __playerMounts: number }).__playerMounts,
      ),
    ).toBe(1);
    await word.click();
    const meaning = panel.getByText("làm việc / công việc", { exact: true });
    await expect(meaning).toBeInViewport();
    await expect(
      panel.getByRole("button", { name: "Đóng tra từ", exact: true }),
    ).toBeFocused();
    await panel
      .getByRole("button", { name: "Nghe lại câu nguồn", exact: true })
      .click();
    await expect(panel).toBeHidden();
    await expect
      .poll(async () => (await getSeeks(page)).map((s) => s.seconds))
      .toEqual([1, 1]);
  });

  test("phrase selection works in reverse order and stays inside one source sentence", async ({
    page,
  }) => {
    await page.goto(`/watch/${VIDEO_ID}`);
    await pasteTranscript(
      page,
      "[00:01] We take a break.\n[00:05] Please work here.",
    );
    const rail = page.getByTestId("transcript-rail");
    const first = rail.locator('[data-sentence="0"]');
    const second = rail.locator('[data-sentence="1"]');
    await page.getByRole("button", { name: "Chọn cụm", exact: true }).click();
    await first
      .getByRole("button", { name: "Chọn từ “break”", exact: true })
      .click();
    await first
      .getByRole("button", { name: "Chọn từ “take”", exact: true })
      .click();
    const panel = page.getByRole("dialog", { name: "Tra từ", exact: true });
    await expect(
      panel.getByRole("textbox", {
        name: "Từ hoặc cụm từ tiếng Anh",
        exact: true,
      }),
    ).toHaveValue("take a break");
    await panel
      .getByRole("button", { name: "Đóng tra từ", exact: true })
      .click();
    await first
      .getByRole("button", { name: "Chọn từ “take”", exact: true })
      .click();
    await second
      .getByRole("button", { name: "Chọn từ “here”", exact: true })
      .click();
    await expect(panel).toBeHidden();
    await second
      .getByRole("button", { name: "Chọn từ “work”", exact: true })
      .click();
    await expect(
      panel.getByRole("textbox", {
        name: "Từ hoặc cụm từ tiếng Anh",
        exact: true,
      }),
    ).toHaveValue("work here");
    await expect(
      panel.getByRole("region", { name: "Câu nguồn" }),
    ).toContainText("Please work here.");
    await expect(panel.getByText("Câu đang học · 0:05")).toBeVisible();
  });

  test("context AI is explicit, source-bounded and labelled; dialog captures playback keys", async ({
    page,
  }) => {
    const requests: { term: string; context: string; mode: string }[] = [];
    await page.route("**/api/dictionary", (route) => {
      requests.push(route.request().postDataJSON());
      return route.fulfill({
        json: {
          ok: true,
          source: "ai",
          entry: {
            word: "work",
            meaning_vn: "làm việc (kết quả AI giả lập cho kiểm thử)",
          },
        },
      });
    });
    await page.goto(`/watch/${VIDEO_ID}`);
    await pasteTranscript(page, "[00:01] I work here.");
    await page
      .getByTestId("transcript-rail")
      .getByRole("button", { name: "Tra từ “work”", exact: true })
      .click();
    const panel = page.getByRole("dialog", { name: "Tra từ", exact: true });
    expect(requests).toHaveLength(0);
    await panel
      .getByRole("button", { name: "Đóng tra từ", exact: true })
      .focus();
    await page.keyboard.press("d");
    expect(await getSeeks(page)).toHaveLength(0);
    await panel
      .getByRole("button", { name: "Tra bằng AI", exact: true })
      .click();
    await expect(
      panel.getByText("AI · cần kiểm tra theo ngữ cảnh", { exact: true }),
    ).toBeVisible();
    expect(requests).toEqual([
      { term: "work", context: "I work here.", mode: "ai" },
    ]);
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
  });

  test("untimed source has lookup without fabricated replay and long phrases are rejected", async ({
    page,
  }) => {
    await page.goto(`/watch/${VIDEO_ID}`);
    const longWord = "w".repeat(121); // One over the dictionary intake limit; never silently truncate selection.
    await pasteTranscript(page, `I work here. ${longWord} end`);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));
    const rail = page.getByTestId("transcript-rail");
    await rail
      .getByRole("button", { name: "Tra từ “work”", exact: true })
      .click();
    const panel = page.getByRole("dialog", { name: "Tra từ", exact: true });
    await expect(
      panel.getByText("Câu đang học · không có timestamp"),
    ).toBeVisible();
    await expect(
      panel.getByRole("button", { name: "Nghe lại câu nguồn", exact: true }),
    ).toHaveCount(0);
    await panel
      .getByRole("button", { name: "Đóng tra từ", exact: true })
      .click();
    await page.getByRole("button", { name: "Chọn cụm", exact: true }).click();
    await rail
      .getByRole("button", { name: `Chọn từ “${longWord}”`, exact: true })
      .click();
    await rail
      .getByRole("button", { name: "Chọn từ “end”", exact: true })
      .click();
    await expect(
      page
        .getByRole("region", { name: "Phụ đề video", exact: true })
        .getByRole("alert"),
    ).toContainText("Chọn cụm ngắn hơn");
    await expect(panel).toBeHidden();
    expect(await getSeeks(page)).toHaveLength(0);
  });

  test("invalid video id renders the 404 page", async ({ page }) => {
    const response = await page.goto("/watch/xxx");
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "Trang không tồn tại" }),
    ).toBeVisible();
  });
});

// Browser translation is mocked: these checks establish UI/ID/cancellation behavior, not translation quality.
test.describe("free subtitle translation", () => {
  test("opens with automatic captions, translation and vocabulary, without extra buttons", async ({
    page,
  }) => {
    let captionRequests = 0;
    let dictionaryRequests = 0;
    await page.route("**/watch/*", (route) => {
      if (
        route.request().method() !== "POST" ||
        !route.request().headers()["next-action"]
      )
        return route.continue();
      captionRequests++;
      const result = {
        ok: true,
        language: "en",
        origin: "youtube_manual",
        trackKind: "manual",
        saved: false,
        title: "Automatic learning · synthetic test captions",
        sentences: [
          { i: 0, text: "I work here.", start_ms: 0, end_ms: 3000 },
          { i: 1, text: "We go to work.", start_ms: 4000, end_ms: 7000 },
        ],
      };
      return route.fulfill({
        contentType: "text/x-component",
        body:
          '0:{"a":"$1","f":[],"b":"fixture"}\n1:' +
          JSON.stringify(result) +
          "\n",
      });
    });
    await page.route("**/api/dictionary", (route) => {
      dictionaryRequests++;
      return route.abort();
    });
    await page.addInitScript(() => {
      (window as unknown as { Translator: unknown }).Translator = {
        availability: async () => "available",
        create: async () => ({
          destroy: () => {},
          translate: async (text: string) =>
            text === "I work here."
              ? "Tôi làm việc ở đây."
              : "Chúng tôi đi làm.",
        }),
      };
    });
    await page.goto(`/watch/${VIDEO_ID}`);
    const rail = page.getByTestId("transcript-rail");
    await expect(rail.getByTestId("translated-sentence").first()).toHaveText(
      "Tôi làm việc ở đây.",
    );
    await expect(rail.getByTestId("automatic-vocabulary")).toContainText(
      "làm việc / công việc",
    );
    await expect(
      page.getByRole("combobox", { name: "Hiển thị phụ đề" }),
    ).toHaveValue("bilingual");
    await expect(
      page.getByRole("button", { name: "Thử lấy lại phụ đề" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Thử dịch nhanh miễn phí" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Phát video", exact: true }),
    ).toBeVisible();
    expect(captionRequests).toBe(1);
    expect(dictionaryRequests).toBe(0);
    expect(await getSeeks(page)).toHaveLength(0);
    if (page.viewportSize()!.width >= 1024)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollHeight <= innerHeight,
        ),
      ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `/home/thunder/Documents/Codex/2026-10-06/p/outputs/automatic-player-${page.viewportSize()!.width}.png`,
      fullPage: true,
    });
    await rail
      .getByRole("button", { name: "Nghe câu 0:04", exact: true })
      .click();
    await expect(rail.getByTestId("automatic-vocabulary")).toContainText(
      "go to work",
    );
    await page
      .getByRole("combobox", { name: "Hiển thị phụ đề" })
      .selectOption("hidden");
    await expect(rail.getByTestId("automatic-vocabulary")).toHaveCount(0);
  });

  test.beforeEach(async ({ page }) => {
    await stubYouTubePlayer(page);
  });
  // Bilingual is the automatic default; reveal remains an optional practice mode.
  async function showBilingual(page: Page) {
    await page
      .getByRole("combobox", { name: "Hiển thị phụ đề" })
      .selectOption("bilingual");
  }
  async function translator(page: Page, slow = false) {
    await page.addInitScript(
      ({ slow }) => {
        const target = window as unknown as {
          Translator: unknown;
          __translationCalls: string[];
        };
        target.__translationCalls = [];
        target.Translator = {
          availability: async () => "downloadable",
          create: async () => ({
            destroy: () => {},
            translate: async (
              text: string,
              options: { signal: AbortSignal },
            ) => {
              target.__translationCalls.push(text);
              if (slow)
                await new Promise<void>((resolve, reject) => {
                  const timer = setTimeout(resolve, 400);
                  options.signal.addEventListener(
                    "abort",
                    () => {
                      clearTimeout(timer);
                      reject(new DOMException("Cancelled", "AbortError"));
                    },
                    { once: true },
                  );
                });
              return text === "First line." ? "Câu đầu tiên." : "Câu thứ hai.";
            },
          }),
        };
      },
      { slow },
    );
  }
  test("long bilingual captions stay inside their strip without overlapping controls", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      (window as unknown as { Translator: unknown }).Translator = {
        availability: async () => "available",
        create: async () => ({
          destroy: () => {},
          translate: async () =>
            "Đây là câu phụ đề dài dùng để kiểm tra bố cục song ngữ trên màn hình nhỏ và bảo đảm phần chữ không chồng lên thanh điều khiển phát video.",
        }),
      };
    });
    await page.goto(`/watch/${VIDEO_ID}`);
    await pasteTranscript(
      page,
      "1\n00:00:00,000 --> 00:00:08,000\nThis long subtitle is a layout test for bilingual captions on small screens and should remain inside the caption strip without overlapping the video controls.",
    );
    await showBilingual(page);
    await expect(page.getByTestId("translated-sentence")).toBeVisible();
    await page
      .getByRole("button", { name: "Nghe câu 0:00", exact: true })
      .click();
    const strip = page.getByTestId("active-caption");
    await expect(strip.locator("[lang=vi]")).toContainText(
      "Đây là câu phụ đề dài",
    );
    // One DOM snapshot: mobile scroll anchoring can move the page between
    // separate boundingBox calls when asynchronous Vietnamese text arrives.
    const { bounds, content, controls } = await strip.evaluate((el) => {
      const rect = (node: Element) => {
        const box = node.getBoundingClientRect();
        return { y: box.y, height: box.height };
      };
      return {
        bounds: rect(el),
        content: rect(el.querySelector(":scope > div")!),
        controls: rect(
          document.querySelector('[aria-label="Vị trí phát video"]')!,
        ),
      };
    });
    expect(content!.y).toBeGreaterThanOrEqual(bounds!.y);
    expect(content!.y + content!.height).toBeLessThanOrEqual(
      bounds!.y + bounds!.height,
    );
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(controls!.y);
    const frame = await page.getByTestId("video-frame").boundingBox();
    const english = await strip.locator("[lang=en]").boundingBox();
    // Keep the active text near the picture; do not leave a large empty band
    // between the grid's vertically centered video and the caption below it.
    expect(english!.y - frame!.y - frame!.height).toBeLessThanOrEqual(56);
    // Text existing in the DOM is not evidence it can be read: the old two-line
    // clamp hid the last words, particularly on phones. Check every painted line.
    const assertReadable = async () => {
      const layout = await strip.evaluate((el) => {
        const box = el.getBoundingClientRect();
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const rectangles: DOMRect[] = [];
        while (walker.nextNode()) {
          if (!walker.currentNode.textContent?.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(walker.currentNode);
          rectangles.push(...Array.from(range.getClientRects()));
        }
        return {
          inside: rectangles.every(
            (r) =>
              r.top >= box.top &&
              r.bottom <= box.bottom &&
              r.left >= box.left &&
              r.right <= box.right,
          ),
          horizontalOverflow:
            document.documentElement.scrollWidth > window.innerWidth,
          captionScroll: el.scrollHeight > el.clientHeight,
        };
      });
      expect(layout).toEqual({
        inside: true,
        horizontalOverflow: false,
        captionScroll: false,
      });
      const caption = await strip.boundingBox();
      const slider = await page
        .getByRole("slider", { name: "Vị trí phát video" })
        .boundingBox();
      expect(caption!.y + caption!.height).toBeLessThanOrEqual(slider!.y);
      if (page.viewportSize()!.width >= 1024) {
        expect(
          await page.evaluate(
            () => document.documentElement.scrollHeight <= innerHeight,
          ),
        ).toBe(true);
      }
    };
    await assertReadable();
    const typography = await strip.evaluate((el) => {
      const en = getComputedStyle(el.querySelector("[lang=en]")!);
      const vi = getComputedStyle(el.querySelector("[lang=vi]")!);
      return {
        english: parseFloat(en.fontSize),
        vietnamese: parseFloat(vi.fontSize),
        lineSpacing: parseFloat(en.lineHeight) / parseFloat(en.fontSize),
        wordPadding: Array.from(
          el.querySelectorAll('[data-testid="sentence-text"] button'),
        ).some((word) => {
          const css = getComputedStyle(word);
          return parseFloat(css.paddingLeft) + parseFloat(css.paddingRight) > 0;
        }),
      };
    });
    expect(typography.english).toBeGreaterThanOrEqual(16);
    expect(typography.vietnamese).toBeGreaterThanOrEqual(15);
    expect(typography.lineSpacing).toBeGreaterThanOrEqual(1.5);
    expect(typography.wordPadding).toBe(false);
    // WCAG 1.4.12 specifies tolerance for user spacing overrides, not defaults.
    await page.addStyleTag({
      content: `[data-testid="active-caption"] * {
        line-height: 1.5 !important;
        letter-spacing: .12em !important;
        word-spacing: .16em !important;
      }`,
    });
    await assertReadable();
  });

  test("read mode presents full paired paragraphs without nested scrolling", async ({
    page,
  }) => {
    await translator(page);
    await page.goto(`/watch/${VIDEO_ID}`);
    await pasteTranscript(page, SRT);
    await showBilingual(page);
    await expect(page.getByTestId("translated-sentence").first()).toHaveText(
      "Câu đầu tiên.",
    );
    await page.getByRole("button", { name: "Chế độ đọc", exact: true }).click();
    const rail = page.getByTestId("transcript-rail");
    const layout = await rail.evaluate((el) => {
      const en = el.querySelector("[lang=en]")!;
      const vi = el.querySelector("[lang=vi]")!;
      const css = getComputedStyle(en);
      const viCss = getComputedStyle(vi);
      const gap =
        vi.getBoundingClientRect().top - en.getBoundingClientRect().bottom;
      return {
        align: css.textAlign,
        enSize: parseFloat(css.fontSize),
        viSize: parseFloat(viCss.fontSize),
        gap,
        nestedScroll: ["auto", "scroll"].includes(
          getComputedStyle(el).overflowY,
        ),
      };
    });
    expect(layout.align).toBe("left");
    expect(layout.enSize).toBeGreaterThanOrEqual(16);
    expect(layout.viSize).toBeGreaterThanOrEqual(15);
    expect(layout.gap).toBeGreaterThanOrEqual(8);
    expect(layout.nestedScroll).toBe(false);
    await rail
      .getByRole("button", { name: "Nghe câu 0:03", exact: true })
      .last()
      .click();
    await expect
      .poll(async () => (await getSeeks(page)).map((seek) => seek.seconds))
      .toEqual([3.5]);
  });

  test("starts from ordinary interaction, shows bilingual lines, caches and retains timing", async ({
    page,
  }) => {
    await translator(page);
    let calls = 0;
    await page.route("**/api/translate", (route) => {
      calls++;
      return route.abort();
    });
    await page.goto(`/watch/${VIDEO_ID}`);
    await pasteTranscript(page, SRT);
    await showBilingual(page);
    await expect(
      page.getByRole("button", {
        name: "Thử dịch nhanh miễn phí",
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(page.getByTestId("translated-sentence").first()).toHaveText(
      "Câu đầu tiên.",
    );
    await expect(page.getByTestId("translated-sentence").last()).toHaveText(
      "Câu thứ hai.",
    );
    await page
      .getByRole("button", { name: "Nghe câu 0:03", exact: true })
      .click();
    expect((await getSeeks(page)).at(-1)?.seconds).toBe(3.5);
    await page
      .getByRole("combobox", { name: "Hiển thị phụ đề" })
      .selectOption("vi");
    await expect(
      page
        .getByTestId("transcript-rail")
        .getByRole("button", { name: "Tra từ “First”", exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("combobox", { name: "Hiển thị phụ đề" })
      .selectOption("en");
    await expect(page.getByTestId("translated-sentence")).toHaveCount(0);
    await page
      .getByRole("combobox", { name: "Hiển thị phụ đề" })
      .selectOption("hidden");
    await expect(page.getByTestId("sentence-text")).toHaveCount(0);
    await page.reload();
    await pasteTranscript(page, SRT);
    await showBilingual(page);
    await expect(page.getByTestId("translated-sentence").first()).toHaveText(
      "Câu đầu tiên.",
    );
    expect(
      await page.evaluate(
        () =>
          (window as unknown as { __translationCalls: string[] })
            .__translationCalls,
      ),
    ).toEqual([]);
    expect(calls).toBe(0);
  });
  test("cancels when English-only is selected and resumes without stale output", async ({
    page,
  }) => {
    await translator(page, true);
    await page.goto(`/watch/${VIDEO_ID}`);
    await pasteTranscript(page, SRT);
    await page
      .getByRole("combobox", { name: "Hiển thị phụ đề" })
      .selectOption("en");
    await expect(page.getByTestId("translated-sentence")).toHaveCount(0);
    await page
      .getByRole("combobox", { name: "Hiển thị phụ đề" })
      .selectOption("bilingual");
    await expect(page.getByTestId("translated-sentence").last()).toHaveText(
      "Câu thứ hai.",
    );
  });
  test("partial device failure keeps completed and original lines without cloud fallback", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      (window as unknown as { Translator: unknown }).Translator = {
        availability: async () => "available",
        create: async () => ({
          destroy: () => {},
          translate: async (text: string) => {
            if (text === "Second line.")
              throw new Error("test-only device failure");
            return "Câu đầu tiên.";
          },
        }),
      };
    });
    let calls = 0;
    await page.route("**/api/translate", (route) => {
      calls++;
      return route.abort();
    });
    await page.goto(`/watch/${VIDEO_ID}`);
    await pasteTranscript(page, SRT);
    await showBilingual(page);
    await expect(
      page.getByRole("region", { name: "Phụ đề video" }).getByRole("alert"),
    ).toContainText("Chưa dịch được phụ đề.");
    await expect(page.getByTestId("translated-sentence").first()).toHaveText(
      "Câu đầu tiên.",
    );
    await expect(page.getByTestId("translated-sentence").last()).toHaveText(
      "Chưa có bản dịch cho câu này.",
    );
    await expect(
      page
        .getByTestId("transcript-rail")
        .getByRole("button", { name: "Tra từ “Second”", exact: true }),
    ).toBeVisible();
    expect(calls).toBe(0);
  });
  test("optional reveal mode blurs Vietnamese until a line is revealed", async ({
    page,
  }) => {
    await translator(page);
    await page.goto(`/watch/${VIDEO_ID}`);
    await pasteTranscript(page, SRT);
    await expect(
      page.getByRole("combobox", { name: "Hiển thị phụ đề" }),
    ).toHaveValue("bilingual");
    await page
      .getByRole("combobox", { name: "Hiển thị phụ đề" })
      .selectOption("reveal");
    const rail = page.getByTestId("transcript-rail");
    // Translated but hidden: English stays readable, Vietnamese is not exposed.
    await expect(rail.getByTestId("reveal-translation").first()).toBeVisible();
    await expect(rail.getByTestId("translated-sentence")).toHaveCount(0);
    await rail.getByTestId("reveal-translation").first().click();
    await expect(rail.getByTestId("translated-sentence").first()).toHaveText(
      "Câu đầu tiên.",
    );
    // Only the chosen line is revealed.
    await expect(rail.getByTestId("reveal-translation")).toHaveCount(1);
    await expect(rail.getByText("First line.")).toBeVisible();
  });

  test("unsupported browser keeps source usable without cloud requests", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "Translator", {
        value: undefined,
        configurable: true,
      });
    });
    let calls = 0;
    await page.route("**/api/translate", (route) => {
      calls++;
      return route.abort();
    });
    await page.goto(`/watch/${VIDEO_ID}`);
    await pasteTranscript(page, SRT);
    await expect(
      page.getByText(
        "Trình duyệt này chưa hỗ trợ dịch miễn phí trên thiết bị.",
        { exact: false },
      ),
    ).toBeVisible();
    await expect(
      page
        .getByTestId("transcript-rail")
        .getByRole("button", { name: "Tra từ “First”", exact: true }),
    ).toBeVisible();
    expect(calls).toBe(0);
  });
});

test.describe("transcript navigation", () => {
  test.beforeEach(async ({ page }) => {
    await stubYouTubePlayer(page);
    await page.addInitScript(() => {
      // Deliberately synthetic model output: tests prove UI/navigation, not quality.
      Object.defineProperty(window, "Translator", {
        configurable: true,
        value: {
          availability: async () => "available",
          create: async () => ({
            destroy() {},
            translate: async (text: string) =>
              text.includes("work")
                ? "Họ làm việc từ đầu."
                : "Phụ đề giả lập dùng kiểm thử.",
          }),
        },
      });
    });
  });
  async function openTranscript(page: Page) {
    await page.goto(`/watch/${VIDEO_ID}`);
    const lines = Array.from(
      { length: 80 },
      (_, index) =>
        "[" +
        Math.floor(index / 60) +
        ":" +
        String(index % 60).padStart(2, "0") +
        "] " +
        (index === 0
          ? "Synthetic test captions."
          : index === 5
            ? "I work here."
            : index === 35
              ? "They work from scratch."
              : "Fixture sentence " + index + "."),
    );
    await pasteTranscript(page, lines.join("\n"));
    const rail = page.getByTestId("transcript-rail");
    await expect(rail.locator("[data-sentence]")).toHaveCount(80);
    await expect(
      rail.locator('[data-sentence="5"]').getByTestId("translated-sentence"),
    ).toHaveText("Họ làm việc từ đầu.");
    return rail;
  }

  test("transcript search finds visible bilingual text without seeking or removing context", async ({
    page,
  }) => {
    const rail = await openTranscript(page);
    await page
      .getByRole("button", { name: "Tìm trong phụ đề", exact: true })
      .click();
    const input = page.getByRole("searchbox", { name: "Tìm câu trong phụ đề" });
    await input.fill("WORK");
    await expect(
      page.getByRole("status").filter({ hasText: "1 / 2 câu phù hợp" }),
    ).toBeVisible();
    await input.press("Enter");
    const first = rail.locator('[data-sentence="5"]');
    await expect(first).toHaveAttribute("data-search-current", "true");
    await expect(first).toBeInViewport();
    expect(await getSeeks(page)).toEqual([]);
    expect(
      await input.evaluate((element) => element === document.activeElement),
    ).toBe(true);

    const artifactDir = process.env.ATOENGLISH_RESEARCH_OUTPUT_DIR;
    if (artifactDir) {
      // Preserve an explicitly labelled fixture in the screenshot, not real video content.
      await input.scrollIntoViewIfNeeded();
      await page.screenshot({
        path:
          artifactDir +
          "/player-navigation-" +
          page.viewportSize()!.width +
          ".png",
      });
    }
    await page.evaluate(() => {
      (window as unknown as { __t: number }).__t = 65;
    });
    await expect(rail.locator('[data-sentence="65"]')).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(first).toHaveAttribute("data-search-current", "true");
    await expect(first).toBeInViewport();
    await page.getByRole("button", { name: "Câu phù hợp tiếp" }).click();
    await expect(rail.locator('[data-sentence="35"]')).toHaveAttribute(
      "data-search-current",
      "true",
    );
    await expect(rail.locator('[data-sentence="35"]')).toBeInViewport();
    expect(await getSeeks(page)).toEqual([]);
    await expect(rail.locator("[data-sentence]")).toHaveCount(80);
    expect(
      await input.evaluate((element) => element === document.activeElement),
    ).toBe(true);

    await input.fill("lam viec tu dau");
    await expect(first).toHaveAttribute("data-search-match", "true");
    await page
      .getByLabel("Hiển thị phụ đề", { exact: true })
      .selectOption("reveal");
    await expect(rail.locator('[data-search-match="true"]')).toHaveCount(0);
    await first
      .getByRole("button", { name: "Hiện nghĩa tiếng Việt của câu này" })
      .click();
    await expect(first).toHaveAttribute("data-search-match", "true");
    await input.fill("from scratch");
    await input.press("Enter");
    await rail
      .getByRole("button", { name: "Nghe câu 0:35", exact: true })
      .click();
    expect(await getSeeks(page)).toContainEqual({
      seconds: 35,
      allowSeekAhead: true,
    });
    await expect(page.getByTestId("video-frame").locator("iframe")).toHaveCount(
      1,
    );
  });

  test("transcript search preserves manual reading and explicitly returns to the playing cue", async ({
    page,
  }) => {
    const rail = await openTranscript(page);
    await page
      .getByRole("button", { name: "Tìm trong phụ đề", exact: true })
      .click();
    const input = page.getByRole("searchbox", { name: "Tìm câu trong phụ đề" });
    await input.fill("from scratch");
    await input.press("Enter");
    await expect(rail.locator('[data-sentence="35"]')).toBeInViewport();
    await page.evaluate(() => {
      (window as unknown as { __t: number }).__t = 65;
    });
    await expect(rail.locator('[data-sentence="65"]')).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(rail.locator('[data-sentence="35"]')).toBeInViewport();
    await input.press("Escape");
    await expect(input).toHaveCount(0);
    const searchButton = page.getByRole("button", {
      name: "Tìm trong phụ đề",
      exact: true,
    });
    await expect(searchButton).toBeFocused();
    await page
      .getByRole("button", { name: "Theo câu đang phát", exact: true })
      .click();
    await expect(rail.locator('[data-sentence="65"]')).toBeInViewport();
    expect(await getSeeks(page)).toEqual([]);
    await page.getByRole("button", { name: "Chế độ đọc", exact: true }).click();
    await page
      .getByRole("button", { name: "Tìm trong phụ đề", exact: true })
      .click();
    await input.fill("I work here");
    await input.press("Enter");
    await expect(rail.locator('[data-sentence="5"]')).toBeInViewport();
    expect(
      await rail.evaluate(
        (element) => element.scrollHeight <= element.clientHeight,
      ),
    ).toBe(true);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    expect(overflow).toBe(false);
  });
  test("ATO-WATCH-01 limits 3000 watch rows, finds the last cue, and keeps Read mode complete", async ({
    page,
  }) => {
    await page.goto(`/watch/${VIDEO_ID}`);
    const source = Array.from(
      { length: 3000 },
      (_, i) =>
        `[${Math.floor(i / 60)}:${String(i % 60).padStart(2, "0")}] Fixture sentence ${i}.`,
    ).join("\n");
    await uploadTranscript(page, source);
    const rail = page.getByTestId("transcript-rail");
    await expect(page.getByTestId("virtual-transcript")).toBeVisible();
    await expect
      .poll(() => rail.locator("[data-sentence]").count())
      .toBeLessThan(80);
    await page
      .getByRole("button", { name: "Tìm trong phụ đề", exact: true })
      .click();
    const input = page.getByRole("searchbox", { name: "Tìm câu trong phụ đề" });
    await input.fill("Fixture sentence 2999");
    await input.press("Enter");
    await expect(rail.locator('[data-sentence="2999"]')).toBeInViewport();
    await expect(input).toBeFocused();
    expect(await getSeeks(page)).toEqual([]);
    await expect
      .poll(() => rail.locator("[data-sentence]").count())
      .toBeLessThan(80);
    await input.press("Escape");
    await page.getByRole("button", { name: "Chế độ đọc", exact: true }).click();
    await expect(rail.locator("[data-sentence]")).toHaveCount(3000);
    await expect(page.getByTestId("virtual-transcript")).toHaveCount(0);
    // Full source text remains in the document for selection and browser Ctrl+F.
    await expect(rail).toContainText("Fixture sentence 2999.");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  });

  test("ATO-WATCH-01 pins dictionary return focus while a virtual cue is scrolled away", async ({
    page,
  }) => {
    await page.goto(`/watch/${VIDEO_ID}`);
    await uploadTranscript(
      page,
      Array.from(
        { length: 3000 },
        (_, i) =>
          `[${Math.floor(i / 60)}:${String(i % 60).padStart(2, "0")}] I work here fixture ${i}.`,
      ).join("\n"),
    );
    const rail = page.getByTestId("transcript-rail");
    await page
      .getByRole("button", { name: "Tìm trong phụ đề", exact: true })
      .click();
    const input = page.getByRole("searchbox", { name: "Tìm câu trong phụ đề" });
    await input.fill("fixture 1500");
    await input.press("Enter");
    const trigger = rail
      .locator('[data-sentence="1500"]')
      .getByRole("button", { name: "Tra từ “work”", exact: true });
    await trigger.click();
    const panel = page.getByRole("dialog", { name: "Tra từ", exact: true });
    await expect(panel).toBeVisible();
    // Simulate a resize/scroll underneath the modal; the original button must survive.
    await rail.evaluate((element) => {
      element.scrollTop = 0;
      window.scrollTo(0, 0);
    });
    await expect(trigger).toHaveCount(1);
    await panel
      .getByRole("button", { name: "Đóng tra từ", exact: true })
      .click();
    await expect(trigger).toBeFocused();
    await expect
      .poll(() => rail.locator("[data-sentence]").count())
      .toBeLessThan(80);
    expect(await getSeeks(page)).toEqual([]);
  });

  test("ATO-WATCH-01 keeps a manual reading anchor when a preceding translation arrives late", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const testWindow = window as unknown as {
        __finishTranslation: () => void;
        __duration: number;
      };
      testWindow.__duration = 1000;
      Object.defineProperty(window, "Translator", {
        configurable: true,
        value: {
          availability: async () => "available",
          create: async () => ({
            destroy() {},
            translate: (text: string) =>
              text.includes("Fixture sentence 198.")
                ? new Promise<string>((resolve) => {
                    testWindow.__finishTranslation = () =>
                      resolve(
                        "Bản dịch fixture dài để kiểm tra thay đổi chiều cao. ".repeat(
                          12,
                        ),
                      );
                  })
                : Promise.resolve("Bản dịch fixture."),
          }),
        },
      });
    });
    await page.goto(`/watch/${VIDEO_ID}`);
    await uploadTranscript(
      page,
      Array.from(
        { length: 250 },
        (_, i) =>
          `[${Math.floor(i / 60)}:${String(i % 60).padStart(2, "0")}] Fixture sentence ${i}.`,
      ).join("\n"),
    );
    const rail = page.getByTestId("transcript-rail");
    await page
      .getByRole("button", { name: "Tìm trong phụ đề", exact: true })
      .click();
    const input = page.getByRole("searchbox", { name: "Tìm câu trong phụ đề" });
    await input.fill("Fixture sentence 198.");
    await input.press("Enter");
    await rail
      .locator('[data-sentence="198"]')
      .getByRole("button", { name: "Nghe câu 3:18", exact: true })
      .click();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            typeof (window as unknown as { __finishTranslation: unknown })
              .__finishTranslation,
        ),
      )
      .toBe("function");
    await input.fill("Fixture sentence 200.");
    await input.press("Enter");
    const anchor = rail.locator('[data-sentence="200"]');
    await expect(anchor).toBeInViewport();
    const top = await anchor.evaluate(
      (element) => element.getBoundingClientRect().top,
    );
    await page.evaluate(() =>
      (
        window as unknown as { __finishTranslation: () => void }
      ).__finishTranslation(),
    );
    await expect(
      rail.locator('[data-sentence="198"]').getByTestId("translated-sentence"),
    ).toContainText("Bản dịch fixture dài");
    await expect
      .poll(async () =>
        Math.abs(
          (await anchor.evaluate(
            (element) => element.getBoundingClientRect().top,
          )) - top,
        ),
      )
      .toBeLessThan(4);
    await expect(input).toBeFocused();
    await expect(
      page.getByRole("button", { name: "Theo câu đang phát", exact: true }),
    ).toHaveAttribute("aria-pressed", "false");
    await expect(
      page.getByTestId("active-caption").getByTestId("sentence-text"),
    ).toHaveText("Fixture sentence 198.");
    expect(await getSeeks(page)).toHaveLength(1);
  });

  test("ATO-WATCH-01 keeps one cursor across Focus/transcript, counts three turns, and cancels replay on pause", async ({
    page,
  }) => {
    await page.goto(`/watch/${VIDEO_ID}`);
    await pasteTranscript(
      page,
      "1\n00:00:00,000 --> 00:00:01,000\nFirst fixture.\n\n2\n00:00:01,000 --> 00:00:02,000\nNext fixture.",
    );
    await page.getByLabel("Lặp câu", { exact: true }).selectOption("three");
    for (let turn = 1; turn <= 3; turn++) {
      await page.evaluate(() => {
        (window as unknown as { __t: number }).__t = 0.9;
      });
      await expect(
        page.getByText("0:00 / 3:32", { exact: true }),
      ).toBeVisible();
      await page.waitForTimeout(210); // Allow one adapter clock sample before the overshoot.
      await page.evaluate(() => {
        (window as unknown as { __t: number }).__t = 1.1;
      });
      await expect(page.getByTestId("repeat-count")).toHaveText(`${turn} / 3`);
      await expect(
        page.getByTestId("active-caption").getByTestId("sentence-text"),
      ).toHaveText("First fixture.");
      await expect(
        page.getByTestId("transcript-rail").locator('[aria-current="true"]'),
      ).toHaveAttribute("data-sentence", "0");
      if (turn < 3)
        await expect
          .poll(async () => (await getSeeks(page)).length)
          .toBe(turn + 1);
    }
    await expect(
      page.getByRole("button", { name: "Phát video", exact: true }),
    ).toBeVisible();
    await page.waitForTimeout(450);
    expect(await getSeeks(page)).toHaveLength(3);
    // Retarget resets the count; stopping a gap cannot restart playback.
    await page
      .getByLabel("Lặp câu", { exact: true })
      .selectOption("continuous");
    await page.evaluate(() => {
      (window as unknown as { __t: number }).__t = 0.9;
    });
    await page.waitForTimeout(210);
    await page.evaluate(() => {
      (window as unknown as { __t: number }).__t = 1.1;
    });
    await expect(page.getByTestId("repeat-count")).toHaveText("1 lượt");
    await page.getByRole("button", { name: "Dừng video", exact: true }).click();
    const count = (await getSeeks(page)).length;
    await page.waitForTimeout(450);
    expect(await getSeeks(page)).toHaveLength(count);
  });

  test("ATO-WATCH-01 uses confirmed speed options, preserves slider state, and restores deep links", async ({
    page,
  }) => {
    await page.goto(`/watch/${VIDEO_ID}?t=3500`);
    await pasteTranscript(page, SRT);
    await expect.poll(async () => (await getSeeks(page))[0]?.seconds).toBe(3.5);
    const speed = page.getByRole("combobox", { name: /^Tốc độ phát/ });
    await speed.selectOption("0.75");
    await expect(speed).toHaveAttribute("aria-label", "Tốc độ phát 0.75×");
    const slider = page.getByRole("slider", { name: "Vị trí phát video" });
    await slider.fill("1000");
    await expect(
      page.getByRole("button", { name: "Phát video", exact: true }),
    ).toBeVisible();
    await expect(page).toHaveURL(/t=1000/);
    await slider.focus();
    const count = (await getSeeks(page)).length;
    await page.keyboard.press("ArrowRight"); // Native range step, never the global +5s handler.
    expect((await getSeeks(page)).length).toBeLessThanOrEqual(count + 1);
    await page.reload();
    await expect
      .poll(async () => (await getSeeks(page))[0]?.seconds)
      .toBeGreaterThanOrEqual(1);
  });
});
