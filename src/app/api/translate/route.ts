import { NextResponse, type NextRequest } from "next/server";
import { NEON_AUTH_SESSION_COOKIE_NAME } from "@neondatabase/auth/server";
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
import { workersAiBinding } from "@/lib/video/workers-ai-binding";
const MAX_BODY_BYTES = 32_768; // UTF-8 Vietnamese/English plus JSON IDs/context; char budget is checked separately.
const REQUESTS_PER_MINUTE = 30; // Up to 360 short sentences per minute; serial client stops on 429.
const limiter = createRateLimiter(
  REQUESTS_PER_MINUTE,
  60_000,
  "subtitle-translation",
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
  // Reuse the current authenticated AI boundary. No DB queries/writes, no new provider configuration.
  if (!request.cookies.has(NEON_AUTH_SESSION_COOKIE_NAME))
    return error("unauthorized", 401);
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
    config.engine.kind === "workers-ai" &&
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
    if (!user)
      return error(
        authError && authError.status !== 401
          ? "auth_unavailable"
          : "unauthorized",
        authError && authError.status !== 401 ? 503 : 401,
      );
    if (!(await limiter.check(`translate:${user.id}`)).success)
      return error("rate_limited", 429);
    const signal = AbortSignal.any([
      request.signal,
      AbortSignal.timeout(config.engine.timeoutMs),
    ]);
    if (config.engine.kind === "local" || config.engine.kind === "workers-ai") {
      let lines;
      if (config.engine.kind === "local")
        lines = await translateLocally(
          input.data,
          config.endpoint!,
          config.key,
          signal,
        );
      else {
        const ai = await workersAiBinding();
        // Flag on but no binding (e.g. Node dev) — never fall through to Gemini.
        if (!ai) return error("ai_unavailable", 503);
        try {
          lines = await translateWithWorkersAi(input.data, ai, signal);
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
      }
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
    }
    const response = await fetch(geminiGenerateUrl(GEMINI_MODEL, config.key), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: TRANSLATION_SYSTEM_PROMPT }] },
        contents: [
          { role: "user", parts: [{ text: JSON.stringify(input.data) }] },
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
    });
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
    let lines;
    try {
      lines = validateTranslations(JSON.parse(text), input.data.lines);
    } catch {
      return error("invalid_output", 502);
    }
    return NextResponse.json(
      {
        ok: true,
        source: "ai",
        model: GEMINI_MODEL,
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
