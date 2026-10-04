import { type NextRequest, NextResponse } from "next/server";
import { audioKeyForText, MAX_TTS_TEXT_CHARS } from "@/lib/ai/audio-key";
import { looksEnglish } from "@/lib/speech";

export const runtime = "edge";
export const revalidate = 0;

// Structural subset of the Workers KVNamespace binding this route uses.
interface AudioKV {
  get(key: string, type: "arrayBuffer"): Promise<ArrayBuffer | null>;
}

/**
 * KV bindings are objects — they surface on `env` via cloudflare:workers,
 * not process.env (which only carries text/serializable bindings). The
 * dynamic import + webpackIgnore keeps `next build` (Workers Builds' build
 * command, plain Node/Turbopack) from trying to resolve the workerd-only
 * specifier; workerd resolves it natively at runtime, Node dev → null →
 * the caller falls back to browser TTS.
 */
async function audioKv(): Promise<AudioKV | null> {
  const mod = (await import(
    /* webpackIgnore: true */ "cloudflare:workers"
  ).catch(() => null)) as { env?: Record<string, unknown> } | null;
  const kv = mod?.env?.AUDIO_KV ?? process.env.AUDIO_KV;
  return (kv as AudioKV) ?? null;
}

/**
 * GET /api/audio?text=...
 * Serves pre-generated Aura-2 speech for fixed curriculum strings from KV
 * (see scripts/tts/generate-audio.ts). 404 → client falls back to
 * browser speechSynthesis, so dynamic/user text is never voiced here.
 */
export async function GET(req: NextRequest) {
  const text = (req.nextUrl.searchParams.get("text") ?? "").trim();
  const kv = await audioKv();
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
