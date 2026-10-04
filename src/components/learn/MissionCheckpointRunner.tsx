"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { claimMissionCheckpoint } from "@/app/actions/mission-checkpoint";
import { MinimalButton } from "@/components/design-system";
import type { MissionSpecV1 } from "@/lib/missions/mission-spec";

interface MissionCheckpointRunnerProps {
  mission: MissionSpecV1;
  nextRoute: string;
}

interface ClaimResult {
  passed: boolean;
  correctCount: number;
  totalCount: number;
  reviewTargetsAdded: number;
}

export default function MissionCheckpointRunner({
  mission,
  nextRoute,
}: MissionCheckpointRunnerProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ClaimResult | null>(null);
  const [sessionId] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : null,
  );

  const submit = async () => {
    if (!sessionId) {
      toast.error("Không thể tạo phiên checkpoint an toàn.");
      return;
    }
    if (
      mission.checkpoint.questions.some(
        (question) => answers[question.id] === undefined,
      )
    ) {
      toast.error("Hãy trả lời đủ các câu checkpoint.");
      return;
    }

    setSubmitting(true);
    const response = await claimMissionCheckpoint({
      sessionId,
      lessonId: mission.lessonId,
      answers,
    });
    setSubmitting(false);

    if (!response.success) {
      toast.error(response.error);
      return;
    }

    setResult({
      passed: response.passed,
      correctCount: response.correctCount,
      totalCount: response.totalCount,
      reviewTargetsAdded: response.reviewTargetsAdded,
    });
  };

  if (result) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
          <div
            className={`rounded-2xl border p-6 ${
              result.passed
                ? "border-primary/30 bg-primary/10"
                : "border-warning/30 bg-warning/10"
            }`}
          >
            {result.passed ? (
              <CheckCircle2 className="size-9 text-primary" />
            ) : (
              <RotateCcw className="size-9 text-warning" />
            )}
            <p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
              Checkpoint · {mission.titleVi}
            </p>
            <h1 className="mt-2 text-2xl font-black">
              {result.passed
                ? "Mastery đã được ghi nhận"
                : "Chưa đủ bằng chứng mastery"}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Bạn trả lời đúng {result.correctCount}/{result.totalCount} câu.
              {result.passed
                ? ` ${result.reviewTargetsAdded} chunks đã được thêm vào lịch ôn FSRS.`
                : " Hãy xem giải thích, quay lại mission và thử checkpoint một lần nữa."}
            </p>
          </div>

          <div className="space-y-3">
            {mission.checkpoint.questions.map((question) => {
              const selected = answers[question.id];
              const correct = selected === question.answer;
              return (
                <div
                  key={question.id}
                  className="rounded-xl border border-border/60 bg-card p-4"
                >
                  <p className="text-sm font-bold">{question.questionVi}</p>
                  <p
                    className={`mt-2 text-sm ${correct ? "text-primary" : "text-warning"}`}
                  >
                    {correct
                      ? `Đúng: ${question.answer}`
                      : `Đáp án đúng: ${question.answer}`}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {question.explanationVi}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 rounded-xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-primary" />
            <p>
              Checkpoint này xác nhận kiến thức hỗ trợ cho cùng can-do outcome.
              Spoken mission evidence và checkpoint evidence được lưu tách biệt.
            </p>
          </div>

          {result.passed ? (
            <MinimalButton fullWidth onClick={() => router.push(nextRoute)}>
              Tiếp tục lộ trình <ArrowRight className="size-4" />
            </MinimalButton>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <MinimalButton
                fullWidth
                variant="secondary"
                onClick={() => router.push(`/learn/${mission.lessonId}`)}
              >
                Luyện lại mission
              </MinimalButton>
              <MinimalButton
                fullWidth
                onClick={() => {
                  setAnswers({});
                  setResult(null);
                }}
              >
                Làm lại checkpoint
              </MinimalButton>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => router.push(`/learn/${mission.lessonId}`)}
            className="min-h-11 rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:bg-muted"
          >
            Quay lại
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black">Checkpoint</p>
            <p className="truncate text-xs text-muted-foreground">
              {mission.titleVi}
            </p>
          </div>
          <span className="text-xs font-bold text-primary">
            Cần {mission.checkpoint.passThreshold}/
            {mission.checkpoint.questions.length}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <p className="text-xs font-black uppercase tracking-widest text-primary">
            Xác nhận mastery
          </p>
          <h1 className="mt-2 text-2xl font-black">{mission.canDoVi}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Chọn đáp án không xem lại chunks. Checkpoint không thay thế spoken
            evidence; nó kiểm tra các quyết định ngôn ngữ cốt lõi của cùng nhiệm
            vụ.
          </p>
        </div>

        <div className="space-y-5">
          {mission.checkpoint.questions.map((question, questionIndex) => (
            <fieldset
              key={question.id}
              className="rounded-xl border border-border/60 bg-card p-4"
            >
              <legend className="px-1 text-sm font-bold">
                {questionIndex + 1}. {question.questionVi}
              </legend>
              <div className="mt-3 grid gap-2">
                {question.options.map((option) => {
                  const selected = answers[question.id] === option;
                  return (
                    <label
                      key={option}
                      className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        selected
                          ? "border-primary bg-primary/10"
                          : "border-border/60 hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={selected}
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            [question.id]: option,
                          }))
                        }
                        className="size-4 accent-primary"
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <MinimalButton fullWidth disabled={submitting} onClick={submit}>
          {submitting ? "Đang chấm..." : "Nộp checkpoint"}
          {!submitting && <ArrowRight className="size-4" />}
        </MinimalButton>
      </div>
    </div>
  );
}
