"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shuffle, CheckCircle } from "lucide-react";
import { MinimalButton } from "@/components/design-system";
import LessonSectionHeader from "../lesson-ui/LessonSectionHeader";
import LessonContinueButton from "../lesson-ui/LessonContinueButton";
import { lessonSectionMotion } from "../lesson-ui/motion";
import type { UnitData, QuizQuestion } from "../UnitTemplate";
import { WordBankExercise } from "@/components/exercises/WordBankExercise";
import { DictationExercise } from "@/components/exercises/DictationExercise";
import { SentenceCorrectionExercise } from "@/components/exercises/SentenceCorrectionExercise";
import { ListenAndArrangeExercise } from "@/components/exercises/ListenAndArrangeExercise";
import { recordAttempt, getWeakTypes, TYPE_LABELS } from "@/lib/adaptive-difficulty";

interface PracticeSectionProps {
  unit: UnitData;
  sectionOrderIdx: number;
  TOTAL_SECTIONS: number;
  playCorrectSound: () => void;
  playWrongSound: () => void;
  goNext: () => void;
}

export default function PracticeSection({
  unit,
  sectionOrderIdx,
  TOTAL_SECTIONS,
  playCorrectSound,
  playWrongSound,
  goNext,
}: PracticeSectionProps) {
  // Practice quiz: use dedicated practiceQuiz if provided, else first 3 of quiz
  const PRACTICE_QS: QuizQuestion[] = unit.practiceQuiz ?? unit.quiz.slice(0, 3);

  // Local States
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [clozeInputs, setClozeInputs] = useState<Record<string, string>>({});
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);

  // Matching state
  const [matchLeft, setMatchLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [wrongMatch, setWrongMatch] = useState<string | null>(null);
  const [shuffledRight, setShuffledRight] = useState<string[]>([]);

  // Scramble state
  const [scrambleShuffled, setScrambleShuffled] = useState<Record<string, string[]>>({});
  const [scrambleBuilt, setScrambleBuilt] = useState<Record<string, string[]>>({});
  const [scrambleChecked, setScrambleChecked] = useState<Record<string, boolean>>({});

  // Word-bank state: tracks current question index and per-question results
  const [wordBankIndex, setWordBankIndex] = useState(0);
  const [wordBankDone, setWordBankDone] = useState(false);
  const [wordBankScore, setWordBankScore] = useState(0);

  // Dictation state: uses listenAndChoose items as dictation source
  const dictationItems = unit.listenAndChoose?.slice(0, 2) ?? [];
  const [dictationIndex, setDictationIndex] = useState(0);
  const [dictationDone, setDictationDone] = useState(!dictationItems.length);
  const [dictationScore, setDictationScore] = useState(0);

  // S3-1: Sentence correction state — track which exercises are complete
  const [correctionsDone, setCorrectionsDone] = useState<Set<string>>(new Set());

  // S4-1: Listen+Arrange state
  const arrangeItems = unit.listenAndArrangeExercises ?? [];
  const [arrangeIndex, setArrangeIndex] = useState(0);
  const [arrangeScore, setArrangeScore] = useState(0);
  const [arrangeDone, setArrangeDone] = useState(!arrangeItems.length);

  // Shuffle matching pairs when unit/exercise changes
  useEffect(() => {
    if (unit.matchingExercise) {
      const rights = unit.matchingExercise.pairs.map((p) => p.right);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShuffledRight([...rights].sort(() => Math.random() - 0.5));
    }
  }, [unit.matchingExercise]);

  // Shuffle scramble words on mount
  useEffect(() => {
    if (unit.scrambleExercises?.length) {
      const shuffled: Record<string, string[]> = {};
      for (const ex of unit.scrambleExercises) {
        shuffled[ex.id] = [...ex.words].sort(() => Math.random() - 0.5);
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScrambleShuffled(shuffled);
    }
  }, [unit.scrambleExercises]);

  const normalizeAnswer = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:'"]/g, "")
      .replace(/\s+/g, " ")
      .replace(/\bi'm\b/g, "i am")
      .replace(/\byou're\b/g, "you are")
      .replace(/\bhe's\b/g, "he is")
      .replace(/\bshe's\b/g, "she is")
      .replace(/\bit's\b/g, "it is")
      .replace(/\bwe're\b/g, "we are")
      .replace(/\bthey're\b/g, "they are")
      .replace(/\bdon't\b/g, "do not")
      .replace(/\bdoesn't\b/g, "does not")
      .trim();

  // Derived Values
  const practiceScore = PRACTICE_QS.filter((q) => {
    if (q.type === "cloze") {
      return normalizeAnswer(clozeInputs[q.id] ?? "") === normalizeAnswer(q.answer);
    }
    return practiceAnswers[q.id] === q.answer;
  }).length;

  const allPracticeAnswered = PRACTICE_QS.every((q) => {
    if (q.type === "cloze") return (clozeInputs[q.id] ?? "").trim().length > 0;
    return !!practiceAnswers[q.id];
  });

  const matchingDone = unit.matchingExercise
    ? matchedPairs.size === unit.matchingExercise.pairs.length * 2
    : true;

  const allScrambleDone =
    !unit.scrambleExercises?.length ||
    unit.scrambleExercises.every((ex) => scrambleChecked[ex.id]);

  const allWordBankDone = !unit.wordBankExercises?.length || wordBankDone;
  const allDictationDone = dictationDone;
  // S3-1: all sentence corrections must be attempted
  const allCorrectionsDone =
    !unit.sentenceCorrectionExercises?.length ||
    unit.sentenceCorrectionExercises.every((ex) => correctionsDone.has(ex.id));
  const allArrangeDone = !arrangeItems.length || arrangeDone;

  // S3-3: Adaptive weak-type tip
  const weakTypes = getWeakTypes(unit.unitId);
  const weakTip = weakTypes.length > 0
    ? `💡 Bạn hay sai phần "${TYPE_LABELS[weakTypes[0]]}" — hãy chú ý lần này nhé!`
    : null;

  const handleMatchSelect = (side: "left" | "right", value: string) => {
    if (matchedPairs.has(value)) return;
    if (side === "left") {
      setMatchLeft(value);
      setWrongMatch(null);
    } else {
      if (!matchLeft) return;
      const pairs = unit.matchingExercise!.pairs;
      const pair = pairs.find((p) => p.left === matchLeft);
      if (pair && pair.right === value) {
        setMatchedPairs((prev) => {
          const next = new Set(prev);
          next.add(matchLeft!);
          next.add(value);
          return next;
        });
        setMatchLeft(null);
        playCorrectSound();
        recordAttempt(unit.unitId, "matching", true); // S3-3
      } else {
        setWrongMatch(value);
        playWrongSound();
        recordAttempt(unit.unitId, "matching", false); // S3-3
        setTimeout(() => {
          setWrongMatch(null);
          setMatchLeft(null);
        }, 800);
      }
    }
  };

  return (
    <motion.div
      key="s4-practice"
      initial={lessonSectionMotion.initial}
      animate={lessonSectionMotion.animate}
      exit={lessonSectionMotion.exit}
      transition={lessonSectionMotion.transition}
    >
      <LessonSectionHeader
        sectionId={4}
        sectionOrderIdx={sectionOrderIdx}
        totalSections={TOTAL_SECTIONS}
        subtitle="Kiểm tra nhanh — chọn hoặc điền đáp án"
      />
      {/* S3-3: Adaptive weak-type tip */}
      {weakTip && (
        <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/30 rounded-xl px-3 py-2.5 mb-5">
          <p className="text-blue-700 text-xs leading-relaxed">{weakTip}</p>
        </div>
      )}

      {/* ── Quiz questions (MC + cloze) ── */}
      <div className="space-y-5 mb-6">
        {PRACTICE_QS.map((q, qi) => {
          if (q.type === "cloze") {
            const userInput = clozeInputs[q.id] ?? "";
            const isCorrect = userInput.trim().toLowerCase() === q.answer.toLowerCase();
            return (
              <div
                key={q.id}
                className={`rounded-2xl border p-5 transition-all duration-300 ${
                  practiceSubmitted
                    ? isCorrect
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-red-500/40 bg-red-500/5"
                    : "border-border/60 bg-card"
                }`}
              >
                <p className="text-foreground font-bold mb-3 text-sm">
                  <span className="text-emerald-400 mr-2">{qi + 1}.</span>
                  {q.question}
                </p>
                <input
                  type="text"
                  disabled={practiceSubmitted}
                  value={userInput}
                  onChange={(e) => setClozeInputs((p) => ({ ...p, [q.id]: e.target.value }))}
                  placeholder="Điền từ còn thiếu..."
                  className="w-full bg-muted/40 border border-border/60 rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                />
                {practiceSubmitted && (
                  <p className={`text-xs mt-2 font-bold ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                    {isCorrect ? "✓ Chính xác!" : `✗ Đáp án đúng: "${q.answer}"`}
                  </p>
                )}
              </div>
            );
          }

          // Multiple choice
          const selected = practiceAnswers[q.id];
          const isCorrect = selected === q.answer;
          return (
            <div
              key={q.id}
              className={`rounded-2xl border p-5 transition-all duration-300 ${
                practiceSubmitted
                  ? isCorrect
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-red-500/40 bg-red-500/5"
                  : "border-border/60 bg-card"
              }`}
            >
              <p className="text-foreground font-bold mb-3 text-sm">
                <span className="text-emerald-400 mr-2">{qi + 1}.</span>
                {q.question}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(q.options ?? []).map((opt) => {
                  const isPicked = selected === opt;
                  const isRight = opt === q.answer;
                  let cls =
                    "px-3 py-2 rounded-xl text-sm font-medium border text-left ";
                  if (!practiceSubmitted) {
                    cls += isPicked
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-card border-border/60 text-foreground hover:border-primary/60 hover:bg-muted/40";
                  } else {
                    if (isRight) cls += "bg-emerald-500/10 border-emerald-500 text-emerald-600 font-bold";
                    else if (isPicked && !isRight)
                      cls += "bg-red-900/30 border-red-500/60 text-red-300 line-through";
                    else cls += "bg-card border-border/60 text-muted-foreground";
                  }
                  return (
                    <motion.button
                      key={opt}
                      disabled={practiceSubmitted}
                      whileHover={!practiceSubmitted ? { y: -2, border: "1px solid #10b981", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)" } : {}}
                      whileTap={!practiceSubmitted ? { y: 1, scale: 0.98 } : {}}
                      transition={{ type: "spring", stiffness: 450, damping: 15 }}
                      className={cls}
                      onClick={() => {
                        if (practiceSubmitted) return;
                        setPracticeAnswers((p) => ({ ...p, [q.id]: opt }));
                      }}
                    >
                      {opt}
                    </motion.button>
                  );
                })}
              </div>
              {practiceSubmitted && (
                <p className={`text-xs mt-2 font-bold ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                  {isCorrect ? "✓ Chính xác!" : `✗ Đáp án đúng: ${q.answer}`}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Matching Exercise ── */}
      {unit.matchingExercise && (
        <div className="border border-border/60 bg-card rounded-2xl p-5 mb-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Shuffle size={16} className="text-teal-400" />
            <p className="text-sm font-bold text-foreground">
              {unit.matchingExercise.title ?? "Nối từ với nghĩa đúng"}
            </p>
            {matchingDone && <CheckCircle size={16} className="text-emerald-400 ml-auto" />}
            {!matchingDone && matchedPairs.size > 0 && (
              <button
                onClick={() => {
                  setMatchedPairs(new Set());
                  setMatchLeft(null);
                  setWrongMatch(null);
                }}
                className="ml-auto text-[10px] font-bold text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg bg-muted/40 border border-border/60 transition-colors"
              >
                ↺ Làm lại
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Left column — English */}
            <div className="space-y-2">
              {unit.matchingExercise.pairs.map((pair, i) => {
                const isMatched = matchedPairs.has(pair.left);
                const isSelected = matchLeft === pair.left;
                return (
                  <button
                    key={i}
                    onClick={() => !isMatched && handleMatchSelect("left", pair.left)}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm font-medium border text-left transition-all duration-200 ${
                      isMatched
                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-600 cursor-default"
                        : isSelected
                        ? "bg-primary/10 border-primary text-primary ring-2 ring-primary/20 scale-[1.02]"
                        : "bg-card border-border/60 text-foreground hover:border-primary/60 hover:bg-muted/40 active:scale-95"
                    }`}
                  >
                    {isMatched && "✓ "}{pair.left}
                  </button>
                );
              })}
            </div>

            {/* Right column — Vietnamese */}
            <div className="space-y-2">
              {shuffledRight.map((right, i) => {
                const isMatched = matchedPairs.has(right);
                const isWrong = wrongMatch === right;
                return (
                  <button
                    key={i}
                    onClick={() => !isMatched && handleMatchSelect("right", right)}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm font-medium border text-left transition-all duration-200 ${
                      isMatched
                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-600 cursor-default"
                        : isWrong
                        ? "bg-red-900/30 border-red-500/60 text-red-300 animate-shake"
                        : "bg-card border-border/60 text-foreground hover:border-primary/60 hover:bg-muted/40 active:scale-95"
                    }`}
                  >
                    {isMatched && "✓ "}{right}
                  </button>
                );
              })}
            </div>
          </div>

          {matchingDone && (
            <div className="mt-3 text-center">
              <p className="text-emerald-400 font-bold text-sm">
                🎉 Hoàn thành! Bạn nối đúng tất cả!
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Sentence Scramble ── */}
      {unit.scrambleExercises && unit.scrambleExercises.length > 0 && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔀</span>
            <p className="text-sm font-bold text-foreground">Sắp xếp thành câu đúng</p>
            <span className="text-xs text-muted-foreground ml-auto">Sản xuất ngôn ngữ</span>
          </div>
          {unit.scrambleExercises.map((ex) => {
            const built = scrambleBuilt[ex.id] ?? [];
            const pool =
              scrambleShuffled[ex.id] ?? [...ex.words].sort(() => Math.random() - 0.5);
            const isChecked = !!scrambleChecked[ex.id];
            const isCorrect =
              built.join(" ").toLowerCase().trim() === ex.answer.toLowerCase().trim();
            return (
              <div
                key={ex.id}
                className={`rounded-2xl border p-5 transition-all duration-300 ${
                  isChecked
                    ? isCorrect
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-red-500/40 bg-red-500/5"
                    : "border-border/60 bg-card"
                }`}
              >
                <p className="text-muted-foreground text-xs mb-3">🇻🇳 {ex.prompt_vn}</p>
                {/* Built sentence slot */}
                <div className="min-h-[44px] flex flex-wrap gap-2 mb-3 p-3 bg-muted/30 rounded-xl border border-border/60">
                  {built.length === 0 ? (
                    <span className="text-muted-foreground/60 text-xs self-center">
                      Nhấn từ bên dưới để xây dựng câu...
                    </span>
                  ) : (
                    built.map((w, i) => (
                      <button
                        key={i}
                        disabled={isChecked}
                        onClick={() => {
                          if (isChecked) return;
                          setScrambleBuilt((p) => {
                            const arr = [...(p[ex.id] ?? [])];
                            arr.splice(i, 1);
                            return { ...p, [ex.id]: arr };
                          });
                        }}
                        className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-colors disabled:cursor-default"
                      >
                        {w}
                      </button>
                    ))
                  )}
                </div>
                {/* Word tile pool */}
                {!isChecked && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {pool.map((w, i) => {
                      const usedCount = built.filter((b) => b === w).length;
                      const totalCount = pool.filter((t) => t === w).length;
                      const disabled = usedCount >= totalCount;
                      return (
                        <button
                          key={i}
                          disabled={disabled}
                          onClick={() => {
                            if (disabled) return;
                            setScrambleBuilt((p) => ({
                              ...p,
                              [ex.id]: [...(p[ex.id] ?? []), w],
                            }));
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all duration-150 ${
                            disabled
                              ? "opacity-20 bg-muted border-border/60 text-muted-foreground/60 cursor-not-allowed"
                              : "bg-muted border-border/60 text-foreground hover:border-teal-400/70 hover:bg-muted/80 hover:-translate-y-0.5 cursor-pointer active:scale-90 active:translate-y-0 shadow-sm"
                          }`}
                        >
                          {w}
                        </button>
                      );
                    })}
                  </div>
                )}
                {/* Check / Result */}
                {!isChecked ? (
                  <button
                    disabled={built.length === 0}
                    onClick={() => {
                      setScrambleChecked((p) => ({ ...p, [ex.id]: true }));
                      const normalize = (s: string) =>
                        s
                          .toLowerCase()
                          .trim()
                          .replace(/\s+([.,!?])/g, "$1")
                          .replace(/\s+/g, " ");
                      if (normalize(built.join(" ")) === normalize(ex.answer)) {
                        playCorrectSound();
                        recordAttempt(unit.unitId, "scramble", true); // S3-3
                      } else {
                        playWrongSound();
                        recordAttempt(unit.unitId, "scramble", false); // S3-3
                      }
                    }}
                    className="px-4 py-1.5 bg-teal-500/10 border border-teal-500/40 text-teal-600 rounded-xl text-xs font-bold hover:bg-teal-500/20 disabled:opacity-40 transition-colors"
                  >
                    Kiểm tra
                  </button>
                ) : (
                  <p className={`text-xs font-bold mt-1 ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                    {isCorrect ? "✓ Chính xác!" : `✗ Đáp án đúng: "${ex.answer}"`}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── S3-1: Sentence Correction Exercises ── */}
      {unit.sentenceCorrectionExercises && unit.sentenceCorrectionExercises.length > 0 && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔍</span>
            <p className="text-sm font-bold text-foreground">Tìm và sửa lỗi ngữ pháp</p>
            <span className="text-xs text-muted-foreground ml-auto">Nhận biết lỗi sai</span>
          </div>
          {unit.sentenceCorrectionExercises.map((ex) => (
            <SentenceCorrectionExercise
              key={ex.id}
              exercise={ex}
              onComplete={(correct) => {
                if (correct) playCorrectSound();
                else playWrongSound();
                recordAttempt(unit.unitId, "correction", correct); // S3-3
                setCorrectionsDone(p => { const n = new Set(p); n.add(ex.id); return n; });
              }}
            />
          ))}
        </div>
      )}

      {/* ── S4-1: Listen + Arrange Exercises ── */}
      {arrangeItems.length > 0 && !arrangeDone && practiceSubmitted && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎧</span>
            <p className="text-sm font-bold text-foreground">Nghe và sắp xếp từ</p>
            <span className="text-xs text-muted-foreground ml-auto">
              {arrangeIndex + 1}/{arrangeItems.length}
            </span>
          </div>
          <ListenAndArrangeExercise
            key={arrangeItems[arrangeIndex]?.id}
            item={arrangeItems[arrangeIndex]!}
            playCorrectSound={playCorrectSound}
            playWrongSound={playWrongSound}
            onCorrect={() => {
              setArrangeScore(s => s + 1);
              recordAttempt(unit.unitId, "listen-arrange", true);
              const next = arrangeIndex + 1;
              if (next >= arrangeItems.length) setArrangeDone(true);
              else setArrangeIndex(next);
            }}
            onWrong={() => {
              recordAttempt(unit.unitId, "listen-arrange", false);
              const next = arrangeIndex + 1;
              if (next >= arrangeItems.length) setArrangeDone(true);
              else setArrangeIndex(next);
            }}
          />
        </div>
      )}

      {arrangeDone && arrangeItems.length > 0 && practiceSubmitted && (
        <div className="flex items-center gap-2 rounded-xl bg-violet-500/10 border border-violet-500/20 p-3">
          <CheckCircle size={16} className="text-violet-400 shrink-0" />
          <p className="text-sm text-violet-700 font-semibold">
            Nghe & sắp xếp: {arrangeScore}/{arrangeItems.length} chính xác
          </p>
        </div>
      )}

      {unit.wordBankExercises && unit.wordBankExercises.length > 0 && !wordBankDone && practiceSubmitted && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧩</span>
            <p className="text-sm font-bold text-foreground">Xây dựng câu tiếng Anh</p>
            <span className="text-xs text-muted-foreground ml-auto">
              {wordBankIndex + 1}/{unit.wordBankExercises.length}
            </span>
          </div>
          <WordBankExercise
            key={unit.wordBankExercises[wordBankIndex]?.id}
            question={unit.wordBankExercises[wordBankIndex]!}
            onAnswer={(correct) => {
              if (correct) playCorrectSound();
              else playWrongSound();
              recordAttempt(unit.unitId, "wordbank", correct); // S3-3
              setWordBankScore(s => s + (correct ? 1 : 0));
              const next = wordBankIndex + 1;
              if (next >= (unit.wordBankExercises?.length ?? 0)) {
                setWordBankDone(true);
              } else {
                setWordBankIndex(next);
              }
            }}
          />
        </div>
      )}

      {unit.wordBankExercises && unit.wordBankExercises.length > 0 && wordBankDone && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-600 font-semibold">
            Xây dựng câu: {wordBankScore}/{unit.wordBankExercises.length} chính xác
          </p>
        </div>
      )}

      {/* ── Dictation Exercises (after WordBank) ── */}
      {dictationItems.length > 0 && wordBankDone && !dictationDone && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎧</span>
            <p className="text-sm font-bold text-foreground">Nghe và gõ lại câu</p>
            <span className="text-xs text-muted-foreground ml-auto">
              {dictationIndex + 1}/{dictationItems.length}
            </span>
          </div>
          <DictationExercise
            key={dictationItems[dictationIndex]?.id}
            question={{
              id: dictationItems[dictationIndex]!.id,
              text: dictationItems[dictationIndex]!.audio_text,
              hint_vn: "Nghe thật kỹ từng từ!",
            }}
            onAnswer={(correct) => {
              if (correct) playCorrectSound();
              else playWrongSound();
              recordAttempt(unit.unitId, "dictation", correct); // S3-3
              setDictationScore((s) => s + (correct ? 1 : 0));
              const next = dictationIndex + 1;
              if (next >= dictationItems.length) {
                setDictationDone(true);
              } else {
                setDictationIndex(next);
              }
            }}
          />
        </div>
      )}

      {dictationDone && dictationItems.length > 0 && wordBankDone && (
        <div className="flex items-center gap-2 rounded-xl bg-blue-500/10 border border-blue-500/20 p-3">
          <CheckCircle size={16} className="text-blue-400 shrink-0" />
          <p className="text-sm text-blue-700 font-semibold">
            Chính tả: {dictationScore}/{dictationItems.length} chính xác
          </p>
        </div>
      )}

      {!practiceSubmitted ? (
        <MinimalButton
          type="button"
          fullWidth
          className="!rounded-2xl !py-4 text-lg"
          disabled={!allPracticeAnswered}
          onClick={() => {
            setPracticeSubmitted(true);
            if (practiceScore >= Math.ceil(PRACTICE_QS.length * 0.7)) {
              playCorrectSound();
            } else playWrongSound();
          }}
        >
          Kiểm tra đáp án
        </MinimalButton>
      ) : (
        <div className="space-y-4">
          <div
            className={`rounded-2xl p-4 text-center border ${
              practiceScore === PRACTICE_QS.length
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-muted/30 border-border/60"
            }`}
          >
            <p className="text-2xl sm:text-3xl font-black text-primary">
              {practiceScore}/{PRACTICE_QS.length} câu đúng
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {practiceScore === PRACTICE_QS.length
                ? "🏆 Xuất sắc! Bạn nắm vững bài học!"
                : practiceScore >= Math.ceil(PRACTICE_QS.length * 0.7)
                ? "🎯 Khá tốt! Tiếp tục nhé!"
                : "💪 Ôn lại thẻ từ vựng sẽ giúp bạn nhớ lâu hơn!"}
            </p>
          </div>
          {matchingDone && allScrambleDone && allCorrectionsDone && allArrangeDone && allWordBankDone && allDictationDone ? (
            <LessonContinueButton onClick={goNext}>Tiếp tục</LessonContinueButton>
          ) : (
            <p className="text-center text-muted-foreground text-sm flex items-center justify-center gap-1.5">
              <span>↑</span>
              {!matchingDone
                ? "Hoàn thành phần nối từ ở trên để tiếp tục"
                : !allScrambleDone
                ? "Hoàn thành phần sắp xếp câu ở trên để tiếp tục"
                : !allCorrectionsDone
                ? "Hoàn thành phần tìm lỗi sai ở trên để tiếp tục"
                : !allArrangeDone
                ? "Hoàn thành phần nghe & sắp xếp ở trên để tiếp tục"
                : !allWordBankDone
                ? "Hoàn thành phần xây dựng câu ở trên để tiếp tục"
                : "Hoàn thành phần chính tả ở trên để tiếp tục"}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
