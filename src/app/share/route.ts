import { NextResponse } from "next/server";
import { parseYoutubeUrl } from "@/lib/video/youtube-url";

export const runtime = "edge";

/**
 * GET /share — mobile share-target intake (mission 006).
 *
 * The PWA manifest registers this as `share_target`, so on Android the
 * learner can do YouTube app → Share → AtoEnglish. Shares arrive as
 * `?title=&text=&url=`; the YouTube app puts the link inside `text`,
 * usually prefixed by the video title, so we scan each whitespace token
 * rather than assume the whole value is a URL. iOS Safari has no
 * share_target support — the same route still works as a pasted-link
 * destination (`/share?text=...`).
 */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  // `url` is the authoritative field; text/title tokens are scanned only
  // when they look like URLs (contain a host dot) — a bare 11-char word in
  // a video title must not shadow the real link.
  const urlParam = params.get("url") ?? "";
  const candidates = [
    urlParam,
    ...(params.get("text") ?? "").split(/\s+/).filter((t) => t.includes(".")),
    ...(params.get("title") ?? "").split(/\s+/).filter((t) => t.includes(".")),
  ];
  for (const token of candidates) {
    const videoId = token && parseYoutubeUrl(token);
    if (videoId) {
      return NextResponse.redirect(
        new URL(`/watch/${videoId}`, request.url),
        307,
      );
    }
  }
  return NextResponse.redirect(new URL("/discover", request.url), 307);
}
