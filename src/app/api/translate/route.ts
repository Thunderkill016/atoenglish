import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GEMINI_MODEL, geminiGenerateUrl } from "@/lib/ai/gemini";
import { createRateLimiter } from "@/lib/security/rate-limit";
import {
  translationInput,
  contextChars,
  validateTranslations,
  TRANSLATION_SYSTEM_PROMPT,
  TRANSLATION_VERSION,
  TRANSLATION_BATCH_SIZE,
} from "@/lib/video/translation";
import {
  serverTranslationConfig,
  translateLocally,
  localTranslationPrompt,
} from "@/lib/video/local-translation";
import {
  translateWithWorkersAi,
  WorkersAiOutputError,
} from "@/lib/video/workers-ai-translation";
import { translateWithM2m100 } from "@/lib/video/m2m100-translation";
import { workersAiBinding } from "@/lib/video/workers-ai-binding";
import {
  readTranslationCache,
  writeTranslationCache,
} from "@/lib/video/translation-cache";
const MAX_BODY_BYTES = 32_768; // UTF-8 Vietnamese/English plus JSON IDs/context; char budget is checked separately.
const REQUESTS_PER_MINUTE = 30; // Up to 360 short sentences per minute; serial client stops on 429.
const GUEST_REQUESTS_PER_MINUTE = 10; // Unauthenticated fallback (mission 008): mobile browsers have no Translator API — keep the door open but narrow.
const limiter = createRateLimiter(
  REQUESTS_PER_MINUTE,
  60_000,
  "subtitle-translation",
);
const guestLimiter = createRateLimiter(
  GUEST_REQUESTS_PER_MINUTE,
  60_000,
  "subtitle-translation-guest",
);
function error(code: string, status: number) {
  return NextResponse.json(
    { ok: false, error: code },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...(status === 429 ? { "Retry-After": "60" } : {}),
      },
    },
  );
}
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host") ?? request.nextUrl.host;
  if (origin && origin !== `${request.nextUrl.protocol}//${host}`)
    return error("forbidden", 403);
  let raw: unknown;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > MAX_BODY_BYTES)
      return error("invalid_input", 413);
    raw = JSON.parse(text);
  } catch {
    return error("invalid_input", 400);
  }
  const input = translationInput.safeParse(raw);
  if (!input.success) return error("invalid_input", 400);
  const config = serverTranslationConfig();
  if (!config) return error("ai_unavailable", 503);
  if (config.engine.kind === "local") {
    try {
      localTranslationPrompt(input.data);
    } catch {
      return error("invalid_input", 400);
    }
  }
  if (
    (config.engine.kind === "workers-ai" ||
      config.engine.kind === "workers-ai-mt") &&
    (input.data.lines.length > config.engine.batchSize ||
      contextChars(input.data) > config.engine.maxChars)
  )
    return error("invalid_input", 400);
  try {
    const client = await createClient();
    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();
    // Guest fallback (mission 008): no Translator API exists on mobile, so
    // the server path must not require a session. Guests get a narrower
    // per-IP budget; a missing/invalid session is still distinguishable
    // from an auth outage.
    if (!user && authError && ![400, 401].includes(authError.status ?? 0))
      return error("auth_unavailable", 503);
    if (user) {
      if (!(await limiter.check(`translate:${user.id}`)).success)
        return error("rate_limited", 429);
    } else {
      const ip =
        request.headers.get("cf-connecting-ip") ??
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown";
      if (!(await guestLimiter.check(`translate:guest:${ip}`)).success)
        return error("rate_limited", 429);
    }
    const signal = AbortSignal.any([
      request.signal,
      AbortSignal.timeout(config.engine.timeoutMs),
    ]);
    // Per-account persisted cache (mission 008): read-through before any AI
    // spend, write-through after. Guests have no DB row space — localStorage
    // remains their cache.
    const videoId = input.data.videoId;
    const cached =
      user && videoId
        ? await readTranslationCache(
            client,
            videoId,
            config.engine.profile,
            input.data.lines,
          )
        : new Map<number, string>();
    const missing = input.data.lines.filter((line) => !cached.has(line.i));
    let fresh: { i: number; vi: string | null }[] = [];
    if (missing.length) {
      const work = { ...input.data, lines: missing };
      if (config.engine.kind === "local") {
        fresh = await translateLocally(
          work,
          config.endpoint!,
          config.key,
          signal,
        );
      } else if (
        config.engine.kind === "workers-ai" ||
        config.engine.kind === "workers-ai-mt"
      ) {
        const ai = await workersAiBinding();
        // Flag on but no binding (e.g. Node dev) — never fall through to Gemini.
        if (!ai) return error("ai_unavailable", 503);
        try {
          fresh =
            config.engine.kind === "workers-ai-mt"
              ? await translateWithM2m100(work, ai, signal)
              : await translateWithWorkersAi(work, ai, signal);
        } catch (cause) {
          if (
            cause instanceof Error &&
            (cause.name === "TimeoutError" || cause.name === "AbortError")
          )
            throw cause;
          return error(
            cause instanceof WorkersAiOutputError
              ? "invalid_output"
              : "ai_failed",
            502,
          );
        }
      } else {
        const response = await fetch(
          geminiGenerateUrl(GEMINI_MODEL, config.key),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal,
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: TRANSLATION_SYSTEM_PROMPT }],
              },
              contents: [
                { role: "user", parts: [{ text: JSON.stringify(work) }] },
              ],
              generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: "ARRAY",
                  maxItems: TRANSLATION_BATCH_SIZE,
                  items: {
                    type: "OBJECT",
                    properties: {
                      i: { type: "INTEGER" },
                      vi: { type: "STRING", nullable: true },
                    },
                    required: ["i", "vi"],
                  },
                },
              },
            }),
          },
        );
        if (!response.ok)
          return error(
            response.status === 429 ? "rate_limited" : "ai_failed",
            response.status === 429 ? 429 : 502,
          );
        const payload = await response.json();
        const candidate = payload.candidates?.[0];
        if (candidate?.finishReason && candidate.finishReason !== "STOP")
          return error("ai_failed", 502);
        const text = candidate?.content?.parts
          ?.filter((part: { thought?: boolean }) => !part.thought)
          .map((part: { text?: string }) => part.text ?? "")
          .join("");
        if (!text) return error("ai_failed", 502);
        try {
          fresh = validateTranslations(JSON.parse(text), work.lines);
        } catch {
          return error("invalid_output", 502);
        }
      }
      // Best-effort write-through — a cache failure never fails the request.
      if (user && videoId)
        await writeTranslationCache(
          client,
          user.id,
          videoId,
          config.engine.profile,
          missing,
          fresh,
        ).catch(() => {});
    }
    const lines = validateTranslations(
      [...[...cached.entries()].map(([i, vi]) => ({ i, vi })), ...fresh],
      input.data.lines,
    );
    return NextResponse.json(
      {
        ok: true,
        source: "ai",
        model: config.engine.model,
        profile: config.engine.profile,
        version: TRANSLATION_VERSION,
        lines,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (cause) {
    if (
      cause instanceof Error &&
      (cause.name === "TimeoutError" || cause.name === "AbortError")
    )
      return error("timeout", 504);
    return error("ai_failed", 502);
  }
}
