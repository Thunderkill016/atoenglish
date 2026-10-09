import { act, StrictMode, type ComponentProps } from "react";
import { TranscriptRail } from "./transcript-rail";
import { createRoot, type Root } from "react-dom/client";
import { webcrypto } from "node:crypto";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { WatchClient } from "./watch-client";
import type {
  CaptionActionResult,
  LoadedTranscript,
} from "@/app/actions/captions";
const actions = vi.hoisted(() => ({
  fetchVideoCaptions: vi.fn(),
  importYoutubeCaptions: vi.fn(),
  saveLearnerTranscript: vi.fn(),
  saveWatchPosition: vi.fn(),
}));
vi.mock("@/app/actions/captions", () => actions);
const studyActions = vi.hoisted(() => ({
  getSavedWordStates: vi.fn(async () => ({ ok: true as const, states: [] })),
  saveStudyItem: vi.fn(async () => ({ ok: true as const, card_id: 1 })),
}));
vi.mock("@/app/actions/study", () => studyActions);
const analyzeActions = vi.hoisted(() => ({
  analyzeSentence: vi.fn(),
}));
vi.mock("@/app/actions/analyze", () => analyzeActions);
const reviewActions = vi.hoisted(() => ({
  recordPracticeAttempt: vi.fn(async () => ({
    ok: true as const,
    attempt_id: 1,
    due: null,
    state: null,
  })),
}));
vi.mock("@/app/actions/review", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/app/actions/review")>()),
  recordPracticeAttempt: reviewActions.recordPracticeAttempt,
}));
const frameRef = vi.hoisted(() => {
  const fixture = { current: null as HTMLDivElement | null };
  // The mocked player owns an independent iframe; React's anchor assignment
  // must not replace it as it would in the real useYouTubePlayer hook.
  const anchor = {
    get current() {
      return fixture.current;
    },
    set current(_value: HTMLDivElement | null) {},
  };
  return { fixture, anchor };
});
const clock = vi.hoisted(() => ({
  nowMs: 0,
  durationMs: 60_000,
  playing: false,
  rate: 1,
  state: "paused" as "paused" | "playing" | "ended",
}));
const player = vi.hoisted(() => ({
  play: vi.fn(),
  pause: vi.fn(),
  seekToMs: vi.fn(),
  setRate: vi.fn(),
  readClock: vi.fn(() => ({ ...clock })),
}));
vi.mock("@/lib/video/use-youtube-player", () => ({
  useYouTubePlayer: () => ({
    ...player,
    ...clock,
    ready: true,
    availableRates: [0.5, 0.75, 1, 1.25],
    containerRef: frameRef.anchor,
    loadError: null,
  }),
}));
const transcript: LoadedTranscript = {
  sentences: [{ i: 0, text: "I work here.", start_ms: 0, end_ms: 3000 }],
  language: "en",
  origin: "youtube_manual",
  trackKind: "manual",
  saved: false,
};
let root: Root;
let container: HTMLDivElement;
function render(initial: LoadedTranscript | null = null, loggedIn = false) {
  return root.render(
    <StrictMode>
      <WatchClient
        videoId="dQw4w9WgXcQ"
        initial={initial}
        loggedIn={loggedIn}
        initialPositionMs={null}
      />
    </StrictMode>,
  );
}
async function check(assertion: () => void) {
  await vi.waitFor(async () => {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    assertion();
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  player.play.mockReset();
  player.pause.mockReset();
  player.seekToMs.mockReset();
  Object.assign(clock, {
    nowMs: 0,
    durationMs: 60_000,
    playing: false,
    rate: 1,
    state: "paused",
  });
  actions.saveWatchPosition.mockResolvedValue({ ok: true });
  vi.stubGlobal("matchMedia", () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  frameRef.fixture.current = null;
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("crypto", webcrypto);
  vi.stubGlobal("Translator", undefined);
  localStorage.clear();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  frameRef.fixture.current?.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
describe("opening a video automatically", () => {
  it("fetches once under StrictMode, translates and shows vocabulary without clicking or autoplay", async () => {
    actions.fetchVideoCaptions.mockResolvedValue({ ok: true, ...transcript });
    const translate = vi.fn(async () => "Tôi làm việc ở đây.");
    vi.stubGlobal("Translator", {
      availability: async () => "available",
      create: async () => ({ translate, destroy: vi.fn() }),
    });
    await act(async () => render());
    await check(() =>
      expect(
        container.querySelector('[data-testid="translated-sentence"]'),
      ).toHaveTextContent("Tôi làm việc ở đây."),
    );
    expect(actions.fetchVideoCaptions).toHaveBeenCalledTimes(1);
    expect(
      container.querySelector('select[aria-label="Hiển thị phụ đề"]'),
    ).toHaveValue("bilingual");
    expect(
      container.querySelector('[data-testid="automatic-vocabulary"]'),
    ).toHaveTextContent("làm việc / công việc");
    expect(translate).toHaveBeenCalledTimes(1);
    expect(player.play).not.toHaveBeenCalled();
    expect(actions.saveLearnerTranscript).not.toHaveBeenCalled();
    expect(container.textContent).not.toContain("Thử dịch nhanh miễn phí");
  });
  it("uses initial captions and human Vietnamese without fetching or preparing a model", async () => {
    const create = vi.fn();
    vi.stubGlobal("Translator", {
      availability: async () => "available",
      create,
    });
    await act(async () =>
      render({
        ...transcript,
        sentences: [{ ...transcript.sentences[0], vi: "Tôi làm việc ở đây." }],
      }),
    );
    expect(actions.fetchVideoCaptions).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(
      container.querySelector('[data-testid="translated-sentence"]'),
    ).toHaveTextContent("Tôi làm việc ở đây.");
  });

  it("shows a stale transcript immediately, then silently upgrades it", async () => {
    const fresh: LoadedTranscript = {
      ...transcript,
      sentences: [{ i: 0, text: "Fresh sentence.", start_ms: 0, end_ms: 2000 }],
    };
    let resolveFetch!: (r: CaptionActionResult) => void;
    actions.fetchVideoCaptions.mockReturnValue(
      new Promise((r) => (resolveFetch = r)),
    );
    await act(async () => render({ ...transcript, stale: true }));
    // Blob-era sentences render right away — the upgrade stays in flight.
    expect(container.textContent).toContain("I work here.");
    await check(() =>
      expect(actions.fetchVideoCaptions).toHaveBeenCalledTimes(1),
    );
    await act(async () => resolveFetch({ ok: true, ...fresh }));
    await check(() =>
      expect(container.textContent).toContain("Fresh sentence."),
    );
  });

  it("keeps the stale transcript on screen when the upgrade fails", async () => {
    actions.fetchVideoCaptions.mockResolvedValue({
      ok: false,
      error: "blocked",
    });
    await act(async () => render({ ...transcript, stale: true }));
    await check(() =>
      expect(actions.fetchVideoCaptions).toHaveBeenCalledTimes(1),
    );
    await check(() => expect(container.textContent).toContain("I work here."));
    // No error swap — the stale copy is still the best available.
    expect(
      container.querySelector('[data-testid="translated-sentence"]'),
    ).not.toBeNull();
  });
  it("writes a shareable ?t= deep link on sentence seek", async () => {
    await act(async () => render(transcript));
    const chip = [...container.querySelectorAll("button")].find(
      (el) => el.textContent?.trim() === "0:00",
    )!;
    await act(async () => chip.click());
    expect(player.seekToMs).toHaveBeenCalledWith(0);
    expect(player.play).toHaveBeenCalled();
    expect(new URL(window.location.href).searchParams.get("t")).toBe("0");
    window.history.replaceState(null, "", "/");
  });
  it.each([true, false])(
    "keeps a pasted transcript when the opening request finishes later (success=%s)",
    async (success) => {
      let finish!: (result: CaptionActionResult) => void;
      actions.fetchVideoCaptions.mockImplementation(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      );
      await act(async () => render());
      const button = Array.from(container.querySelectorAll("button")).find(
        (el) => el.textContent === "Dán hoặc tải phụ đề",
      )!;
      expect(button).not.toBeDisabled();
      await act(async () => button.click());
      container.querySelector("textarea")!.value =
        "[00:00] Teachers work here.";
      const use = Array.from(container.querySelectorAll("button")).find(
        (el) => el.textContent === "Dùng phụ đề này",
      )!;
      await act(async () => use.click());
      await act(async () =>
        finish(
          success
            ? { ok: true, ...transcript }
            : { ok: false, error: "blocked" },
        ),
      );
      expect(
        container.querySelector('[data-testid="transcript-rail"]'),
      ).toHaveTextContent("Teachers work here.");
      expect(container.querySelector('[role="alert"]')).toBeNull();
      expect(actions.fetchVideoCaptions).toHaveBeenCalledTimes(1);
    },
  );
  it("stops after an upstream failure and allows an explicit retry", async () => {
    actions.fetchVideoCaptions
      .mockResolvedValueOnce({ ok: false, error: "blocked" })
      .mockResolvedValue({ ok: true, ...transcript });
    await act(async () => render());
    await check(() =>
      expect(container.querySelector('[role="alert"]')).toHaveTextContent(
        "YouTube đang chặn",
      ),
    );
    await act(async () => render());
    expect(actions.fetchVideoCaptions).toHaveBeenCalledTimes(1);
    const retry = Array.from(container.querySelectorAll("button")).find(
      (el) => el.textContent === "Thử lấy lại phụ đề",
    )!;
    await act(async () => retry.click());
    await check(() =>
      expect(
        container.querySelector('[data-testid="transcript-rail"]'),
      ).not.toBeNull(),
    );
    expect(actions.fetchVideoCaptions).toHaveBeenCalledTimes(2);
  });
});

describe("account position confirmation", () => {
  const human: LoadedTranscript = {
    ...transcript,
    sentences: [{ ...transcript.sentences[0], vi: "Tôi làm việc ở đây." }],
  };
  const button = (label: string) =>
    container.querySelector<HTMLButtonElement>(
      `button[aria-label="${label}"]`,
    )!;
  it("saves each 15 seconds across pause/play changes, on a manual stop, and surfaces a failed acknowledgement", async () => {
    vi.useFakeTimers();
    Object.assign(clock, { nowMs: 1000, playing: true, state: "playing" });
    await act(async () => render(human, true));
    await act(async () => vi.advanceTimersByTimeAsync(10_000));
    // Native pause/resume must not restart the periodic-save deadline.
    Object.assign(clock, { playing: false, state: "paused" });
    await act(async () => render(human, true));
    expect(actions.saveWatchPosition).toHaveBeenCalledTimes(1);
    Object.assign(clock, { nowMs: 2000, playing: true, state: "playing" });
    await act(async () => render(human, true));
    await act(async () => vi.advanceTimersByTimeAsync(5000));
    expect(actions.saveWatchPosition).toHaveBeenLastCalledWith(
      "dQw4w9WgXcQ",
      2000,
    );
    expect(actions.saveWatchPosition).toHaveBeenCalledTimes(2);
    actions.saveWatchPosition.mockResolvedValueOnce({
      ok: false,
      error: "not_saved",
    });
    clock.nowMs = 2600;
    await act(async () => button("Dừng video").click());
    expect(actions.saveWatchPosition).toHaveBeenCalledTimes(3);
    expect(container.textContent).toContain("Chưa lưu được vị trí xem");
  });
  it("does not save during each repeat gap, but does save a deliberate stop in a gap", async () => {
    vi.useFakeTimers();
    player.pause.mockImplementation(() => {
      clock.playing = false;
      clock.state = "paused";
    });
    player.play.mockImplementation(() => {
      clock.playing = true;
      clock.state = "playing";
    });
    player.seekToMs.mockImplementation((ms: number) => {
      clock.nowMs = ms;
    });
    const loopSource = {
      ...human,
      sentences: [{ ...human.sentences[0], end_ms: 1000 }],
    };
    await act(async () => render(loopSource, true));
    const repeat = container.querySelector<HTMLSelectElement>(
      'select[aria-label="Lặp câu"]',
    )!;
    await act(async () => {
      repeat.value = "three";
      repeat.dispatchEvent(new Event("change", { bubbles: true }));
    });
    Object.assign(clock, { nowMs: 900, playing: true, state: "playing" });
    await act(async () => render(loopSource, true));
    clock.nowMs = 1100;
    await act(async () => vi.advanceTimersByTimeAsync(110));
    expect(container.textContent).toContain("1 / 3");
    expect(actions.saveWatchPosition).not.toHaveBeenCalled();
    await act(async () => button("Dừng video").click());
    expect(actions.saveWatchPosition).toHaveBeenCalledTimes(1);
    await act(async () => vi.advanceTimersByTimeAsync(1000));
    expect(player.play).toHaveBeenCalledTimes(1);
    player.pause.mockReset();
    player.play.mockReset();
    player.seekToMs.mockReset();
  });
  it("never attempts a position write for a guest", async () => {
    vi.useFakeTimers();
    Object.assign(clock, { nowMs: 1200, playing: true, state: "playing" });
    await act(async () => render(human));
    await act(async () => button("Dừng video").click());
    await act(async () => vi.advanceTimersByTimeAsync(30_000));
    expect(actions.saveWatchPosition).not.toHaveBeenCalled();
  });
});

describe("automatic native iframe captions", () => {
  const payload = {
    type: "atoenglish:youtube-captions",
    version: 1,
    videoId: "dQw4w9WgXcQ",
    tracks: [
      {
        languageCode: "en",
        kind: "manual",
        events: [
          { tStartMs: 0, dDurationMs: 3000, segs: [{ utf8: "I work here." }] },
        ],
      },
    ],
  };
  function mountFrame() {
    const host = document.createElement("div");
    const frame = document.createElement("iframe");
    host.append(frame);
    document.body.append(host);
    frameRef.fixture.current = host;
    return frame.contentWindow!;
  }
  async function deliver(source: Window, data = payload) {
    await act(async () =>
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://www.youtube.com",
          source,
          data,
        }),
      ),
    );
  }
  it("requests once and accepts the matching iframe under StrictMode without a click", async () => {
    actions.fetchVideoCaptions.mockReturnValue(new Promise(() => {}));
    const frame = mountFrame();
    const post = vi.spyOn(frame, "postMessage");
    await act(async () => render());
    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith(
      { type: "atoenglish:request-captions", videoId: payload.videoId },
      "https://www.youtube.com",
    );
    await deliver(frame);
    expect(
      container.querySelector('[data-testid="transcript-rail"]'),
    ).toHaveTextContent("I work here.");
    expect(player.play).not.toHaveBeenCalled();
    expect(actions.importYoutubeCaptions).not.toHaveBeenCalled();
  });
  it("rejects another window, wrong video and wrong origin", async () => {
    actions.fetchVideoCaptions.mockReturnValue(new Promise(() => {}));
    const frame = mountFrame();
    await act(async () => render());
    await deliver(window);
    await deliver(frame, { ...payload, videoId: "oyRxhiAC9u8" });
    await act(async () =>
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://other.workers.dev",
          source: frame,
          data: payload,
        }),
      ),
    );
    expect(
      container.querySelector('[data-testid="transcript-rail"]'),
    ).toBeNull();
    await deliver(frame);
    expect(
      container.querySelector('[data-testid="transcript-rail"]'),
    ).toHaveTextContent("I work here.");
  });
  it("keeps pasted captions when an automatic iframe response arrives late", async () => {
    actions.fetchVideoCaptions.mockReturnValue(new Promise(() => {}));
    const frame = mountFrame();
    await act(async () => render());
    const paste = Array.from(container.querySelectorAll("button")).find(
      (el) => el.textContent === "Dán hoặc tải phụ đề",
    )!;
    await act(async () => paste.click());
    container.querySelector("textarea")!.value = "[00:00] Teachers work here.";
    const use = Array.from(container.querySelectorAll("button")).find(
      (el) => el.textContent === "Dùng phụ đề này",
    )!;
    await act(async () => use.click());
    await deliver(frame);
    expect(
      container.querySelector('[data-testid="transcript-rail"]'),
    ).toHaveTextContent("Teachers work here.");
  });
  it("surfaces a rejected private import and keeps the manual fallback usable", async () => {
    actions.fetchVideoCaptions.mockReturnValue(new Promise(() => {}));
    actions.importYoutubeCaptions.mockRejectedValue(
      new Error("Import unavailable"),
    );
    const frame = mountFrame();
    await act(async () => render(null, true));
    await deliver(frame);
    expect(container.querySelector('[role="alert"]')).toHaveTextContent(
      "Có lỗi khi lấy phụ đề",
    );
    expect(
      Array.from(container.querySelectorAll("button")).find(
        (el) => el.textContent === "Dán hoặc tải phụ đề",
      ),
    ).not.toBeDisabled();
    expect(actions.importYoutubeCaptions).toHaveBeenCalledTimes(1);
  });
  it("does not collect when a saved transcript is available", async () => {
    const frame = mountFrame();
    const post = vi.spyOn(frame, "postMessage");
    await act(async () => render(transcript));
    expect(post).not.toHaveBeenCalled();
    expect(actions.fetchVideoCaptions).not.toHaveBeenCalled();
  });
  it("keeps a successful server transcript when native captions arrive later", async () => {
    actions.fetchVideoCaptions.mockResolvedValue({ ok: true, ...transcript });
    const frame = mountFrame();
    await act(async () => render());
    await deliver(frame, {
      ...payload,
      tracks: [
        {
          ...payload.tracks[0],
          events: [
            {
              tStartMs: 0,
              dDurationMs: 3000,
              segs: [{ utf8: "Different native text." }],
            },
          ],
        },
      ],
    });
    expect(
      container.querySelector('[data-testid="transcript-rail"]'),
    ).toHaveTextContent("I work here.");
    expect(container.textContent).not.toContain("Different native text.");
  });
});

describe("transcript navigation", () => {
  // Match the repository's native DOM + React act test harness; no new test dependency.
  const fireEvent = {
    change(input: HTMLElement, { target }: { target: { value: string } }) {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(input, target.value);
      return input.dispatchEvent(new Event("input", { bubbles: true }));
    },
    keyDown(input: HTMLElement, init: KeyboardEventInit) {
      return input.dispatchEvent(
        new KeyboardEvent("keydown", { ...init, bubbles: true }),
      );
    },
  };
  const within = (scope: HTMLElement) => {
    const queryByRole = (role: string, options?: { name: string | RegExp }) => {
      const selector =
        role === "button"
          ? "button"
          : role === "searchbox"
            ? 'input[type="search"]'
            : '[role="' + role + '"]';
      return (
        [...scope.querySelectorAll<HTMLElement>(selector)].find((element) => {
          if (!options) return true;
          const name =
            element.getAttribute("aria-label") ??
            element.textContent?.trim() ??
            "";
          return typeof options.name === "string"
            ? name === options.name
            : options.name.test(name);
        }) ?? null
      );
    };
    return {
      queryByRole,
      getByRole(role: string, options?: { name: string | RegExp }) {
        const element = queryByRole(role, options);
        if (!element)
          throw new Error(
            "Missing " + role + " " + String(options?.name ?? ""),
          );
        return element;
      },
    };
  };

  // Non-contiguous source IDs guard against mistaking a match position for a cue ID.
  const sentences = [
    { i: 12, text: "I work here.", start_ms: 0, end_ms: 3000 },
    {
      i: 42,
      text: "They work from scratch.",
      start_ms: 30_000,
      end_ms: 33_000,
    },
    {
      i: 77,
      text: "Don't stop. Take a break.",
      start_ms: 60_000,
      end_ms: 63_000,
    },
  ];
  const translations = {
    12: "Tôi làm việc tại đây.",
    42: "Họ làm việc từ đầu.",
    77: "Đừng dừng lại. Nghỉ một chút.",
  };
  const seek = vi.fn();
  async function renderRail(
    overrides: Partial<ComponentProps<typeof TranscriptRail>> = {},
  ) {
    await act(async () =>
      root.render(
        <TranscriptRail
          sentences={sentences}
          translations={translations}
          subtitleMode="bilingual"
          activeIndex={12}
          nowMs={0}
          onSeek={seek}
          {...overrides}
        />,
      ),
    );
    // JSDOM has no layout or native scrolling; browser tests verify geometry.
    for (const row of container.querySelectorAll<HTMLElement>(
      "[data-sentence]",
    )) {
      if (!row.scrollIntoView) row.scrollIntoView = vi.fn();
    }
  }
  async function search(value: string) {
    const ui = within(container);
    if (!ui.queryByRole("searchbox")) {
      await act(async () =>
        ui.getByRole("button", { name: "Tìm trong phụ đề" }).click(),
      );
    }
    const input = ui.getByRole("searchbox", { name: "Tìm câu trong phụ đề" });
    await act(async () => fireEvent.change(input, { target: { value } }));
    return input;
  }
  const chosen = () => container.querySelector('[data-search-current="true"]');

  it("finds source sentences without filtering context, seeking or changing the active cue", async () => {
    await renderRail();
    const input = await search("WORK");
    expect(within(container).getByRole("status")).toHaveTextContent(
      "1 / 2 câu phù hợp",
    );
    expect(container.querySelectorAll("[data-sentence]")).toHaveLength(3);
    expect(chosen()).toHaveAttribute("data-sentence", "12");
    await act(async () =>
      within(container)
        .getByRole("button", { name: "Câu phù hợp tiếp" })
        .click(),
    );
    expect(chosen()).toHaveAttribute("data-sentence", "42");
    expect(container.querySelector('[aria-current="true"]')).toHaveAttribute(
      "data-sentence",
      "12",
    );
    expect(seek).not.toHaveBeenCalled();
    await act(async () => fireEvent.keyDown(input, { key: "Enter" }));
    expect(seek).not.toHaveBeenCalled();
    await act(async () =>
      within(container).getByRole("button", { name: "Nghe câu 0:30" }).click(),
    );
    expect(seek).toHaveBeenCalledExactlyOnceWith(30_000);
  });
  it("finds Vietnamese without accents, including đ, and treats punctuation literally", async () => {
    await renderRail();
    await search("TU DAU");
    expect(chosen()).toHaveAttribute("data-sentence", "42");
    expect(within(container).getByRole("status")).toHaveTextContent("1 / 1");
    await search("[*");
    expect(chosen()).toBeNull();
    expect(within(container).getByRole("status")).toHaveTextContent(
      "Không tìm thấy",
    );
    expect(
      within(container).getByRole("button", { name: "Câu phù hợp tiếp" }),
    ).toBeDisabled();
    await search("don’t  stop");
    expect(chosen()).toHaveAttribute("data-sentence", "77");
  });
  it("does not expose hidden translations through search results", async () => {
    await renderRail({ subtitleMode: "en" });
    await search("tu dau");
    expect(chosen()).toBeNull();
    await renderRail({ subtitleMode: "reveal" });
    expect(chosen()).toBeNull();
    const row = container.querySelector('[data-sentence="42"]')!;
    await act(async () =>
      within(row as HTMLElement)
        .getByRole("button", { name: "Hiện nghĩa tiếng Việt của câu này" })
        .click(),
    );
    expect(chosen()).toHaveAttribute("data-sentence", "42");
    await renderRail({ subtitleMode: "vi" });
    await search("work");
    expect(chosen()).toBeNull();
  });
  it("retains the selected sentence as progressive translation inserts earlier matches", async () => {
    await renderRail({ translations: { 77: "Nghỉ một chút." } });
    const input = await search("nghi");
    await act(async () => fireEvent.keyDown(input, { key: "Enter" }));
    const row = chosen() as HTMLElement;
    expect(row).toHaveAttribute("data-sentence", "77");
    const scroll = row.scrollIntoView;
    expect(scroll).toHaveBeenCalledTimes(1);
    await renderRail({
      translations: { 12: "Nghỉ ở đây.", 77: "Nghỉ một chút." },
    });
    expect(chosen()).toHaveAttribute("data-sentence", "77");
    expect(within(container).getByRole("status")).toHaveTextContent("2 / 2");
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(seek).not.toHaveBeenCalled();
  });
  it("cycles results in both directions and keeps search input focus", async () => {
    await renderRail();
    const input = await search("work");
    expect(document.activeElement).toBe(input);
    await act(async () =>
      fireEvent.keyDown(input, { key: "Enter", shiftKey: true }),
    );
    expect(chosen()).toHaveAttribute("data-sentence", "42");
    await act(async () =>
      within(container)
        .getByRole("button", { name: "Câu phù hợp tiếp" })
        .click(),
    );
    expect(chosen()).toHaveAttribute("data-sentence", "12");
    await act(async () =>
      within(container)
        .getByRole("button", { name: "Câu phù hợp trước" })
        .click(),
    );
    expect(chosen()).toHaveAttribute("data-sentence", "42");
    expect(document.activeElement).toBe(input);
  });
  it("closes with Escape, restores focus and resumes following only on request", async () => {
    await renderRail();
    const input = await search("work");
    await act(async () => fireEvent.keyDown(input, { key: "Escape" }));
    const ui = within(container);
    expect(ui.queryByRole("searchbox")).toBeNull();
    expect(document.activeElement).toBe(
      ui.getByRole("button", { name: "Tìm trong phụ đề" }),
    );
    const resume = ui.getByRole("button", { name: "Theo câu đang phát" });
    expect(resume).toHaveAttribute("aria-pressed", "false");
    await act(async () => resume.click());
    expect(
      ui.getByRole("button", { name: "Đang theo câu phát · Tắt" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(seek).not.toHaveBeenCalled();
  });
  it("resets search and follow state on source replacement", async () => {
    await renderRail();
    await search("work");
    await renderRail({
      sentences: [{ i: 8, text: "A new source.", start_ms: 0, end_ms: 1000 }],
      activeIndex: 8,
    });
    expect(within(container).queryByRole("searchbox")).toBeNull();
    expect(chosen()).toBeNull();
    expect(
      within(container).getByRole("button", {
        name: "Đang theo câu phát · Tắt",
      }),
    ).toHaveAttribute("aria-pressed", "true");
  });
  it("searches untimed read-mode text without inventing a replay action", async () => {
    await renderRail({
      sentences: [
        { i: 9, text: "A quiet place.", start_ms: null, end_ms: null },
      ],
      translations: {},
      activeIndex: -1,
      prose: true,
    });
    const input = await search("quiet");
    await act(async () => fireEvent.keyDown(input, { key: "Enter" }));
    expect(chosen()).toHaveAttribute("data-sentence", "9");
    expect(
      within(container).queryByRole("button", { name: /Nghe câu|Nghe lại/ }),
    ).toBeNull();
    expect(seek).not.toHaveBeenCalled();
  });
});

describe("B2 sentence analysis", () => {
  it("analyzes the active sentence and shows the labeled AI panel", async () => {
    analyzeActions.analyzeSentence.mockResolvedValue({
      ok: true,
      cached: false,
      analysis: {
        translation_vi: "Tôi làm việc ở đây.",
        structure: {
          subject: "I",
          main_verb: "work",
          clauses: ["here"],
        },
        phrases: [{ text: "work here", meaning_vi: "làm việc ở đây" }],
        grammar_point: "Thì hiện tại đơn.",
      },
    });
    await act(async () => render(transcript, true));
    await check(() =>
      expect(
        container.querySelector("button[aria-label='Phân tích câu bằng AI']"),
      ).not.toBeNull(),
    );
    await act(async () => {
      container
        .querySelector("button[aria-label='Phân tích câu bằng AI']")!
        .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await check(() => {
      const panel = container.querySelector(
        "[data-testid='sentence-analysis']",
      );
      expect(panel).not.toBeNull();
      expect(panel!.textContent).toContain("Phân tích AI");
      expect(panel!.textContent).toContain("Tôi làm việc ở đây.");
      expect(panel!.textContent).toContain("Thì hiện tại đơn.");
    });
    expect(analyzeActions.analyzeSentence).toHaveBeenCalledWith({
      sentence: "I work here.",
    });
  });

  it("surfaces an honest notice when analysis fails", async () => {
    analyzeActions.analyzeSentence.mockResolvedValue({
      ok: false,
      error: "unavailable",
    });
    await act(async () => render(transcript, true));
    await act(async () => {
      container
        .querySelector("button[aria-label='Phân tích câu bằng AI']")!
        .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await check(() => {
      const panel = container.querySelector(
        "[data-testid='sentence-analysis']",
      );
      expect(panel!.textContent).toContain("hiện không khả dụng");
    });
  });

  it("opens the Luyện panel on the active sentence and exits back", async () => {
    await act(async () => render(transcript, true));
    await check(() =>
      expect(
        container.querySelector("button[aria-label='Luyện câu này']"),
      ).not.toBeNull(),
    );
    await act(async () => {
      container
        .querySelector("button[aria-label='Luyện câu này']")!
        .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await check(() => {
      const panel = container.querySelector("[data-testid='practice-panel']");
      expect(panel).not.toBeNull();
      // Dictation hides the caption — the answer must not leak.
      expect(panel!.textContent).not.toContain("I work here.");
    });
    // Dictation submits through the card-less attempt anchor.
    const textarea = container.querySelector("textarea")!;
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )!.set!;
      setter.call(textarea, "i work here");
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => {
      [...container.querySelectorAll("button")]
        .find((b) => b.textContent === "Kiểm tra")!
        .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await check(() => {
      expect(container.textContent).toContain("Độ chính xác: 100%");
      expect(reviewActions.recordPracticeAttempt).toHaveBeenCalledWith(
        expect.objectContaining({
          video_id: "dQw4w9WgXcQ",
          sentence_index: 0,
          mode: "sentence_dictation",
        }),
      );
    });
    // Exit returns the normal caption.
    await act(async () => {
      container
        .querySelector("button[aria-label='Thoát luyện tập']")!
        .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await check(() =>
      expect(
        container.querySelector("[data-testid='practice-panel']"),
      ).toBeNull(),
    );
  });
});
