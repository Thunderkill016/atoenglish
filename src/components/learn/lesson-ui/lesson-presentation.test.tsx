import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

import LessonProgress from "./LessonProgress";
import SessionBreakCard from "./SessionBreakCard";

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const MotionDiv = ({ initial, animate, exit, transition, ...props }: Record<string, unknown>) => {
    void initial;
    void animate;
    void exit;
    void transition;
    return React.createElement("div", props);
  };

  return { motion: { div: MotionDiv } };
});

describe("lesson presentation helpers", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  async function render(ui: ReactNode) {
    await act(async () => root.render(ui));
  }

  it("renders the exact non-linear lesson progress position", async () => {
    await render(<LessonProgress sectionOrderIdx={3} />);

    const progress = container.querySelector('[role="progressbar"]');
    expect(progress?.getAttribute("aria-label")).toBe(
      "Tiến độ bài học: bước 4 / 10",
    );
    expect(progress?.getAttribute("aria-valuenow")).toBe("33");
    expect(progress?.querySelectorAll("svg")).toHaveLength(3);
  });

  it("preserves the session break copy, rest link, and continue callback", async () => {
    const onContinue = vi.fn();
    await render(<SessionBreakCard onContinue={onContinue} />);

    expect(container.textContent).toContain("Phần 1 hoàn thành!");
    expect(container.textContent).toContain("Tiếp tục Phần 2 →");
    expect(container.querySelector('a[href="/learn"]')?.textContent).toContain(
      "Lưu và nghỉ ngơi",
    );

    const continueButton = Array.from(container.querySelectorAll("button")).find((button) =>
      button.textContent?.includes("Tiếp tục Phần 2"),
    );
    expect(continueButton).toBeDefined();

    await act(async () => {
      continueButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onContinue).toHaveBeenCalledOnce();
  });
});
