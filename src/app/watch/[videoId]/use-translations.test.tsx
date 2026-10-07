import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { webcrypto } from "node:crypto";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { useTranslations } from "./use-translations";
import {
  TRANSLATION_VERSION,
  type ServerTranslationEngine,
  type SubtitleMode,
} from "@/lib/video/translation";
import type { Sentence } from "@/lib/video/types";
const engine: ServerTranslationEngine = {
  kind: "local",
  model: "test-local",
  profile: "test-local@revision-1",
  label: "Test model",
  batchSize: 1,
  maxChars: 2000,
  timeoutMs: 45_000,
};
const sentences: Sentence[] = [
  { i: 0, text: "My father taught me.", start_ms: 0, end_ms: 2000 },
  { i: 2, text: "He is my teacher.", start_ms: 3500, end_ms: 5500 },
];
let root: Root;
let container: HTMLDivElement;
let current: ReturnType<typeof useTranslations>;
function Harness({
  mode = "bilingual",
  model = engine,
  source = sentences,
  activeIndex = 0,
}: {
  mode?: SubtitleMode;
  model?: ServerTranslationEngine;
  source?: Sentence[];
  activeIndex?: number;
}) {
  const value = useTranslations(
    source,
    "isolated-test",
    1,
    mode,
    activeIndex,
    "en",
    model,
  );
  useEffect(() => {
    current = value;
  });
  return null;
}
async function check(assertion: () => void) {
  await vi.waitFor(async () => {
    // Flush the hook's asynchronous fingerprint/fetch state into React before inspecting it.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    assertion();
  });
}
beforeEach(() => {
  vi.stubGlobal("crypto", webcrypto);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("Translator", undefined);
  localStorage.clear();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
describe("server subtitle scheduling and cache", () => {
  it("activates explicitly, sends one cue with neighbors and never reuses a different model revision", async () => {
    // Revision-2 answers wait for an explicit release so the "old revision is
    // hidden immediately" check cannot race with act() flushing the mock.
    let releaseRevision2!: () => void;
    const revision2Gate = new Promise<void>((resolve) => {
      releaseRevision2 = resolve;
    });
    const fetcher = vi.fn(async (_url: string, init: RequestInit) => {
      const input = JSON.parse(init.body as string);
      const profile = currentProfile;
      if (profile !== engine.profile) await revision2Gate;
      return new Response(
        JSON.stringify({
          ok: true,
          source: "ai",
          model: engine.model,
          profile: currentProfile,
          version: TRANSLATION_VERSION,
          lines: [{ i: input.lines[0].i, vi: "Nghĩa mẫu." }],
        }),
      );
    });
    let currentProfile = engine.profile;
    vi.stubGlobal("fetch", fetcher);
    await act(async () => root.render(<Harness />));
    expect(fetcher).not.toHaveBeenCalled();
    await act(async () => current.useServer());
    await check(() => expect(current.finished).toBe(true));
    expect(current.lines).toEqual({ 0: "Nghĩa mẫu.", 2: "Nghĩa mẫu." });
    expect(fetcher).toHaveBeenCalledTimes(2);
    const requests = fetcher.mock.calls.map(([, init]) =>
      JSON.parse(init.body as string),
    );
    expect(requests[0].lines.map((line: { i: number }) => line.i)).toEqual([0]);
    expect(requests[0].after).toEqual([{ i: 2, text: sentences[1].text }]);
    expect(requests[1].before).toEqual([{ i: 0, text: sentences[0].text }]);
    expect(sentences[1].start_ms).toBe(3500);
    await act(async () => root.render(<Harness mode="en" />));
    await act(async () => root.render(<Harness />));
    await check(() => expect(current.finished).toBe(true));
    expect(fetcher).toHaveBeenCalledTimes(2);
    currentProfile = "test-local@revision-2";
    await act(async () =>
      root.render(<Harness model={{ ...engine, profile: currentProfile }} />),
    );
    expect(current.lines).toEqual({});
    // Old revision is hidden while its replacement is in flight; release it
    // now so the revision-2 fetches can finish.
    await act(async () => releaseRevision2());
    await check(() => expect(current.finished).toBe(true));
    expect(fetcher).toHaveBeenCalledTimes(4);
  });
  it("cancels a pending server request when English-only is selected", async () => {
    let signal: AbortSignal;
    const fetcher = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          signal = init.signal as AbortSignal;
          signal.addEventListener(
            "abort",
            () => reject(new DOMException("Cancelled", "AbortError")),
            { once: true },
          );
        }),
    );
    vi.stubGlobal("fetch", fetcher);
    await act(async () => root.render(<Harness />));
    await act(async () => current.useServer());
    await check(() => expect(fetcher).toHaveBeenCalledTimes(1));
    await act(async () => root.render(<Harness mode="en" />));
    expect(signal!.aborted).toBe(true);
    expect(current.lines).toEqual({});
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("rejects provenance from another model instead of publishing or caching its text", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          source: "ai",
          model: "wrong",
          profile: engine.profile,
          version: TRANSLATION_VERSION,
          lines: [{ i: 0, vi: "Sai bộ dịch." }],
        }),
      ),
    );
    vi.stubGlobal("fetch", fetcher);
    await act(async () => root.render(<Harness />));
    await act(async () => current.useServer());
    await check(() => expect(current.error).toContain("Chưa dịch được phụ đề"));
    expect(current.lines).toEqual({});
    expect(localStorage.length).toBe(0);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

describe("device translation scheduling", () => {
  it("rechecks playback after each cue, persists partial success and resumes from it after failure", async () => {
    const source = Array.from({ length: 16 }, (_, i) => ({
      i,
      text: `Cue ${i}.`,
      start_ms: i * 1000,
      end_ms: i * 1000 + 900,
    }));
    let finishFirst!: (text: string) => void;
    let failActive = true;
    const translate = vi.fn((text: string) => {
      if (text === "Cue 0.")
        return new Promise<string>((resolve) => {
          finishFirst = resolve;
        });
      if (text === "Cue 14." && failActive)
        return Promise.reject(new Error("test-only local failure"));
      return Promise.resolve(`Bản dịch ${text}`);
    });
    vi.stubGlobal("Translator", {
      availability: async () => "available",
      create: async () => ({ translate, destroy: vi.fn() }),
    });
    const cloud = vi.fn();
    vi.stubGlobal("fetch", cloud);
    await act(async () => root.render(<Harness source={source} />));
    await act(async () => current.enableDevice());
    await check(() => expect(translate).toHaveBeenCalledTimes(1));
    await act(async () =>
      root.render(<Harness source={source} activeIndex={14} />),
    );
    await act(async () => finishFirst("Câu số không."));
    await check(() => expect(current.error).not.toBeNull());
    expect(translate.mock.calls.map(([text]) => text)).toEqual([
      "Cue 0.",
      "Cue 14.",
    ]);
    expect(current.lines[0]).toBe("Câu số không.");
    expect(
      JSON.parse(
        localStorage.getItem("atoenglish.subtitle-vi.v1:isolated-test")!,
      )[0].lines,
    ).toEqual([{ i: 0, vi: "Câu số không." }]);
    failActive = false;
    await act(async () => current.retry());
    await check(() => expect(current.finished).toBe(true));
    expect(
      translate.mock.calls.filter(([text]) => text === "Cue 0."),
    ).toHaveLength(1);
    expect(Object.keys(current.lines)).toHaveLength(16);
    expect(cloud).not.toHaveBeenCalled();
  });
});
