import { describe, expect, it, vi } from "vitest";
import {
  buildJson3Url,
  fetchYoutubeCaptions,
  parseTimedTextList,
  pickEnglishTrack,
  UPSTREAM_REQUEST_BUDGET,
} from "./captions";
import rickrollPlayer from "./__fixtures__/rickroll.player.json";
import gangnamPlayer from "./__fixtures__/gangnam.player.json";
import noTracksPlayer from "./__fixtures__/no-tracks.player.json";
import rickrollAsr from "./__fixtures__/rickroll.asr.json";

const VIDEO_ID = "dQw4w9WgXcQ";

interface RecordedCall {
  url: string;
  init?: RequestInit;
}

function mockFetch(
  handler: (url: string, init?: RequestInit) => Response | Promise<Response>,
) {
  const calls: RecordedCall[] = [];
  const fn = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const u = typeof url === "string" ? url : url instanceof URL ? url.toString() : url.url;
    calls.push({ url: u, init });
    return handler(u, init);
  }) as unknown as typeof fetch & { mock: { calls: unknown[][] } };
  return { calls, fetch: fn };
}

const jsonRes = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

const textRes = (text: string, status = 200) =>
  new Response(text, { status });

const noDelay = () => Promise.resolve();

/** Route map: predicate → response or "throw"/"next". */
function router(
  routes: Array<[RegExp, Response | "throw" | "next"]>,
  fallback?: Response | "throw",
) {
  return mockFetch(async (url) => {
    for (const [re, res] of routes) {
      if (re.test(url)) {
        if (res === "throw") throw new Error("network down");
        if (res === "next") continue;
        return res.clone();
      }
    }
    const fb = fallback ?? jsonRes({ playabilityStatus: { status: "ERROR" } });
    if (fb === "throw") throw new Error("network down");
    return (fb as Response).clone();
  });
}

const PLAYER_RE = /youtubei\/v1\/player/;
const TIMEDTEXT_RE = /api\/timedtext/;
const WATCH_RE = /youtube\.com\/watch\?v=/;

describe("fetchYoutubeCaptions — chain order", () => {
  it("returns the iOS track when the first player call succeeds", async () => {
    const { calls, fetch } = router([
      [PLAYER_RE, jsonRes(rickrollPlayer)],
      [TIMEDTEXT_RE, jsonRes(rickrollAsr)],
    ]);
    const result = await fetchYoutubeCaptions(VIDEO_ID, { fetch, delay: noDelay });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source).toBe("ios");
    expect(result.track.languageCode).toBe("en");
    expect(result.track.kind).toBe("manual"); // en manual scored above en asr
    expect(result.video.title).toContain("Never Gonna Give You Up");
    expect(result.events.length).toBeGreaterThan(0);
    expect(calls).toHaveLength(2);
  });

  it("prefers the manual en track over en asr", async () => {
    const tracks = rickrollPlayer.captions.playerCaptionsTracklistRenderer.captionTracks;
    const i = pickEnglishTrack(tracks);
    expect(tracks[i].languageCode).toBe("en");
    expect(tracks[i].kind).not.toBe("asr");
  });

  it("replaces fmt=srv3 with fmt=json3 and adds WEB client params", () => {
    const url = buildJson3Url(
      "https://www.youtube.com/api/timedtext?v=x&lang=en&fmt=srv3&pot=abc",
    );
    const u = new URL(url);
    expect(u.searchParams.get("fmt")).toBe("json3");
    expect(u.searchParams.getAll("fmt")).toHaveLength(1);
    expect(u.searchParams.get("pot")).toBe("abc"); // untouched params preserved
    expect(u.searchParams.get("c")).toBe("WEB");
    expect(u.searchParams.get("cplayer")).toBe("UNIPLAYER");
    expect(u.searchParams.get("xorb")).toBe("2");
  });

  it("falls through to Android when iOS has no captions", async () => {
    let playerCalls = 0;
    const { calls, fetch } = mockFetch(async (url) => {
      if (PLAYER_RE.test(url)) {
        playerCalls++;
        return playerCalls === 1
          ? jsonRes(noTracksPlayer) // playable, zero tracks
          : jsonRes(rickrollPlayer); // android succeeds
      }
      return jsonRes(rickrollAsr);
    });
    const result = await fetchYoutubeCaptions(VIDEO_ID, { fetch, delay: noDelay });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source).toBe("android");
    expect(playerCalls).toBe(2);
    expect(calls).toHaveLength(3);
  });

  it("walks the whole chain: players fail → watch page → timedtext list", async () => {
    const watchHtml = `<html><script>var ytInitialPlayerResponse={"captions":${JSON.stringify(
      rickrollPlayer.captions,
    )}};</script></html>`;
    const { calls, fetch } = router([
      [PLAYER_RE, jsonRes({ playabilityStatus: { status: "ERROR", reason: "x" } })],
      [WATCH_RE, textRes(watchHtml)],
      [TIMEDTEXT_RE, jsonRes(rickrollAsr)],
    ]);
    const result = await fetchYoutubeCaptions(VIDEO_ID, { fetch, delay: noDelay });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source).toBe("watch");
    // 2 players + 1 watch + 1 track fetch
    expect(calls).toHaveLength(4);
  });

  it("uses the timedtext list when nothing else yields tracks", async () => {
    const listXml = `<transcript_list><track id="1" lang_code="en" lang_original="English" kind="asr"/></transcript_list>`;
    const { fetch } = router([
      [PLAYER_RE, jsonRes(noTracksPlayer)],
      [WATCH_RE, textRes("<html>no captions here</html>")],
      [/type=list/, textRes(listXml)],
      [/timedtext\?/, jsonRes(rickrollAsr)],
    ]);
    const result = await fetchYoutubeCaptions(VIDEO_ID, { fetch, delay: noDelay });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source).toBe("timedtext");
    expect(result.track.kind).toBe("asr");
  });
});

describe("fetchYoutubeCaptions — budget, retry, abort", () => {
  it("never exceeds the upstream request budget", async () => {
    const { calls, fetch } = mockFetch(async () => {
      throw new Error("network down");
    });
    const result = await fetchYoutubeCaptions(VIDEO_ID, { fetch, delay: noDelay });
    expect(result.ok).toBe(false);
    expect(calls.length).toBeLessThanOrEqual(UPSTREAM_REQUEST_BUDGET);
  });

  it("backs off only on retryable failures (429) and stops on 404", async () => {
    const delays: number[] = [];
    const record = (ms: number) => {
      delays.push(ms);
      return Promise.resolve();
    };
    // 429 on every call → each chain step retries its own ladder
    // (iOS burns 4 requests + Android 2 = the shared 6-request budget).
    const { calls: c1, fetch: f1 } = router([[PLAYER_RE, jsonRes({}, 429)]]);
    await fetchYoutubeCaptions(VIDEO_ID, { fetch: f1, delay: record });
    expect(delays).toEqual([300, 600, 1200, 300]);
    expect(c1.length).toBeLessThanOrEqual(UPSTREAM_REQUEST_BUDGET);

    // 404 → no retry, moves straight to the next chain step
    const { calls: c2, fetch: f2 } = router([
      [PLAYER_RE, jsonRes({}, 404)],
    ]);
    await fetchYoutubeCaptions(VIDEO_ID, { fetch: f2, delay: noDelay });
    const playerCalls = c2.filter((c) => PLAYER_RE.test(c.url));
    expect(playerCalls).toHaveLength(2); // iOS once + Android once, no retries
    expect(c1.length).toBeGreaterThan(2); // 429 did retry
  });

  it("aborts the whole chain when the signal fires", async () => {
    const controller = new AbortController();
    const { calls, fetch } = mockFetch(async () => {
      controller.abort();
      return jsonRes(rickrollPlayer);
    });
    const result = await fetchYoutubeCaptions(VIDEO_ID, {
      fetch,
      delay: noDelay,
      signal: controller.signal,
    });
    expect(result).toEqual({ ok: false, error: "aborted" });
    expect(calls.length).toBeLessThanOrEqual(1);
  });
});

describe("fetchYoutubeCaptions — error mapping", () => {
  it("rejects invalid ids without any upstream call", async () => {
    const { calls, fetch } = mockFetch(async () => jsonRes({}));
    const result = await fetchYoutubeCaptions("short!!", { fetch });
    expect(result).toEqual({ ok: false, error: "invalid_url" });
    expect(calls).toHaveLength(0);
  });

  it("maps playable-but-no-English-track to no_captions", async () => {
    const { fetch } = router([
      [PLAYER_RE, jsonRes(gangnamPlayer)], // ko:asr only
      [WATCH_RE, textRes("<html></html>")],
      [TIMEDTEXT_RE, textRes("<transcript_list></transcript_list>")],
    ]);
    const result = await fetchYoutubeCaptions("9bZkp7q19f0", { fetch, delay: noDelay });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe("no_captions");
  });

  it("maps blocked playability to blocked", async () => {
    const blocked = {
      playabilityStatus: { status: "LOGIN_REQUIRED", reason: "Sign in to confirm you're not a bot" },
    };
    const { fetch } = router([
      [PLAYER_RE, jsonRes(blocked)],
      [WATCH_RE, textRes("<html></html>")],
      [TIMEDTEXT_RE, textRes("<transcript_list></transcript_list>")],
    ]);
    const result = await fetchYoutubeCaptions(VIDEO_ID, { fetch, delay: noDelay });
    expect(result).toEqual({ ok: false, error: "blocked" });
  });
});

describe("parseTimedTextList", () => {
  it("parses track attributes", () => {
    const xml = `<transcript_list>
      <track id="0" lang_code="en" lang_original="English" kind="asr" lang_default="true"/>
      <track id="1" lang_code="vi" lang_original="Vietnamese"/>
    </transcript_list>`;
    const tracks = parseTimedTextList(xml);
    expect(tracks).toHaveLength(2);
    expect(tracks[0]).toMatchObject({ languageCode: "en", kind: "asr" });
    expect(tracks[1]).toMatchObject({ languageCode: "vi", kind: "manual" });
  });
});

describe("fetchYoutubeCaptions — human Vietnamese track", () => {
  const player = (tracks: Array<{ languageCode: string; kind?: string }>) => ({
    playabilityStatus: { status: "OK" },
    videoDetails: { title: "T", author: "A", lengthSeconds: "10" },
    captions: {
      playerCaptionsTracklistRenderer: {
        captionTracks: tracks.map((t) => ({
          ...t,
          baseUrl: `https://www.youtube.com/api/timedtext?v=${VIDEO_ID}&lang=${t.languageCode}${t.kind ? `&kind=${t.kind}` : ""}`,
        })),
      },
    },
  });
  const en = { events: [{ tStartMs: 0, dDurationMs: 1000, segs: [{ utf8: "Hello." }] }] };
  const vi = { events: [{ tStartMs: 0, dDurationMs: 1000, segs: [{ utf8: "Xin chào." }] }] };

  it("fetches the uploader's manual vi track alongside English", async () => {
    const { fetch } = router([
      [PLAYER_RE, jsonRes(player([{ languageCode: "en" }, { languageCode: "vi" }]))],
      [/lang=vi/, jsonRes(vi)],
      [/lang=en/, jsonRes(en)],
    ]);
    const result = await fetchYoutubeCaptions(VIDEO_ID, { fetch, delay: noDelay });
    expect(result.ok && result.viEvents).toEqual(vi.events);
  });

  it("never treats ASR vi as a translation", async () => {
    const { calls, fetch } = router([
      [PLAYER_RE, jsonRes(player([{ languageCode: "en" }, { languageCode: "vi", kind: "asr" }]))],
      [/lang=en/, jsonRes(en)],
    ]);
    const result = await fetchYoutubeCaptions(VIDEO_ID, { fetch, delay: noDelay });
    expect(result.ok && result.viEvents).toBeUndefined();
    expect(calls.some((c) => /lang=vi/.test(c.url))).toBe(false);
  });

  it("keeps the English success when the vi fetch fails", async () => {
    const { fetch } = router([
      [PLAYER_RE, jsonRes(player([{ languageCode: "en" }, { languageCode: "vi" }]))],
      [/lang=vi/, textRes("blocked", 403)],
      [/lang=en/, jsonRes(en)],
    ]);
    const result = await fetchYoutubeCaptions(VIDEO_ID, { fetch, delay: noDelay });
    expect(result.ok).toBe(true);
    expect(result.ok && result.events).toEqual(en.events);
    expect(result.ok && result.viEvents).toBeUndefined();
  });
});
