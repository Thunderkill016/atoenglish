"use client";

import {
  useRef,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Mic,
  RotateCcw,
  ShieldCheck,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";

import { recordLearningAttempts } from "@/app/actions/learning-attempts";
import { MinimalButton } from "@/components/design-system";
import type { LessonSpecV1 } from "@/lib/lessons/lesson-spec";
import {
  evaluateMissionTranscript,
  type MissionEvaluationResult,
} from "@/lib/missions/mission-evaluator";
import type {
  MissionSpecV1,
  MissionTransferVariant,
} from "@/lib/missions/mission-spec";

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface SpeechRecognitionErrorEventLike {
  error?: string;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type StartRecognition = (onTranscript: (transcript: string) => void) => void;
type MissionLesson = LessonSpecV1 & { mission: MissionSpecV1 };
type TransferStage = "scenario" | "roleplay" | "feedback" | "retry" | "done";

interface MissionTransferRunnerProps {
  lesson: MissionLesson;
  variant: MissionTransferVariant;
  returnRoute?: string;
}

interface TransferSpeechInputProps {
  speechSupported: boolean;
  isListening: boolean;
  fallbackText: string;
  setFallbackText: Dispatch<SetStateAction<string>>;
  startRecognition: StartRecognition;
  onSubmit: (value: string) => void;
}

const subscribeToBrowserCapability = () => () => {};

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const browserWindow = window as unknown as Record<string, unknown>;
  return (browserWindow.SpeechRecognition ??
    browserWindow.webkitSpeechRecognition ??
    null) as SpeechRecognitionConstructor | null;
}

function speakText(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}

function TransferSpeechInput({
  speechSupported,
  isListening,
  fallbackText,
  setFallbackText,
  startRecognition,
  onSubmit,
}: TransferSpeechInputProps) {
  if (speechSupported) {
    return (
      <MinimalButton
        fullWidth
        disabled={isListening}
        onClick={() => startRecognition(onSubmit)}
      >
        <Mic className="size-4" />
        {isListening ? "Đang nghe..." : "Bắt đầu nói"}
      </MinimalButton>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
      <div className="flex gap-2 text-sm text-amber-700 dark:text-amber-200">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p>
          Hãy tự nói thành tiếng rồi nhập lại điều vừa nói. Nội dung nhập chỉ
          kiểm tra mục tiêu giao tiếp, không phải điểm phát âm.
        </p>
      </div>
      <textarea
        value={fallbackText}
        onChange={(event) => setFallbackText(event.target.value)}
        rows={3}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        placeholder="Nhập lại câu bạn vừa tự nói..."
      />
      <MinimalButton fullWidth onClick={() => onSubmit(fallbackText)}>
        Gửi câu vừa nói <ArrowRight className="size-4" />
      </MinimalButton>
    </div>
  );
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
  const [isListening, setIsListening] = useState(false);
  const [evaluation, setEvaluation] = useState<MissionEvaluationResult | null>(
    null,
  );
  const [evidenceState, setEvidenceState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechSupported = useSyncExternalStore(
    subscribeToBrowserCapability,
    () => getSpeechRecognitionConstructor() !== null,
    () => false,
  );
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

  const startRecognition: StartRecognition = (onTranscript) => {
    const Constructor = getSpeechRecognitionConstructor();
    if (!Constructor) return;
    recognitionRef.current?.abort();
    const recognition = new Constructor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      setIsListening(false);
      onTranscript(event.results[0]?.[0]?.transcript?.trim() ?? "");
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      toast.error(
        event.error === "not-allowed"
          ? "Microphone đang bị chặn. Hãy cấp quyền rồi thử lại."
          : "Chưa nhận được giọng nói. Hãy thử lại.",
      );
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
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
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => router.push(returnRoute)}
            className="min-h-11 rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:bg-muted"
          >
            Thoát
          </button>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressByStage[stage]}%` }}
            />
          </div>
          <span className="text-xs font-black text-primary">Transfer</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
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
            <TransferSpeechInput {...speechInputProps} onSubmit={submitTurn} />
          </section>
        )}

        {stage === "feedback" && evaluation && (
          <section className="space-y-5">
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <div className="flex items-start gap-3">
                {evaluation.taskCompleted ? (
                  <CheckCircle2 className="size-6 shrink-0 text-emerald-500" />
                ) : (
                  <RotateCcw className="size-6 shrink-0 text-amber-500" />
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
                  className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4"
                >
                  <p className="text-xs font-black text-amber-500">
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
            <TransferSpeechInput {...speechInputProps} onSubmit={submitRetry} />
          </section>
        )}

        {stage === "done" && evaluation && (
          <section className="space-y-5">
            <div
              className={`rounded-2xl border p-5 ${
                evaluation.taskCompleted
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-amber-500/30 bg-amber-500/10"
              }`}
            >
              {evaluation.taskCompleted ? (
                <CheckCircle2 className="size-8 text-emerald-500" />
              ) : (
                <RotateCcw className="size-8 text-amber-500" />
              )}
              <h1 className="mt-3 text-2xl font-black">
                {evaluation.taskCompleted
                  ? "Transfer đã đạt"
                  : "Transfer chưa đạt"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Retry cuối: {evaluation.taskScore ?? 0}%. Chỉ kết quả retry
                trong cùng phiên mới được dùng để xác nhận hoàn tất.
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
      </div>
    </div>
  );
}
