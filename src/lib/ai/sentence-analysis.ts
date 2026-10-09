import { z } from "zod";

/** Output contract for the "Phân tích" sentence analysis (SPEC §5.3). Shared
 * between the server action (validation + cache write) and the client
 * (rendering) — kept out of the "use server" module, which may only export
 * async functions. */
const phraseSchema = z.object({
  text: z.string().trim().min(1).max(200),
  meaning_vi: z.string().trim().min(1).max(500),
});

export const sentenceAnalysisSchema = z.object({
  translation_vi: z.string().trim().min(1).max(2000),
  structure: z.object({
    subject: z.string().trim().min(1).max(500),
    main_verb: z.string().trim().min(1).max(200),
    clauses: z.array(z.string().trim().min(1).max(500)).max(5),
  }),
  phrases: z.array(phraseSchema).min(1).max(3),
  grammar_point: z.string().trim().min(1).max(1000),
});

export type SentenceAnalysis = z.infer<typeof sentenceAnalysisSchema>;

/** sha256 hex of the normalized input — the ai_results cache key (the raw
 * sentence itself is never persisted). */
export async function hashAiInput(text: string): Promise<string> {
  const normalized = text.replace(/\s+/g, " ").trim();
  const bytes = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
