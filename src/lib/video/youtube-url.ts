/**
 * YouTube URL intake (SPEC §4.1).
 *
 * Accepted: `youtube.com/watch?v=`, `youtu.be/`, `/shorts/`, `/live/`,
 * `/embed/`, `m.`/`music.` subdomains, plus a bare 11-char video id.
 * Rejected: lookalike hosts (`youtube.com.evil.tld`, `notyoutube.com`),
 * malformed URLs, ids that are not exactly 11 chars of `[A-Za-z0-9_-]`.
 */

export const YOUTUBE_VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;

const YOUTUBE_HOST_RE = /(^|\.)youtube\.com$/i;
const YOUTUBE_NOCOOKIE_RE = /(^|\.)youtube-nocookie\.com$/i;
const YOUTU_BE_RE = /(^|\.)youtu\.be$/i;

/** Extract an 11-char video id from a learner-pasted link or bare id. */
export function parseYoutubeUrl(raw: string): string | null {
  const input = raw.trim();
  if (!input) return null;
  if (YOUTUBE_VIDEO_ID_RE.test(input)) return input;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const host = url.hostname;
  const path = url.pathname;

  if (YOUTU_BE_RE.test(host)) {
    // youtu.be/<id> only — trailing path segments are not a real shortlink.
    const m = path.match(/^\/([A-Za-z0-9_-]{11})\/?$/);
    return m ? m[1] : null;
  }

  if (YOUTUBE_HOST_RE.test(host) || YOUTUBE_NOCOOKIE_RE.test(host)) {
    if (path === "/watch") {
      const id = url.searchParams.get("v") ?? "";
      return YOUTUBE_VIDEO_ID_RE.test(id) ? id : null;
    }
    // /shorts/<id>, /live/<id>, /embed/<id>, /v/<id>
    const m = path.match(/^\/(shorts|live|embed|v)\/([A-Za-z0-9_-]{11})(?:[/?]|$)/);
    if (m) return m[2];
  }

  return null;
}
