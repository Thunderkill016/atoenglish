"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";

import { recordLearningAttempts } from "@/app/actions/learning-attempts";
import { MinimalButton } from "@/components/design-system";
import {
  RunnerShell,
  RunnerSpeechInput,
  useSpeechRecognition,
} from "@/components/learn/runner-shell";
import type { LessonSpecV1 } from "@/lib/lessons/lesson-spec";
import {
  evaluateMissionTranscript,
  type MissionEvaluationResult,
} from "@/lib/missions/mission-evaluator";
import type {
  MissionSpecV1,
  MissionTransferVariant,
} from "@/lib/missions/mission-spec";
import { speakEnglish } from "@/lib/speech";

type MissionLesson = LessonSpecV1 & { mission: MissionSpecV1 };
type TransferStage = "scenario" | "roleplay" | "feedback" | "retry" | "done";

interface MissionTransferRunnerProps {
  lesson: MissionLesson;
  variant: MissionTransferVariant;
  returnRoute?: string;
}

function speakText(text: string) {
  speakEnglish(text, 1);
}

export default function MissionTransferRunner({
  lesson,
  variant,
  returnRoute = "/learn",
}: MissionTransferRunnerProps) {
  const router = useRouter();
  const mission = lesson.mission;
  const turns = mission.roleplayTurns.map((turn, index) => ({
    ...turn,
    partnerLine: variant.partnerLines[index] ?? turn.partnerLine,
    partnerLineVi:
      index === 0
        ? variant.scenarioVi
        : `Lượt ${index + 1} trong bối cảnh transfer; không dùng lại câu mẫu cũ.`,
  }));
  const [stage, setStage] = useState<TransferStage>("scenario");
  const [turnIndex, setTurnIndex] = useState(0);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [fallbackText, setFallbackText] = useState("");
  const [evaluation, setEvaluation] = useState<MissionEvaluationResult | null>(
    null,
  );
  const [evidenceState, setEvidenceState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const { speechSupported, isListening, startRecognition } =
    useSpeechRecognition();
  const [sessionId] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : null,
  );

  const persistEvaluation = async (result: MissionEvaluationResult) => {
    if (!sessionId || result.taskScore === null) return;
    setEvidenceState("saving");
    const saved = await recordLearningAttempts({
      sessionId,
      lessonId: lesson.id,
      attempts: [
        {
          activityId: `${lesson.id}:transfer:${variant.id}`,
          modality: "speaking",
          status: "scored",
          score: result.taskScore,
          errorTags: result.missingIntentIds.slice(0, 3),
          evaluator: result.evidence.evaluator,
          evaluatorVersion: result.evidence.evaluatorVersion,
          latencyMs: null,
        },
      ],
    });
    setEvidenceState(saved.success ? "saved" : "error");
  };

  const finishRoleplay = (answers: string[]) => {
    const result = evaluateMissionTranscript(mission, answers);
    setEvaluation(result);
    setStage("feedback");
    void persistEvaluation(result);
  };

  const submitTurn = (transcript: string) => {
    if (!transcript.trim()) {
      toast.error("Chưa nhận được câu trả lời. Hãy thử nói lại.");
      return;
    }
    const nextAnswers = [...transcripts, transcript.trim()];
    setFallbackText("");
    setTranscripts(nextAnswers);
    if (turnIndex >= turns.length - 1) {
      finishRoleplay(nextAnswers);
      return;
    }
    setTurnIndex((current) => current + 1);
  };

  const submitRetry = (transcript: string) => {
    if (!transcript.trim()) {
      toast.error("Hãy thực hiện lại toàn bộ nhiệm vụ.");
      return;
    }
    const result = evaluateMissionTranscript(mission, [
      ...transcripts,
      transcript.trim(),
    ]);
    setEvaluation(result);
    setFallbackText("");
    setStage("done");
    void persistEvaluation(result);
  };

  const currentTurn = turns[turnIndex];
  const progressByStage: Record<TransferStage, number> = {
    scenario: 10,
    roleplay: 20 + Math.round((turnIndex / turns.length) * 55),
    feedback: 80,
    retry: 90,
    done: 100,
  };
  const speechInputProps = {
    speechSupported,
    isListening,
    fallbackText,
    setFallbackText,
    startRecognition,
  };

  return (
    <RunnerShell
      onBack={() => router.push(returnRoute)}
      backLabel="Thoát"
      progress={progressByStage[stage]}
      status={<span className="text-xs font-black text-primary">Transfer</span>}
    >
      {stage === "scenario" && (
        <section className="space-y-5">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-primary">
              Kiểm tra sau {variant.dueAfterDays} ngày
            </p>
            <h1 className="mt-2 text-2xl font-black">{mission.titleVi}</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {variant.scenarioVi}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-sm font-bold">Điểm đã thay đổi</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {variant.changedConditions.map((condition) => (
                <li key={condition} className="flex gap-2">
                  <span className="text-primary">•</span> {condition}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            Không xem lại chunks. Cả {turns.length} lượt hội thoại đã được đổi
            để kiểm tra transfer, không chỉ thay câu mở đầu.
          </p>
          <MinimalButton fullWidth onClick={() => setStage("roleplay")}>
            Bắt đầu kiểm tra <ArrowRight className="size-4" />
          </MinimalButton>
        </section>
      )}

      {stage === "roleplay" && currentTurn && (
        <section className="space-y-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-primary">
              Lượt {turnIndex + 1}/{turns.length}
            </p>
            <h1 className="mt-1 text-2xl font-black">
              Trả lời không có câu mẫu
            </h1>
          </div>
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-primary">
                  {mission.partnerName} nói
                </p>
                <p className="mt-2 text-lg font-bold">
                  {currentTurn.partnerLine}
                </p>
              </div>
              <button
                type="button"
                onClick={() => speakText(currentTurn.partnerLine)}
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                aria-label={`Nghe câu của ${mission.partnerName}`}
              >
                <Volume2 className="size-5" />
              </button>
            </div>
          </div>
          <RunnerSpeechInput {...speechInputProps} onSubmit={submitTurn} />
        </section>
      )}

      {stage === "feedback" && evaluation && (
        <section className="space-y-5">
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <div className="flex items-start gap-3">
              {evaluation.taskCompleted ? (
                <CheckCircle2 className="size-6 shrink-0 text-primary" />
              ) : (
                <RotateCcw className="size-6 shrink-0 text-warning" />
              )}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Kết quả transfer
                </p>
                <h1 className="mt-1 text-2xl font-black">
                  {evaluation.taskScore ?? 0}% mục tiêu giao tiếp
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {evaluation.taskCompleted
                    ? "Bạn đã lấy được kỹ năng ra dùng trong bối cảnh mới."
                    : "Bạn chưa thể hiện đủ các mục tiêu trong bối cảnh mới."}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {evaluation.corrections.map((correction, index) => (
              <div
                key={correction.code}
                className="rounded-xl border border-warning/30 bg-warning/10 p-4"
              >
                <p className="text-xs font-black text-warning">
                  Sửa {index + 1}
                </p>
                <p className="mt-2 text-sm font-bold">
                  {correction.suggestion}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {correction.explanationVi}
                </p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 rounded-xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-primary" />
            <p>
              Transfer score chỉ dựa trên mục tiêu giao tiếp trong transcript;
              không có điểm phát âm hoặc độ dễ hiểu giả.
            </p>
          </div>
          <MinimalButton fullWidth onClick={() => setStage("retry")}>
            Thực hiện lại toàn bộ nhiệm vụ <ArrowRight className="size-4" />
          </MinimalButton>
        </section>
      )}

      {stage === "retry" && evaluation && (
        <section className="space-y-5">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-primary">
              Retry
            </p>
            <h1 className="mt-1 text-2xl font-black">
              Tự tạo một lượt trả lời hoàn chỉnh
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {evaluation.retryInstructionVi}
            </p>
          </div>
          <RunnerSpeechInput {...speechInputProps} onSubmit={submitRetry} />
        </section>
      )}

      {stage === "done" && evaluation && (
        <section className="space-y-5">
          <div
            className={`rounded-2xl border p-5 ${
              evaluation.taskCompleted
                ? "border-primary/30 bg-primary/10"
                : "border-warning/30 bg-warning/10"
            }`}
          >
            {evaluation.taskCompleted ? (
              <CheckCircle2 className="size-8 text-primary" />
            ) : (
              <RotateCcw className="size-8 text-warning" />
            )}
            <h1 className="mt-3 text-2xl font-black">
              {evaluation.taskCompleted
                ? "Transfer đã đạt"
                : "Transfer chưa đạt"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Retry cuối: {evaluation.taskScore ?? 0}%. Chỉ kết quả retry trong
              cùng phiên mới được dùng để xác nhận hoàn tất.
            </p>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {evidenceState === "saved"
              ? "Evidence đã được lưu."
              : evidenceState === "saving"
                ? "Đang lưu evidence..."
                : evidenceState === "error"
                  ? "Chưa lưu được evidence; bài vẫn sẽ còn trong hàng đợi."
                  : "Chưa có evidence được lưu."}
          </p>
          <MinimalButton fullWidth onClick={() => router.push(returnRoute)}>
            Quay lại lộ trình <ArrowRight className="size-4" />
          </MinimalButton>
        </section>
      )}
    </RunnerShell>
  );
}
