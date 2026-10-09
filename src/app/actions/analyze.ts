"use server";

import { z } from "zod";

import { GEMINI_MODEL, geminiGenerateUrl } from "@/lib/ai/gemini";
import {
  hashAiInput,
  sentenceAnalysisSchema,
  type SentenceAnalysis,
} from "@/lib/ai/sentence-analysis";
import { createRateLimiter } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

// ─── B2: sentence analysis (SPEC §5.3) ────────────────────────────────────────
// "Phân tích" on a sentence → Gemini returns a strict JSON shape: natural VI
// translation, sentence structure, 1–3 phrases worth learning, one grammar
// point. Results cache in ai_results keyed by (user, kind, sha256 input,
// model) so re-asking the same sentence never calls the model twice. The raw
// sentence is the only thing sent upstream (minimum payload §13); the hash —
// not the text — is what persists.
//
// Same trust rules as every AI surface: the reply carries an "AI" label in
// the UI, a failure surfaces a notice, and nothing here blocks watching or
// saving.

const ANALYSIS_KIND = "sentence_analysis";
const GEMINI_TIMEOUT_MS = 20_000;

const inputSchema = z.object({
  sentence: z.string().trim().min(1).max(2000),
});

export type { SentenceAnalysis };

export type AnalyzeResult =
  | { ok: true; analysis: SentenceAnalysis; cached: boolean }
  | {
      ok: false;
      error: "invalid_input" | "unauthorized" | "rate_limited" | "unavailable";
    };

// Each cache miss is a paid call — same 10/min ceiling as write_reuse
// feedback. Cache hits skip the limiter: replaying an answer costs nothing.
const analyzeLimiter = createRateLimiter(10, 60_000, "sentence-analysis");

export async function analyzeSentence(raw: unknown): Promise<AnalyzeResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const sentence = parsed.data.sentence.replace(/\s+/g, " ").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const inputHash = await hashAiInput(sentence);
  const { data: cached } = await supabase
    .from("ai_results")
    .select("output")
    .eq("user_id", user.id)
    .eq("kind", ANALYSIS_KIND)
    .eq("input_hash", inputHash)
    .eq("model", GEMINI_MODEL)
    .maybeSingle();
  if (cached?.output) {
    const cachedAnalysis = sentenceAnalysisSchema.safeParse(cached.output);
    if (cachedAnalysis.success)
      return { ok: true, analysis: cachedAnalysis.data, cached: true };
    // A stale/unparseable cache row (e.g. schema evolved) falls through to a
    // fresh call.
  }

  if (!(await analyzeLimiter.check(`analyze:${user.id}`)).success)
    return { ok: false, error: "rate_limited" };

  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false, error: "unavailable" };

  let analysis: SentenceAnalysis;
  try {
    const response = await fetch(geminiGenerateUrl(GEMINI_MODEL, key), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: "You are an English grammar tutor for Vietnamese learners. Analyze the given English sentence and reply ONLY with JSON matching the schema: translation_vi (natural Vietnamese translation), structure (subject, main_verb, clauses — short Vietnamese or quoted English labels), phrases (1–3 English phrases worth learning, each with meaning_vi in Vietnamese), grammar_point (one key grammar note in Vietnamese, ≤2 sentences).",
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: JSON.stringify({ sentence }) }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              translation_vi: { type: "STRING" },
              structure: {
                type: "OBJECT",
                properties: {
                  subject: { type: "STRING" },
                  main_verb: { type: "STRING" },
                  clauses: { type: "ARRAY", items: { type: "STRING" } },
                },
                required: ["subject", "main_verb", "clauses"],
              },
              phrases: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    text: { type: "STRING" },
                    meaning_vi: { type: "STRING" },
                  },
                  required: ["text", "meaning_vi"],
                },
              },
              grammar_point: { type: "STRING" },
            },
            required: [
              "translation_vi",
              "structure",
              "phrases",
              "grammar_point",
            ],
          },
        },
      }),
    });
    if (!response.ok)
      return {
        ok: false,
        error: response.status === 429 ? "rate_limited" : "unavailable",
      };
    const payload = await response.json();
    const candidate = payload.candidates?.[0];
    if (candidate?.finishReason && candidate.finishReason !== "STOP")
      return { ok: false, error: "unavailable" };
    const text = candidate?.content?.parts
      ?.filter((part: { thought?: boolean }) => !part.thought)
      .map((part: { text?: string }) => part.text ?? "")
      .join("");
    if (!text) return { ok: false, error: "unavailable" };
    const generated = sentenceAnalysisSchema.safeParse(JSON.parse(text));
    if (!generated.success) return { ok: false, error: "unavailable" };
    analysis = generated.data;
  } catch {
    return { ok: false, error: "unavailable" };
  }

  // Cache for the next ask. A concurrent first-analyze of the same sentence
  // loses the insert race — the result is identical anyway, so the conflict
  // is harmless to ignore.
  await supabase.from("ai_results").insert({
    user_id: user.id,
    kind: ANALYSIS_KIND,
    input_hash: inputHash,
    model: GEMINI_MODEL,
    output: analysis,
  });
  return { ok: true, analysis, cached: false };
}
