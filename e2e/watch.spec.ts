import { test, expect, type Page } from "@playwright/test";

/**
 * /watch/[videoId] — deterministic guest coverage.
 *
 * `use-youtube-player.ts` resolves early when `window.YT?.Player` already
 * exists, so predefining it via `addInitScript` (before `goto`) means the
 * real https://www.youtube.com/iframe_api is never requested and no YouTube
 * iframe is ever created. A `page.route` fulfil serves the same stub source
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
  window.__duration = 212; // rickroll length in seconds
  var PlayerState = {
    UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5,
  };
  function FakePlayer(el, cfg) {
    this.el = el;
    this._cfg = cfg || {};
    this._rate = 1;
    this._state = PlayerState.UNSTARTED;
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
  FakePlayer.prototype.setPlaybackRate = function (rate) { this._rate = rate; };
  FakePlayer.prototype.getPlaybackRate = function () { return this._rate; };
  FakePlayer.prototype.destroy = function () {};
  window.YT = { Player: FakePlayer, PlayerState: PlayerState };
  if (typeof window.onYouTubeIframeAPIReady === "function") {
    window.onYouTubeIframeAPIReady();
  }
})();`;

async function stubYouTubePlayer(page: Page): Promise<void> {
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
  await page.locator("textarea").fill(raw);
  await page.getByRole("button", { name: "Dùng phụ đề này" }).click();
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
      page.getByRole("button", { name: "Lấy phụ đề từ YouTube" }),
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
    await page.goto(`/watch/${VIDEO_ID}`);
    await page
      .getByRole("button", { name: "Lấy phụ đề từ YouTube" })
      .click();
    // The dev server makes a real upstream call here — either outcome is a
    // valid, non-destructive result. The regex covers every error mapped in
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

    await rail.locator('[data-sentence="1"]').click();
    await expect
      .poll(() => getSeeks(page))
      .toEqual([{ seconds: 3.5, allowSeekAhead: true }]);
    // Clicked line becomes active (clock now sits inside its cue).
    await expect(rail.locator('[data-sentence="1"]')).toHaveClass(
      /bg-\[#f5b50a\]\/10/,
    );
    // Caption strip under the player mirrors the active sentence.
    await expect(page.locator("div.text-center")).toHaveText("Second line.");
  });

  test("keyboard shortcuts navigate between sentences", async ({ page }) => {
    await page.goto(`/watch/${VIDEO_ID}`);
    await pasteTranscript(page, SRT);
    const rail = page.getByTestId("transcript-rail");
    await expect(rail.locator("[data-sentence]")).toHaveCount(2);

    await rail.locator('[data-sentence="0"]').click();
    await expect.poll(async () => (await getSeeks(page)).length).toBe(1);

    // "d" = next sentence, "a" = previous (watch-client.tsx keydown map).
    await page.keyboard.press("d");
    await expect
      .poll(async () => (await getSeeks(page)).map((s) => s.seconds))
      .toEqual([1, 3.5]);
    await expect(rail.locator('[data-sentence="1"]')).toHaveClass(
      /bg-\[#f5b50a\]\/10/,
    );

    await page.keyboard.press("a");
    await expect
      .poll(async () => (await getSeeks(page)).map((s) => s.seconds))
      .toEqual([1, 3.5, 1]);
    await expect(rail.locator('[data-sentence="0"]')).toHaveClass(
      /bg-\[#f5b50a\]\/10/,
    );

    // "?" toggles the shortcut help panel.
    await page.keyboard.press("?");
    await expect(page.getByText("Phím tắt:")).toBeVisible();
  });

  test("invalid video id renders the 404 page", async ({ page }) => {
    const response = await page.goto("/watch/xxx");
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "Trang không tồn tại" }),
    ).toBeVisible();
  });
});
