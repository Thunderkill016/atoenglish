/**
 * YouTube caption fetch chain (SPEC §4.2).
 *
 * Order: iOS player → Android player → watch-page `captionTracks` →
 * `timedtext?type=list` → (caller falls back to learner upload/paste).
 *
 * Constraints:
 * - ≤ UPSTREAM_REQUEST_BUDGET requests per call across the whole chain.
 * - Backoff RETRY_DELAYS only for network errors / 5xx; stop on 403/429.
 * - `fmt` on a track `baseUrl` must be *replaced* with `json3` (appending
 *   leaves `fmt=srv3` in place and YouTube returns XML — verified 06/10).
 * - Timedtext requests carry the fixed WEB client params read-frog uses to
 *   reduce blocking. This server path does not acquire session attestation;
 *   fixed params cannot guarantee caption access. Some requests fail — the
 *   upload/paste fallback is mandatory, not optional.
 * - `fetch`/`delay`/`signal` are injectable so tests run on fixtures.
 */

import { YOUTUBE_VIDEO_ID_RE } from "./youtube-url";
import type { CaptionTrackInfo, Json3Event } from "./types";

/**
 * Hard cap on upstream requests per call across the whole chain. Worst case
 * is 3 player clients × (1 call + MAX_TRACK_ATTEMPTS_PER_STEP tracks) +
 * watch page + timedtext list ≈ 15, capped tighter on purpose.
 */
export const UPSTREAM_REQUEST_BUDGET = 12;
export const RETRY_DELAYS_MS = [300, 600, 1200] as const;

/**
 * A refused or empty track URL only retires that one signed URL — the next
 * English candidate may carry a working signature. Capped per step so a bad
 * track list cannot eat the whole budget.
 */
const MAX_TRACK_ATTEMPTS_PER_STEP = 2;

/**
 * Matches the mobile-Safari client identity already claimed by
 * TIMEDTEXT_PARAMS (cos=iPhone, cbr=Safari) — the HTTP header must agree
 * with the URL params or the request looks inconsistent to abuse checks.
 */
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1";

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
    userAgent:
      "com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X; en_US)",
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
    userAgent:
      "com.google.android.youtube/20.10.38 (Linux; U; Android 11) gzip",
    context: {
      client: {
        clientName: "ANDROID",
        clientVersion: "20.10.38",
        androidSdkVersion: 30,
        osName: "Android",
        osVersion: "11",
        userAgent:
          "com.google.android.youtube/20.10.38 (Linux; U; Android 11) gzip",
        hl: "en",
        gl: "US",
      },
    },
  },
  // Third identity: the TV client is served by a different YouTube backend
  // path and produces differently-signed track URLs — the standard fallback
  // when mobile clients are gated (yt-dlp relies on it for the same cases).
  {
    name: "tvhtml5" as const,
    userAgent:
      "Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.0) AppleWebKit/537.36 (KHTML, like Gecko) Version/6.0 TV safari/537.36",
    context: {
      client: {
        clientName: "TVHTML5",
        clientVersion: "7.20250312.16.00",
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
  source: "ios" | "android" | "tvhtml5" | "watch" | "timedtext";
  track: CaptionTrackInfo;
  events: Json3Event[];
  /** Uploader-authored Vietnamese track, when the video has one. */
  viEvents?: Json3Event[];
  video: { title?: string; channel?: string; durationMs?: number };
}

export interface CaptionFailure {
  ok: false;
  error: CaptionFetchError;
  /**
   * Compact per-route failure tags, e.g. "ios-track:429,watch:403" — for
   * observability only; never shown to the learner.
   */
  detail?: string;
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
class UpstreamRefused extends Error {
  constructor(public status: number) {
    super(`upstream refused with ${status}`);
  }
}

const isRetryableStatus = (status: number) => status >= 500;

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

/**
 * Uploader-authored Vietnamese only: ASR `vi` is speech recognition of
 * Vietnamese audio, not a translation, and YouTube's own `tlang` output is
 * machine translation — neither counts as a human subtitle.
 */
export function pickVietnameseTrack<
  T extends { languageCode: string; kind?: string },
>(tracks: T[]): T | null {
  return (
    tracks.find(
      (t) =>
        /^vi(?:[-_]|$)/i.test(t.languageCode) && trackKind(t.kind) === "manual",
    ) ?? null
  );
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

/**
 * baseUrl → json3 URL: replace `fmt` (never append), add WEB client params.
 * Watch-page captionTracks can carry host-relative baseUrls — resolve them
 * against the YouTube origin instead of throwing on `new URL`.
 */
export function buildJson3Url(baseUrl: string): string {
  const url = new URL(baseUrl, "https://www.youtube.com");
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
    tracks.push({
      languageCode: lang,
      kind: trackKind(get("kind")),
      name: get("lang_original"),
    });
  }
  return tracks;
}

export async function fetchYoutubeCaptions(
  videoId: string,
  deps: CaptionFetchDeps = {},
): Promise<CaptionResult> {
  if (!YOUTUBE_VIDEO_ID_RE.test(videoId))
    return { ok: false, error: "invalid_url" };

  const doFetch = deps.fetch ?? fetch;
  const delay =
    deps.delay ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));
  const signal = deps.signal;

  let budget = UPSTREAM_REQUEST_BUDGET;
  let sawBlocked = false;
  let sawPlayableNoTracks = false;
  const failures: string[] = [];

  const failureDetail = () => failures.join(",") || undefined;

  /**
   * A refusal retires only the route that hit it. Returns true when `e` was
   * a refusal (recorded for diagnostics); rethrow anything else — abort and
   * budget exhaustion stay fatal.
   */
  const refused = (e: unknown, tag: string): boolean => {
    if (e instanceof UpstreamRefused) {
      sawBlocked = true;
      failures.push(`${tag}:${e.status}`);
      return true;
    }
    return false;
  };

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
        if (
          signal?.aborted ||
          (e instanceof Error && e.name === "AbortError")
        ) {
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
      // A refusal only retires this one URL — a different signed track,
      // client or route can still succeed (seen live: the iOS player call
      // returned tracks while that session's timedtext URL 429'd). Same-URL
      // retry is pointless, so the refusal propagates to the step handler.
      if (res.status === 403 || res.status === 429)
        throw new UpstreamRefused(res.status);
      if (
        isRetryableStatus(res.status) &&
        attempt < RETRY_DELAYS_MS.length &&
        budget > 0
      ) {
        await delay(RETRY_DELAYS_MS[attempt++]);
        continue;
      }
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
    const res = await request(buildJson3Url(baseUrl), {
      headers: { "user-agent": BROWSER_USER_AGENT },
    });
    const data = (await json(res)) as { events?: Json3Event[] } | null;
    if (!data?.events || data.events.length === 0) return null;
    return data.events;
  };

  const fromPlayerResponse = (
    data: PlayerResponse | null,
    clientName: string,
  ): { tracks: CaptionTrackInfo[]; playable: boolean } => {
    const playable = data?.playabilityStatus?.status === "OK";
    if (!playable) {
      const status = data?.playabilityStatus?.status;
      if (status) {
        sawBlocked = true;
        failures.push(`${clientName}-player:${status}`);
      }
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

  /** English candidates in preference order, capped per step. */
  const englishCandidates = (tracks: CaptionTrackInfo[]): CaptionTrackInfo[] =>
    tracks
      .map((track, index) => ({ track, score: scoreTrack(track), index }))
      .filter((c) => c.score !== Number.POSITIVE_INFINITY)
      .sort((a, b) => a.score - b.score || a.index - b.index)
      .slice(0, MAX_TRACK_ATTEMPTS_PER_STEP)
      .map((c) => c.track);

  // Best effort: the English track is already in hand, so a failed, blocked
  // or budget-exhausted Vietnamese fetch must never turn success into failure.
  const fetchHumanVietnamese = async (
    tracks: CaptionTrackInfo[],
  ): Promise<Json3Event[] | undefined> => {
    const vi = pickVietnameseTrack(tracks);
    if (!vi?.baseUrl) return undefined;
    try {
      return (await fetchTrackJson3(vi.baseUrl)) ?? undefined;
    } catch (e) {
      if (e instanceof AbortFetch) throw e;
      return undefined;
    }
  };

  try {
    // Steps 1–3: youtubei player (iOS, Android, TVHTML5).
    for (const client of PLAYER_CLIENTS) {
      let res: Response | null;
      try {
        res = await request(
          "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "user-agent": client.userAgent,
            },
            body: JSON.stringify({ context: client.context, videoId }),
          },
        );
      } catch (e) {
        if (refused(e, `${client.name}-player`)) continue;
        throw e;
      }
      const data = (await json(res)) as PlayerResponse | null;
      if (data === null) failures.push(`${client.name}-player:empty`);
      const { tracks, playable } = fromPlayerResponse(data, client.name);
      if (!playable) continue;
      const candidates = englishCandidates(tracks);
      if (candidates.length === 0) {
        sawPlayableNoTracks = true;
        continue;
      }
      for (const track of candidates) {
        if (!track.baseUrl) continue;
        let events: Json3Event[] | null;
        try {
          events = await fetchTrackJson3(track.baseUrl);
        } catch (e) {
          if (refused(e, `${client.name}-track`)) continue;
          throw e;
        }
        if (events) {
          return {
            ok: true,
            videoId,
            source: client.name,
            track,
            events,
            viEvents: await fetchHumanVietnamese(tracks),
            video: videoDetails(data),
          };
        }
        failures.push(`${client.name}-track:empty`);
      }
    }

    // Step 4: captionTracks embedded in the watch page HTML.
    let html: string | null = null;
    try {
      const watchRes = await request(
        `https://www.youtube.com/watch?v=${videoId}&hl=en`,
        { headers: { "user-agent": BROWSER_USER_AGENT } },
      );
      if (watchRes === null) failures.push("watch:null");
      else html = await watchRes.text();
    } catch (e) {
      if (!refused(e, "watch")) throw e;
    }
    if (html && !html.includes('"captions"'))
      // Consent walls and bot checks answer with HTML that simply has no
      // captions blob — that is a miss, not proof the video has none.
      failures.push("watch:no-captions");
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
            const candidates = englishCandidates(tracks);
            if (candidates.length === 0) sawPlayableNoTracks = true;
            for (const track of candidates) {
              if (!track.baseUrl) continue;
              let events: Json3Event[] | null;
              try {
                events = await fetchTrackJson3(track.baseUrl);
              } catch (e) {
                if (refused(e, "watch-track")) continue;
                throw e;
              }
              if (events) {
                return {
                  ok: true,
                  videoId,
                  source: "watch",
                  track,
                  events,
                  viEvents: await fetchHumanVietnamese(tracks),
                  video: {},
                };
              }
              failures.push("watch-track:empty");
            }
          } catch (error) {
            if (error instanceof AbortFetch || error instanceof BudgetExhausted)
              throw error;
            if (!refused(error, "watch")) failures.push("watch:bad-json");
            // malformed embedded JSON — fall through to timedtext
          }
        }
      }
    }

    // Step 5: timedtext track list → constructed json3 URL.
    let xml: string | null = null;
    try {
      const listRes = await request(
        `https://www.youtube.com/api/timedtext?v=${videoId}&type=list`,
        { headers: { "user-agent": BROWSER_USER_AGENT } },
      );
      if (listRes === null) failures.push("list:null");
      else xml = await listRes.text();
    } catch (e) {
      if (!refused(e, "list")) throw e;
    }
    if (xml) {
      const candidates = englishCandidates(parseTimedTextList(xml));
      if (candidates.length === 0) {
        sawPlayableNoTracks = true;
        failures.push("list:no-tracks");
      }
      for (const track of candidates) {
        const url = new URL("https://www.youtube.com/api/timedtext");
        url.searchParams.set("v", videoId);
        url.searchParams.set("lang", track.languageCode);
        if (track.kind === "asr") url.searchParams.set("kind", "asr");
        url.searchParams.set("fmt", "json3");
        for (const [k, v] of Object.entries(TIMEDTEXT_PARAMS)) {
          url.searchParams.set(k, v);
        }
        try {
          const res = await request(url.toString(), {
            headers: { "user-agent": BROWSER_USER_AGENT },
          });
          const data = (await json(res)) as { events?: Json3Event[] } | null;
          if (data?.events?.length) {
            return {
              ok: true,
              videoId,
              source: "timedtext",
              track,
              events: data.events,
              video: {},
            };
          }
          failures.push("list-track:empty");
        } catch (e) {
          if (refused(e, "list-track")) continue;
          throw e;
        }
      }
    }
  } catch (e) {
    if (e instanceof AbortFetch) return { ok: false, error: "aborted" };
    if (e instanceof UpstreamRefused)
      return { ok: false, error: "blocked", detail: failureDetail() };
    if (!(e instanceof BudgetExhausted))
      return { ok: false, error: "error", detail: failureDetail() };
  }

  if (sawBlocked)
    return { ok: false, error: "blocked", detail: failureDetail() };
  if (sawPlayableNoTracks)
    return { ok: false, error: "no_captions", detail: failureDetail() };
  return { ok: false, error: "error", detail: failureDetail() };
}
