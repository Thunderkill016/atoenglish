import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { createZeroPathSession } from "@/lib/nep/session-runner.v1";
import { zeroPathLessonEnvelope } from "@/lib/nep/zero-path-pilot.v1";

import { ZeroPathSession } from "./ZeroPathSession";

// The component test exercises the real session runner + wiring pipeline;
// only the server-action transport hop is mocked (a per-session runner map).
vi.mock("@/app/actions/zero-path", () => {
  const runners = new Map<string, ReturnType<typeof createZeroPathSession>>();
  let counter = 0;
  return {
    startZeroPathPilotSession: async () => {
      const sessionId = `test-${counter++}`;
      runners.set(sessionId, createZeroPathSession({ sessionId }));
      return { sessionId };
    },
    submitZeroPathResponse: async (
      sessionId: string,
      input: Parameters<
        ReturnType<typeof createZeroPathSession>["recordSubmission"]
      >[0],
    ) => {
      const runner = runners.get(sessionId);
      if (!runner) return { kind: "no-session" as const };
      const outcome = runner.recordSubmission(input);
      switch (outcome.kind) {
        case "rejected":
          return { kind: "unresolvable" as const };
        case "duplicate":
          return {
            kind: "duplicate" as const,
            evaluation:
              "evaluation" in outcome.prior ? outcome.prior.evaluation : null,
            feedback:
              "feedback" in outcome.prior
                ? outcome.prior.feedback
                : "Lượt này đã được ghi nhận trước đó.",
          };
        case "self-report":
          return { kind: "self-report" as const, feedback: outcome.feedback };
        case "attempt-only":
          return {
            kind: "attempt-only" as const,
            evaluation: outcome.evaluation,
            feedback: outcome.feedback,
          };
        case "evidence":
          return {
            kind: "evidence" as const,
            claim: outcome.claim,
            evaluation: outcome.evaluation,
            feedback: outcome.feedback,
          };
        case "invalid-evidence":
          return {
            kind: "invalid-evidence" as const,
            claim: outcome.claim,
            problems: outcome.problems.map((p) => JSON.stringify(p)),
            evaluation: outcome.evaluation,
            feedback: outcome.feedback,
          };
      }
    },
    getZeroPathReadModel: async (sessionId: string) => {
      // Resumed sessions were started by a previous process — the mock mints
      // a runner on first read, like the real durable store rehydrates one.
      if (!runners.has(sessionId)) {
        runners.set(sessionId, createZeroPathSession({ sessionId }));
      }
      return runners.get(sessionId)?.readModel() ?? null;
    },
  };
});

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

function typeAndSubmit(container: HTMLElement, text: string) {
  const textarea = container.querySelector("textarea")!;
  const setter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  )!.set!;
  setter.call(textarea, text);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

/** Types then clicks whichever submit the action renders ("Kiểm tra" for text, "Gửi câu vừa nói" for speech). */
function submitTypedAnswer(container: HTMLElement, text: string) {
  typeAndSubmit(container, text);
  const button = [...container.querySelectorAll("button")].find((b) =>
    ["Kiểm tra", "Gửi câu vừa nói"].some((label) =>
      b.textContent?.includes(label),
    ),
  );
  expect(button, "submit button").toBeTruthy();
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
    // Orientation: can-do outcome + step count shown before any action.
    expect(container.textContent).toContain(lesson.learnerCanDo);
    expect(container.textContent).toContain(`${lesson.actions.length} bước`);
    clickButton(container, "Bắt đầu");
    await flush();

    // context (non-respondable): shows scripted model, advances locally.
    expect(container.textContent).toContain("Hi, I'm Maya");
    clickButton(container, "Tiếp tục");
    await flush();

    // comprehend (respondable, choice): click a choice → feedback → continue.
    clickButton(container, "name");
    await flush();
    clickButton(container, "Tiếp tục");
    await flush();

    // notice (non-respondable): continue.
    clickButton(container, "Tiếp tục");
    await flush();

    // retrieve: free text.
    await act(async () => submitTypedAnswer(container, "my name is hoang"));
    await flush();
    clickButton(container, "Tiếp tục");
    await flush();

    // produce: free text.
    await act(async () => submitTypedAnswer(container, "my name is hoang"));
    await flush();
    clickButton(container, "Tiếp tục");
    await flush();

    // feedback (non-respondable): continue.
    clickButton(container, "Tiếp tục");
    await flush();

    // repair: free text with repair signal.
    await act(async () =>
      submitTypedAnswer(container, "sorry could you say that again"),
    );
    await flush();
    clickButton(container, "Tiếp tục");
    await flush();

    // retry is attempt-only: respondable (feedback) but mints no evidence.
    await act(async () => submitTypedAnswer(container, "my name is hoang"));
    await flush();
    clickButton(container, "Tiếp tục");
    await flush();

    // transfer: free text.
    await act(async () =>
      submitTypedAnswer(container, "could you say that again my name is hoang"),
    );
    await flush();
    clickButton(container, "Tiếp tục");
    await flush();

    // reflect: unassessed self-report — mints no evidence, neutral feedback.
    clickButton(container, "Tôi làm được nhưng còn chậm");
    await flush();
    clickButton(container, "Xem bằng chứng buổi học");
    await flush();

    // Read-back: per-activity constructs with honest labels, no score/mastery.
    expect(container.textContent).toContain("Bằng chứng buổi học");
    expect(container.textContent).toContain("Đọc hiểu");
    expect(container.textContent).toContain("Viết");
    expect(container.textContent).toContain("Tương tác viết");
    expect(container.textContent).toContain(
      "không phải điểm số hay mức thành thạo",
    );
  });

  it("resumes at the first action without a stored outcome — no replay, no orientation", async () => {
    const completed = lesson.actions
      .slice(0, 4)
      .map((action) => action.actionId);
    await act(async () => {
      root.render(
        <ZeroPathSession
          lesson={lesson}
          resume={{ sessionId: "resumed-1", completedActionIds: completed }}
        />,
      );
    });
    await flush();
    // Skips orientation entirely and lands on the 5th action (retrieve).
    expect(container.textContent).not.toContain("Bắt đầu");
    expect(container.textContent).toContain(
      lesson.actions[4].instruction ?? "",
    );
  });

  it("shows the read-model summary when a resumed session already finished", async () => {
    const completed = lesson.actions.map((action) => action.actionId);
    await act(async () => {
      root.render(
        <ZeroPathSession
          lesson={lesson}
          resume={{ sessionId: "resumed-2", completedActionIds: completed }}
        />,
      );
    });
    await flush();
    await flush();
    expect(container.textContent).toContain("Bằng chứng buổi học");
  });
});
