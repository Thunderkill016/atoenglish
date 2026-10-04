import { describe, expect, it } from "vitest";

import {
  audioKeyForText,
  AUDIO_KEY_PREFIX,
  MAX_TTS_TEXT_CHARS,
} from "./audio-key";

describe("audioKeyForText", () => {
  it("is deterministic and carries the model prefix", async () => {
    const a = await audioKeyForText("Good morning!");
    const b = await audioKeyForText("Good morning!");
    expect(a).toBe(b);
    expect(a).toMatch(new RegExp(`^${AUDIO_KEY_PREFIX}/[0-9a-f]{64}$`));
  });

  it("normalizes surrounding whitespace the same on both sides", async () => {
    // The route trims query input; the generator trims corpus strings —
    // both must land on one key or every asset would 404.
    expect(await audioKeyForText("  Hello.  ")).toBe(
      await audioKeyForText("Hello."),
    );
  });

  it("distinguishes near-identical strings", async () => {
    expect(await audioKeyForText("Hello.")).not.toBe(
      await audioKeyForText("Hello!"),
    );
  });

  it("caps text length so the KV corpus stays bounded", () => {
    expect(MAX_TTS_TEXT_CHARS).toBeGreaterThanOrEqual(400);
    expect(MAX_TTS_TEXT_CHARS).toBeLessThanOrEqual(1000);
  });
});
