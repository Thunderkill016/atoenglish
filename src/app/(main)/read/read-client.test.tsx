import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ReadClient, splitSentences } from "./read-client";

const actions = vi.hoisted(() => ({
  getSavedWordStates: vi.fn(),
  saveStudyItem: vi.fn(),
  saveTextSource: vi.fn(),
}));
vi.mock("@/app/actions/study", () => ({
  getSavedWordStates: actions.getSavedWordStates,
  saveStudyItem: actions.saveStudyItem,
  saveTextSource: actions.saveTextSource,
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  vi.restoreAllMocks();
  actions.getSavedWordStates.mockReset().mockResolvedValue({
    ok: true,
    states: [{ key: "resilience", state: 0 }],
  });
  actions.saveStudyItem.mockReset().mockResolvedValue({
    ok: true,
    card_id: 5,
    card_created: true,
    context_created: true,
  });
  actions.saveTextSource
    .mockReset()
    .mockResolvedValue({ ok: true, source_id: 31 });
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const SAMPLE = "It takes resilience to keep going. Keep going anyway.";

async function pasteAndRead(text = SAMPLE) {
  const textarea = container.querySelector("textarea")!;
  await act(async () => {
    // React 19 reads the native setter value on synthetic change.
    const setter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value",
    )!.set!;
    setter.call(textarea, text);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  });
  const start = [...container.querySelectorAll("button")].find(
    (b) => b.textContent === "Đọc bài này",
  )!;
  await act(async () => start.click());
}

describe("splitSentences", () => {
  it("splits plain text into ordered untimed sentences", () => {
    expect(splitSentences(SAMPLE)).toEqual([
      {
        i: 0,
        start_ms: null,
        end_ms: null,
        text: "It takes resilience to keep going.",
      },
      { i: 1, start_ms: null, end_ms: null, text: "Keep going anyway." },
    ]);
  });
});

describe("ReadClient", () => {
  it("turns pasted text into lookupable sentences", async () => {
    await act(async () =>
      root.render(<ReadClient loggedIn={false} />),
    );
    await pasteAndRead();
    const wordButtons = [
      ...container.querySelectorAll('button[aria-label^="Tra từ"]'),
    ];
    expect(wordButtons.length).toBeGreaterThan(5);
    // Guests read and look up but get no save affordance.
    expect(
      [...container.querySelectorAll("button")].find(
        (b) => b.textContent?.trim() === "Lưu câu",
      ),
    ).toBeUndefined();
  });

  it("paints saved words from the study-card map", async () => {
    await act(async () => root.render(<ReadClient loggedIn />));
    await pasteAndRead();
    await act(async () => Promise.resolve()); // flush getSavedWordStates
    const saved = [
      ...container.querySelectorAll('button[aria-label="Tra từ “resilience”"]'),
    ];
    expect(saved[0]?.className).toContain("bg-state-learning/25");
  });

  it("saves a sentence anchored to the text source", async () => {
    await act(async () => root.render(<ReadClient loggedIn />));
    await pasteAndRead();
    const saveButton = [
      ...container.querySelectorAll("button"),
    ].find((b) => b.textContent?.includes("Lưu câu"))!;
    await act(async () => saveButton.click());
    expect(actions.saveTextSource).toHaveBeenCalledTimes(1);
    expect(actions.saveStudyItem).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "sentence",
        key: "it takes resilience to keep going.",
        context: expect.objectContaining({
          source_id: 31,
          sentence_index: 0,
          origin: "read_lookup",
        }),
      }),
    );
    expect(saveButton.textContent).toContain("Đã lưu");
  });

  it("translates one sentence on demand", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        ok: true,
        lines: [{ i: 0, vi: "Cần sự kiên cường để tiếp tục." }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    await act(async () => root.render(<ReadClient loggedIn />));
    await pasteAndRead();
    const translate = [
      ...container.querySelectorAll("button"),
    ].find((b) => b.textContent?.trim() === "Dịch")!;
    await act(async () => translate.click());
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/translate",
      expect.objectContaining({ method: "POST" }),
    );
    expect(container.textContent).toContain(
      "Cần sự kiên cường để tiếp tục.",
    );
  });
});
