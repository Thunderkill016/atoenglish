"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  BookOpen,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SecondaryPageShell } from "@/components/design-system";
import {
  UNIT_VOCABULARY,
  type VocabularyItem,
} from "@/lib/constants/vocabulary";
import { UNITS } from "@/lib/constants/units";
import { saveQuizResult } from "@/app/actions/quiz";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Question {
  word: string;
  phonetic: string;
  correct: string;
  options: string[];
}

type AnswerState = "unanswered" | "correct" | "wrong";

// ── Helpers ───────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestions(unitId: string, count = 10): Question[] {
  const vocab = UNIT_VOCABULARY[unitId] ?? [];
  if (vocab.length < 4) return [];

  // Use all distractors from same unit
  const allMeanings = vocab.map((v) => v.meaning_vn);

  return shuffle(vocab)
    .slice(0, Math.min(count, vocab.length))
    .map((item) => {
      const distractors = shuffle(
        allMeanings.filter((m) => m !== item.meaning_vn),
      ).slice(0, 3);
      return {
        word: item.word,
        phonetic: item.phonetic,
        correct: item.meaning_vn,
        options: shuffle([item.meaning_vn, ...distractors]),
      };
    });
}

// ── Quiz component ────────────────────────────────────────────────────────────
export default function VocabQuizClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("unanswered");
  const [finished, setFinished] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [xpEarned, setXpEarned] = useState(0);
  const [streak, setStreak] = useState(0); // consecutive correct answers

  const startQuiz = useCallback((unitId: string) => {
    const qs = buildQuestions(unitId);
    if (qs.length === 0) return;
    setSelectedUnit(unitId);
    setQuestions(qs);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setAnswerState("unanswered");
    setFinished(false);
    setWrongAnswers([]);
    setStreak(0);
  }, []);

  // Pre-select unit from ?unit= URL param (e.g. from learn page quiz shortcut)
  useEffect(() => {
    const unitParam = searchParams.get("unit");
    if (unitParam && !selectedUnit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startQuiz(unitParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = (option: string) => {
    if (answerState !== "unanswered") return;
    setSelected(option);
    const q = questions[current];
    const isCorrect = option === q.correct;
    setAnswerState(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      setStreak((s) => s + 1);
      // Auto-advance after 700ms on correct — avoids stale closure by using refs to state
      setTimeout(() => {
        const nextIdx = current + 1;
        if (nextIdx >= questions.length) {
          setFinished(true);
          if (selectedUnit) {
            saveQuizResult({
              unitId: selectedUnit,
              score: newScore,
              total: questions.length,
            })
              .then((res) => {
                if (res.success && res.xpEarned) {
                  setXpEarned(res.xpEarned);
                  toast.success(`+${res.xpEarned} XP — quiz hoàn thành!`);
                }
              })
              .catch(() => {
                /* silent */
              });
          }
        } else {
          setCurrent(nextIdx);
          setSelected(null);
          setAnswerState("unanswered");
        }
      }, 700);
    } else {
      setStreak(0);
      setWrongAnswers((w) => [...w, q.word]);
    }
  };

  const nextQuestion = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
      // Award XP on quiz completion (fire-and-forget, non-blocking)
      if (selectedUnit) {
        saveQuizResult({ unitId: selectedUnit, score, total: questions.length })
          .then((res) => {
            if (res.success && res.xpEarned) {
              setXpEarned(res.xpEarned);
              toast.success(`+${res.xpEarned} XP — quiz hoàn thành!`);
            }
          })
          .catch(() => {
            /* silent fail — XP is best-effort */
          });
      }
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswerState("unanswered");
    }
  };

  const pct =
    questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  // ── Unit Selection Screen ────────────────────────────────────────────────
  if (!selectedUnit) {
    return (
      <SecondaryPageShell
        title="Kiểm tra Từ vựng"
        subtitle="Chọn unit để bắt đầu quiz trắc nghiệm từ vựng"
      >
        <div className="space-y-3 pb-16">
          {UNITS.map((unit) => {
            const vocab = UNIT_VOCABULARY[unit.id] ?? [];
            const hasEnough = vocab.length >= 4;
            return (
              <button
                key={unit.id}
                type="button"
                disabled={!hasEnough}
                onClick={() => startQuiz(unit.id)}
                className={`w-full text-left rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
                  hasEnough
                    ? "border-border/60 bg-white/60 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                    : "border-border/30 opacity-40 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-foreground">
                      {unit.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {vocab.length} từ vựng · {unit.level}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                      unit.level === "A1"
                        ? "text-primary bg-primary/10 border-primary/20"
                        : unit.level === "A2"
                          ? "text-primary bg-primary/10 border-primary/20"
                          : "text-primary bg-primary/10 border-primary/20"
                    }`}
                  >
                    {unit.level}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </SecondaryPageShell>
    );
  }

  // ── Finished Screen ──────────────────────────────────────────────────────
  if (finished) {
    const medal = pct >= 90 ? "🥇" : pct >= 70 ? "🥈" : pct >= 50 ? "🥉" : "📚";
    const msg =
      pct >= 90
        ? "Xuất sắc! Bạn nắm vững từ vựng unit này."
        : pct >= 70
          ? "Tốt lắm! Ôn lại các từ bị sai nhé."
          : pct >= 50
            ? "Cần ôn thêm — tiếp tục luyện tập!"
            : "Quay lại bài học và luyện SRS nhiều hơn.";

    return (
      <SecondaryPageShell
        title="Kiểm tra Từ vựng"
        subtitle={`${score}/${questions.length} đúng · ${pct}%`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md text-center space-y-6 pb-16"
        >
          <div className="text-6xl">{medal}</div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-foreground">
              {score}/{questions.length} đúng
            </h2>
            <p className="text-sm text-muted-foreground">{msg}</p>
            {xpEarned > 0 && (
              <p className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 inline-block mt-1">
                ✨ Nhận được +{xpEarned} XP
              </p>
            )}
          </div>

          {/* Score bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-muted-foreground">
              <span>Kết quả</span>
              <span className={pct >= 70 ? "text-primary" : "text-warning"}>
                {pct}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${pct >= 70 ? "bg-primary" : "bg-warning"}`}
              />
            </div>
          </div>

          {wrongAnswers.length > 0 && (
            <div className="text-left rounded-xl border border-warning/20 bg-warning/5 p-4 space-y-2">
              <p className="text-xs font-bold text-warning uppercase tracking-wider">
                Từ cần ôn lại
              </p>
              <div className="flex flex-wrap gap-2">
                {wrongAnswers.map((w) => (
                  <span
                    key={w}
                    className="text-xs px-2 py-0.5 rounded-lg bg-warning/10 text-warning border border-warning/20 font-medium"
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center pt-2">
            <Button
              onClick={() => startQuiz(selectedUnit)}
              className="gap-2 bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary text-white rounded-xl h-11 px-5 active:scale-95 transition-all"
            >
              <RotateCcw className="size-4" />
              Làm lại
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedUnit(null)}
              className="gap-2 rounded-xl h-11 px-5 border-border"
            >
              <BookOpen className="size-4" />
              Đổi Unit
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/review")}
              className="gap-2 rounded-xl h-11 px-5 border-border"
            >
              <Flame className="size-4" />
              Ôn SRS
            </Button>
          </div>
        </motion.div>
      </SecondaryPageShell>
    );
  }

  // ── Quiz Question Screen ─────────────────────────────────────────────────
  const q = questions[current];
  const progressPct = Math.round((current / questions.length) * 100);

  return (
    <SecondaryPageShell
      title="Kiểm tra Từ vựng"
      subtitle={`Câu ${current + 1} / ${questions.length} · ${score} đúng`}
    >
      <div className="mx-auto max-w-lg space-y-6 pb-16">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-muted-foreground">
            <span>
              {current + 1} / {questions.length}
            </span>
            <div className="flex items-center gap-2">
              {streak >= 3 && (
                <span className="text-warning font-black text-xs flex items-center gap-0.5">
                  🔥 {streak} streak
                </span>
              )}
              <span className="text-primary">{score} đúng</span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-border/60 bg-white/60 backdrop-blur-sm p-6 sm:p-8 text-center space-y-2"
          >
            <p className="text-xs font-bold text-primary uppercase tracking-wider">
              Từ vựng
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground capitalize">
              {q.word}
            </h2>
            <p className="text-sm font-mono text-muted-foreground">
              {q.phonetic}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Nghĩa tiếng Việt là gì?
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
          {q.options.map((opt) => {
            let style =
              "border-border/60 bg-white/60 hover:border-primary/40 hover:bg-primary/5";
            if (answerState !== "unanswered") {
              if (opt === q.correct) {
                style = "border-primary/60 bg-primary/10 text-primary";
              } else if (opt === selected && opt !== q.correct) {
                style =
                  "border-destructive/60 bg-destructive/10 text-destructive";
              } else {
                style = "border-border/30 opacity-50";
              }
            }

            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleAnswer(opt)}
                disabled={answerState !== "unanswered"}
                className={`w-full text-left rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all duration-150 flex items-center justify-between ${style}`}
              >
                <span>{opt}</span>
                {answerState !== "unanswered" && opt === q.correct && (
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                )}
                {answerState !== "unanswered" &&
                  opt === selected &&
                  opt !== q.correct && (
                    <XCircle className="size-4 text-destructive shrink-0" />
                  )}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        {answerState !== "unanswered" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <Button
              onClick={nextQuestion}
              className="gap-2 bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary text-white rounded-xl h-11 px-8 active:scale-95 transition-all shadow-md shadow-primary/20"
            >
              {current + 1 >= questions.length ? (
                <>
                  <Trophy className="size-4" />
                  Xem kết quả
                </>
              ) : (
                <>
                  Câu tiếp theo
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </SecondaryPageShell>
  );
}
