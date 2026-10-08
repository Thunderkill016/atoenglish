import { test as base, chromium, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";

// Actual MV3 extension in a fresh Chromium profile. Every YouTube response is
// synthetic and routed: this tests wiring, never upstream availability.
// Persistent-context setup follows https://playwright.dev/docs/chrome-extensions.
const extensionPath = fileURLToPath(new URL("../extension", import.meta.url));
const VIDEO = "dQw4w9WgXcQ";
const EN = "I work here.";
const VI = "Tôi làm việc ở đây.";
const test = base.extend({
  context: async ({ baseURL }, runFixture) => {
    const context = await chromium.launchPersistentContext("", {
      channel: "chromium",
      headless: true,
      baseURL,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });
    try {
      await runFixture(context);
    } finally {
      await context.close();
    }
  },
});

const parentPlayer = `(() => {
  window.__t = 0;
  function Player(el, cfg) {
    this.el = document.createElement("iframe");
    this.el.src = "https://www.youtube.com/embed/${VIDEO}";
    this.el.title = "Synthetic YouTube iframe for caption companion test";
    this.el.onload = () => cfg.events.onReady({ target: this });
    el.replaceWith(this.el);
  }
  Player.prototype.playVideo = function () {};
  Player.prototype.pauseVideo = function () {};
  Player.prototype.seekTo = function (seconds) { window.__t = seconds; };
  Player.prototype.getCurrentTime = function () { return window.__t; };
  Player.prototype.getDuration = function () { return 60; };
  Player.prototype.getPlayerState = function () { return -1; };
  Player.prototype.setPlaybackRate = function () {};
  Player.prototype.getPlaybackRate = function () { return 1; };
  Player.prototype.destroy = function () { this.el.remove(); };
  window.YT = { Player, PlayerState: { PLAYING: 1, PAUSED: 2, ENDED: 0, CUED: 5 } };
})();`;

const nativePlayer = `<!doctype html><html><body><div id="movie_player">Synthetic caption source</div><script>
  const tracks = ["en", "vi"].map(languageCode => ({
    languageCode, vssId: "." + languageCode,
    baseUrl: "https://www.youtube.com/api/timedtext?v=${VIDEO}&lang=" + languageCode + "&fmt=json3",
  }));
  const player = document.getElementById("movie_player"); let selected = {};
  player.getPlayerResponse = () => ({
    videoDetails: { videoId: "${VIDEO}", title: "Synthetic native captions", author: "Test fixture", lengthSeconds: "60" },
    captions: { playerCaptionsTracklistRenderer: { captionTracks: tracks } },
  });
  player.loadModule = () => {};
  player.getOption = (_module, option) => option === "track" ? selected : tracks;
  player.setOption = (_module, _option, track) => {
    selected = track;
    if (!track.baseUrl) return;
    const xhr = new XMLHttpRequest(); xhr.open("GET", track.baseUrl); xhr.send();
  };
</script></body></html>`;

async function routeFixture(
  context: import("@playwright/test").BrowserContext,
  status = 200,
  importStatus = status,
) {
  const captionRequests: string[] = [];
  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === "https://www.youtube.com") {
      if (url.pathname.startsWith("/embed/") || url.pathname === "/watch") {
        return route.fulfill({ contentType: "text/html", body: nativePlayer });
      }
      if (url.pathname === "/api/timedtext") {
        captionRequests.push(url.searchParams.get("lang")!);
        return route.fulfill({
          status: request.frame().url().includes("/watch")
            ? importStatus
            : status,
          contentType: "application/json",
          body: JSON.stringify({
            events: [
              {
                tStartMs: 0,
                dDurationMs: 3000,
                segs: [
                  { utf8: url.searchParams.get("lang") === "vi" ? VI : EN },
                ],
              },
            ],
          }),
        });
      }
      return route.abort();
    }
    if (!/^https?:\/\/localhost:(?:3000|3100)$/.test(url.origin))
      return route.abort();
    // No server action/telemetry write, even with an accidental live runtime.
    if (request.method() === "POST" && request.headers()["next-action"]) {
      return route.fulfill({
        contentType: "text/x-component",
        body: '0:{"a":"$1","f":[],"b":"fixture"}\n1:{"ok":false,"error":"no_captions"}\n',
      });
    }
    return route.continue();
  });
  await context.addInitScript({ content: parentPlayer });
  return captionRequests;
}

test("installed companion imports native bilingual captions automatically with no extra request", async ({
  context,
  page,
}) => {
  const requests = await routeFixture(context);
  await page.goto(`/watch/${VIDEO}`);
  await expect(page.locator("html")).toHaveAttribute(
    "data-atoenglish-ext",
    "0.2.0",
  );
  await expect(page.getByTestId("transcript-rail")).toContainText(EN);
  await expect(page.getByTestId("transcript-rail")).toContainText(VI);
  expect(requests).toEqual(["en", "vi"]);
  await expect(page.locator('p[role="alert"]')).toHaveCount(0);
  // Navigation tears down the iframe/hooks without injecting into other pages.
  await page.goto("/discover");
  await expect(page.getByTestId("transcript-rail")).toHaveCount(0);
  expect(requests).toEqual(["en", "vi"]);
});

test("native refusal keeps the fallback available and does not repeat timedtext", async ({
  context,
  page,
}) => {
  const requests = await routeFixture(context, 429);
  await page.goto(`/watch/${VIDEO}`);
  await expect(page.locator("html")).toHaveAttribute(
    "data-atoenglish-ext",
    "0.2.0",
  );
  await expect(
    page.getByRole("button", { name: "Dán hoặc tải phụ đề" }),
  ).toBeVisible();
  await expect.poll(() => requests).toEqual(["en"]);
  // Wait for completion rather than sleeping: collector restores its hook.
  await expect
    .poll(() =>
      page.frames().some((frame) => frame.url().includes("youtube.com/embed/")),
    )
    .toBe(true);
  const iframe = page
    .frames()
    .find((frame) => frame.url().includes("youtube.com/embed/"))!;
  await expect
    .poll(() => iframe.evaluate(() => XMLHttpRequest.prototype.open.name))
    .toBe("open");
  await expect(page.getByTestId("transcript-rail")).toHaveCount(0);
  expect(requests).toEqual(["en"]);
});

test("explicit import tab delivers through storage and closes after handoff", async ({
  context,
  page,
}) => {
  const requests = await routeFixture(context, 429, 200);
  await page.goto(`/watch/${VIDEO}`);
  await expect(
    page.getByRole("button", { name: "Lấy qua extension" }),
  ).toBeVisible();
  // The import button can render before the asynchronously loaded iframe.
  await expect
    .poll(() =>
      page.frames().some((frame) => frame.url().includes("youtube.com/embed/")),
    )
    .toBe(true);
  const frame = page
    .frames()
    .find((frame) => frame.url().includes("youtube.com/embed/"))!;
  await expect
    .poll(() => frame.evaluate(() => XMLHttpRequest.prototype.open.name))
    .toBe("open");
  const popupPromise = context.waitForEvent("page");
  await page.getByRole("button", { name: "Lấy qua extension" }).click();
  const popup = await popupPromise;
  await expect(page.getByTestId("transcript-rail")).toContainText(EN);
  await expect(page.getByTestId("transcript-rail")).toContainText(VI);
  await expect.poll(() => popup.isClosed()).toBe(true);
  expect(requests).toEqual(["en", "en", "vi"]);
});
