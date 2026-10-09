import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { webcrypto } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ReviewSession } from "./review-session";
import type { ReviewQueueItem } from "@/app/actions/review";

const actions = vi.hoisted(() => ({ recordPracticeAttempt: vi.fn() }));
vi.mock("@/app/actions/review", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/app/actions/review")>()),
  recordPracticeAttempt: actions.recordPracticeAttempt,
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
});
