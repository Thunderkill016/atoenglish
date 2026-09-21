"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { submitZeroPathResponse } from "@/app/actions/zero-path";
import type { ReferenceCoreEvidence } from "@/lib/core/certified-evidence";
import { buildEnglishOntologyV1 } from "@/lib/core/ontology-seed";
import {
  buildSessionReadModel,
  type ZeroPathSessionReadModel,
} from "@/lib/nep/session-read-model";
import type { ZeroPathClaimId } from "@/lib/nep/core-evidence-wiring.v1";
import type { ZeroPathLessonEnvelope } from "@/lib/nep/zero-path-pilot.v1";

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

type StepState =
  | { readonly phase: "answering" }
  | { readonly phase: "feedback"; readonly feedback: string };

export function ZeroPathSession({ lesson }: { lesson: ZeroPathLessonEnvelope }) {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState<StepState>({ phase: "answering" });
  const [response, setResponse] = useState("");
  const [supportRevealed, setSupportRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const actionStartedAt = useRef(0);
  const sequence = useRef(0);
  const sessionId = `zp-${useId().replace(/:/g, "")}`;
  const [accum, setAccum] = useState<{
    accepted: ReferenceCoreEvidence[];
    claimsByTarget: Map<string, Set<ZeroPathClaimId>>;
    submissions: number;
    skippedAttemptOnly: number;
    rejected: number;
  }>({
    accepted: [],
    claimsByTarget: new Map(),
    submissions: 0,
    skippedAttemptOnly: 0,
    rejected: 0,
  });
  const ontology = useMemo(() => {
    const built = buildEnglishOntologyV1();
    return built.ok ? built.graph : null;
  }, []);

  const action = lesson.actions[index];
  const isLast = index >= lesson.actions.length - 1;

  useEffect(() => {
    actionStartedAt.current = Date.now();
  }, [index]);

  function advance() {
    setResponse("");
    setSupportRevealed(false);
    setStep({ phase: "answering" });
    if (isLast) setFinished(true);
    else setIndex(index + 1);
  }

  async function submit(rawResponse: string) {
    if (!action?.respondable) {
      advance();
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitZeroPathResponse({
        lessonId: lesson.lessonId,
        lessonVersion: lesson.lessonVersion,
        actionId: action.actionId,
        response: rawResponse,
        responseSource: rawResponse.trim() ? "text" : null,
        supportUsed: supportRevealed,
        latencyMs: Math.max(0, Date.now() - actionStartedAt.current),
        sequence: sequence.current++,
      });
      setAccum((prev) => {
        if (
          result.kind === "rate-limited" ||
          result.kind === "invalid-input" ||
          result.kind === "unresolvable"
        ) {
          return prev;
        }
        const next = { ...prev, submissions: prev.submissions + 1 };
        if (result.kind === "evidence") {
          next.accepted = [...prev.accepted, result.evidence];
          next.claimsByTarget = new Map(prev.claimsByTarget);
          const set = new Set(next.claimsByTarget.get(result.evidence.targetId));
          set.add(result.claim);
          next.claimsByTarget.set(result.evidence.targetId, set);
        } else if (result.kind === "attempt-only") {
          next.skippedAttemptOnly = prev.skippedAttemptOnly + 1;
        } else {
          next.rejected = prev.rejected + 1;
        }
        return next;
      });
      setStep({
        phase: "feedback",
        feedback: "feedback" in result ? result.feedback : "Không ghi nhận được câu trả lời. Thử lại nhé.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const model: ZeroPathSessionReadModel | null =
    finished && ontology
      ? buildSessionReadModel({
          sessionId,
          submissions: accum.submissions,
          skippedAttemptOnly: accum.skippedAttemptOnly,
          rejectedBeforeProjection: accum.rejected,
          accepted: accum.accepted,
          claimsByTarget: accum.claimsByTarget,
          ontology,
        })
      : null;

  if (model) return <SessionSummary model={model} />;

  if (!action) {
    return (
      <p className="text-sm text-stone-500">
        Không tải được bài học pilot. Thử tải lại trang.
      </p>
    );
  }

  return (
    <section className="space-y-5" aria-label="Bài học zero-path">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
        Bước {index + 1}/{lesson.actions.length} · {action.kind}
      </p>
      <h2 className="text-lg font-semibold text-stone-900">{action.title}</h2>
      <p className="text-sm text-stone-600">{action.instruction}</p>
      {action.prompt ? (
        <p className="rounded-xl bg-stone-100 px-4 py-3 text-base text-stone-800">{action.prompt}</p>
      ) : null}
      {action.model ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-base text-emerald-900">{action.model}</p>
      ) : null}

      {action.respondable && action.supportVi ? (
        <div>
          {supportRevealed ? (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{action.supportVi}</p>
          ) : (
            <button
              type="button"
              onClick={() => setSupportRevealed(true)}
              className="text-sm font-medium text-amber-700 underline underline-offset-2"
            >
              Hiện hỗ trợ tiếng Việt
            </button>
          )}
        </div>
      ) : null}
      {!action.respondable && action.supportVi ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{action.supportVi}</p>
      ) : null}

      {step.phase === "feedback" ? (
        <div className="space-y-4">
          <p className="rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-900">{step.feedback}</p>
          <button
            type="button"
            onClick={advance}
            className="w-full rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white"
          >
            {isLast ? "Xem bằng chứng buổi học" : "Tiếp tục"}
          </button>
        </div>
      ) : action.respondable ? (
        <div className="space-y-3">
          {action.choices.length > 0 ? (
            <div className="grid gap-2">
              {action.choices.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  disabled={submitting}
                  onClick={() => void submit(choice)}
                  className="rounded-xl border border-stone-200 px-4 py-3 text-left text-sm font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-50"
                >
                  {choice}
                </button>
              ))}
            </div>
          ) : (
            <>
              <textarea
                value={response}
                onChange={(event) => setResponse(event.target.value)}
                rows={2}
                placeholder="Gõ câu tiếng Anh của bạn…"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-base text-stone-900 focus:border-stone-500 focus:outline-none"
              />
              <button
                type="button"
                disabled={submitting || !response.trim()}
                onClick={() => void submit(response)}
                className="w-full rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {submitting ? "Đang chấm…" : "Gửi câu trả lời"}
              </button>
            </>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={advance}
          className="w-full rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white"
        >
          {isLast ? "Xem bằng chứng buổi học" : "Tiếp tục"}
        </button>
      )}
    </section>
  );
}

function SessionSummary({ model }: { model: ZeroPathSessionReadModel }) {
  return (
    <section className="space-y-5" aria-label="Bằng chứng buổi học">
      <h2 className="text-lg font-semibold text-stone-900">Bằng chứng buổi học</h2>
      <p className="text-sm text-stone-600">
        {model.evidenceMinted} bằng chứng được ghi nhận từ {model.submissions} lượt trả lời.
        {model.skippedAttemptOnly > 0
          ? ` ${model.skippedAttemptOnly} lượt luyện tập không tạo bằng chứng.`
          : ""}
        {model.rejectedCount > 0 ? ` ${model.rejectedCount} bằng chứng bị từ chối.` : ""}
      </p>
      <ul className="space-y-3">
        {model.constructs.map((construct) => {
          const key = construct.targetId.split(".").pop() ?? construct.targetId;
          return (
            <li key={construct.targetId} className="rounded-xl border border-stone-200 px-4 py-3">
              <p className="text-sm font-semibold text-stone-900">
                {ACTIVITY_LABELS[key] ?? key}
              </p>
              <p className="text-sm text-stone-600">
                {construct.read.evidenceCount} bằng chứng ·{" "}
                {STATUS_LABELS[construct.read.sourceStatus] ?? construct.read.sourceStatus}
              </p>
              {construct.claims.length > 0 ? (
                <p className="mt-1 text-xs text-stone-500">
                  {construct.claims.map((claim) => CLAIM_LABELS[claim] ?? claim).join(" · ")}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-stone-400">
        Đây là bằng chứng quan sát được, không phải điểm số hay mức thành thạo.
      </p>
    </section>
  );
}
