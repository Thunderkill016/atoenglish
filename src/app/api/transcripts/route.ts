import { NextResponse } from "next/server";
import { importYoutubeCaptions } from "@/app/actions/captions";
import type { CaptionActionError } from "@/app/actions/captions";
import { YOUTUBE_VIDEO_ID_RE } from "@/lib/video/youtube-url";

export const runtime = "edge";

/**
 * POST /api/transcripts — extension/importer sync endpoint (mission 006).
 *
 * Body: `{ videoId, payload }` where payload is the raw caption payload the
 * importer captured inside its YouTube session. Everything reuses the
 * server-action pipeline: shape validation, re-segmentation, rate limiting,
 * account-scope persist, plausibility-gated library promotion.
 *
 * Same-origin callers (the app page relaying an extension postMessage) get
 * the session cookie automatically. Cross-site importer calls need cookie
 * credentials or a future bearer token — this endpoint never accepts
 * unauthenticated payloads.
 */
/** Importer payloads are caption tracks — far above this is abuse. */
const MAX_BODY_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "invalid_file" },
      { status: 413 },
    );
  }
  let body: { videoId?: unknown; payload?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_file" },
      { status: 400 },
    );
  }

  const videoId = typeof body.videoId === "string" ? body.videoId : "";
  if (!YOUTUBE_VIDEO_ID_RE.test(videoId)) {
    return NextResponse.json(
      { ok: false, error: "invalid_url" },
      { status: 400 },
    );
  }

  const result = await importYoutubeCaptions(videoId, body.payload);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: statusFor(result.error) },
    );
  }
  return NextResponse.json({
    ok: true,
    videoId,
    sentenceCount: result.sentences.length,
    origin: result.origin,
    saved: result.saved,
  });
}

function statusFor(error: CaptionActionError): number {
  switch (error) {
    case "unauthorized":
      return 401;
    case "rate_limited":
      return 429;
    case "no_captions":
      return 422;
    case "invalid_url":
    case "invalid_file":
      return 400;
    default:
      return 500;
  }
}
