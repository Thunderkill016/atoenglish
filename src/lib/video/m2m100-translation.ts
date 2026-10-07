import { z } from "zod";
import { validateTranslations, type TranslationInput } from "./translation";
import { abortable, type WorkersAi } from "./workers-ai-translation";

// Dedicated NMT model on Workers AI (owner spec ATO-TRANSLATE-MOBILE-01):
// purpose-built translation, ~$0.34/1M tokens, synchronous single-call
// per cue — the mobile/no-Translator fallback path.
export const M2M100_TRANSLATION_MODEL = "@cf/meta/m2m100-1.2b";
// Bump when model or language pair changes: cached answers from another
// configuration must never be reused.
export const M2M100_TRANSLATION_PROFILE = "m2m100-1.2b@workers-ai/en-vi-v1";
// The model itself takes one `text` per call, but one HTTP request may carry
// a small batch translated with bounded concurrency — a per-line request
// would drain the guest rate limit before the first playhead window ends.
export const M2M100_TRANSLATION_BATCH_SIZE = 8;
const M2M100_CONCURRENCY = 4;
export const M2M100_TRANSLATION_TIMEOUT_MS = 20_000;
export const M2M100_TRANSLATION_MAX_CHARS = 2000;

const output = z.object({ translated_text: z.string() });

/**
 * m2m100 returns `{translated_text}` — no IDs, no JSON contract — so the
 * cue ID is ours, never the model's. A line that fails or answers empty is
 * a null line (validator drops it; the next run may retry it).
 */
export async function translateWithM2m100(
  input: TranslationInput,
  ai: WorkersAi,
  signal: AbortSignal,
) {
  const results: { i: number; vi: string | null }[] = new Array(
    input.lines.length,
  );
  let next = 0;
  let errored = 0;
  let firstError: unknown;
  async function worker() {
    while (next < input.lines.length) {
      const index = next++;
      const line = input.lines[index];
      try {
        const raw = await abortable(
          ai.run(M2M100_TRANSLATION_MODEL, {
            text: line.text,
            source_lang: "en",
            target_lang: "vi",
          }),
          signal,
        );
        results[index] = {
          i: line.i,
          vi: output.parse(raw).translated_text.trim() || null,
        };
      } catch (cause) {
        if (
          cause instanceof Error &&
          (cause.name === "TimeoutError" || cause.name === "AbortError")
        )
          throw cause;
        // Per-line degradation — one bad cue never sinks the batch…
        errored += 1;
        firstError ??= cause;
        results[index] = { i: line.i, vi: null };
      }
    }
  }
  await Promise.all(Array.from({ length: M2M100_CONCURRENCY }, () => worker()));
  // …but every cue failing means the binding is down, not that the model had
  // nothing to say — surface it so the client can retry instead of marking
  // the batch "done" with all-null output.
  if (errored === input.lines.length) throw firstError;
  return validateTranslations(results, input.lines);
}
