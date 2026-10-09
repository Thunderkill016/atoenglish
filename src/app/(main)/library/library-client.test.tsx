import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LibraryClient } from "./library-client";
import type { LibraryItem, LibraryVideo } from "@/app/actions/library";

const actions = vi.hoisted(() => ({
  deleteLibrarySource: vi.fn(),
  deleteStudyCard: vi.fn(),
  updateCardMeaning: vi.fn(),
}));
vi.mock("@/app/actions/library", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/app/actions/library")>()),
  deleteLibrarySource: actions.deleteLibrarySource,
  deleteStudyCard: actions.deleteStudyCard,
  updateCardMeaning: actions.updateCardMeaning,
}));

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  actions.deleteLibrarySource.mockReset();
  actions.deleteStudyCard.mockReset();
  actions.updateCardMeaning.mockReset();
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const VIDEO: LibraryVideo = {
  source_id: 9,
  external_id: "dQw4w9WgXcQ",
  title: "Demo talk",
  channel: "Chan",
  last_position_ms: 41_000,
  updated_at: new Date().toISOString(),
  saved_count: 2,
};

function word(overrides: Partial<LibraryItem> = {}): LibraryItem {
  return {
    card_id: 5,
    kind: "word",
    display: "resilience",
    meaning_vi: "khả năng phục hồi",
    state: 0,
    due: null,
    context: {
      sentence_text: "It takes resilience to keep going.",
      start_ms: 41_000,
      video_id: "dQw4w9WgXcQ",
      source_title: "Demo talk",
      source_id: 9,
    },
    ...overrides,
  };
}

function render(props?: {
  videos?: LibraryVideo[];
  words?: LibraryItem[];
  sentences?: LibraryItem[];
}) {
  act(() => {
    root.render(
      <LibraryClient
        videos={props?.videos ?? [VIDEO]}
        words={props?.words ?? [word()]}
        sentences={props?.sentences ?? []}
      />,
    );
  });
}

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

describe("LibraryClient", () => {
  it("renders the video tab with resume + saved-count", () => {
    render();
    const link = container.querySelector<HTMLAnchorElement>(
      "a[href='/watch/dQw4w9WgXcQ?t=41000']",
    );
    expect(link).not.toBeNull();
    expect(container.textContent).toContain("2 mục đã lưu");
  });

  it("switches to words tab and deep-links the item to its segment", () => {
    render();
    click(
      [...container.querySelectorAll("button")].find(
        (b) => b.textContent === "Từ & cụm",
      )!,
    );
    const deep = container.querySelector<HTMLAnchorElement>(
      "a[href='/watch/dQw4w9WgXcQ?t=41000']",
    );
    expect(deep).not.toBeNull();
    expect(container.textContent).toContain("resilience");
  });

  it("filters saved items by source chip", () => {
    render({
      words: [
        word(),
        word({
          card_id: 6,
          display: "orphan",
          context: {
            sentence_text: "orphan context",
            start_ms: 1,
            video_id: "aaaaaaaaaaa",
            source_title: "Other video",
            source_id: 10,
          },
        }),
      ],
    });
    click(
      [...container.querySelectorAll("button")].find(
        (b) => b.textContent === "Từ & cụm",
      )!,
    );
    const chips = [...container.querySelectorAll("button")].filter((b) =>
      b.className.includes("rounded-full"),
    );
    expect(chips.map((c) => c.textContent)).toEqual([
      "Tất cả",
      "Demo talk",
      "Other video",
    ]);
    click(chips[2]);
    expect(container.textContent).toContain("orphan");
    expect(container.textContent).not.toContain("resilience");
  });

  it("edits a meaning through the inline editor", async () => {
    actions.updateCardMeaning.mockResolvedValue({ ok: true });
    render();
    click(
      [...container.querySelectorAll("button")].find(
        (b) => b.textContent === "Từ & cụm",
      )!,
    );
    click(
      container.querySelector("button[aria-label='Sửa nghĩa resilience']")!,
    );
    const input = container.querySelector("input")!;
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!;
      setter.call(input, "nghĩa mới");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const saveBtn = [...container.querySelectorAll("button")].find(
      (b) => b.textContent === "Lưu",
    )!;
    await act(async () => {
      saveBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(actions.updateCardMeaning).toHaveBeenCalledWith({
      card_id: 5,
      meaning_vi: "nghĩa mới",
    });
    expect(container.textContent).toContain("nghĩa mới");
  });

  it("deletes a card after inline confirm", async () => {
    actions.deleteStudyCard.mockResolvedValue({ ok: true });
    render();
    click(
      [...container.querySelectorAll("button")].find(
        (b) => b.textContent === "Từ & cụm",
      )!,
    );
    click(container.querySelector("button[aria-label='Xoá resilience']")!);
    const confirm = [...container.querySelectorAll("button")].find(
      (b) => b.textContent === "Xoá",
    )!;
    await act(async () => {
      confirm.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(actions.deleteStudyCard).toHaveBeenCalledWith(5);
    expect(container.textContent).not.toContain("resilience");
  });

  it("deletes a source and strips stale deep links", async () => {
    actions.deleteLibrarySource.mockResolvedValue({ ok: true });
    render();
    click(container.querySelector("button[aria-label='Xoá Demo talk']")!);
    const confirm = [...container.querySelectorAll("button")].find(
      (b) => b.textContent === "Xoá",
    )!;
    await act(async () => {
      confirm.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(actions.deleteLibrarySource).toHaveBeenCalledWith(9);
    // Video row gone; the word survives but its deep link is stripped.
    click(
      [...container.querySelectorAll("button")].find(
        (b) => b.textContent === "Từ & cụm",
      )!,
    );
    expect(container.textContent).toContain("resilience");
    expect(container.querySelector("a[href^='/watch/']")).toBeNull();
  });
});
