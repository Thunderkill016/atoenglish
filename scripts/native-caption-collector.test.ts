import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const source = readFileSync(
  resolve("extension/content-youtube-main.js"),
  "utf8",
);
const manifest = JSON.parse(
  readFileSync(resolve("extension/manifest.json"), "utf8"),
);
const VIDEO = "oyRxhiAC9u8";
const APP = "http://localhost:3100";
const EN = [
  { tStartMs: 0, dDurationMs: 1000, segs: [{ utf8: "Hello there." }] },
];
const VI = [{ tStartMs: 0, dDurationMs: 1000, segs: [{ utf8: "Xin chào." }] }];
const timedtext = (lang = "en", extra = "") =>
  `https://www.youtube.com/api/timedtext?v=${VIDEO}&lang=${lang}&fmt=json3${extra}`;

function harness({
  referrer = APP,
  tracks = [
    {
      languageCode: "en",
      baseUrl: timedtext("en").replace("json3", "srv3"),
      vssId: ".en",
    },
  ],
  fetchBody = EN,
  fetchStatus = 200,
} = {}) {
  const listeners = new Map<string, Set<(event: any) => void>>();
  const parent = { postMessage: vi.fn() };
  const nativeTrack = { languageCode: "fr" };
  let selected: unknown = nativeTrack;
  const player = {
    getPlayerResponse: vi.fn(() => ({
      videoDetails: {
        videoId: VIDEO,
        title: "Caption test fixture",
        lengthSeconds: "60",
      },
      captions: { playerCaptionsTracklistRenderer: { captionTracks: tracks } },
    })),
    loadModule: vi.fn(),
    getOption: vi.fn((_module: string, option: string) =>
      option === "track" ? selected : tracks,
    ),
    setOption: vi.fn((_module: string, _option: string, value: unknown) => {
      selected = value;
    }),
  };
  class Xhr {
    listeners: Array<() => void> = [];
    responseType = "text";
    responseText = "";
    responseURL = "";
    status = 200;
    addEventListener(_name: string, listener: () => void) {
      this.listeners.push(listener);
    }
    open(_method: string, url: string) {
      this.responseURL = url;
    }
    load(body: unknown, status = 200) {
      this.status = status;
      this.responseText =
        typeof body === "string" ? body : JSON.stringify(body);
      this.listeners.forEach((listener) => listener());
    }
  }
  const open = Xhr.prototype.open;
  const fetch = vi.fn(
    async (_input: unknown, _init?: RequestInit) =>
      new Response(JSON.stringify({ events: fetchBody }), {
        status: fetchStatus,
      }),
  );
  const location = {
    href: `https://www.youtube.com/embed/${VIDEO}`,
    origin: "https://www.youtube.com",
    pathname: `/embed/${VIDEO}`,
    search: "",
  };
  const window: any = {
    parent,
    fetch,
    ytcfg: { get: () => "c=WEB&cbr=Chrome&cbrver=140" },
    addEventListener: (name: string, listener: any) => {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name)!.add(listener);
    },
    removeEventListener: (name: string, listener: any) =>
      listeners.get(name)?.delete(listener),
  };
  runInNewContext(source, {
    window,
    location,
    document: { referrer, getElementById: () => player },
    XMLHttpRequest: Xhr,
    URL,
    URLSearchParams,
    AbortController,
    setTimeout,
    clearTimeout,
    Date,
  });
  const emit = (name: string, event: unknown) =>
    [...(listeners.get(name) ?? [])].forEach((listener) => listener(event));
  return {
    window,
    parent,
    Xhr,
    open,
    fetch,
    player,
    location,
    emit,
    request: (origin = APP, source: unknown = parent, videoId = VIDEO) =>
      emit("message", {
        origin,
        source,
        data: { type: "atoenglish:request-captions", videoId },
      }),
    capture: (url: string, body: unknown, status = 200) => {
      const xhr = new Xhr();
      xhr.open("GET", url);
      xhr.load(body, status);
      return xhr;
    },
    payloads: () =>
      parent.postMessage.mock.calls.filter(
        ([data]) => data.type === "atoenglish:youtube-captions",
      ),
  };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("native YouTube caption companion", () => {
  it("injects before requests in embedded frames, with bounded app origins", () => {
    const entry = manifest.content_scripts.find(
      (entry: any) => entry.world === "MAIN",
    );
    expect(entry.run_at).toBe("document_start");
    expect(entry.all_frames).toBe(true);
    expect(entry.matches).toContain("https://www.youtube.com/embed/*");
    expect(manifest.content_scripts[2].matches).not.toContain(
      "https://*.workers.dev/*",
    );
  });
  it("reads native XHR data without a second fetch, strips request context and restores hooks/track", async () => {
    const h = harness();
    h.capture(timedtext("en", "&pot=private-session-proof"), { events: EN });
    h.request();
    await vi.advanceTimersByTimeAsync(1);
    expect(h.fetch).not.toHaveBeenCalled();
    expect(h.payloads()).toHaveLength(1);
    expect(h.payloads()[0][0].tracks[0].events).toEqual(EN);
    expect(JSON.stringify(h.payloads())).not.toContain("private-session-proof");
    expect(JSON.stringify(h.payloads())).not.toContain("captionURL");
    expect(h.Xhr.prototype.open).toBe(h.open);
    expect(h.window.fetch).toBe(h.fetch);
  });
  it("waits for native track data, also accepts fetch-clone responses and keeps native body readable", async () => {
    const h = harness();
    h.request();
    const response = await h.window.fetch(timedtext());
    expect(await response.json()).toEqual({ events: EN });
    await vi.advanceTimersByTimeAsync(250);
    expect(h.payloads()).toHaveLength(1);
    expect(h.fetch).toHaveBeenCalledTimes(1); // This was the simulated native player request.
    expect(h.player.setOption).toHaveBeenLastCalledWith("captions", "track", {
      languageCode: "fr",
    });
  });
  it("uses one direct fallback, replaces fmt and uses real device metadata", async () => {
    const h = harness();
    h.request();
    await vi.advanceTimersByTimeAsync(3500);
    expect(h.fetch).toHaveBeenCalledTimes(1);
    const url = new URL(h.fetch.mock.calls[0][0] as unknown as string);
    expect(url.searchParams.getAll("fmt")).toEqual(["json3"]);
    expect(url.searchParams.get("cbr")).toBe("Chrome");
    expect(h.payloads()).toHaveLength(1);
  });
  it("stops after native 429 without repeating the refused request", async () => {
    const h = harness();
    h.request();
    h.capture(timedtext(), "blocked", 429);
    await vi.advanceTimersByTimeAsync(1000);
    expect(h.fetch).not.toHaveBeenCalled();
    expect(h.payloads()).toHaveLength(0);
    expect(h.parent.postMessage).toHaveBeenCalledWith(
      { type: "atoenglish:collect-done", videoId: VIDEO },
      APP,
    );
  });
  it("rejects wrong parent/origin/video, unrelated video, translated track and malformed response", async () => {
    const h = harness();
    h.request("https://other.workers.dev");
    h.request(APP, {});
    h.request(APP, h.parent, "dQw4w9WgXcQ");
    expect(h.player.getPlayerResponse).not.toHaveBeenCalled();
    h.capture(timedtext().replace(VIDEO, "dQw4w9WgXcQ"), { events: EN });
    h.capture(timedtext("en", "&tlang=vi"), { events: EN });
    h.capture(timedtext(), { events: [{ tStartMs: "bad", segs: [{}] }] });
    h.request();
    await vi.advanceTimersByTimeAsync(1000);
    expect(h.payloads()).toHaveLength(0);
    h.emit("pagehide", {});
    expect(h.Xhr.prototype.open).toBe(h.open);
  });
  it("aligns only actual human Vietnamese and avoids collecting other languages", async () => {
    const h = harness({
      tracks: [
        { languageCode: "en", baseUrl: timedtext(), vssId: ".en" },
        { languageCode: "vi", baseUrl: timedtext("vi"), vssId: ".vi" },
      ],
    });
    h.capture(timedtext(), { events: EN });
    h.capture(timedtext("vi", "&kind=asr"), { events: VI });
    h.capture(timedtext("vi"), { events: VI });
    h.request();
    await vi.advanceTimersByTimeAsync(1);
    expect(
      h.payloads()[0][0].tracks.map((t: any) => `${t.languageCode}:${t.kind}`),
    ).toEqual(["en:manual", "vi:manual"]);
    expect(h.fetch).not.toHaveBeenCalled();
  });
  it("restores passive hooks after the cache-hit wait without a request", async () => {
    const h = harness();
    await vi.advanceTimersByTimeAsync(30_001); // Collector's documented 30-second ceiling.
    expect(h.Xhr.prototype.open).toBe(h.open);
    expect(h.window.fetch).toBe(h.fetch);
    h.request();
    expect(h.player.getPlayerResponse).not.toHaveBeenCalled();
    expect(h.fetch).not.toHaveBeenCalled();
  });
  it("preserves a later user choice of another native track in the same language", async () => {
    const h = harness();
    h.request();
    const chosen = { languageCode: "en", vssId: ".en-other" };
    h.player.setOption("captions", "track", chosen);
    h.capture(timedtext(), { events: EN });
    await vi.advanceTimersByTimeAsync(250);
    expect(h.player.setOption).toHaveBeenLastCalledWith(
      "captions",
      "track",
      chosen,
    );
  });
  it("drops completion on video navigation and never restarts for duplicate requests", async () => {
    const h = harness();
    h.request();
    h.request();
    h.location.pathname = "/embed/dQw4w9WgXcQ";
    await vi.advanceTimersByTimeAsync(3500);
    // Do not restore the previous video's caption choice onto the new one.
    expect(h.player.setOption).toHaveBeenCalledTimes(1);
    expect(h.payloads()).toHaveLength(0);
    expect(h.fetch).not.toHaveBeenCalled();
    expect(h.Xhr.prototype.open).toBe(h.open);
  });
});

describe("import tab relay", () => {
  it("closes only after storage finishes successfully", async () => {
    const relay = readFileSync(
      resolve("extension/content-youtube-relay.js"),
      "utf8",
    );
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    let listener: (event: any) => void = () => {};
    const window = {
      addEventListener: (_name: string, fn: typeof listener) => {
        listener = fn;
      },
      close: vi.fn(),
    };
    const location = {
      hash: "#atoenglish-import",
      origin: "https://www.youtube.com",
    };
    runInNewContext(relay, {
      window,
      location,
      Date,
      chrome: { storage: { local: { set: () => pending } } },
    });
    listener({
      source: window,
      origin: location.origin,
      data: { type: "atoenglish:youtube-captions", videoId: VIDEO },
    });
    listener({
      source: window,
      origin: location.origin,
      data: { type: "atoenglish:collect-done" },
    });
    expect(window.close).not.toHaveBeenCalled();
    finish();
    await vi.advanceTimersByTimeAsync(1);
    expect(window.close).toHaveBeenCalledTimes(1);
  });
});
