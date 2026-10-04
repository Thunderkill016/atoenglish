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
import { UNIT_VOCABULARY, type VocabularyItem } from "@/lib/constants/vocabulary";
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
        allMeanings.filter((m) => m !== item.meaning_vn)
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
            saveQuizResult({ unitId: selectedUnit, score: newScore, total: questions.length })
              .then((res) => {
                if (res.success && res.xpEarned) {
                  setXpEarned(res.xpEarned);
                  toast.success(`+${res.xpEarned} XP — quiz hoàn thành!`);
                }
              })
              .catch(() => { /* silent */ });
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
          .catch(() => { /* silent fail — XP is best-effort */ });
      }
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswerState("unanswered");
    }
  };

  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

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
                    ? "border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/25 hover:border-violet-500/40 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                    : "border-zinc-200/30 dark:border-zinc-800/30 opacity-40 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-zinc-900 dark:text-zinc-50">
                      {unit.title}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {vocab.length} từ vựng · {unit.level}
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                    unit.level === "A1" ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                    unit.level === "A2" ? "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20" :
                    "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20"
                  }`}>
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
      pct >= 90 ? "Xuất sắc! Bạn nắm vững từ vựng unit này." :
      pct >= 70 ? "Tốt lắm! Ôn lại các từ bị sai nhé." :
      pct >= 50 ? "Cần ôn thêm — tiếp tục luyện tập!" :
      "Quay lại bài học và luyện SRS nhiều hơn.";

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
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {score}/{questions.length} đúng
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{msg}</p>
          {xpEarned > 0 && (
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 inline-block mt-1">
              ✨ Nhận được +{xpEarned} XP
            </p>
          )}
        </div>

        {/* Score bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-zinc-500">
            <span>Kết quả</span>
            <span className={pct >= 70 ? "text-emerald-600 dark:text-emerald-400" : "text-orange-500"}>{pct}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${pct >= 70 ? "bg-emerald-500" : "bg-orange-500"}`}
            />
          </div>
        </div>

        {wrongAnswers.length > 0 && (
          <div className="text-left rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 space-y-2">
            <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Từ cần ôn lại</p>
            <div className="flex flex-wrap gap-2">
              {wrongAnswers.map((w) => (
                <span key={w} className="text-xs px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20 font-medium">
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center pt-2">
          <Button
            onClick={() => startQuiz(selectedUnit)}
            className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl h-11 px-5 active:scale-95 transition-all"
          >
            <RotateCcw className="size-4" />
            Làm lại
          </Button>
          <Button
            variant="outline"
            onClick={() => setSelectedUnit(null)}
            className="gap-2 rounded-xl h-11 px-5 border-zinc-200 dark:border-zinc-800"
          >
            <BookOpen className="size-4" />
            Đổi Unit
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/review")}
            className="gap-2 rounded-xl h-11 px-5 border-zinc-200 dark:border-zinc-800"
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
        <div className="flex justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400">
          <span>{current + 1} / {questions.length}</span>
          <div className="flex items-center gap-2">
            {streak >= 3 && (
              <span className="text-orange-500 font-black text-xs flex items-center gap-0.5">
                🔥 {streak} streak
              </span>
            )}
            <span className="text-emerald-600 dark:text-emerald-400">{score} đúng</span>
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
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
          className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/25 backdrop-blur-sm p-6 sm:p-8 text-center space-y-2"
        >
          <p className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Từ vựng</p>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-50 capitalize">
            {q.word}
          </h2>
          <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400">{q.phonetic}</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Nghĩa tiếng Việt là gì?</p>
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3">
        {q.options.map((opt) => {
          let style = "border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/25 hover:border-violet-500/40 hover:bg-violet-500/5";
          if (answerState !== "unanswered") {
            if (opt === q.correct) {
              style = "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
            } else if (opt === selected && opt !== q.correct) {
              style = "border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-300";
            } else {
              style = "border-zinc-200/30 dark:border-zinc-800/30 opacity-50";
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
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              )}
              {answerState !== "unanswered" && opt === selected && opt !== q.correct && (
                <XCircle className="size-4 text-red-500 shrink-0" />
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
            className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl h-11 px-8 active:scale-95 transition-all shadow-md shadow-violet-600/20"
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
