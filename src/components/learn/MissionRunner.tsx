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
import {
  createMissionSession,
  transitionMissionSession,
} from "@/lib/missions/mission-engine";
import type { MissionSpecV1 } from "@/lib/missions/mission-spec";

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
type MissionLesson = LessonSpecV1 & { mission: MissionSpecV1 };

type StartRecognition = (onTranscript: (transcript: string) => void) => void;

interface MissionRunnerProps {
  lesson: MissionLesson;
  nextRoute: string;
}

interface SpeechInputPanelProps {
  speechSupported: boolean;
  isListening: boolean;
  fallbackText: string;
  setFallbackText: Dispatch<SetStateAction<string>>;
  startRecognition: StartRecognition;
  onSubmit: (value: string) => void;
  placeholder: string;
}

const STAGE_ORDER = [
  "scenario",
  "model",
  "guided_roleplay",
  "independent_roleplay",
  "feedback",
  "retry",
  "transfer",
] as const;

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
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
}

function scoreLabel(result: MissionEvaluationResult | null) {
  if (!result || result.taskScore === null) return "Chưa có bằng chứng để chấm";
  return `${result.taskScore}% mục tiêu giao tiếp`;
}

function SpeechInputPanel({
  speechSupported,
  isListening,
  fallbackText,
  setFallbackText,
  startRecognition,
  onSubmit,
  placeholder,
}: SpeechInputPanelProps) {
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
    <div className="space-y-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
      <div className="flex gap-2 text-sm text-warning">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p>
          Trình duyệt chưa hỗ trợ nhận diện giọng nói. Hãy tự nói thành tiếng
          rồi nhập lại điều vừa nói. Nội dung nhập chỉ kiểm tra mục tiêu giao
          tiếp, không phải phát âm.
        </p>
      </div>
      <textarea
        value={fallbackText}
        onChange={(event) => setFallbackText(event.target.value)}
        rows={3}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        placeholder={placeholder}
      />
      <MinimalButton fullWidth onClick={() => onSubmit(fallbackText)}>
        Gửi câu vừa nói <ArrowRight className="size-4" />
      </MinimalButton>
    </div>
  );
}

export default function MissionRunner({
  lesson,
  nextRoute,
}: MissionRunnerProps) {
  const router = useRouter();
  const mission = lesson.mission;
  const [session, setSession] = useState(() => createMissionSession(mission));
  const [isListening, setIsListening] = useState(false);
  const [fallbackText, setFallbackText] = useState("");
  const [evidenceState, setEvidenceState] = useState<
    "idle" | "saving" | "saved" | "local"
  >("idle");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechSupported = useSyncExternalStore(
    subscribeToBrowserCapability,
    () => getSpeechRecognitionConstructor() !== null,
    () => false,
  );
  const [attemptSessionId] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : null,
  );

  const persistEvaluation = async (evaluation: MissionEvaluationResult) => {
    if (!attemptSessionId || evaluation.taskScore === null) {
      setEvidenceState("local");
      return;
    }

    setEvidenceState("saving");
    const result = await recordLearningAttempts({
      sessionId: attemptSessionId,
      lessonId: lesson.id,
      attempts: [
        {
          activityId: `${lesson.id}:mission:${mission.id}`,
          modality: "speaking",
          status: "scored",
          score: evaluation.taskScore,
          errorTags: evaluation.missingIntentIds.slice(0, 3),
          evaluator: evaluation.evidence.evaluator,
          evaluatorVersion: evaluation.evidence.evaluatorVersion,
          latencyMs: null,
        },
      ],
    });

    setEvidenceState(result.success ? "saved" : "local");
    if (!result.success && !result.error.includes("đăng nhập")) {
      toast.error("Chưa lưu được bằng chứng nhiệm vụ.");
    }
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

  const evaluateAndShowFeedback = (
    transcripts: string[],
    currentSession = session,
  ) => {
    const evaluation = evaluateMissionTranscript(mission, transcripts);
    const evaluated = transitionMissionSession(mission, currentSession, {
      type: "EVALUATE",
      result: evaluation,
    });
    setSession(evaluated);
    void persistEvaluation(evaluation);
  };

  const submitRoleplayTurn = (transcript: string) => {
    if (!transcript.trim()) {
      toast.error("Chưa nhận được câu trả lời. Hãy thử nói lại.");
      return;
    }

    const next = transitionMissionSession(mission, session, {
      type: "SUBMIT_TURN",
      transcript,
    });
    setFallbackText("");

    if (next.currentTurnIndex >= mission.roleplayTurns.length) {
      evaluateAndShowFeedback(next.transcripts, next);
    } else {
      setSession(next);
    }
  };

  const submitRetry = (transcript: string) => {
    if (!transcript.trim()) {
      toast.error("Hãy thực hiện lại toàn bộ nhiệm vụ bằng ít nhất một câu.");
      return;
    }

    const withRetry = transitionMissionSession(mission, session, {
      type: "SUBMIT_RETRY",
      transcript,
    });
    const evaluation = evaluateMissionTranscript(
      mission,
      withRetry.transcripts,
    );
    const evaluated = transitionMissionSession(mission, withRetry, {
      type: "RETRY_EVALUATED",
      result: evaluation,
    });
    setFallbackText("");
    setSession(evaluated);
    void persistEvaluation(evaluation);
  };

  const progress = Math.max(
    1,
    STAGE_ORDER.indexOf(session.stage as (typeof STAGE_ORDER)[number]) + 1,
  );
  const currentTurn = mission.roleplayTurns[session.currentTurnIndex];
  const requiredIntentCount = mission.intents.filter(
    (intent) => intent.required,
  ).length;
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
            onClick={() => router.push("/learn")}
            className="min-h-11 rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:bg-muted"
          >
            Thoát
          </button>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${Math.round((progress / STAGE_ORDER.length) * 100)}%`,
              }}
            />
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {Math.min(progress, STAGE_ORDER.length)}/{STAGE_ORDER.length}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        {session.stage === "scenario" && (
          <section className="space-y-6">
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-primary">
                Nhiệm vụ giao tiếp
              </p>
              <h1 className="mt-2 text-2xl font-black">{mission.titleVi}</h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {mission.scenarioVi}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-sm font-bold">Đích đến</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {mission.canDoVi}
              </p>
              <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                <p>
                  <strong className="text-foreground">Vai của bạn:</strong>{" "}
                  {mission.learnerRoleVi}
                </p>
                <p>
                  <strong className="text-foreground">Đối tác:</strong>{" "}
                  {mission.partnerName} — {mission.partnerRoleVi}
                </p>
              </div>
            </div>
            <MinimalButton
              fullWidth
              onClick={() =>
                setSession((current) =>
                  transitionMissionSession(mission, current, { type: "START" }),
                )
              }
            >
              Bắt đầu nhiệm vụ <ArrowRight className="size-4" />
            </MinimalButton>
          </section>
        )}

        {session.stage === "model" && (
          <section className="space-y-5">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-primary">
                Ngôn ngữ vừa đủ
              </p>
              <h1 className="mt-1 text-2xl font-black">
                {mission.targetChunks.length} cụm dùng ngay
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Nghe, hiểu lúc dùng và chọn cụm phù hợp; không học thuộc danh
                sách rời rạc.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {mission.targetChunks.map((chunk) => (
                <button
                  key={chunk.id}
                  type="button"
                  onClick={() =>
                    speakText(chunk.english.replace("...", "Minh"))
                  }
                  className="rounded-xl border border-border/60 bg-card p-4 text-left transition-colors hover:border-primary/50"
                >
                  <span className="flex items-center justify-between gap-3">
                    <strong className="text-sm">{chunk.english}</strong>
                    <Volume2
                      className="size-4 shrink-0 text-primary"
                      aria-hidden
                    />
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {chunk.vietnamese}
                  </span>
                  <span className="mt-2 block text-xs text-muted-foreground/80">
                    {chunk.useWhenVi}
                  </span>
                </button>
              ))}
            </div>
            <MinimalButton
              fullWidth
              onClick={() =>
                setSession((current) =>
                  transitionMissionSession(mission, current, {
                    type: "MODEL_COMPLETE",
                  }),
                )
              }
            >
              Thực hành có hướng dẫn <ArrowRight className="size-4" />
            </MinimalButton>
          </section>
        )}

        {session.stage === "guided_roleplay" && (
          <section className="space-y-5">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-primary">
                Tập trước khi nói thật
              </p>
              <h1 className="mt-1 text-2xl font-black">
                Xem {mission.roleplayTurns.length} lượt hội thoại
              </h1>
            </div>
            <div className="space-y-3">
              {mission.roleplayTurns.map((turn, index) => (
                <div
                  key={turn.id}
                  className="rounded-xl border border-border/60 bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => speakText(turn.partnerLine)}
                        className="flex w-full items-start justify-between gap-3 text-left"
                      >
                        <strong className="text-sm">
                          {mission.partnerName}: {turn.partnerLine}
                        </strong>
                        <Volume2
                          className="size-4 shrink-0 text-primary"
                          aria-hidden
                        />
                      </button>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {turn.partnerLineVi}
                      </p>
                      <p className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                        Gợi ý: {turn.hintVi}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <MinimalButton
              fullWidth
              onClick={() =>
                setSession((current) =>
                  transitionMissionSession(mission, current, {
                    type: "GUIDED_COMPLETE",
                  }),
                )
              }
            >
              Bỏ câu mẫu, bắt đầu roleplay <ArrowRight className="size-4" />
            </MinimalButton>
          </section>
        )}

        {session.stage === "independent_roleplay" && currentTurn && (
          <section className="space-y-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-primary">
                Roleplay {session.currentTurnIndex + 1}/
                {mission.roleplayTurns.length}
              </p>
              <h1 className="mt-1 text-2xl font-black">
                Trả lời không nhìn câu mẫu
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
            <SpeechInputPanel
              {...speechInputProps}
              onSubmit={submitRoleplayTurn}
              placeholder="Nhập lại câu bạn vừa tự nói..."
            />
            <details className="rounded-lg border border-border/60 px-4 py-3 text-sm">
              <summary className="cursor-pointer font-semibold text-muted-foreground">
                Tôi bị đứng hình
              </summary>
              <p className="mt-2 text-muted-foreground">{currentTurn.hintVi}</p>
            </details>
          </section>
        )}

        {session.stage === "feedback" && session.evaluation && (
          <section className="space-y-5">
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <div className="flex items-start gap-3">
                {session.evaluation.taskCompleted ? (
                  <CheckCircle2 className="size-6 shrink-0 text-primary" />
                ) : (
                  <RotateCcw className="size-6 shrink-0 text-warning" />
                )}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Kết quả nhiệm vụ
                  </p>
                  <h1 className="mt-1 text-2xl font-black">
                    {scoreLabel(session.evaluation)}
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Đã thể hiện {session.evaluation.completedIntentIds.length}/
                    {requiredIntentCount} mục tiêu bắt buộc.
                  </p>
                </div>
              </div>
            </div>

            {session.evaluation.corrections.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-bold">
                  Chỉ sửa {session.evaluation.corrections.length} điểm quan
                  trọng nhất
                </p>
                {session.evaluation.corrections.map((correction, index) => (
                  <div
                    key={correction.code}
                    className="rounded-xl border border-warning/30 bg-warning/10 p-4"
                  >
                    <p className="text-xs font-black text-warning">
                      Sửa {index + 1}
                    </p>
                    {correction.original && (
                      <p className="mt-2 text-sm text-muted-foreground line-through">
                        {correction.original}
                      </p>
                    )}
                    <p className="mt-1 text-sm font-bold">
                      {correction.suggestion}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {correction.explanationVi}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm">
                Bạn đã thể hiện đủ mục tiêu giao tiếp trong transcript.
              </div>
            )}

            <div className="flex gap-2 rounded-xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0 text-primary" />
              <p>
                Điểm chỉ đo nội dung giao tiếp trong transcript. Không có điểm
                phát âm, accent hoặc độ dễ hiểu giả.
              </p>
            </div>
            <MinimalButton
              fullWidth
              onClick={() =>
                setSession((current) =>
                  transitionMissionSession(mission, current, {
                    type: "SHOW_FEEDBACK",
                  }),
                )
              }
            >
              Nói lại toàn bộ nhiệm vụ <ArrowRight className="size-4" />
            </MinimalButton>
          </section>
        )}

        {session.stage === "retry" && session.evaluation && (
          <section className="space-y-5">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-primary">
                Retry bắt buộc
              </p>
              <h1 className="mt-1 text-2xl font-black">
                Biến feedback thành kỹ năng
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {session.evaluation.retryInstructionVi}
              </p>
            </div>
            <SpeechInputPanel
              {...speechInputProps}
              onSubmit={submitRetry}
              placeholder="Tự thực hiện lại toàn bộ nhiệm vụ rồi nhập lại..."
            />
          </section>
        )}

        {session.stage === "transfer" && (
          <section className="space-y-5">
            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5">
              <CheckCircle2 className="size-8 text-primary" />
              <h1 className="mt-3 text-2xl font-black">
                Hoàn thành vòng luyện tập
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {scoreLabel(session.evaluation)}. Checkpoint tiếp theo mới xác
                nhận mastery; transfer 1/7/30 ngày sẽ kiểm tra khả năng dùng
                trong bối cảnh mới.
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-sm font-bold">Lịch transfer test</p>
              <div className="mt-3 space-y-3">
                {mission.transferVariants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                      +{variant.dueAfterDays}
                    </span>
                    <div>
                      <p className="font-semibold">
                        Sau {variant.dueAfterDays} ngày
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {variant.scenarioVi}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {evidenceState === "saved"
                ? "Đã lưu evidence; không lưu raw audio hoặc transcript."
                : evidenceState === "saving"
                  ? "Đang lưu evidence..."
                  : "Evidence hiện chỉ nằm trong phiên này; đăng nhập để lưu tiến độ."}
            </p>
            <MinimalButton
              fullWidth
              onClick={() => {
                setSession((current) =>
                  transitionMissionSession(mission, current, {
                    type: "COMPLETE",
                  }),
                );
                router.push(nextRoute);
              }}
            >
              Làm checkpoint xác nhận <ArrowRight className="size-4" />
            </MinimalButton>
          </section>
        )}
      </div>
    </div>
  );
}
