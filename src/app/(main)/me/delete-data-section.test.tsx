import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DeleteDataSection } from "./delete-data-section";

const h = vi.hoisted(() => ({
  deleteAllMyData: vi.fn(
    async (): Promise<{ ok: true } | { ok: false; error: string }> => ({
      ok: true,
    }),
  ),
  signOut: vi.fn(async () => ({ error: null })),
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/app/actions/account", () => ({
  deleteAllMyData: h.deleteAllMyData,
}));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { signOut: h.signOut } }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: h.push, refresh: h.refresh }),
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
  vi.clearAllMocks();
  h.deleteAllMyData.mockResolvedValue({ ok: true });
  h.signOut.mockResolvedValue({ error: null });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

async function render() {
  await act(async () => {
    root.render(<DeleteDataSection />);
  });
}

function click(el: Element | null | undefined) {
  if (!el) throw new Error("element not found");
  act(() => {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

describe("DeleteDataSection", () => {
  it("requires the two-step confirm before calling the action", async () => {
    await render();
    const open = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Xoá toàn bộ dữ liệu"),
    );
    click(open);
    expect(
      container.textContent?.includes("Chắc chắn xoá toàn bộ"),
    ).toBeTruthy();
    expect(h.deleteAllMyData).not.toHaveBeenCalled();

    // Huỷ backs out without deleting.
    const cancel = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.trim() === "Huỷ",
    );
    click(cancel);
    expect(h.deleteAllMyData).not.toHaveBeenCalled();
  });

  it("on confirm: erases, signs out through the browser client, leaves /me", async () => {
    await render();
    click(
      Array.from(container.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("Xoá toàn bộ dữ liệu"),
      ),
    );
    const confirm = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.trim() === "Xoá hết",
    );
    await act(async () => {
      confirm?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(h.deleteAllMyData).toHaveBeenCalledTimes(1);
    expect(h.signOut).toHaveBeenCalledTimes(1);
    expect(h.push).toHaveBeenCalledWith("/");
  });

  it("failed wipe keeps the session and surfaces an honest error", async () => {
    h.deleteAllMyData.mockResolvedValue({
      ok: false,
      error: "delete_failed",
    });
    await render();
    click(
      Array.from(container.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("Xoá toàn bộ dữ liệu"),
      ),
    );
    const confirm = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.trim() === "Xoá hết",
    );
    await act(async () => {
      confirm?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(h.deleteAllMyData).toHaveBeenCalledTimes(1);
    expect(h.signOut).not.toHaveBeenCalled();
    expect(h.push).not.toHaveBeenCalled();
    expect(container.querySelector('[role="alert"]')).toBeTruthy();
  });
});
