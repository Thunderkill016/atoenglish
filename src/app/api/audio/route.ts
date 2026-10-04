import { type NextRequest, NextResponse } from "next/server";
import { env as cfEnv } from "cloudflare:workers";
import { audioKeyForText, MAX_TTS_TEXT_CHARS } from "@/lib/ai/audio-key";
import { looksEnglish } from "@/lib/speech";

export const runtime = "edge";
export const revalidate = 0;

// Structural subset of the Workers KVNamespace binding this route uses —
// bindings arrive on `env` via cloudflare:workers (object bindings do not
// surface on process.env).
interface AudioKV {
  get(key: string, type: "arrayBuffer"): Promise<ArrayBuffer | null>;
}

/**
 * GET /api/audio?text=...
 * Serves pre-generated Aura-2 speech for fixed curriculum strings from KV
 * (see scripts/tts/generate-audio.ts). 404 → client falls back to
 * browser speechSynthesis, so dynamic/user text is never voiced here.
 */
export async function GET(req: NextRequest) {
  const text = (req.nextUrl.searchParams.get("text") ?? "").trim();
  const kv = (cfEnv as { AUDIO_KV?: AudioKV }).AUDIO_KV;
  if (!kv || !text || text.length > MAX_TTS_TEXT_CHARS || !looksEnglish(text)) {
    return new NextResponse(null, { status: 404 });
  }
  const body = await kv.get(await audioKeyForText(text), "arrayBuffer");
  if (!body) {
    return new NextResponse(null, { status: 404 });
  }
  return new NextResponse(body, {
    headers: {
      "content-type": "audio/mpeg",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
