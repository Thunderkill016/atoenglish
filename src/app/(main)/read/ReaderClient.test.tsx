import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { ReaderClient } from "./ReaderClient";

const store = new Map<string, "learning" | "known">();

// Mock only the server-action transport: the word-state "DB" is an in-memory
// map keyed exactly like the real table (one status per normalized word).
vi.mock("@/app/actions/read", () => ({
  getReadWordStates: async (words: readonly string[]) => {
    const states: Record<string, "learning" | "known"> = {};
    for (const word of words) {
      const status = store.get(word);
      if (status) states[word] = status;
    }
    return { signedIn: true, states };
  },
  setReadWordStatus: async (word: string, status: "learning" | "known") => {
    store.set(word, status);
    return { ok: true };
  },
  clearReadWordStatus: async (word: string) => {
    store.delete(word);
    return { ok: true };
  },
  getReadWordCounts: async () => {
    let known = 0;
    let learning = 0;
    for (const status of store.values()) {
      if (status === "known") known += 1;
      else learning += 1;
    }
    return { signedIn: true, known, learning };
  },
}));

vi.mock("@/app/actions/cards", () => ({
  saveCardToSRS: async () => ({ success: true, message: "saved" }),
}));

const STARTER = [
  {
    id: "t1",
    title: "Test text",
    level: "A0" as const,
    body: "Hello teacher. My family is happy.",
  },
];

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function clickText(container: HTMLElement, text: string) {
  const button = [...container.querySelectorAll("button")].find(
    (b) => b.textContent === text || b.textContent?.includes(text),
  );
  expect(button, `button "${text}"`).toBeTruthy();
  button!.click();
}

describe("ReaderClient", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    store.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("renders a text, taps a word, marks it known — and keeps it on a new render", async () => {
    await act(async () => {
      root.render(<ReaderClient signedIn starterTexts={STARTER} />);
    });
    clickText(container, "Test text");
    await flush();

    // All words start as "new" (no stored state).
    const hello = [...container.querySelectorAll("button")].find((b) => b.textContent === "Hello");
    expect(hello!.className).toContain("bg-sky-100");

    // Tap → gloss popover shows the curated meaning.
    clickText(container, "Hello");
    await flush();
    expect(container.textContent).toContain("xin chào");

    // Mark known → immediate recolour + the count moves by exactly 1.
    clickText(container, "Tôi biết từ này");
    await flush();
    expect(store.get("hello")).toBe("known");
    expect(container.textContent).toContain("1 từ đã đánh dấu biết");

    // A later render of the same text still shows the stored status.
    clickText(container, "Chọn văn bản khác");
    await flush();
    clickText(container, "Test text");
    await flush();
    const helloAgain = [...container.querySelectorAll("button")].find(
      (b) => b.textContent === "Hello",
    );
    expect(helloAgain!.className).toContain("decoration-emerald-300");
  });

  it("honestly shows 'chưa có nghĩa' for words outside the dictionary", async () => {
    const text = [{ id: "t2", title: "Gap text", level: "A0" as const, body: "Photosynthesis is hard." }];
    await act(async () => {
      root.render(<ReaderClient signedIn starterTexts={text} />);
    });
    clickText(container, "Gap text");
    await flush();
    clickText(container, "Photosynthesis");
    await flush();
    expect(container.textContent).toContain("chưa có nghĩa");
    // And no "save to flashcard" button — a card can't carry a meaning it doesn't have.
    expect(container.textContent).not.toContain("Lưu vào flashcard");
  });

  it("anonymous readers get a fully neutral render with the honest sign-in note", async () => {
    await act(async () => {
      root.render(<ReaderClient signedIn={false} starterTexts={STARTER} />);
    });
    expect(container.textContent).toContain("Đăng nhập để đánh dấu");
    clickText(container, "Test text");
    await flush();
    const hello = [...container.querySelectorAll("button")].find((b) => b.textContent === "Hello");
    expect(hello!.className).not.toContain("bg-sky-100");
    clickText(container, "Hello");
    await flush();
    // Gloss still works, but marking controls are absent.
    expect(container.textContent).toContain("xin chào");
    expect(container.textContent).not.toContain("Tôi biết từ này");
  });
});
