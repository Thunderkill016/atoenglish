"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Lock,
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Zap,
  Star,
} from "lucide-react";
import { SecondaryPageShell, MinimalButton } from "@/components/design-system";
import { toast } from "sonner";
import {
  claimTrialCheckpoint,
  revealTrialCheckpointAnswer,
} from "@/app/actions/learning-attempts";

/**
 * Learner-safe question shape — no answer key, no explanation. Answers are
 * revealed one at a time by `revealTrialCheckpointAnswer` after the learner
 * commits a selection; the full-set claim is re-scored server-side.
 */
export interface CheckpointQuestionView {
  id: string;
  question: string;
  options: string[];
}

interface Props {
  phaseLabel: string;
  description: string;
  completedCount: number;
  totalCount: number;
  isUnlocked: boolean;
  questions: CheckpointQuestionView[];
  passThreshold: number;
}

interface RevealedAnswer {
  correct: boolean;
  correctAnswer: string;
  explanation: string;
}

export default function CheckpointClient({
  phaseLabel,
  description,
  completedCount,
  totalCount,
  isUnlocked,
  questions,
  passThreshold,
}: Props) {
  const router = useRouter();

  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [revealed, setRevealed] = useState<RevealedAnswer | null>(null);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [answerRecord, setAnswerRecord] = useState<Record<string, string>>({});
  const [trialClaimState, setTrialClaimState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const q = questions[current];
  const isCorrect = revealed?.correct === true;
  const passed = score >= passThreshold;

  const handleConfirm = useCallback(async () => {
    if (!selected || confirmed || revealing || !q) return;
    setRevealing(true);
    const result = await revealTrialCheckpointAnswer({
      questionId: q.id,
      answer: selected,
    });
    setRevealing(false);
    if (!result.success) {
      toast.error(result.error ?? "Không thể kiểm tra đáp án.");
      return;
    }
    setConfirmed(true);
    setRevealed({
      correct: result.correct,
      correctAnswer: result.correctAnswer,
      explanation: result.explanation,
    });
    setAnswerRecord((previous) => ({ ...previous, [q.id]: selected }));
    if (result.correct) {
      setScore((prev) => prev + 1);
    } else {
      setWrongAnswers((prev) => [...prev, q.id]);
    }
  }, [selected, confirmed, revealing, q]);

  const submitTrialClaim = useCallback(() => {
    if (typeof crypto === "undefined" || !("randomUUID" in crypto)) {
      setTrialClaimState("error");
      return;
    }

    setTrialClaimState("saving");
    void claimTrialCheckpoint({
      sessionId: crypto.randomUUID(),
      answers: answerRecord,
    }).then((result) => {
      if (result.success) {
        setTrialClaimState("saved");
      } else {
        setTrialClaimState("error");
        toast.error(result.error);
      }
    });
  }, [answerRecord]);

  const handleNext = useCallback(() => {
    if (current < questions.length - 1) {
      setCurrent((prev) => prev + 1);
      setSelected(null);
      setConfirmed(false);
      setRevealed(null);
    } else {
      submitTrialClaim();
      setFinished(true);
    }
  }, [current, questions.length, submitTrialClaim]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!started || finished) return;
      if (confirmed) {
        if (e.code === "Space" || e.code === "Enter") {
          e.preventDefault();
          handleNext();
        }
        return;
      }
      const numKey = parseInt(e.key);
      if (numKey >= 1 && numKey <= q.options.length) {
        setSelected(q.options[numKey - 1]);
      }
      if ((e.code === "Space" || e.code === "Enter") && selected) {
        e.preventDefault();
        void handleConfirm();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [started, finished, confirmed, selected, q, handleNext, handleConfirm]);

  // LOCKED STATE
  if (!isUnlocked) {
    const pct = Math.round((completedCount / totalCount) * 100);
    return (
      <SecondaryPageShell
        title={`Checkpoint ${phaseLabel}`}
        subtitle="Chưa mở khoá"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 py-8"
        >
          <div className="inline-flex size-20 items-center justify-center rounded-3xl bg-muted border border-border">
            <Lock className="size-10 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-black">
              Bài kiểm tra {phaseLabel} chưa mở khoá
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hoàn thành tất cả{" "}
              <span className="font-bold text-foreground">
                {totalCount} bài học
              </span>{" "}
              của chặng {phaseLabel} để mở khoá bài kiểm tra tổng hợp.
            </p>
            <p className="text-sm font-bold text-primary">
              {completedCount}/{totalCount} bài đã hoàn thành ({pct}%)
            </p>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary"
            />
          </div>
          <MinimalButton fullWidth onClick={() => router.push("/learn")}>
            <BookOpen className="size-4" /> Tiếp tục học
          </MinimalButton>
        </motion.div>
      </SecondaryPageShell>
    );
  }

  // START SCREEN
  if (!started) {
    return (
      <SecondaryPageShell
        title={`Kiểm tra ${phaseLabel}`}
        subtitle={description}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6 py-4"
        >
          <div className="text-center space-y-4">
            <div className="inline-flex size-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20">
              <Trophy className="size-10 text-primary" />
            </div>
            <h1 className="text-3xl font-black">Kiểm tra {phaseLabel}</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Bài kiểm tra{" "}
              <span className="font-bold text-foreground">
                {questions.length} câu hỏi
              </span>{" "}
              xác nhận kiến thức cốt lõi. Cần đúng{" "}
              <span className="font-bold text-primary">
                {passThreshold}/{questions.length} câu
              </span>{" "}
              để tiếp tục.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Hướng dẫn
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />{" "}
                Nhấn chọn đáp án rồi nhấn <strong>&quot;Xác nhận&quot;</strong>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />{" "}
                Phím tắt: <strong>1-4</strong> chọn đáp án ·{" "}
                <strong>Space/Enter</strong> xác nhận
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />{" "}
                Sau mỗi câu sẽ có giải thích tiếng Việt
              </li>
              <li className="flex items-start gap-2">
                <Zap className="size-4 text-warning shrink-0 mt-0.5" /> Đúng{" "}
                {passThreshold}/{questions.length} câu để tiếp tục học.
              </li>
            </ul>
          </div>

          <MinimalButton
            data-testid="start-checkpoint"
            fullWidth
            onClick={() => setStarted(true)}
          >
            Bắt đầu kiểm tra <ArrowRight className="size-5" />
          </MinimalButton>
          <MinimalButton
            variant="ghost"
            fullWidth
            onClick={() => router.push("/learn")}
          >
            Ôn lại bài học trước
          </MinimalButton>
        </motion.div>
      </SecondaryPageShell>
    );
  }

  // FINISHED SCREEN
  if (finished) {
    return (
      <SecondaryPageShell
        title={passed ? "Đã pass!" : "Cần ôn thêm"}
        subtitle={`${score}/${questions.length} câu đúng`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 py-4"
        >
          <div
            className={`inline-flex size-20 items-center justify-center rounded-3xl ${passed ? "bg-primary/10 border border-primary/20" : "bg-destructive/10 border border-destructive/20"}`}
          >
            {passed ? (
              <Trophy className="size-10 text-primary" />
            ) : (
              <XCircle className="size-10 text-destructive" />
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black">
              {passed ? "🎉 Xuất sắc! Bạn đã pass!" : "Cần ôn thêm một chút!"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {passed
                ? `Bạn đúng ${score}/${questions.length} câu và đã đủ điều kiện học tiếp.`
                : `Bạn đúng ${score}/${questions.length} câu. Cần ${passThreshold - score} câu nữa để tiếp tục.`}
            </p>
          </div>

          {/* Score display */}
          <div className="flex justify-center gap-2">
            {questions.map((question, i) => (
              <div
                key={question.id}
                className={`size-3 rounded-full ${wrongAnswers.includes(questions[i].id) ? "bg-destructive" : "bg-primary"}`}
              />
            ))}
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-1">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`size-8 ${score >= s * Math.ceil(questions.length / 3) ? "text-warning fill-warning" : "text-foreground"}`}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {trialClaimState === "saving" && (
              <p className="text-sm text-muted-foreground">
                Đang lưu bằng chứng checkpoint...
              </p>
            )}
            {trialClaimState === "error" && (
              <p className="text-sm text-destructive">
                Chưa thể ghi nhận kết quả. Hãy làm lại checkpoint.
              </p>
            )}
            {passed && trialClaimState === "saved" && (
              <MinimalButton fullWidth onClick={() => router.push("/learn")}>
                <BookOpen className="size-4" /> Học tiếp bài mới
              </MinimalButton>
            )}
            <MinimalButton
              data-testid="retry-checkpoint"
              variant="secondary"
              fullWidth
              onClick={() => {
                setCurrent(0);
                setSelected(null);
                setConfirmed(false);
                setRevealed(null);
                setScore(0);
                setWrongAnswers([]);
                setAnswerRecord({});
                setTrialClaimState("idle");
                setFinished(false);
                setStarted(true);
              }}
            >
              <RotateCcw className="size-4" /> Làm lại
            </MinimalButton>
            <MinimalButton
              variant="ghost"
              fullWidth
              onClick={() => router.push("/learn")}
            >
              Về Học
            </MinimalButton>
          </div>
        </motion.div>
      </SecondaryPageShell>
    );
  }

  // QUIZ SCREEN
  const progress = ((current + (confirmed ? 1 : 0)) / questions.length) * 100;

  return (
    <SecondaryPageShell
      title={`${phaseLabel} · Câu ${current + 1}/${questions.length}`}
      subtitle={`✓ ${score} đúng`}
    >
      <div className="space-y-5 pb-16">
        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5"
          >
            <p className="text-base sm:text-lg font-bold text-foreground leading-relaxed">
              {q.question}
            </p>

            <div className="space-y-2.5">
              {q.options.map((opt, idx) => {
                let style =
                  "border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5 text-foreground";
                if (confirmed && revealed) {
                  if (opt === revealed.correctAnswer)
                    style =
                      "border-primary bg-primary/10 text-primary font-bold";
                  else if (opt === selected && !isCorrect)
                    style =
                      "border-destructive bg-destructive/10 text-destructive";
                  else
                    style =
                      "border-border bg-muted/10 text-muted-foreground opacity-50";
                } else if (selected === opt) {
                  style = "border-primary bg-primary/10 text-primary font-bold";
                }

                return (
                  <button
                    key={opt}
                    disabled={confirmed || revealing}
                    onClick={() => !confirmed && setSelected(opt)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all duration-150 ${style}`}
                  >
                    <span className="shrink-0 size-6 rounded-lg border border-current/20 bg-current/5 flex items-center justify-center text-xs font-black">
                      {idx + 1}
                    </span>
                    <span>{opt}</span>
                    {confirmed &&
                      revealed &&
                      opt === revealed.correctAnswer && (
                        <CheckCircle2 className="size-4 ml-auto text-primary shrink-0" />
                      )}
                    {confirmed &&
                      revealed &&
                      opt === selected &&
                      !isCorrect && (
                        <XCircle className="size-4 ml-auto text-destructive shrink-0" />
                      )}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {confirmed && revealed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`rounded-xl p-4 text-sm leading-relaxed ${isCorrect ? "bg-primary/5 border border-primary/20 text-primary" : "bg-warning/5 border border-warning/20 text-warning"}`}
                >
                  <span className="font-black">💡 Giải thích: </span>
                  {revealed.explanation}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Action button */}
        {!confirmed ? (
          <MinimalButton
            data-testid="confirm-checkpoint-answer"
            fullWidth
            disabled={!selected || revealing}
            onClick={() => void handleConfirm()}
          >
            {revealing ? "Đang kiểm tra..." : "Xác nhận"}
          </MinimalButton>
        ) : (
          <MinimalButton
            data-testid="next-checkpoint-question"
            fullWidth
            onClick={handleNext}
          >
            {current < questions.length - 1 ? "Câu tiếp theo" : "Xem kết quả"}{" "}
            <ArrowRight className="size-4" />
          </MinimalButton>
        )}
      </div>
    </SecondaryPageShell>
  );
}
