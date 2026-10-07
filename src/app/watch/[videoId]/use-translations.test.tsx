import { act, StrictMode, useEffect } from "react";
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
  automatic = false,
  title,
  videoId,
}: {
  mode?: SubtitleMode;
  model?: ServerTranslationEngine;
  source?: Sentence[];
  activeIndex?: number;
  automatic?: boolean;
  title?: string;
  videoId?: string;
}) {
  const value = useTranslations(
    source,
    "isolated-test",
    1,
    mode,
    activeIndex,
    "en",
    model,
    title,
    { automatic, videoId },
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
  vi.stubGlobal("AtoTranslate", undefined);
  vi.stubGlobal("__atoShellTranslateResult", undefined);
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
  it("hides old context output immediately and never reuses it for another title", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const fetcher = vi.fn(async (_url: string, init: RequestInit) => {
      const input = JSON.parse(init.body as string);
      if (input.title === "Talk B") await gate;
      return new Response(
        JSON.stringify({
          ok: true,
          source: "ai",
          model: engine.model,
          profile: engine.profile,
          version: TRANSLATION_VERSION,
          lines: input.lines.map((line: { i: number }) => ({
            i: line.i,
            vi: "Nghĩa mẫu.",
          })),
        }),
      );
    });
    vi.stubGlobal("fetch", fetcher);
    await act(async () => root.render(<Harness automatic title="Talk A" />));
    await check(() => expect(current.finished).toBe(true));
    expect(fetcher).toHaveBeenCalledTimes(2);
    await act(async () => root.render(<Harness automatic title="Talk B" />));
    expect(current.lines).toEqual({});
    await check(() => expect(fetcher).toHaveBeenCalledTimes(3));
    await act(async () => release());
    await check(() => expect(current.finished).toBe(true));
    expect(fetcher).toHaveBeenCalledTimes(4);
  });
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
    // The preceding cue carries its own Vietnamese so pronouns stay consistent.
    expect(requests[1].before).toEqual([
      { i: 0, text: sentences[0].text, vi: "Nghĩa mẫu." },
    ]);
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
  // No server engine configured → a mid-run failure keeps the device provider
  // and an explicit retry resumes it (the auto-stepdown case is covered in the
  // cross-device suite below).
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
    await act(async () =>
      root.render(<Harness source={source} model={null as never} />),
    );
    await act(async () => current.enableDevice());
    await check(() => expect(translate).toHaveBeenCalledTimes(1));
    await act(async () =>
      root.render(
        <Harness source={source} activeIndex={14} model={null as never} />,
      ),
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
    // Only the playhead window (1 back / 12 ahead of cue 14) is translated;
    // cues 1–12 wait until the learner gets there.
    await check(() =>
      expect(
        Object.keys(current.lines)
          .map(Number)
          .sort((a, b) => a - b),
      ).toEqual([0, 13, 14, 15]),
    );
    expect(current.finished).toBe(false);
    expect(current.busy).toBe(false);
    await act(async () =>
      root.render(
        <Harness source={source} activeIndex={0} model={null as never} />,
      ),
    );
    await check(() => expect(current.finished).toBe(true));
    expect(
      translate.mock.calls.filter(([text]) => text === "Cue 0."),
    ).toHaveLength(1);
    expect(Object.keys(current.lines)).toHaveLength(16);
    expect(cloud).not.toHaveBeenCalled();
  });

  it("shows the channel's own Vietnamese without activation and never re-translates it", async () => {
    const translate = vi.fn((text: string) => Promise.resolve(`Máy: ${text}`));
    vi.stubGlobal("Translator", {
      availability: async () => "available",
      create: async () => ({ translate, destroy: vi.fn() }),
    });
    const source = [
      { ...sentences[0], vi: "Bố tôi đã dạy tôi." },
      sentences[1],
    ];
    await act(async () => root.render(<Harness source={source} />));
    expect(current.lines).toEqual({ 0: "Bố tôi đã dạy tôi." });
    expect(current.humanCount).toBe(1);
    await act(async () => current.enableDevice());
    await check(() => expect(current.finished).toBe(true));
    expect(translate.mock.calls.map(([text]) => text)).toEqual([
      sentences[1].text,
    ]);
    expect(current.lines).toEqual({
      0: "Bố tôi đã dạy tôi.",
      2: `Máy: ${sentences[1].text}`,
    });
  });
});

describe("automatic free preparation", () => {
  it("does not let a late device download override an explicit server choice", async () => {
    let finish!: (value: {
      translate: ReturnType<typeof vi.fn>;
      destroy: ReturnType<typeof vi.fn>;
    }) => void;
    const destroy = vi.fn();
    vi.stubGlobal("Translator", {
      availability: async () => "downloadable",
      create: vi.fn(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      ),
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ ok: false, error: "ai_unavailable" })),
      ),
    );
    await act(async () =>
      root.render(<Harness automatic model={{ ...engine, kind: "gemini" }} />),
    );
    await act(async () => document.dispatchEvent(new Event("pointerdown")));
    await act(async () => current.useServer());
    await act(async () => finish({ translate: vi.fn(), destroy }));
    expect(current.provider).toBe("server");
    expect(current.deviceReady).toBe(false);
    expect(destroy).toHaveBeenCalledTimes(1);
  });
  it("prepares an available device once under StrictMode and translates without a button", async () => {
    const translate = vi.fn(async () => "Nghĩa tự động.");
    const create = vi.fn(async () => ({ translate, destroy: vi.fn() }));
    vi.stubGlobal("Translator", {
      availability: async () => "available",
      create,
    });
    vi.stubGlobal("fetch", vi.fn());
    await act(async () =>
      root.render(
        <StrictMode>
          <Harness automatic model={{ ...engine, kind: "gemini" }} />
        </StrictMode>,
      ),
    );
    await check(() => expect(current.finished).toBe(true));
    expect(create).toHaveBeenCalledTimes(1);
    expect(translate).toHaveBeenCalledTimes(2);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("downloads from an ordinary play gesture, deduplicates setup and never retries a network failure automatically", async () => {
    let reject!: (reason: Error) => void;
    const create = vi.fn(
      () =>
        new Promise<never>((_resolve, fail) => {
          reject = fail;
        }),
    );
    vi.stubGlobal("Translator", {
      availability: async () => "downloadable",
      create,
    });
    vi.stubGlobal("fetch", vi.fn());
    await act(async () =>
      root.render(<Harness automatic model={{ ...engine, kind: "gemini" }} />),
    );
    expect(create).not.toHaveBeenCalled();
    await act(async () => {
      document.dispatchEvent(new Event("pointerdown"));
      document.dispatchEvent(new Event("keydown"));
    });
    expect(create).toHaveBeenCalledTimes(1);
    await act(async () => reject(new Error("fixture network failure")));
    expect(current.setupError).not.toBeNull();
    await act(async () => document.dispatchEvent(new Event("pointerdown")));
    expect(create).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("waits for a real gesture when available-model creation requires activation", async () => {
    const translate = vi.fn(async () => "Nghĩa tự động.");
    const create = vi
      .fn()
      .mockRejectedValueOnce(
        new DOMException("Gesture required", "NotAllowedError"),
      )
      .mockResolvedValue({ translate, destroy: vi.fn() });
    vi.stubGlobal("Translator", {
      availability: async () => "available",
      create,
    });
    await act(async () =>
      root.render(<Harness automatic model={{ ...engine, kind: "gemini" }} />),
    );
    await check(() => expect(current.needsActivation).toBe(true));
    expect(current.setupError).toBeNull();
    expect(create).toHaveBeenCalledTimes(1);
    await act(async () => document.dispatchEvent(new Event("pointerdown")));
    await check(() => expect(current.finished).toBe(true));
    expect(create).toHaveBeenCalledTimes(2);
  });
  it("automatically uses a configured free server without selecting it", async () => {
    const fetcher = vi.fn(async (_url: string, init: RequestInit) => {
      const input = JSON.parse(init.body as string);
      return new Response(
        JSON.stringify({
          ok: true,
          source: "ai",
          model: engine.model,
          profile: engine.profile,
          version: TRANSLATION_VERSION,
          lines: input.lines.map((line: { i: number }) => ({
            i: line.i,
            vi: "Dịch tự động.",
          })),
        }),
      );
    });
    vi.stubGlobal("fetch", fetcher);
    await act(async () => root.render(<Harness automatic />));
    await check(() => expect(current.finished).toBe(true));
    expect(current.provider).toBe("server");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("does not prepare a model for fully translated human captions or English-only display", async () => {
    const create = vi.fn();
    vi.stubGlobal("Translator", {
      availability: async () => "available",
      create,
    });
    const source = sentences.map((s) => ({ ...s, vi: "Bản của kênh." }));
    await act(async () =>
      root.render(
        <Harness
          automatic
          source={source}
          model={{ ...engine, kind: "gemini" }}
        />,
      ),
    );
    await act(async () => document.dispatchEvent(new Event("pointerdown")));
    expect(create).not.toHaveBeenCalled();
    await act(async () =>
      root.render(
        <Harness automatic mode="en" model={{ ...engine, kind: "gemini" }} />,
      ),
    );
    await act(async () => document.dispatchEvent(new Event("pointerdown")));
    expect(create).not.toHaveBeenCalled();
  });
});

describe("native shell translation bridge (mission 007)", () => {
  it("prefers the shell bridge over every other provider and translates without setup", async () => {
    const g = globalThis as typeof globalThis & {
      __atoShellTranslateResult?: (id: number, vi: string | null) => void;
    };
    const translate = vi.fn((id: number, text: string) => {
      setTimeout(() => g.__atoShellTranslateResult?.(id, `Vỏ: ${text}`), 0);
    });
    vi.stubGlobal("AtoTranslate", { translate });
    const cloud = vi.fn();
    vi.stubGlobal("fetch", cloud);
    await act(async () => root.render(<Harness automatic />));
    await check(() => expect(current.finished).toBe(true));
    expect(current.provider).toBe("shell");
    expect(current.deviceReady).toBe(true);
    expect(translate).toHaveBeenCalledTimes(2);
    expect(current.lines).toEqual({
      0: `Vỏ: ${sentences[0].text}`,
      2: `Vỏ: ${sentences[1].text}`,
    });
    // Neither the cloud API nor Chrome's Translator was needed.
    expect(cloud).not.toHaveBeenCalled();
  });

  it("keeps untranslated cues when the bridge answers null", async () => {
    const g = globalThis as typeof globalThis & {
      __atoShellTranslateResult?: (id: number, vi: string | null) => void;
    };
    vi.stubGlobal("AtoTranslate", {
      translate: vi.fn((id: number) => {
        setTimeout(() => g.__atoShellTranslateResult?.(id, null), 0);
      }),
    });
    await act(async () => root.render(<Harness automatic />));
    await check(() => expect(current.finished).toBe(true));
    expect(current.lines).toEqual({});
    expect(current.error).toBeNull();
  });
});

describe("cross-device server fallback (ATO-TRANSLATE-MOBILE-01)", () => {
  const serverReply = (_url: string, init: RequestInit) => {
    const input = JSON.parse(init.body as string);
    return Promise.resolve(
      new Response(
        JSON.stringify({
          ok: true,
          source: "ai",
          model: engine.model,
          profile: engine.profile,
          version: TRANSLATION_VERSION,
          lines: input.lines.map((line: { i: number }) => ({
            i: line.i,
            vi: `SV:${line.i}`,
          })),
        }),
      ),
    );
  };

  it("mobile browser without Translator API falls back to the server engine and sends videoId", async () => {
    const fetcher = vi.fn(serverReply);
    vi.stubGlobal("fetch", fetcher);
    await act(async () =>
      root.render(<Harness automatic videoId="a1b2c3d4e5f" />),
    );
    await check(() => expect(current.finished).toBe(true));
    expect(current.availability).toBe("unavailable");
    expect(current.provider).toBe("server");
    expect(fetcher).toHaveBeenCalledTimes(2);
    const body = JSON.parse(fetcher.mock.calls[0][1].body as string);
    expect(body.videoId).toBe("a1b2c3d4e5f");
    expect(current.lines).toEqual({ 0: "SV:0", 2: "SV:2" });
  });

  it("steps down to the server once when the device translator fails mid-run", async () => {
    const translate = vi
      .fn()
      .mockRejectedValue(new Error("on-device model crashed"));
    vi.stubGlobal("Translator", {
      availability: async () => "available",
      create: async () => ({ translate, destroy: vi.fn() }),
    });
    const fetcher = vi.fn(serverReply);
    vi.stubGlobal("fetch", fetcher);
    await act(async () => root.render(<Harness automatic />));
    await check(() => expect(current.finished).toBe(true));
    expect(current.provider).toBe("server");
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(current.lines).toEqual({ 0: "SV:0", 2: "SV:2" });
    expect(current.error).toBeNull();
  });

  it("reports pending while cues are queued and clears it when finished", async () => {
    let release!: (response: Response) => void;
    const gate = new Promise<Response>((resolve) => {
      release = resolve;
    });
    const fetcher = vi.fn((_url: string, init: RequestInit) =>
      gate.then(() => serverReply(_url, init)),
    );
    vi.stubGlobal("fetch", fetcher);
    await act(async () => root.render(<Harness automatic />));
    await check(() => expect(current.pending).toBe(true));
    expect(current.finished).toBe(false);
    await act(async () => release(new Response("{}")));
    await check(() => expect(current.finished).toBe(true));
    expect(current.pending).toBe(false);
  });

  it("does not spend server budget without activation when translation is not automatic", async () => {
    const fetcher = vi.fn(serverReply);
    vi.stubGlobal("fetch", fetcher);
    await act(async () => root.render(<Harness />)); // automatic: false
    await check(() => expect(current.availability).toBe("unavailable"));
    expect(current.provider).toBe("device");
    expect(fetcher).not.toHaveBeenCalled();
    expect(current.lines).toEqual({});
  });

  it("does not report pending when nothing can deliver a translation", async () => {
    // No Translator, no shell, no server engine — terminal "unavailable".
    await act(async () =>
      root.render(<Harness automatic model={null as never} />),
    );
    await check(() => expect(current.availability).toBe("unavailable"));
    expect(current.provider).toBe("device");
    expect(current.pending).toBe(false);
    expect(current.finished).toBe(false);
  });

  it("translates a 300+ cue video only around the playhead, then jumps on seek", async () => {
    const source = Array.from({ length: 320 }, (_, i) => ({
      i,
      text: `Cue ${i}.`,
      start_ms: i * 2000,
      end_ms: i * 2000 + 1500,
    }));
    const fetcher = vi.fn(serverReply);
    vi.stubGlobal("fetch", fetcher);
    await act(async () => root.render(<Harness automatic source={source} />));
    // Wait for work to actually start before watching it idle — `busy` is
    // false at mount too.
    await check(() => expect(fetcher.mock.calls.length).toBeGreaterThan(0));
    await check(() => expect(current.busy).toBe(false));
    const firstWindowCount = fetcher.mock.calls.length;
    // Bounded around the active window — never the whole transcript at once.
    expect(firstWindowCount).toBeGreaterThan(0);
    expect(firstWindowCount).toBeLessThan(30);
    expect(current.finished).toBe(false);
    await act(async () =>
      root.render(<Harness automatic source={source} activeIndex={200} />),
    );
    await check(() =>
      expect(fetcher.mock.calls.length).toBeGreaterThan(firstWindowCount),
    );
    expect(Object.keys(current.lines).map(Number)).toContain(200);
  });
});
