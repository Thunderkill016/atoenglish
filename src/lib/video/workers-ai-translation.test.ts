import { afterEach, describe, expect, it, vi } from "vitest";
import {
  translateWithWorkersAi,
  WorkersAiOutputError,
  WORKERS_AI_TRANSLATION_MODEL,
  WORKERS_AI_TRANSLATION_PROFILE,
} from "./workers-ai-translation";
import { serverTranslationConfig } from "./local-translation";
import { TRANSLATION_SYSTEM_PROMPT } from "./translation";

const input = {
  language: "vi" as const,
  lines: [{ i: 7, text: "He is my teacher." }],
  before: [{ i: 6, text: "My father taught me to play the accordion." }],
  after: [],
};
// Shape returned by Workers AI for Gemma 4 (observed via REST 07/10).
function reply(content: string | null, finish = "stop") {
  return {
    choices: [{ finish_reason: finish, message: { content } }],
  };
}
function ai(result: unknown) {
  return { run: vi.fn().mockResolvedValue(result) };
}

afterEach(() => vi.unstubAllEnvs());

describe("Workers AI subtitle translation", () => {
  it("is selected only by its own flag and exposes no secrets", () => {
    vi.stubEnv("SUBTITLE_LOCAL_ENABLED", "false");
    vi.stubEnv("SUBTITLE_GEMINI_ENABLED", "false");
    vi.stubEnv("SUBTITLE_WORKERS_AI_ENABLED", "false");
    expect(serverTranslationConfig()).toBeNull();
    vi.stubEnv("SUBTITLE_WORKERS_AI_ENABLED", "true");
    expect(serverTranslationConfig()?.engine).toMatchObject({
      kind: "workers-ai",
      model: WORKERS_AI_TRANSLATION_MODEL,
      profile: WORKERS_AI_TRANSLATION_PROFILE,
      batchSize: 1,
    });
  });

  it("sends the shared prompt with context, thinking off, and strips a JSON fence", async () => {
    const binding = ai(
      reply('```json\n[{"i": 7, "vi": "Ông ấy là thầy của tôi."}]\n```'),
    );
    expect(
      await translateWithWorkersAi(input, binding, new AbortController().signal),
    ).toEqual([{ i: 7, vi: "Ông ấy là thầy của tôi." }]);
    const [model, body] = binding.run.mock.calls[0];
    expect(model).toBe(WORKERS_AI_TRANSLATION_MODEL);
    expect(body.messages[0].content).toBe(TRANSLATION_SYSTEM_PROMPT);
    expect(JSON.parse(body.messages[1].content)).toEqual(input);
    expect(body.chat_template_kwargs).toEqual({ enable_thinking: false });
  });

  it.each([
    ["foreign ID", reply('[{"i": 99, "vi": "Sai"}]')],
    ["truncated", reply('[{"i": 7, "vi": "Một phần"}]', "length")],
    ["not JSON", reply("Ông ấy là thầy của tôi.")],
    ["empty", reply(null)],
    ["unknown shape", { output: "x" }],
  ])("rejects %s output as WorkersAiOutputError", async (_, result) => {
    await expect(
      translateWithWorkersAi(input, ai(result), new AbortController().signal),
    ).rejects.toBeInstanceOf(WorkersAiOutputError);
  });

  it("refuses multi-cue batches before calling the model", async () => {
    const binding = ai(reply("[]"));
    await expect(
      translateWithWorkersAi(
        { ...input, lines: [...input.lines, { i: 8, text: "Hi." }] },
        binding,
        new AbortController().signal,
      ),
    ).rejects.toThrow();
    expect(binding.run).not.toHaveBeenCalled();
  });

  it("stops waiting when the request is cancelled", async () => {
    const binding = { run: vi.fn(() => new Promise(() => {})) };
    const controller = new AbortController();
    const pending = translateWithWorkersAi(input, binding, controller.signal);
    controller.abort(new DOMException("Cancelled", "AbortError"));
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });
});
