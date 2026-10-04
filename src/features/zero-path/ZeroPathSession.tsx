"use client";

import { useEffect, useRef, useState } from "react";

import {
  getZeroPathReadModel,
  startZeroPathPilotSession,
  submitZeroPathResponse,
} from "@/app/actions/zero-path";
import type { ZeroPathSessionReadModel } from "@/lib/nep/session-read-model";
import type { ZeroPathClaimId } from "@/lib/nep/core-evidence-wiring.v1";
import type {
  ZeroPathActionEnvelope,
  ZeroPathLessonEnvelope,
} from "@/lib/nep/zero-path-pilot.v1";

const ACTIVITY_LABELS: Record<string, string> = {
  "reading-reception": "Đọc hiểu",
  "listening-reception": "Nghe hiểu",
  "spoken-production": "Nói",
  "written-production": "Viết",
  "spoken-interaction": "Tương tác nói",
  "written-interaction": "Tương tác viết",
};

const STATUS_LABELS: Record<string, string> = {
  unknown: "Chưa có dữ liệu",
  "insufficient-support": "Chưa đủ bằng chứng",
  "provisional-support": "Có tín hiệu tốt",
  "provisional-weakness": "Cần luyện thêm",
  "conflicted-support": "Tín hiệu lẫn lộn",
  observed: "Đã ghi nhận",
};

const CLAIM_LABELS: Record<ZeroPathClaimId, string> = {
  understand_written: "Hiểu chữ viết",
  recognize_audio: "Nhận diện âm thanh",
  retrieve_form: "Nhớ lại mẫu câu",
  produce_in_context: "Tự sản xuất",
  interactional_repair: "Tự xử lý khó khăn",
  use_novel_context: "Dùng trong ngữ cảnh mới",
};

const KIND_LABELS: Record<ZeroPathActionEnvelope["kind"], string> = {
  context: "Bối cảnh",
  comprehend: "Đọc hiểu",
  notice: "Để ý mẫu câu",
  retrieve: "Nhớ lại",
  produce: "Tự nói",
  feedback: "Gợi ý",
  repair: "Xử lý khó khăn",
  retry: "Thử lại",
  transfer: "Ngữ cảnh mới",
  reflect: "Tự đánh giá",
};

type StepState =
  | { readonly phase: "answering" }
  | {
      readonly phase: "feedback";
      readonly feedback: string;
      /** neutral = unassessed self-report or transport-level outcome. */
      readonly verdict: "correct" | "incorrect" | "neutral";
    };

export function ZeroPathSession({
  lesson,
  mode = "learn",
  resume = null,
}: {
  lesson: ZeroPathLessonEnvelope;
  /** Server-bound session mode: "review" marks attempts as delayed re-observation. */
  mode?: "learn" | "review";
  /**
   * Durable-session resume: when present the session continues at the first
   * action without a stored outcome, using the already-minted session id.
   */
  resume?: { sessionId: string; completedActionIds: readonly string[] } | null;
}) {
  const resumeIndex = resume
    ? lesson.actions.findIndex(
        (item) => !resume.completedActionIds.includes(item.actionId),
      )
    : 0;
  const resumedComplete = resume !== null && resumeIndex === -1;
  const [started, setStarted] = useState(resume !== null);
  const [sessionId, setSessionId] = useState<string | null>(
    resume?.sessionId ?? null,
  );
  const [index, setIndex] = useState(
    resumedComplete ? lesson.actions.length - 1 : resumeIndex,
  );
  const [step, setStep] = useState<StepState>({ phase: "answering" });
  const [response, setResponse] = useState("");
  const [supportLevel, setSupportLevel] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [model, setModel] = useState<ZeroPathSessionReadModel | null>(null);
  const actionStartedAt = useRef(0);
  const idempotencyKey = useRef(crypto.randomUUID());

  useEffect(() => {
    actionStartedAt.current = Date.now();
    idempotencyKey.current = crypto.randomUUID();
  }, [index]);

  // Resumed sessions that already completed every action skip straight to
  // the read-model summary rather than replaying the final action.
  useEffect(() => {
    if (resumedComplete && sessionId) {
      void getZeroPathReadModel(sessionId).then((readModel) => {
        if (readModel) setModel(readModel);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only hydration
  }, []);

  async function start() {
    const result = await startZeroPathPilotSession(
      lesson.lessonId,
      mode === "review" ? "review" : undefined,
    );
    if (!result.sessionId) {
      setStartError("Đang có quá nhiều yêu cầu — thử lại sau ít phút nhé.");
      return;
    }
    setStartError(null);
    setSessionId(result.sessionId);
    setStarted(true);
  }

  const action = lesson.actions[index];
  const isLast = index >= lesson.actions.length - 1;

  function advance() {
    setResponse("");
    setSupportLevel(0);
    setStep({ phase: "answering" });
    if (isLast && sessionId) {
      void getZeroPathReadModel(sessionId).then((readModel) => {
        if (readModel) setModel(readModel);
      });
    } else {
      setIndex(index + 1);
    }
  }

  async function submit(rawResponse: string) {
    if (!action?.respondable) {
      advance();
      return;
    }
    if (!sessionId) return;
    setSubmitting(true);
    try {
      const result = await submitZeroPathResponse(sessionId, {
        lessonId: lesson.lessonId,
        lessonVersion: lesson.lessonVersion,
        actionId: action.actionId,
        idempotencyKey: idempotencyKey.current,
        response: rawResponse,
        responseSource: rawResponse.trim() ? "text" : null,
        supportLevelUsed: supportLevel,
        latencyMs: Math.max(0, Date.now() - actionStartedAt.current),
      });
      const evaluation = "evaluation" in result ? result.evaluation : null;
      setStep({
        phase: "feedback",
        feedback:
          "feedback" in result
            ? result.feedback
            : "Không ghi nhận được câu trả lời. Thử lại nhé.",
        verdict:
          evaluation == null
            ? "neutral"
            : evaluation.success
              ? "correct"
              : "incorrect",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (model) return <SessionSummary model={model} />;

  if (!started) {
    return (
      <section
        aria-label="Giới thiệu buổi học"
        className="flex min-h-[68vh] flex-col justify-center space-y-5"
      >
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-600">
            {mode === "review" ? "Buổi ôn tập" : "Buổi học"}
          </p>
          <h2 className="text-xl font-bold text-foreground">
            {lesson.mission}
          </h2>
          <p className="text-sm text-muted-foreground">
            Mục tiêu: {lesson.learnerCanDo}
          </p>
          <p className="text-sm text-muted-foreground">
            {mode === "review"
              ? `${lesson.actions.length} bước — ôn lại sau một thời gian giúp đánh giá khả năng ghi nhớ.`
              : `${lesson.actions.length} bước — đáp án luôn ẩn cho đến khi bạn thử, và có thể gõ thay vì nói.`}
          </p>
        </div>
        {startError ? (
          <p role="alert" className="text-sm font-medium text-amber-600">
            {startError}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => void start()}
          className="w-full rounded-2xl bg-sky-500 px-5 py-3.5 text-base font-bold text-white shadow-[0_3px_0_0_rgba(2,132,199,0.4)] transition hover:bg-sky-600 active:translate-y-0.5 active:shadow-none"
        >
          Bắt đầu
        </button>
      </section>
    );
  }

  if (!action) {
    return (
      <p className="text-sm text-muted-foreground">
        Không tải được bài học pilot. Thử tải lại trang.
      </p>
    );
  }

  return (
    <section
      aria-label="Bài học zero-path"
      className="flex min-h-[68vh] flex-col"
    >
      <ProgressBar current={index} total={lesson.actions.length} />

      <div className="flex-1 space-y-5 py-6">
        <p className="text-xs font-bold uppercase tracking-widest text-sky-600">
          {KIND_LABELS[action.kind] ?? action.kind}
        </p>
        <h2 className="text-xl font-bold text-foreground">{action.title}</h2>
        <p className="text-sm text-muted-foreground">{action.instruction}</p>
        {action.prompt ? (
          <p className="rounded-2xl border-2 border-border bg-card px-5 py-4 text-lg font-medium text-foreground">
            {action.prompt}
          </p>
        ) : null}
        {action.model ? (
          <p className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 px-5 py-4 text-lg font-medium text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
            {action.model}
          </p>
        ) : null}

        {action.respondable && action.supportSteps.length > 0 ? (
          <div className="space-y-2">
            {action.supportSteps
              .slice(0, supportLevel)
              .map((rung, rungIndex) => (
                <p
                  key={rungIndex}
                  className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100"
                >
                  {rung}
                </p>
              ))}
            {supportLevel < action.supportSteps.length ? (
              <button
                type="button"
                onClick={() => setSupportLevel(supportLevel + 1)}
                className="text-sm font-semibold text-amber-700 dark:text-amber-300 underline dark:text-amber-400 underline-offset-2"
              >
                {supportLevel === 0 ? "Cần gợi ý?" : "Gợi ý thêm"}
              </button>
            ) : null}
          </div>
        ) : null}
        {!action.respondable && action.supportVi ? (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
            {action.supportVi}
          </p>
        ) : null}

        {step.phase === "answering" && action.respondable ? (
          action.choices.length > 0 ? (
            <div className="grid gap-2.5">
              {action.choices.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  disabled={submitting || !sessionId}
                  onClick={() => void submit(choice)}
                  className="rounded-2xl border-2 border-border bg-card px-5 py-4 text-left text-base font-semibold text-foreground shadow-[0_2px_0_0_var(--border)] transition hover:border-sky-300 hover:bg-sky-50 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
                >
                  {choice}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              value={response}
              onChange={(event) => setResponse(event.target.value)}
              rows={2}
              placeholder="Gõ câu tiếng Anh của bạn…"
              className="w-full rounded-2xl border-2 border-border bg-muted/50 px-5 py-4 text-lg text-foreground focus:border-sky-400 focus:bg-white focus:outline-none"
            />
          )
        ) : null}
      </div>

      {step.phase === "feedback" ? (
        <div
          className={`sticky bottom-0 -mx-4 space-y-3 border-t-4 px-4 py-5 sm:mx-0 sm:rounded-t-3xl sm:border-x-4 ${
            step.verdict === "correct"
              ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
              : step.verdict === "incorrect"
                ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
                : "border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950"
          }`}
          role="status"
        >
          <p
            className={`text-base font-bold ${
              step.verdict === "correct"
                ? "text-emerald-700 dark:text-emerald-300"
                : step.verdict === "incorrect"
                  ? "text-amber-700 dark:text-amber-300"
                  : "text-sky-700 dark:text-sky-300"
            }`}
          >
            {step.verdict === "correct"
              ? "Chính xác!"
              : step.verdict === "incorrect"
                ? "Gần được rồi"
                : "Đã ghi nhận"}
          </p>
          <p className="text-sm text-foreground">{step.feedback}</p>
          <button
            type="button"
            onClick={advance}
            className={`w-full rounded-2xl px-5 py-3.5 text-base font-bold text-white shadow-[0_3px_0_0_rgba(0,0,0,0.15)] transition active:translate-y-0.5 active:shadow-none ${
              step.verdict === "correct"
                ? "bg-emerald-500 hover:bg-emerald-600"
                : step.verdict === "incorrect"
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-sky-500 hover:bg-sky-600"
            }`}
          >
            {isLast ? "Xem bằng chứng buổi học" : "Tiếp tục"}
          </button>
        </div>
      ) : action.respondable && action.choices.length === 0 ? (
        <button
          type="button"
          disabled={submitting || !response.trim() || !sessionId}
          onClick={() => void submit(response)}
          className="w-full rounded-2xl bg-sky-500 px-5 py-3.5 text-base font-bold text-white shadow-[0_3px_0_0_rgba(2,132,199,0.4)] transition hover:bg-sky-600 active:translate-y-0.5 active:shadow-none disabled:opacity-40"
        >
          {submitting ? "Đang chấm…" : "Kiểm tra"}
        </button>
      ) : !action.respondable ? (
        <button
          type="button"
          onClick={advance}
          className="w-full rounded-2xl bg-sky-500 px-5 py-3.5 text-base font-bold text-white shadow-[0_3px_0_0_rgba(2,132,199,0.4)] transition hover:bg-sky-600 active:translate-y-0.5 active:shadow-none"
        >
          {isLast ? "Xem bằng chứng buổi học" : "Tiếp tục"}
        </button>
      ) : null}
    </section>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 pt-2" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2.5 flex-1 rounded-full ${
            i <= current ? "bg-emerald-400" : "bg-muted"
          }`}
        />
      ))}
    </div>
  );
}

function SessionSummary({ model }: { model: ZeroPathSessionReadModel }) {
  return (
    <section className="space-y-5" aria-label="Bằng chứng buổi học">
      <h2 className="text-xl font-bold text-foreground">Bằng chứng buổi học</h2>
      <div className="rounded-3xl bg-emerald-500 px-6 py-8 text-center text-white">
        <p className="text-3xl font-black">{model.evidenceMinted}</p>
        <p className="mt-1 text-sm font-semibold opacity-90">
          bằng chứng ghi nhận được · {model.submissions} lượt trả lời
        </p>
      </div>
      <ul className="space-y-3">
        {model.constructs.map((construct) => {
          const key = construct.targetId.split(".").pop() ?? construct.targetId;
          return (
            <li
              key={construct.targetId}
              className="rounded-2xl border-2 border-border bg-card px-5 py-4"
            >
              <p className="text-sm font-bold text-foreground">
                {ACTIVITY_LABELS[key] ?? key}
              </p>
              <p className="text-sm text-muted-foreground">
                {construct.read.evidenceCount} bằng chứng ·{" "}
                {STATUS_LABELS[construct.read.sourceStatus] ??
                  construct.read.sourceStatus}
              </p>
              {construct.claims.length > 0 ? (
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {construct.claims
                    .map((claim) => CLAIM_LABELS[claim] ?? claim)
                    .join(" · ")}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
      {model.skippedAttemptOnly > 0 ||
      model.selfReports > 0 ||
      model.rejectedCount > 0 ? (
        <p className="text-xs text-muted-foreground">
          {model.skippedAttemptOnly > 0
            ? `${model.skippedAttemptOnly} lượt luyện tập không tạo bằng chứng. `
            : ""}
          {model.selfReports > 0
            ? `${model.selfReports} tự đánh giá đã ghi nhận. `
            : ""}
          {model.rejectedCount > 0
            ? `${model.rejectedCount} bằng chứng bị từ chối.`
            : ""}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Đây là bằng chứng quan sát được, không phải điểm số hay mức thành thạo.
      </p>
    </section>
  );
}
