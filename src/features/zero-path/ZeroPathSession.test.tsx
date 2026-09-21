import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { compileCanonicalNếpPracticeAttempt } from "@/lib/nep/practice-execution.v1";
import { toLearnerStateEvidence } from "@/lib/nep/core-evidence-wiring.v1";
import { zeroPathLessonEnvelope } from "@/lib/nep/zero-path-pilot.v1";

import { ZeroPathSession } from "./ZeroPathSession";

// The component test exercises the real canonical compile + wiring pipeline;
// only the server-action transport hop is mocked.
vi.mock("@/app/actions/zero-path", () => ({
  submitZeroPathResponse: async (input: {
    lessonId: string;
    lessonVersion: number;
    actionId: string;
    response: string;
    responseSource: "speech" | "text" | null;
    supportUsed: boolean;
    latencyMs: number;
    sequence: number;
  }) => {
    const compiled = compileCanonicalNếpPracticeAttempt(input);
    if (!compiled) return { kind: "unresolvable" as const };
    const result = toLearnerStateEvidence({
      lesson: compiled.lesson,
      action: compiled.action,
      response: input.response,
      responseSource: input.responseSource,
      evaluation: compiled.evaluation,
      supportUsed: input.supportUsed,
      latencyMs: input.latencyMs,
      occurredAt: new Date().toISOString(),
      sequence: input.sequence,
    });
    const base = { evaluation: compiled.evaluation, feedback: compiled.feedback };
    if (!result) return { kind: "attempt-only" as const, ...base };
    if (!result.ok) {
      return {
        kind: "invalid-evidence" as const,
        claim: result.claim,
        problems: result.problems.map((p) => JSON.stringify(p)),
        ...base,
      };
    }
    return { kind: "evidence" as const, claim: result.claim, evidence: result.evidence, ...base };
  },
}));

const lesson = zeroPathLessonEnvelope();
if (!lesson) throw new Error("pilot lesson envelope missing");

async function flush() {
  await act(async () => {
    await Promise.resolve();
  });
}

function clickButton(container: HTMLElement, text: string) {
  const button = [...container.querySelectorAll("button")].find((b) =>
    b.textContent?.includes(text),
  );
  expect(button, `button "${text}"`).toBeTruthy();
  button!.click();
}

describe("ZeroPathSession", () => {
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

  it("runs the pilot lesson end-to-end and renders honest evidence read-back", async () => {
    await act(async () => {
      root.render(<ZeroPathSession lesson={lesson} />);
    });

    // context (non-assessed): shows scripted model, advances locally.
    expect(container.textContent).toContain("Hi, I'm Maya");
    clickButton(container, "Tiếp tục");
    await flush();

    // comprehend (assessed, choice): click a choice → feedback → continue.
    clickButton(container, "name");
    await flush();
    expect(container.textContent).toContain("Bước");
    clickButton(container, "Tiếp tục");
    await flush();

    // notice (non-assessed): continue.
    clickButton(container, "Tiếp tục");
    await flush();

    // retrieve (assessed, free text): type a response and submit.
    const textarea = container.querySelector("textarea")!;
    await act(async () => {
      // React 19 onChange
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!;
      setter.call(textarea, "my name is hoang");
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    });
    clickButton(container, "Gửi");
    await flush();
    clickButton(container, "Tiếp tục");
    await flush();

    // produce: free text.
    const textarea2 = container.querySelector("textarea")!;
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!;
      setter.call(textarea2, "my name is hoang");
      textarea2.dispatchEvent(new Event("input", { bubbles: true }));
    });
    clickButton(container, "Gửi");
    await flush();
    clickButton(container, "Tiếp tục");
    await flush();

    // feedback (non-assessed): continue.
    clickButton(container, "Tiếp tục");
    await flush();

    // repair: free text with repair signal.
    const textarea3 = container.querySelector("textarea")!;
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!;
      setter.call(textarea3, "sorry could you say that again");
      textarea3.dispatchEvent(new Event("input", { bubbles: true }));
    });
    clickButton(container, "Gửi");
    await flush();
    clickButton(container, "Tiếp tục");
    await flush();

    // retry is attempt-only: respondable (collects a response + feedback)
    // but mints no evidence.
    const textareaRetry = container.querySelector("textarea")!;
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!;
      setter.call(textareaRetry, "my name is hoang");
      textareaRetry.dispatchEvent(new Event("input", { bubbles: true }));
    });
    clickButton(container, "Gửi");
    await flush();
    clickButton(container, "Tiếp tục");
    await flush();

    // transfer: free text.
    const textarea4 = container.querySelector("textarea")!;
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!;
      setter.call(textarea4, "could you say that again my name is hoang");
      textarea4.dispatchEvent(new Event("input", { bubbles: true }));
    });
    clickButton(container, "Gửi");
    await flush();
    clickButton(container, "Xem bằng chứng buổi học");
    await flush();

    // Read-back: per-activity constructs with honest labels, no score/mastery.
    expect(container.textContent).toContain("Bằng chứng buổi học");
    expect(container.textContent).toContain("Đọc hiểu");
    expect(container.textContent).toContain("Viết");
    expect(container.textContent).toContain("Tương tác viết");
    expect(container.textContent).toContain("không phải điểm số hay mức thành thạo");
  });
});
