"use server";

/**
 * Opt-in YouTube Data API search for `/discover` (SPEC §10, TASK_CONTRACT
 * slice-6). The UI renders the affordance only when
 * `YOUTUBE_DATA_API_KEY` exists server-side; this action additionally
 * refuses without the key so the capability cannot be invoked directly.
 *
 * Contract: `search.list` ONLY, with `type=video` +
 * `videoCaption=closedCaption` + bounded `maxResults`. `videoEmbeddable=true`
 * is added because a non-embeddable result could never play inside the
 * /watch iframe player. `relevanceLanguage=en` biases toward English
 * content — this is an English-learning catalog.
 *
 * Quota: each call costs 100 units on the standard 10,000/day free quota —
 * ~100 searches/day shared across the whole app. The per-identity limiter
 * is deliberately conservative; upstream quota exhaustion surfaces as the
 * honest "quota" error, never a silent empty list.
 */

import { headers } from "next/headers";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import {
  createRateLimiter,
  getClientIpFromHeaders,
} from "@/lib/security/rate-limit";
import { YOUTUBE_VIDEO_ID_RE } from "@/lib/video/youtube-url";

const SEARCH_LIMIT = 10;
const SEARCH_WINDOW_MS = 60 * 60 * 1000;
/** Bounded result count — picker-style previews, not an infinite feed. */
const SEARCH_MAX_RESULTS = 8;
const UPSTREAM_TIMEOUT_MS = 8_000;
const QUERY_MAX_LEN = 100;

const searchLimiter = createRateLimiter(
  SEARCH_LIMIT,
  SEARCH_WINDOW_MS,
  "search",
);

const searchItemSchema = z.object({
  id: z.object({ videoId: z.string().regex(YOUTUBE_VIDEO_ID_RE) }),
  snippet: z.object({
    title: z.string().min(1),
    channelTitle: z.string().min(1),
  }),
});
const searchResponseSchema = z.object({
  items: z.array(z.unknown()).optional(),
});

export interface YoutubeSearchVideo {
  id: string;
  title: string;
  channel: string;
}

export type YoutubeSearchError =
  | "unavailable"
  | "invalid_query"
  | "rate_limited"
  | "quota"
  | "upstream";

export type YoutubeSearchResult =
  | { ok: true; videos: YoutubeSearchVideo[] }
  | { ok: false; error: YoutubeSearchError };

async function searchKey(): Promise<string> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user?.id) return `user:${data.user.id}`;
  } catch {
    // Auth outage must not kill search — degrade to the IP key.
  }
  const h = await headers();
  return `anon:${getClientIpFromHeaders(h)}`;
}

/** YouTube returns 403 with per-reason entries for quota vs real denials. */
function isQuotaError(status: number, payload: unknown): boolean {
  if (status !== 403) return false;
  const reasons =
    (payload as { error?: { errors?: Array<{ reason?: string }> } })?.error
      ?.errors ?? [];
  return reasons.some(
    (r) =>
      r.reason === "quotaExceeded" ||
      r.reason === "dailyLimitExceeded" ||
      r.reason === "rateLimitExceeded",
  );
}

export async function searchYoutube(
  query: string,
): Promise<YoutubeSearchResult> {
  const apiKey = process.env.YOUTUBE_DATA_API_KEY;
  if (!apiKey) return { ok: false, error: "unavailable" };

  const q = query.trim().slice(0, QUERY_MAX_LEN);
  if (q.length < 2) return { ok: false, error: "invalid_query" };

  const verdict = await searchLimiter.check(await searchKey());
  if (!verdict.success) return { ok: false, error: "rate_limited" };

  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    videoCaption: "closedCaption",
    videoEmbeddable: "true",
    relevanceLanguage: "en",
    maxResults: String(SEARCH_MAX_RESULTS),
    q,
    key: apiKey,
  });

  let response: Response;
  try {
    response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`,
      { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) },
    );
  } catch {
    return { ok: false, error: "upstream" };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      error: isQuotaError(response.status, payload) ? "quota" : "upstream",
    };
  }

  const parsed = searchResponseSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: "upstream" };

  const videos: YoutubeSearchVideo[] = [];
  for (const item of parsed.data.items ?? []) {
    const entry = searchItemSchema.safeParse(item);
    // A malformed upstream row must not poison the whole result list.
    if (entry.success) {
      videos.push({
        id: entry.data.id.videoId,
        title: entry.data.snippet.title,
        channel: entry.data.snippet.channelTitle,
      });
    }
  }
  // Upstream is asked for SEARCH_MAX_RESULTS; do not trust it blindly.
  return { ok: true, videos: videos.slice(0, SEARCH_MAX_RESULTS) };
}
