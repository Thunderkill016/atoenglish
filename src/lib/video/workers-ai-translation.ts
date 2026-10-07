import { z } from "zod";
import {
  validateTranslations,
  TRANSLATION_SYSTEM_PROMPT,
  type TranslationInput,
} from "./translation";

// Cloudflare-hosted model reached through the Worker `AI` binding — runs on
// every browser/device because the client only calls /api/translate.
export const WORKERS_AI_TRANSLATION_MODEL = "@cf/google/gemma-4-26b-a4b-it";
// Bump when model, sampling, thinking mode or prompt change: cached answers
// from another configuration must never be reused.
export const WORKERS_AI_TRANSLATION_PROFILE =
  "gemma-4-26b-a4b-it@workers-ai/nothink-t0.2/p1";
// Evaluated configuration (07/10, 30 frozen cases): one cue per call.
export const WORKERS_AI_TRANSLATION_BATCH_SIZE = 1;
// One observed outlier took 37 s of the 30 evaluated calls (p50 ≈ 1.3 s).
export const WORKERS_AI_TRANSLATION_TIMEOUT_MS = 45_000;
export const WORKERS_AI_TRANSLATION_MAX_CHARS = 2000;
const MAX_OUTPUT_TOKENS = 512; // Bounded single-cue generation.
const TEMPERATURE = 0.2; // Low variance for subtitle fidelity; evaluated value.

/** Structural subset of the Workers AI binding this module uses. */
export interface WorkersAi {
  run(model: string, inputs: Record<string, unknown>): Promise<unknown>;
}

const completion = z.union([
  z.object({
    choices: z
      .array(
        z.object({
          finish_reason: z.string().nullable().optional(),
          message: z.object({ content: z.string().nullable() }),
        }),
      )
      .min(1),
  }),
  z.object({ response: z.string() }),
]);

/** Models often wrap JSON in a markdown fence even when told not to. */
function stripFence(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(signal.reason);
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(signal.reason);
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(resolve, reject).finally(() =>
      signal.removeEventListener("abort", onAbort),
    );
  });
}

export async function translateWithWorkersAi(
  input: TranslationInput,
  ai: WorkersAi,
  signal: AbortSignal,
) {
  if (input.lines.length !== WORKERS_AI_TRANSLATION_BATCH_SIZE)
    throw new Error("Workers AI translation requires one source cue");
  const raw = await abortable(
    ai.run(WORKERS_AI_TRANSLATION_MODEL, {
      messages: [
        { role: "system", content: TRANSLATION_SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(input) },
      ],
      max_tokens: MAX_OUTPUT_TOKENS,
      temperature: TEMPERATURE,
      // Thinking mode spends the whole token budget on reasoning (observed).
      chat_template_kwargs: { enable_thinking: false },
    }),
    signal,
  );
  try {
    const parsed = completion.parse(raw);
    let text: string;
    if ("choices" in parsed) {
      const choice = parsed.choices[0];
      if (choice.finish_reason && choice.finish_reason !== "stop")
        throw new Error("Truncated Workers AI translation");
      text = choice.message.content ?? "";
    } else text = parsed.response;
    // IDs are checked against the selected cue; foreign/duplicate IDs throw.
    return validateTranslations(JSON.parse(stripFence(text)), input.lines);
  } catch (cause) {
    throw new WorkersAiOutputError(cause);
  }
}

/** Model answered, but the answer is unusable (shape, truncation, IDs). */
export class WorkersAiOutputError extends Error {
  constructor(cause: unknown) {
    super("Invalid Workers AI translation output", { cause });
    this.name = "WorkersAiOutputError";
  }
}
