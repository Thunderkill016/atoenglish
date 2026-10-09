import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DiscoverSearch, DiscoverSearchProvider } from "./discover-search";

const h = vi.hoisted(() => ({
  searchYoutube: vi.fn(),
  push: vi.fn(),
}));

vi.mock("@/app/actions/youtube-search", () => ({
  searchYoutube: h.searchYoutube,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: h.push, replace: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/components/dictionary-panel", () => ({
  DictionaryPanel: () => null,
}));

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function render(enabled: boolean) {
  act(() => {
    root.render(
      <DiscoverSearchProvider>
        <DiscoverSearch youtubeSearchEnabled={enabled} />
      </DiscoverSearchProvider>,
    );
  });
}

async function openDialogAndType(query: string) {
  const launcher = container.querySelector<HTMLButtonElement>(
    'button[aria-label="Tìm kiếm và khám phá"]',
  )!;
  await act(async () => launcher.click());
  const input = container.querySelector<HTMLInputElement>(
    'input[type="search"]',
  )!;
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )!.set!;
  await act(async () => {
    setter.call(input, query);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  vi.clearAllMocks();
  // jsdom lacks <dialog> modal plumbing — stub it so the component can
  // open/close; tests assert on the rendered children, not modality.
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("remote YouTube search capability", () => {
  it("does not exist in the UI when the flag is off — hidden-without-key contract", async () => {
    render(false);
    await openDialogAndType("english");
    const remoteBtn = [...container.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Tìm trên YouTube"),
    );
    expect(remoteBtn).toBeUndefined();
    expect(h.searchYoutube).not.toHaveBeenCalled();
  });

  it("runs one remote call per explicit click and renders result links to /watch", async () => {
    h.searchYoutube.mockResolvedValue({
      ok: true,
      videos: [
        {
          id: "dQw4w9WgXcQ",
          title: "Never Gonna Give You Up",
          channel: "Rick Astley",
        },
      ],
    });
    render(true);
    await openDialogAndType("rick astley");
    const remoteBtn = [...container.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Tìm trên YouTube"),
    )!;
    expect(remoteBtn).toBeTruthy();
    await act(async () => remoteBtn.click());
    expect(h.searchYoutube).toHaveBeenCalledTimes(1);
    expect(h.searchYoutube).toHaveBeenCalledWith("rick astley");
    const link = [...container.querySelectorAll("a")].find((a) =>
      a.getAttribute("href")?.includes("/watch/dQw4w9WgXcQ"),
    );
    expect(link).toBeTruthy();
    expect(link!.textContent).toContain("Never Gonna Give You Up");
    expect(link!.textContent).toContain("Rick Astley");
  });

  it("shows an honest error instead of a fake empty list", async () => {
    h.searchYoutube.mockResolvedValue({ ok: false, error: "quota" });
    render(true);
    await openDialogAndType("english");
    const remoteBtn = [...container.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Tìm trên YouTube"),
    )!;
    await act(async () => remoteBtn.click());
    expect(container.textContent).toContain("Lượt tìm YouTube hôm nay đã hết");
  });

  it("re-arms the button when the query changes instead of re-showing stale results", async () => {
    h.searchYoutube.mockResolvedValue({ ok: true, videos: [] });
    render(true);
    await openDialogAndType("first query");
    let remoteBtn = [...container.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Tìm trên YouTube"),
    )!;
    await act(async () => remoteBtn.click());
    expect(container.textContent).toContain("YouTube không có kết quả phù hợp");
    // New query → the stale empty result must not linger on screen.
    const input = container.querySelector<HTMLInputElement>(
      'input[type="search"]',
    )!;
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!;
    await act(async () => {
      setter.call(input, "second query");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    remoteBtn = [...container.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Tìm trên YouTube"),
    )!;
    expect(remoteBtn).toBeTruthy();
    expect(container.textContent).not.toContain(
      "YouTube không có kết quả phù hợp",
    );
  });
});
