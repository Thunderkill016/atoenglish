import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { webcrypto } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ReviewSession } from "./review-session";
import type { ReviewQueueItem } from "@/app/actions/review";

const actions = vi.hoisted(() => ({
  recordPracticeAttempt: vi.fn(),
  requestReuseFeedback: vi.fn(),
}));
vi.mock("@/app/actions/review", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/app/actions/review")>()),
  recordPracticeAttempt: actions.recordPracticeAttempt,
  requestReuseFeedback: actions.requestReuseFeedback,
}));

// The review player is the official iframe API — swap it for a stub the same
// way watch-client.test does; audio-mode cards only need play/seekToMs.
const player = vi.hoisted(() => ({
  containerRef: { current: null as HTMLDivElement | null },
  ready: true,
  playing: false,
  loadError: false,
  nowMs: 0,
  durationMs: 60_000,
  play: vi.fn(),
  pause: vi.fn(),
  seekToMs: vi.fn(),
  setRate: vi.fn(),
  rate: 1,
  state: "paused",
  availableRates: [1],
  readClock: vi.fn(),
}));
vi.mock("@/lib/video/use-youtube-player", () => ({
  useYouTubePlayer: () => player,
}));

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, "crypto", { value: webcrypto });
}
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  actions.recordPracticeAttempt.mockReset();
  actions.requestReuseFeedback.mockReset();
  delete (window as { SpeechRecognition?: unknown }).SpeechRecognition;
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function item(overrides: Partial<ReviewQueueItem> = {}): ReviewQueueItem {
  return {
    card_id: 5,
    kind: "word",
    key: "resilience",
    display: "resilience",
    meaning_vi: "khả năng phục hồi",
    meaning_origin: "dictionary",
    state: 0,
    mode: "recall",
    context: {
      sentence_text: "It takes resilience to keep going.",
      sentence_vi: "Cần sự kiên cường để tiếp tục.",
      token_start: 3,
      token_count: 1,
      start_ms: 41000,
      end_ms: 43000,
      video_id: "dQw4w9WgXcQ",
      source_title: "Talk",
    },
    ...overrides,
  };
}

function click(el: Element | null) {
  act(() => {
    el?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

function buttonByText(text: string): HTMLButtonElement | null {
  return [...container.querySelectorAll("button")].find(
    (b) =>
      b.textContent?.trim() === text ||
      b.firstElementChild?.textContent?.trim() === text,
  ) as HTMLButtonElement | null;
}
function ratingButton(value: number): HTMLButtonElement | null {
  return container.querySelector(`button[data-rating="${value}"]`);
}

describe("ReviewSession", () => {
  it("shows the empty state when the queue is empty", async () => {
    await act(async () =>
      root.render(<ReviewSession items={[]} />),
    );
    expect(container.textContent).toContain("Chưa có thẻ nào đến hạn");
  });

  it("blanks the saved word inside its context sentence", async () => {
    await act(async () =>
      root.render(<ReviewSession items={[item()]} />),
    );
    const cue = container.querySelector("p[lang=en]");
    expect(cue?.textContent).toContain("It takes");
    expect(cue?.textContent).not.toContain("resilience");
    expect(container.textContent).toContain("khả năng phục hồi");
    expect(container.querySelector("a")?.getAttribute("href")).toBe(
      "/watch/dQw4w9WgXcQ?t=41000",
    );
  });

  it("flips then records the self-rating and advances", async () => {
    actions.recordPracticeAttempt.mockResolvedValue({
      ok: true,
      attempt_id: 1,
      due: "2026-10-17T00:00:00Z",
      state: 1,
    });
    await act(async () =>
      root.render(
        <ReviewSession
          items={[item(), item({ card_id: 6, display: "steady", key: "steady" })]}
        />,
      ),
    );

    // Rating buttons only appear after the flip.
    expect(ratingButton(3)).toBeNull();
    click(buttonByText("Lật thẻ"));
    expect(container.querySelector("[data-testid=answer]")).not.toBeNull();
    expect(container.textContent).toContain("resilience");

    await act(async () => {
      ratingButton(3)?.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
    });
    expect(actions.recordPracticeAttempt).toHaveBeenCalledWith({
      card_id: 5,
      mode: "recall",
      rating: 3,
    });
    // Second card is now the cue.
    expect(container.textContent).toContain("2 / 2");
  });

  it("stays on the card and shows an error when recording fails", async () => {
    actions.recordPracticeAttempt.mockResolvedValue({
      ok: false,
      error: "save_failed",
    });
    await act(async () =>
      root.render(<ReviewSession items={[item()]} />),
    );
    click(buttonByText("Lật thẻ"));
    await act(async () => {
      ratingButton(4)?.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
    });
    expect(container.textContent).toContain("Chưa ghi được lượt ôn");
    expect(container.textContent).toContain("1 / 1");
  });

  it("reaches the summary after the last card", async () => {
    actions.recordPracticeAttempt.mockResolvedValue({
      ok: true,
      attempt_id: 1,
      due: "2026-10-17T00:00:00Z",
      state: 1,
    });
    await act(async () =>
      root.render(<ReviewSession items={[item()]} />),
    );
    click(buttonByText("Lật thẻ"));
    await act(async () => {
      ratingButton(3)?.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
    });
    expect(container.textContent).toContain("Hết hàng đợi");
    expect(container.textContent).toContain("1 thẻ");
  });

  it("shows the vietnamese cue for sentence_meaning cards", async () => {
    await act(async () =>
      root.render(
        <ReviewSession
          items={[
            item({
              kind: "sentence",
              mode: "sentence_meaning",
              display: "It takes resilience to keep going.",
              key: "it takes resilience to keep going.",
            }),
          ]}
        />,
      ),
    );
    expect(container.textContent).toContain("Cần sự kiên cường để tiếp tục.");
    expect(container.textContent).toContain("Nhớ lại câu");
  });

  it("grades listen_fill from the typed answer and advances on Tiếp", async () => {
    actions.recordPracticeAttempt.mockResolvedValue({
      ok: true,
      attempt_id: 7,
      due: "2026-10-17T00:00:00Z",
      state: 2,
    });
    await act(async () =>
      root.render(
        <ReviewSession items={[item({ mode: "listen_fill", state: 2, reps: 1 } as never)]} />,
      ),
    );

    // Audio cue: play button + input instead of flip/rate.
    expect(container.querySelector("[data-rating]")).toBeNull();
    click(buttonByText("Nghe đoạn này"));
    expect(player.seekToMs).toHaveBeenCalledWith(41000);
    expect(player.play).toHaveBeenCalled();

    const input = container.querySelector("input")!;
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!;
      setter.call(input, "resilience");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => {
      buttonByText("Kiểm tra")?.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
    });

    expect(actions.recordPracticeAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        card_id: 5,
        mode: "listen_fill",
        correct: true,
        plays: 1,
        learner_text: "resilience",
      }),
    );
    // Result shown — rating never leaves the client verbatim for audio modes.
    expect(container.textContent).toContain("Chính xác!");
    expect(actions.recordPracticeAttempt.mock.calls[0][0]).not.toHaveProperty(
      "rating",
    );
  });

  it("records dictation accuracy and hint usage", async () => {
    actions.recordPracticeAttempt.mockResolvedValue({
      ok: true,
      attempt_id: 8,
      due: "2026-10-17T00:00:00Z",
      state: 2,
    });
    await act(async () =>
      root.render(
        <ReviewSession
          items={[
            item({
              kind: "sentence",
              mode: "sentence_dictation",
              state: 2,
              display: "It takes resilience to keep going.",
              key: "it takes resilience to keep going.",
            } as never),
          ]}
        />,
      ),
    );

    // The source sentence stays hidden until after the attempt.
    expect(container.textContent).not.toContain("resilience to keep");
    click(buttonByText("Gợi ý (0)"));
    expect(container.textContent).toContain("Gợi ý (1)");

    const input = container.querySelector("input")!;
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!;
      setter.call(input, "it takes resilience to keep going");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => {
      buttonByText("Kiểm tra")?.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
    });

    expect(actions.recordPracticeAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "sentence_dictation",
        word_accuracy: 1,
        hints_used: 1,
      }),
    );
  });

  it("logs speak_repeat with transcript-match similarity, never a rating", async () => {
    actions.recordPracticeAttempt.mockResolvedValue({
      ok: true,
      attempt_id: 9,
      due: null,
      state: 0,
    });
    // Fake SpeechRecognition that resolves immediately on start().
    (window as { SpeechRecognition?: unknown }).SpeechRecognition = class {
      lang = "";
      interimResults = false;
      maxAlternatives = 1;
      onresult: ((e: unknown) => void) | null = null;
      onerror: (() => void) | null = null;
      onnomatch: (() => void) | null = null;
      start() {
        this.onresult?.({
          results: [
            [{ transcript: "It takes resilience to keep going." }],
          ],
        });
      }
      stop() {}
      abort() {}
    };
    await act(async () =>
      root.render(<ReviewSession items={[item()]} />),
    );
    click(buttonByText("Lật thẻ"));
    await act(async () => {
      buttonByText("Nói lại câu này")?.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
    });

    expect(actions.recordPracticeAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "speak_repeat",
        similarity: 1,
        learner_text: "It takes resilience to keep going.",
      }),
    );
    expect(actions.recordPracticeAttempt.mock.calls[0][0]).not.toHaveProperty(
      "rating",
    );
    expect(container.textContent).toContain("Độ khớp nhận dạng: 100%");
  });

  it("offers one write_reuse at session end with AI-labeled feedback", async () => {
    actions.recordPracticeAttempt.mockResolvedValue({
      ok: true,
      attempt_id: 10,
      due: null,
      state: 0,
    });
    actions.requestReuseFeedback.mockResolvedValue({
      ok: true,
      feedback: "Câu tự nhiên, dùng đúng nghĩa.",
    });
    await act(async () =>
      root.render(<ReviewSession items={[item()]} />),
    );
    click(buttonByText("Lật thẻ"));
    await act(async () => {
      ratingButton(3)?.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
    });
    expect(container.textContent).toContain("Hết hàng đợi");
    expect(container.textContent).toContain("Viết một câu mới dùng");

    const textarea = container.querySelector("textarea")!;
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )!.set!;
      setter.call(textarea, "Her resilience helped her recover.");
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => {
      buttonByText("Gửi câu")?.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
    });

    // Evidence log + AI feedback carry the label, per spec.
    expect(actions.recordPracticeAttempt).toHaveBeenLastCalledWith(
      expect.objectContaining({
        mode: "write_reuse",
        learner_text: "Her resilience helped her recover.",
      }),
    );
    expect(container.textContent).toContain("Câu tự nhiên");
    expect(container.textContent).toContain("Phản hồi AI");
  });
});
