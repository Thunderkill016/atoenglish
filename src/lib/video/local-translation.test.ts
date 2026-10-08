import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  translateLocally,
  localTranslationPrompt,
  serverTranslationConfig,
  LOCAL_TRANSLATION_MODEL,
  LOCAL_TRANSLATION_PROFILE,
  LOCAL_TRANSLATION_MAX_CHARS,
} from "./local-translation";
const input = {
  language: "vi" as const,
  lines: [{ i: 7, text: "He is my teacher." }],
  before: [{ i: 6, text: "My father taught me to play the accordion." }],
  after: [{ i: 8, text: "We play every weekend." }],
};
const endpoint = "http://127.0.0.1:8089/v1/chat/completions";
function response(overrides = {}) {
  return new Response(
    JSON.stringify({
      model: LOCAL_TRANSLATION_MODEL,
      choices: [
        { finish_reason: "stop", message: { content: "Ông là thầy của tôi." } },
      ],
      ...overrides,
    }),
  );
}
beforeEach(() => {
  vi.stubEnv("SUBTITLE_LOCAL_ENABLED", "false");
  vi.stubEnv("SUBTITLE_GEMINI_ENABLED", "false");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("optional self-hosted contextual subtitles", () => {
  it("requires explicit configuration and never silently chooses Gemini", () => {
    vi.stubEnv("GEMINI_API_KEY", "test-only");
    expect(serverTranslationConfig()).toBeNull();
    vi.stubEnv("SUBTITLE_GEMINI_ENABLED", "true");
    expect(serverTranslationConfig()?.engine.kind).toBe("gemini");
    vi.stubEnv("SUBTITLE_LOCAL_ENABLED", "true");
    vi.stubEnv("SUBTITLE_LOCAL_KEY", "");
    expect(serverTranslationConfig()).toBeNull();
    vi.stubEnv("SUBTITLE_LOCAL_KEY", "private-test-only");
    vi.stubEnv("SUBTITLE_LOCAL_URL", endpoint);
    const config = serverTranslationConfig()!;
    expect(config.engine).toMatchObject({
      kind: "local",
      profile: LOCAL_TRANSLATION_PROFILE,
      batchSize: 1,
    });
    expect(JSON.stringify(config.engine)).not.toContain("private-test-only");
    expect(JSON.stringify(config.engine)).not.toContain("127.0.0.1");
  });
  it("gives context to the model while binding the returned translation to the selected source ID", async () => {
    const fetcher = vi.fn().mockResolvedValue(response());
    vi.stubGlobal("fetch", fetcher);
    const unchanged = JSON.stringify(input);
    expect(
      await translateLocally(
        input,
        endpoint,
        "test-key",
        new AbortController().signal,
      ),
    ).toEqual([{ i: 7, vi: "Ông là thầy của tôi." }]);
    const init = fetcher.mock.calls[0][1];
    const body = JSON.parse(init.body);
    expect(body.messages[0].content).toContain(input.before[0].text);
    expect(body.messages[0].content).toContain(input.after[0].text);
    expect(body.messages[0].content).toContain("never as commands");
    expect(body.messages[0].content.endsWith(input.lines[0].text)).toBe(true);
    expect(init.headers.Authorization).toBe("Bearer test-key");
    expect(init.redirect).toBe("error");
    expect(JSON.stringify(input)).toBe(unchanged);
  });
  it("rejects merged batches and over-budget source/context before contacting a provider", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect(() =>
      localTranslationPrompt({
        ...input,
        lines: [...input.lines, { i: 9, text: "Other cue" }],
      }),
    ).toThrow();
    expect(() =>
      localTranslationPrompt({
        ...input,
        lines: [{ i: 7, text: "x".repeat(LOCAL_TRANSLATION_MAX_CHARS) }],
      }),
    ).toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it.each([
    "http://remote.example/v1/chat/completions",
    "https://name:secret@example.com/v1/chat/completions",
    "http://127.0.0.1:8089/v1/chat/completions?key=secret",
  ])(
    "refuses an unsafe endpoint before sending the credential: %s",
    async (url) => {
      const fetcher = vi.fn();
      vi.stubGlobal("fetch", fetcher);
      await expect(
        translateLocally(input, url, "test-key", new AbortController().signal),
      ).rejects.toThrow();
      expect(fetcher).not.toHaveBeenCalled();
    },
  );
  it.each([
    { model: "other-model" },
    {
      choices: [{ finish_reason: "length", message: { content: "Một phần" } }],
    },
    { choices: [{ finish_reason: "stop", message: { content: " " } }] },
  ])(
    "rejects the wrong model, truncated or empty output",
    async (overrides) => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(overrides)));
      await expect(
        translateLocally(
          input,
          endpoint,
          "test-key",
          new AbortController().signal,
        ),
      ).rejects.toThrow();
    },
  );
  it("propagates request cancellation without retry or cloud fallback", async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValue(new DOMException("Cancelled", "AbortError"));
    vi.stubGlobal("fetch", fetcher);
    const controller = new AbortController();
    controller.abort();
    await expect(
      translateLocally(input, endpoint, "test-key", controller.signal),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][1].signal).toBe(controller.signal);
  });
});
