/**
 * YouTube caption fetch chain (SPEC §4.2).
 *
 * Order: iOS player → Android player → watch-page `captionTracks` →
 * `timedtext?type=list` → (caller falls back to learner upload/paste).
 *
 * Constraints:
 * - ≤ UPSTREAM_REQUEST_BUDGET requests per call across the whole chain.
 * - Backoff RETRY_DELAYS only for network errors / 403 / 429 / 5xx.
 * - `fmt` on a track `baseUrl` must be *replaced* with `json3` (appending
 *   leaves `fmt=srv3` in place and YouTube returns XML — verified 06/10).
 * - Timedtext requests carry the fixed WEB client params read-frog uses to
 *   reduce blocking. PO Tokens only exist in a real browser session, so
 *   server-side fetches will still be blocked on some videos — the
 *   upload/paste fallback is mandatory, not optional.
 * - `fetch`/`delay`/`signal` are injectable so tests run on fixtures.
 */

import { YOUTUBE_VIDEO_ID_RE } from "./youtube-url";
import type { CaptionTrackInfo, Json3Event } from "./types";

export const UPSTREAM_REQUEST_BUDGET = 6;
export const RETRY_DELAYS_MS = [300, 600, 1200] as const;

/** Fixed WEB client params on timedtext requests (read-frog buildSubtitleUrl). */
const TIMEDTEXT_PARAMS: Record<string, string> = {
  xorb: "2",
  xobt: "3",
  xovt: "3",
  c: "WEB",
  cplayer: "UNIPLAYER",
  cver: "2.20250313.05.00",
  cbrand: "apple",
  cbr: "Safari",
  cbrver: "18.4",
  cos: "iPhone",
  cosver: "18_3_2",
  cplatform: "MOBILE",
};

const PLAYER_CLIENTS = [
  {
    name: "ios" as const,
    context: {
      client: {
        clientName: "IOS",
        clientVersion: "20.10.4",
        deviceMake: "Apple",
        deviceModel: "iPhone16,2",
        userAgent:
          "com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X; en_US)",
        osName: "iPhone",
        osVersion: "18.3.2",
        hl: "en",
        gl: "US",
      },
    },
  },
  {
    name: "android" as const,
    context: {
      client: {
        clientName: "ANDROID",
        clientVersion: "20.10.38",
        androidSdkVersion: 30,
        osName: "Android",
        osVersion: "11",
        hl: "en",
        gl: "US",
      },
    },
  },
];

export type CaptionFetchError =
  | "invalid_url"
  | "no_captions"
  | "blocked"
  | "aborted"
  | "error";

export interface CaptionSuccess {
  ok: true;
  videoId: string;
  /** Which chain step produced the track. */
  source: "ios" | "android" | "watch" | "timedtext";
  track: CaptionTrackInfo;
  events: Json3Event[];
  video: { title?: string; channel?: string; durationMs?: number };
}

export interface CaptionFailure {
  ok: false;
  error: CaptionFetchError;
}

export type CaptionResult = CaptionSuccess | CaptionFailure;

export interface CaptionFetchDeps {
  fetch?: typeof fetch;
  delay?: (ms: number) => Promise<void>;
  signal?: AbortSignal;
}

interface PlayerCaptions {
  captionTracks?: Array<{
    baseUrl?: string;
    languageCode?: string;
    kind?: string;
    name?: { simpleText?: string; runs?: Array<{ text?: string }> };
  }>;
}

interface PlayerResponse {
  playabilityStatus?: { status?: string; reason?: string };
  captions?: {
    playerCaptionsTracklistRenderer?: PlayerCaptions;
  };
  videoDetails?: {
    title?: string;
    author?: string;
    lengthSeconds?: string;
  };
}

class BudgetExhausted extends Error {}
class AbortFetch extends Error {}

const isRetryableStatus = (status: number) =>
  status === 403 || status === 429 || status >= 500;

const trackKind = (kind: string | undefined): "manual" | "asr" =>
  kind === "asr" ? "asr" : "manual";

/**
 * English-learning product: prefer uploader `en` → `asr` `en` → other
 * English variants (same preference order). Non-English tracks are useless
 * for learning English and score as unusable.
 */
function scoreTrack(t: { languageCode: string; kind?: string }): number {
  const lang = t.languageCode;
  const manual = trackKind(t.kind) === "manual";
  if (lang === "en") return manual ? 0 : 1;
  if (/^en[-_]/i.test(lang)) return manual ? 2 : 3;
  return Number.POSITIVE_INFINITY;
}

export function pickEnglishTrack(
  tracks: Array<{ languageCode: string; kind?: string }>,
): number {
  let best = -1;
  let bestScore = Number.POSITIVE_INFINITY;
  tracks.forEach((t, i) => {
    const s = scoreTrack(t);
    if (s < bestScore) {
      bestScore = s;
      best = i;
    }
  });
  return best;
}

function toTrackInfo(t: {
  baseUrl?: string;
  languageCode?: string;
  kind?: string;
  name?: { simpleText?: string; runs?: Array<{ text?: string }> };
}): CaptionTrackInfo | null {
  if (!t.languageCode || !t.baseUrl) return null;
  return {
    languageCode: t.languageCode,
    kind: trackKind(t.kind),
    baseUrl: t.baseUrl,
    name: t.name?.simpleText ?? t.name?.runs?.map((r) => r.text).join(""),
  };
}

/** baseUrl → json3 URL: replace `fmt` (never append), add WEB client params. */
export function buildJson3Url(baseUrl: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set("fmt", "json3");
  for (const [k, v] of Object.entries(TIMEDTEXT_PARAMS)) {
    if (!url.searchParams.has(k)) url.searchParams.set(k, v);
  }
  return url.toString();
}

/** Extract a balanced-brace JSON object starting at `start` (index of `{`). */
function extractJsonObject(text: string, start: number): string | null {
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

/** Parse `<track …>` elements out of `timedtext?type=list` XML. */
export function parseTimedTextList(xml: string): CaptionTrackInfo[] {
  const tracks: CaptionTrackInfo[] = [];
  for (const m of xml.matchAll(/<track\s+([^>]+?)\/?\s*>/g)) {
    const attrs = m[1];
    const get = (name: string) =>
      attrs.match(new RegExp(`${name}="([^"]*)"`))?.[1];
    const lang = get("lang_code");
    if (!lang) continue;
    tracks.push({ languageCode: lang, kind: trackKind(get("kind")), name: get("lang_original") });
  }
  return tracks;
}

export async function fetchYoutubeCaptions(
  videoId: string,
  deps: CaptionFetchDeps = {},
): Promise<CaptionResult> {
  if (!YOUTUBE_VIDEO_ID_RE.test(videoId)) return { ok: false, error: "invalid_url" };

  const doFetch = deps.fetch ?? fetch;
  const delay = deps.delay ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));
  const signal = deps.signal;

  let budget = UPSTREAM_REQUEST_BUDGET;
  let sawBlocked = false;
  let sawPlayableNoTracks = false;

  const request = async (
    url: string,
    init?: RequestInit,
  ): Promise<Response | null> => {
    let attempt = 0;
    while (true) {
      if (signal?.aborted) throw new AbortFetch();
      if (budget <= 0) throw new BudgetExhausted();
      budget--;
      let res: Response;
      try {
        res = await doFetch(url, { ...init, signal });
      } catch (e) {
        if (signal?.aborted || (e instanceof Error && e.name === "AbortError")) {
          throw new AbortFetch();
        }
        // Network error — retryable while delay ladder + budget remain.
        if (attempt < RETRY_DELAYS_MS.length && budget > 0) {
          await delay(RETRY_DELAYS_MS[attempt++]);
          continue;
        }
        return null;
      }
      if (res.ok) return res;
      if (
        isRetryableStatus(res.status) &&
        attempt < RETRY_DELAYS_MS.length &&
        budget > 0
      ) {
        await delay(RETRY_DELAYS_MS[attempt++]);
        continue;
      }
      if (res.status === 403) sawBlocked = true;
      return null;
    }
  };

  const json = async (res: Response | null): Promise<unknown | null> => {
    if (!res) return null;
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const fetchTrackJson3 = async (
    baseUrl: string,
  ): Promise<Json3Event[] | null> => {
    const res = await request(buildJson3Url(baseUrl));
    const data = (await json(res)) as { events?: Json3Event[] } | null;
    if (!data?.events || data.events.length === 0) return null;
    return data.events;
  };

  const fromPlayerResponse = (
    data: PlayerResponse | null,
  ): { tracks: CaptionTrackInfo[]; playable: boolean } => {
    const playable = data?.playabilityStatus?.status === "OK";
    if (!playable) {
      if (data?.playabilityStatus?.status) sawBlocked = true;
      return { tracks: [], playable: false };
    }
    const raw =
      data?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
    const tracks = raw
      .map(toTrackInfo)
      .filter((t): t is CaptionTrackInfo => t != null);
    return { tracks, playable: true };
  };

  const videoDetails = (data: PlayerResponse | null) => ({
    title: data?.videoDetails?.title,
    channel: data?.videoDetails?.author,
    durationMs: data?.videoDetails?.lengthSeconds
      ? Number(data.videoDetails.lengthSeconds) * 1000
      : undefined,
  });

  const pickTrack = (tracks: CaptionTrackInfo[]): CaptionTrackInfo | null => {
    const i = pickEnglishTrack(tracks);
    return i >= 0 ? tracks[i] : null;
  };

  try {
    // Steps 1–2: youtubei player (iOS, then Android).
    for (const client of PLAYER_CLIENTS) {
      const res = await request(
        "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ context: client.context, videoId }),
        },
      );
      const data = (await json(res)) as PlayerResponse | null;
      const { tracks, playable } = fromPlayerResponse(data);
      if (!playable) continue;
      const track = pickTrack(tracks);
      if (!track) {
        sawPlayableNoTracks = true;
        continue;
      }
      const events = track.baseUrl ? await fetchTrackJson3(track.baseUrl) : null;
      if (events) {
        return {
          ok: true,
          videoId,
          source: client.name,
          track,
          events,
          video: videoDetails(data),
        };
      }
    }

    // Step 3: captionTracks embedded in the watch page HTML.
    const watchRes = await request(
      `https://www.youtube.com/watch?v=${videoId}&hl=en`,
    );
    const html = watchRes ? await watchRes.text() : null;
    if (html) {
      const idx = html.indexOf('"captions"');
      if (idx >= 0) {
        const brace = html.indexOf("{", idx);
        const slice = brace >= 0 ? extractJsonObject(html, brace) : null;
        if (slice) {
          try {
            const data = JSON.parse(slice) as PlayerResponse["captions"];
            const raw =
              data?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
            const tracks = raw
              .map(toTrackInfo)
              .filter((t): t is CaptionTrackInfo => t != null);
            const track = pickTrack(tracks);
            if (track?.baseUrl) {
              const events = await fetchTrackJson3(track.baseUrl);
              if (events) {
                return {
                  ok: true,
                  videoId,
                  source: "watch",
                  track,
                  events,
                  video: {},
                };
              }
            } else {
              sawPlayableNoTracks = true;
            }
          } catch {
            // malformed embedded JSON — fall through to timedtext
          }
        }
      }
    }

    // Step 4: timedtext track list → constructed json3 URL.
    const listRes = await request(
      `https://www.youtube.com/api/timedtext?v=${videoId}&type=list`,
    );
    const xml = listRes ? await listRes.text() : null;
    if (xml) {
      const tracks = parseTimedTextList(xml);
      const track = pickTrack(tracks);
      if (track) {
        const url = new URL("https://www.youtube.com/api/timedtext");
        url.searchParams.set("v", videoId);
        url.searchParams.set("lang", track.languageCode);
        if (track.kind === "asr") url.searchParams.set("kind", "asr");
        url.searchParams.set("fmt", "json3");
        for (const [k, v] of Object.entries(TIMEDTEXT_PARAMS)) {
          url.searchParams.set(k, v);
        }
        const res = await request(url.toString());
        const data = (await json(res)) as { events?: Json3Event[] } | null;
        if (data?.events?.length) {
          return { ok: true, videoId, source: "timedtext", track, events: data.events, video: {} };
        }
      } else {
        sawPlayableNoTracks = true;
      }
    }
  } catch (e) {
    if (e instanceof AbortFetch) return { ok: false, error: "aborted" };
    if (!(e instanceof BudgetExhausted)) return { ok: false, error: "error" };
  }

  if (sawBlocked) return { ok: false, error: "blocked" };
  if (sawPlayableNoTracks) return { ok: false, error: "no_captions" };
  return { ok: false, error: "error" };
}
