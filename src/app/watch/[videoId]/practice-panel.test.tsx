import { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PracticePanel, type PracticePanelProps } from "./practice-panel";
import type { Sentence } from "@/lib/video/types";

const reviewActions = vi.hoisted(() => ({
  recordPracticeAttempt: vi.fn(async (_input: Record<string, unknown>) => ({
    ok: true as const,
    attempt_id: 1,
    due: null,
    state: null,
  })),
}));
vi.mock("@/app/actions/review", () => reviewActions);

const SENTENCE: Sentence = {
  i: 7,
  start_ms: 30_000,
  end_ms: 33_000,
  text: "It takes resilience to keep going.",
  vi: "Cần sự kiên trì để tiếp tục.",
};

function baseProps(overrides: Partial<PracticePanelProps> = {}) {
  return {
    videoId: "dQw4w9WgXcQ",
    sentence: SENTENCE,
    index: 0,
    total: 2,
    prevStartMs: null,
    nextStartMs: 40_000,
    loggedIn: true,
    ready: true,
    playing: false,
    rate: 1,
    onPlaySentence: vi.fn(),
    onNavigate: vi.fn(),
    onRate: vi.fn(),
    onSaveSentence: vi.fn(),
    saved: false,
    onExit: vi.fn(),
    ...overrides,
  } satisfies PracticePanelProps;
}

let root: Root;
let container: HTMLDivElement;

async function renderPanel(props = baseProps()) {
  await act(async () =>
    root.render(
      <StrictMode>
        <PracticePanel {...props} />
      </StrictMode>,
    ),
  );
}

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

function button(name: string): HTMLButtonElement {
  const found = [...container.querySelectorAll("button")].find(
    (b) =>
      b.textContent?.includes(name) || b.getAttribute("aria-label") === name,
  );
  expect(found, `button "${name}"`).toBeTruthy();
  return found as HTMLButtonElement;
}

function typeText(el: HTMLTextAreaElement, value: string) {
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value",
    )!.set!;
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

/** A fake SpeechRecognition whose result is scripted per test. */
function stubRecognition(transcript: string) {
  class FakeRecognition {
    lang = "";
    interimResults = true;
    maxAlternatives = 1;
    onresult: ((e: unknown) => void) | null = null;
    onerror: (() => void) | null = null;
    onnomatch: (() => void) | null = null;
    start() {
      this.onresult?.({ results: [[{ transcript }]] });
    }
  }
  (window as unknown as Record<string, unknown>).SpeechRecognition =
    FakeRecognition;
}

beforeEach(() => {
  vi.clearAllMocks();
  delete (window as unknown as Record<string, unknown>).SpeechRecognition;
  delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("PracticePanel", () => {
  it("opens on dictation and hides speech modes without recognition support", async () => {
    await renderPanel();
    expect(
      container.querySelector("button[role='tab'][aria-selected='true']")
        ?.textContent,
    ).toBe("Chép chính tả");
    expect(
      [...container.querySelectorAll("button")].some(
        (b) => b.textContent === "Shadowing",
      ),
    ).toBe(false);
    expect(container.textContent).toContain("Câu 1/2");
  });

  it("plays the bounded sentence segment and counts plays", async () => {
    const props = baseProps();
    await renderPanel(props);
    await click(button("Nghe câu"));
    await click(button("Nghe lại"));
    expect(props.onPlaySentence).toHaveBeenCalledTimes(2);
    expect(container.textContent).toContain("đã nghe 2 lần");
  });

  it("navigates sentences without starting playback", async () => {
    const props = baseProps();
    await renderPanel(props);
    await click(button("Câu tiếp"));
    expect(props.onNavigate).toHaveBeenCalledWith(40_000);
    expect(props.onPlaySentence).not.toHaveBeenCalled();
    expect(button("Câu trước").disabled).toBe(true);
  });

  it("toggles the slow rate", async () => {
    const props = baseProps();
    await renderPanel(props);
    await click(button("Phát chậm"));
    expect(props.onRate).toHaveBeenCalledWith(0.75);
  });

  it("reveals one more leading letter per hint press", async () => {
    await renderPanel();
    await click(button("Gợi ý"));
    const scaffold = container.querySelector(
      "[data-testid='dictation-scaffold']",
    )!;
    expect(scaffold.textContent).toContain("I·");
    await click(button("Gợi ý (1)"));
    expect(
      container.querySelector("[data-testid='dictation-scaffold']")!
        .textContent,
    ).toContain("It");
  });

  it("grades a correct dictation and logs the anchored card-less attempt", async () => {
    await renderPanel();
    typeText(
      container.querySelector("textarea")!,
      "it takes resilience to keep going",
    );
    await act(async () =>
      button("Kiểm tra").dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      ),
    );
    expect(container.textContent).toContain("Độ chính xác: 100%");
    expect(reviewActions.recordPracticeAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        video_id: "dQw4w9WgXcQ",
        sentence_index: 7,
        mode: "sentence_dictation",
        word_accuracy: 1,
        hints_used: 0,
      }),
    );
    // card_id is absent — free practice, the action resolves the anchor.
    expect(
      reviewActions.recordPracticeAttempt.mock.calls[0][0],
    ).not.toHaveProperty("card_id");
  });

  it("shows missing words and offers to save the sentence", async () => {
    const props = baseProps();
    await renderPanel(props);
    typeText(container.querySelector("textarea")!, "it takes to keep going");
    await act(async () =>
      button("Kiểm tra").dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      ),
    );
    const result = container.querySelector("[data-testid='dictation-result']")!;
    // "resilience" was dropped — rendered as a missing word.
    expect(result.textContent).toContain("resilience");
    await click(button("Lưu câu này để ôn"));
    expect(props.onSaveSentence).toHaveBeenCalled();
  });

  it("keeps practicing usable for guests but never calls the action", async () => {
    await renderPanel(baseProps({ loggedIn: false }));
    expect(container.textContent).toContain("Đăng nhập để ghi nhận");
    typeText(container.querySelector("textarea")!, "it takes");
    await click(button("Kiểm tra"));
    expect(container.textContent).toContain("Độ chính xác");
    expect(reviewActions.recordPracticeAttempt).not.toHaveBeenCalled();
    expect(
      [...container.querySelectorAll("button")].some(
        (b) => b.textContent === "Lưu câu này để ôn",
      ),
    ).toBe(false);
  });

  it("shadowing: transcript match is labelled honestly, never a score", async () => {
    stubRecognition("it takes resilience to keep going");
    await renderPanel();
    await click(button("Shadowing"));
    await act(async () =>
      button("Nói theo").dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      ),
    );
    expect(container.textContent).toContain("Độ khớp nhận dạng: 100%");
    expect(container.textContent).toContain("không phải điểm phát âm");
    expect(reviewActions.recordPracticeAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "speak_repeat",
        similarity: 1,
        learner_text: "it takes resilience to keep going",
      }),
    );
  });

  it("speak_first shows the caption before any playback", async () => {
    stubRecognition("it takes resilience");
    const props = baseProps();
    await renderPanel(props);
    await click(button("Nói trước"));
    expect(container.textContent).toContain(
      "It takes resilience to keep going.",
    );
    await act(async () =>
      button("Nói câu này trước").dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      ),
    );
    expect(container.textContent).toContain("Độ khớp nhận dạng: 50%");
    expect(props.onPlaySentence).not.toHaveBeenCalled();
  });

  it("exits practice via the Thoát button", async () => {
    const props = baseProps();
    await renderPanel(props);
    await click(button("Thoát luyện tập"));
    expect(props.onExit).toHaveBeenCalled();
  });
});
