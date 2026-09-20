"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, CheckCircle, Volume2, Sparkles, ChevronRight } from "lucide-react";
import { MinimalButton } from "@/components/design-system";
import LessonSectionHeader from "../lesson-ui/LessonSectionHeader";
import LessonContinueButton from "../lesson-ui/LessonContinueButton";
import { lessonSectionMotion } from "../lesson-ui/motion";
import { toast } from "sonner";
import type { UnitData, QuizQuestion } from "../UnitTemplate";
import { ReadingComprehensionExercise } from "@/components/exercises/ReadingComprehensionExercise";
import { generateGrammarNote } from "@/app/actions/grammar-notes";

interface QuizSectionProps {
  unit: UnitData;
  sectionOrderIdx: number;
  TOTAL_SECTIONS: number;
  seenCards: Set<number>;
  VOCAB_LIMIT: number;
  shadowAvg: number;
  shadowDone: boolean;
  lacScore: number;
  LISTEN_CHOOSE_LENGTH: number;
  isCompleted: boolean;
  isSubmitting: boolean;
  handleCompleteUnit: () => void;
  playCorrectSound: () => void;
  playWrongSound: () => void;

  // Cumulative review states
  cumulativeAnswers: Record<string, string>;
  setCumulativeAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  cumulativeClozeInputs: Record<string, string>;
  setCumulativeClozeInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  cumulativeSubmitted: boolean;
  setCumulativeSubmitted: React.Dispatch<React.SetStateAction<boolean>>;

  // Quiz states
  quizAnswers: Record<string, string>;
  setQuizAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  quizClozeInputs: Record<string, string>;
  setQuizClozeInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  quizSubmitted: boolean;
  setQuizSubmitted: React.Dispatch<React.SetStateAction<boolean>>;

  // Retry states
  retryAnswers: Record<string, string>;
  setRetryAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  retryClozeInputs: Record<string, string>;
  setRetryClozeInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  retrySubmitted: boolean;
  setRetrySubmitted: React.Dispatch<React.SetStateAction<boolean>>;

  // Derived values from parent
  finalQuizScore: number;
  wrongQuestions: QuizQuestion[];
  retryCorrectCount: number;
  retryBonusPct: number;
  effectiveScore: number;
  effectiveStarCount: number;
  nextRoute: string;
}

export default function QuizSection({
  unit,
  sectionOrderIdx,
  TOTAL_SECTIONS,
  seenCards,
  VOCAB_LIMIT,
  shadowAvg,
  shadowDone,
  lacScore,
  LISTEN_CHOOSE_LENGTH,
  isCompleted,
  isSubmitting,
  handleCompleteUnit,
  playCorrectSound,
  playWrongSound,

  cumulativeAnswers,
  setCumulativeAnswers,
  cumulativeClozeInputs,
  setCumulativeClozeInputs,
  cumulativeSubmitted,
  setCumulativeSubmitted,

  quizAnswers,
  setQuizAnswers,
  quizClozeInputs,
  setQuizClozeInputs,
  quizSubmitted,
  setQuizSubmitted,

  retryAnswers,
  setRetryAnswers,
  retryClozeInputs,
  setRetryClozeInputs,
  retrySubmitted,
  setRetrySubmitted,

  finalQuizScore,
  wrongQuestions,
  retryCorrectCount,
  retryBonusPct,
  effectiveScore,
  effectiveStarCount,
  nextRoute,
}: QuizSectionProps) {
  const FINAL_QS = unit.quiz;

  // Reading comprehension state
  const hasReading = !!unit.readingPassage;
  const [readingDone, setReadingDone] = useState(!hasReading);

  // S1-3: Mandatory recall state — track per-question recall typing
  const [recallInputs, setRecallInputs] = useState<Record<string, string>>({});
  const [recallChecked, setRecallChecked] = useState<Record<string, boolean>>({});

  // S4-2: AI Grammar Note state — per question-id, stores generated note
  const [aiNotes, setAiNotes] = useState<Record<string, string | null>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});

  // S4-2: When quiz is submitted, auto-fetch AI notes for wrong answers without explanation_vn
  useEffect(() => {
    if (!quizSubmitted) return;
    const wrongWithoutNote = FINAL_QS.filter(
      q => !q.explanation_vn &&
        (q.type === "multiple-choice" || q.type === "true-false") &&
        quizAnswers[q.id] !== undefined &&
        quizAnswers[q.id] !== q.answer
    );
    wrongWithoutNote.forEach(async (q) => {
      const wrongAns = quizAnswers[q.id];
      if (!wrongAns) return;
      setAiLoading(p => ({ ...p, [q.id]: true }));
      try {
        const res = await generateGrammarNote({
          question: q.question,
          answer: q.answer,
          wrong_answer: wrongAns,
          cefr_level: (unit.level as "A0" | "A1" | "A2" | "B1" | "B2") ?? "A1",
        });
        if (res.success) {
          setAiNotes(p => ({ ...p, [q.id]: res.result.explanation_vn }));
        }
      } catch { /* silent — not critical */ }
      finally { setAiLoading(p => ({ ...p, [q.id]: false })); }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizSubmitted]);

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

  const pickEnglishVoice = () => {
    if (typeof window === "undefined") return null;
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find(v => v.lang === "en-US" && v.name.includes("Google")) ??
      voices.find(v => v.lang === "en-US") ??
      voices.find(v => v.lang.startsWith("en")) ??
      null
    );
  };

  const playTTS = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      toast.error("Trình duyệt không hỗ trợ TTS");
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.85;
    const voice = pickEnglishVoice();
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  }, []);

  // S1-3: check recall answer
  const checkRecall = useCallback((qId: string, correctAnswer: string) => {
    const typed = normalizeAnswer(recallInputs[qId] ?? "");
    const correct = normalizeAnswer(correctAnswer);
    setRecallChecked(p => ({ ...p, [qId]: typed === correct }));
  }, [recallInputs]);



  return (
    <motion.div
      key="s8"
      initial={lessonSectionMotion.initial}
      animate={lessonSectionMotion.animate}
      exit={lessonSectionMotion.exit}
      transition={lessonSectionMotion.transition}
    >
      <LessonSectionHeader
        sectionId={8}
        sectionOrderIdx={sectionOrderIdx}
        totalSections={TOTAL_SECTIONS}
        subtitle="Hoàn thành bài và xem kết quả học tập"
      />

      {/* Spaced Cumulative Review */}
      {unit.cumulativeReviewQuestions && unit.cumulativeReviewQuestions.length > 0 && (
        <div className="mb-6">
          {!cumulativeSubmitted ? (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🔁</span>
                <div>
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                    Ôn tập bài cũ
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Trả lời để kích hoạt bộ nhớ dài hạn trước khi học tiếp
                  </p>
                </div>
              </div>
              <div className="space-y-5">
                {unit.cumulativeReviewQuestions.map((q, qi) => {
                  if (q.type === "cloze" || q.type === "translate") {
                    return (
                      <div key={q.id}>
                        <p className="text-foreground text-sm mb-2">
                          <span className="text-amber-500/70 mr-2">↺ {qi + 1}.</span>
                          {q.question}
                        </p>
                        {q.type === "translate" && (
                          <p className="text-xs text-violet-400 mb-1">✍️ Dịch sang tiếng Anh</p>
                        )}
                        <input
                          type="text"
                          value={cumulativeClozeInputs[q.id] ?? ""}
                          onChange={(e) =>
                            setCumulativeClozeInputs((p) => ({ ...p, [q.id]: e.target.value }))
                          }
                          placeholder={
                            q.type === "translate"
                              ? "Nhập câu tiếng Anh..."
                              : "Điền từ còn thiếu..."
                          }
                          className="w-full bg-muted/40 border border-amber-500/30 rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                        />
                      </div>
                    );
                  }
                  return (
                    <div key={q.id}>
                      <p className="text-foreground text-sm mb-2">
                        <span className="text-amber-500/70 mr-2">↺ {qi + 1}.</span>
                        {q.question}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(q.options ?? []).map((opt: string) => (
                          <motion.button
                            key={opt}
                            disabled={cumulativeSubmitted}
                            onClick={() =>
                              !cumulativeSubmitted &&
                              setCumulativeAnswers((p) => ({ ...p, [q.id]: opt }))
                            }
                            whileHover={!cumulativeSubmitted ? { y: -2, border: "1px solid #d97706", boxShadow: "0 4px 12px rgba(217, 119, 6, 0.15)" } : {}}
                            whileTap={!cumulativeSubmitted ? { y: 1, scale: 0.98 } : {}}
                            transition={{ type: "spring", stiffness: 450, damping: 15 }}
                            className={`px-3 py-2 rounded-xl text-sm font-medium border text-left disabled:cursor-default ${
                              cumulativeAnswers[q.id] === opt
                                ? "bg-amber-600/30 border-amber-500 text-amber-300"
                                : "bg-card border-border/60 text-foreground hover:border-amber-500/60 hover:bg-muted/40"
                            }`}
                          >
                            {opt}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <MinimalButton
                type="button"
                fullWidth
                className="mt-4 !rounded-2xl"
                disabled={unit.cumulativeReviewQuestions.some((q) =>
                  q.type === "multiple-choice"
                    ? !cumulativeAnswers[q.id]
                    : !(cumulativeClozeInputs[q.id] ?? "").trim()
                )}
                onClick={() => {
                  setCumulativeSubmitted(true);
                  const correct = unit.cumulativeReviewQuestions!.filter((q) =>
                    q.type === "multiple-choice"
                      ? cumulativeAnswers[q.id] === q.answer
                      : normalizeAnswer(cumulativeClozeInputs[q.id] ?? "") ===
                        normalizeAnswer(q.answer)
                  ).length;
                  if (correct === unit.cumulativeReviewQuestions!.length) playCorrectSound();
                }}
              >
                Kiểm tra ôn tập
              </MinimalButton>
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
              <p className="text-xs font-bold text-amber-400 mb-2">🔁 Kết quả ôn tập bài cũ</p>
              <div className="space-y-2">
                {unit.cumulativeReviewQuestions.map((q, qi) => {
                  const isCorrect =
                    q.type === "multiple-choice"
                      ? cumulativeAnswers[q.id] === q.answer
                      : normalizeAnswer(cumulativeClozeInputs[q.id] ?? "") ===
                        normalizeAnswer(q.answer);
                  return (
                    <div
                      key={q.id}
                      className={`flex items-start gap-2 text-xs rounded-xl p-2 ${
                        isCorrect ? "bg-emerald-500/10" : "bg-red-500/10"
                      }`}
                    >
                      <span>{isCorrect ? "✓" : "✗"}</span>
                      <div>
                        <p className="text-foreground">
                          {qi + 1}. {q.question}
                        </p>
                        {!isCorrect && <p className="text-emerald-400 mt-0.5">Đáp án: {q.answer}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Final Quiz */}
      {!quizSubmitted ? (
        <div className="border border-border/60 bg-card rounded-2xl p-6 mb-6 shadow-md">
          <p className="text-sm font-bold text-foreground mb-5">🧠 Quiz tổng hợp — {FINAL_QS.length} câu</p>
          <div className="space-y-6">
            {FINAL_QS.map((q, qi) => {
              if (q.type === "cloze") {
                return (
                  <div key={q.id}>
                    <p className="text-foreground text-sm mb-3">
                      <span className="text-muted-foreground mr-2">Câu {qi + 1}.</span>
                      {q.question}
                    </p>
                    <input
                      type="text"
                      value={quizClozeInputs[q.id] ?? ""}
                      onChange={(e) =>
                        setQuizClozeInputs((p) => ({ ...p, [q.id]: e.target.value }))
                      }
                      placeholder="Điền từ còn thiếu..."
                      className="w-full bg-muted/40 border border-border/60 rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                    />
                  </div>
                );
              }
              if (q.type === "translate") {
                return (
                  <div key={q.id}>
                    <p className="text-foreground text-sm mb-1">
                      <span className="text-muted-foreground mr-2">Câu {qi + 1}.</span>
                      {q.question}
                    </p>
                    <p className="text-xs text-violet-400 mb-2">✍️ Dịch sang tiếng Anh</p>
                    <input
                      type="text"
                      value={quizClozeInputs[q.id] ?? ""}
                      onChange={(e) =>
                        setQuizClozeInputs((p) => ({ ...p, [q.id]: e.target.value }))
                      }
                      placeholder="Nhập câu tiếng Anh..."
                      className="w-full bg-muted/40 border border-violet-500/50 rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-violet-500 transition-colors text-sm"
                    />
                  </div>
                );
              }
              // S2-4: True/False/Not Given
              if (q.type === "true-false") {
                const tfOptions = q.options ?? ["Đúng", "Sai", "Không đề cập"];
                return (
                  <div key={q.id}>
                    <p className="text-foreground text-sm mb-3">
                      <span className="text-muted-foreground mr-2">Câu {qi + 1}.</span>
                      {q.question}
                    </p>
                    <div className="flex gap-2">
                      {tfOptions.map((opt, oi) => {
                        const isSelected = quizAnswers[q.id] === opt;
                        const isWrongAnswer = quizSubmitted && isSelected && opt !== q.answer;
                        const isRightAnswer = quizSubmitted && opt === q.answer;
                        let cls = "flex-1 px-3 py-2.5 rounded-xl text-sm font-bold border text-center ";
                        if (quizSubmitted) {
                          if (isRightAnswer) cls += "bg-primary/10 border-primary text-primary";
                          else if (isWrongAnswer) cls += "bg-red-900/30 border-red-500 text-red-300 animate-shake";
                          else cls += "bg-card border-border/60 text-muted-foreground cursor-default";
                        } else {
                          cls += isSelected
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-card border-border/60 text-foreground hover:border-primary/60 hover:bg-muted/40";
                        }
                        return (
                          <motion.button
                            key={oi}
                            onClick={() => !quizSubmitted && setQuizAnswers(p => ({ ...p, [q.id]: opt }))}
                            disabled={quizSubmitted}
                            whileHover={!quizSubmitted ? { y: -2 } : {}}
                            whileTap={!quizSubmitted ? { scale: 0.97 } : {}}
                            transition={{ type: "spring", stiffness: 450, damping: 15 }}
                            className={cls}
                          >
                            {opt}
                          </motion.button>
                        );
                      })}
                    </div>
                    {quizSubmitted && quizAnswers[q.id] !== q.answer && q.explanation_vn && (
                      <div className="mt-2 flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2.5">
                        <span className="text-amber-400 text-sm shrink-0">💡</span>
                        <p className="text-amber-600 text-xs leading-relaxed">{q.explanation_vn}</p>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <div key={q.id}>
                  <p className="text-foreground text-sm mb-3">
                    <span className="text-muted-foreground mr-2">Câu {qi + 1}.</span>
                    {q.question}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(q.options ?? []).map((opt, oi) => {
                      const isSelected = quizAnswers[q.id] === opt;
                      const isWrongAnswer = quizSubmitted && isSelected && opt !== q.answer;
                      const isRightAnswer = quizSubmitted && opt === q.answer;
                      let cls = "px-3 py-2 rounded-xl text-sm font-medium border text-left ";
                      if (quizSubmitted) {
                        if (isRightAnswer) cls += "bg-primary/10 border-primary text-primary";
                        else if (isWrongAnswer) cls += "bg-red-900/30 border-red-500 text-red-300 animate-shake";
                        else cls += "bg-card border-border/60 text-muted-foreground cursor-default";
                      } else {
                        cls += isSelected
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-card border-border/60 text-foreground hover:border-primary/60 hover:bg-muted/40";
                      }
                      return (
                        <motion.button
                          key={oi}
                          onClick={() => !quizSubmitted && setQuizAnswers((p) => ({ ...p, [q.id]: opt }))}
                          disabled={quizSubmitted}
                          whileHover={!quizSubmitted ? { y: -2, border: "1px solid #10b981", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)" } : {}}
                          whileTap={!quizSubmitted ? { y: 1, scale: 0.98 } : {}}
                          transition={{ type: "spring", stiffness: 450, damping: 15 }}
                          className={cls}
                        >
                          {opt}
                        </motion.button>
                      );
                    })}
                  </div>
                  {/* S1-2: Static grammar explanation */}
                  {quizSubmitted && quizAnswers[q.id] !== q.answer && q.explanation_vn && (
                    <div className="mt-2 flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2.5">
                      <span className="text-amber-400 text-sm shrink-0">💡</span>
                      <p className="text-amber-600 text-xs leading-relaxed">{q.explanation_vn}</p>
                    </div>
                  )}
                  {/* S4-2: AI grammar note — shown when no static explanation exists */}
                  {quizSubmitted && quizAnswers[q.id] !== q.answer && !q.explanation_vn && (
                    aiLoading[q.id] ? (
                      <div className="mt-2 flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 rounded-xl px-3 py-2.5">
                        <Sparkles size={13} className="text-violet-400 shrink-0 animate-pulse" />
                        <p className="text-violet-700 text-xs">AI đang phân tích lỗi ngữ pháp...</p>
                      </div>
                    ) : aiNotes[q.id] ? (
                      <div className="mt-2 flex items-start gap-2 bg-violet-500/10 border border-violet-500/30 rounded-xl px-3 py-2.5">
                        <Sparkles size={13} className="text-violet-400 shrink-0 mt-0.5" />
                        <p className="text-violet-700 text-xs leading-relaxed">{aiNotes[q.id]}</p>
                      </div>
                    ) : null
                  )}
                  {/* S1-3: Mandatory recall */}
                  {quizSubmitted && quizAnswers[q.id] !== q.answer && (
                    <div className="mt-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                        ✏️ Gõ lại đáp án đúng:
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={recallInputs[q.id] ?? ""}
                          onChange={e => setRecallInputs(p => ({ ...p, [q.id]: e.target.value }))}
                          onBlur={() => checkRecall(q.id, q.answer)}
                          onKeyDown={e => e.key === "Enter" && checkRecall(q.id, q.answer)}
                          placeholder={q.answer}
                          className={`flex-1 bg-muted border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none transition-colors ${
                            recallChecked[q.id] === true
                              ? "border-emerald-500 bg-emerald-500/10"
                              : recallChecked[q.id] === false
                              ? "border-red-500/60"
                              : "border-border/60 focus:border-amber-500/60"
                          }`}
                        />
                        {recallChecked[q.id] === true && (
                          <span className="text-emerald-400 text-lg shrink-0">✓</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <MinimalButton
            type="button"
            fullWidth
            className="mt-6 !rounded-2xl"
            onClick={() => {
              setQuizSubmitted(true);
              if (finalQuizScore >= Math.ceil(FINAL_QS.length * 0.8)) playCorrectSound();
              else if (finalQuizScore < Math.ceil(FINAL_QS.length * 0.5)) playWrongSound();
              const firstWrong = FINAL_QS.find(
                q => q.type === "multiple-choice" && quizAnswers[q.id] !== q.answer
              );
              if (firstWrong) {
                setTimeout(() => playTTS(firstWrong.answer), 500);
              }
            }}
            disabled={
              FINAL_QS.filter((q) => q.type === "multiple-choice" || q.type === "true-false").some((q) => !quizAnswers[q.id]) ||
              FINAL_QS.filter((q) => q.type === "cloze" || q.type === "translate").some(
                (q) => !(quizClozeInputs[q.id] ?? "").trim()
              )
            }
          >
            Kiểm tra đáp án
          </MinimalButton>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Score Display */}
          <div className="border border-emerald-500/40 bg-emerald-500/5 rounded-2xl p-6 text-center shadow-md">
            <div className="text-5xl mb-3">
              {finalQuizScore >= Math.ceil(FINAL_QS.length * 0.8)
                ? "🏆"
                : finalQuizScore >= Math.ceil(FINAL_QS.length * 0.6)
                ? "🎯"
                : "💪"}
            </div>
            <p className="text-emerald-600 font-black text-2xl mb-1">{finalQuizScore}/{FINAL_QS.length} đúng</p>
            <p className="text-muted-foreground text-sm">
              {finalQuizScore >= Math.ceil(FINAL_QS.length * 0.8)
                ? "Xuất sắc! Bạn đã nắm vững bài học!"
                : finalQuizScore >= Math.ceil(FINAL_QS.length * 0.6)
                ? "Khá tốt! Tiếp tục ôn tập nhé!"
                : "Cần luyện thêm một chút — bạn làm được!"}
            </p>
          </div>

          {/* Retry panel */}
          {wrongQuestions.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
              <p className="text-sm font-bold text-amber-400 mb-1">💡 Ôn lại câu sai ({wrongQuestions.length} câu)</p>
              <p className="text-xs text-muted-foreground mb-4">
                Trả lời đúng để nhận thêm điểm thưởng (tối đa +10%)!
              </p>
              {!retrySubmitted ? (
                <div className="space-y-4">
                  {wrongQuestions.map((q, qi) => {
                    if (q.type === "cloze") {
                      return (
                        <div key={q.id}>
                          <p className="text-foreground text-sm mb-2">
                            <span className="text-amber-400 mr-2">↺ {qi + 1}.</span>
                            {q.question}
                          </p>
                          <input
                            type="text"
                            value={retryClozeInputs[q.id] ?? ""}
                            onChange={(e) =>
                              setRetryClozeInputs((p) => ({ ...p, [q.id]: e.target.value }))
                            }
                            placeholder="Điền từ còn thiếu..."
                            className="w-full bg-muted/40 border border-border/60 rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                          />
                        </div>
                      );
                    }
                    return (
                      <div key={q.id}>
                        <p className="text-foreground text-sm mb-2">
                          <span className="text-amber-400 mr-2">↺ {qi + 1}.</span>
                          {q.question}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {(q.options ?? []).map((opt: string) => (
                            <motion.button
                              key={opt}
                              onClick={() => setRetryAnswers((p) => ({ ...p, [q.id]: opt }))}
                              disabled={retrySubmitted}
                              whileHover={!retrySubmitted ? { y: -2, border: "1px solid #d97706", boxShadow: "0 4px 12px rgba(217, 119, 6, 0.15)" } : {}}
                              whileTap={!retrySubmitted ? { y: 1, scale: 0.98 } : {}}
                              transition={{ type: "spring", stiffness: 450, damping: 15 }}
                              className={`px-3 py-2 rounded-xl text-sm font-medium border text-left ${
                                retryAnswers[q.id] === opt
                                  ? "bg-amber-600/30 border-amber-500 text-amber-300"
                                  : "bg-card border-border/60 text-foreground hover:border-amber-500/60 hover:bg-muted/40"
                              }`}
                            >
                              {opt}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  <MinimalButton
                    type="button"
                    fullWidth
                    className="!rounded-2xl"
                    onClick={() => {
                      setRetrySubmitted(true);
                      if (retryCorrectCount > 0) playCorrectSound();
                    }}
                    disabled={wrongQuestions.some((q) =>
                      q.type === "multiple-choice"
                        ? !retryAnswers[q.id]
                        : !(retryClozeInputs[q.id] ?? "").trim()
                    )}
                  >
                    Gửi câu trả lời
                  </MinimalButton>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-2xl mb-1">
                    {retryCorrectCount === wrongQuestions.length ? "🎉" : "📖"}
                  </p>
                  <p className="font-bold text-white">
                    {retryCorrectCount}/{wrongQuestions.length} câu đúng
                  </p>
                  {retryBonusPct > 0 && (
                    <p className="text-emerald-400 font-bold text-sm mt-1">
                      +{retryBonusPct}% điểm thưởng! Tổng: {effectiveScore}%
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reading Comprehension — shown after quiz submitted */}
          {hasReading && unit.readingPassage && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5">
              <ReadingComprehensionExercise
                passage={unit.readingPassage}
                onComplete={(score, total) => {
                  setReadingDone(true);
                  if (score >= Math.ceil(total * 0.75)) playCorrectSound();
                }}
              />
            </div>
          )}

          {/* Progress Summary */}
          <div className="border border-border/60 bg-card rounded-2xl p-5 shadow-md">
            <p className="text-sm font-bold text-foreground mb-3">📊 Kết quả học tập</p>
            <div className="space-y-2">
              {[
                {
                  label: "Từ vựng đã học",
                  value: `${seenCards.size}/${VOCAB_LIMIT} từ`,
                  icon: "📚",
                  done: seenCards.size >= VOCAB_LIMIT,
                },
                {
                  label: "Shadowing",
                  value: `${shadowAvg}% trung bình`,
                  icon: "🎤",
                  done: shadowDone || unit.dialogues.length === 0,
                },
                {
                  label: "Nghe hiểu",
                  value: `${lacScore}/${LISTEN_CHOOSE_LENGTH} đúng`,
                  icon: "🎧",
                  done: lacScore >= Math.ceil(LISTEN_CHOOSE_LENGTH * 0.7),
                },
                {
                  label: "Quiz",
                  value: `${finalQuizScore}/${FINAL_QS.length} đúng`,
                  icon: "🧠",
                  done: finalQuizScore >= Math.ceil(FINAL_QS.length * 0.6),
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <span className="text-muted-foreground text-sm flex-1">{item.label}</span>
                  <span
                    className={`text-sm font-bold ${item.done ? "text-emerald-400" : "text-muted-foreground"}`}
                  >
                    {item.value}
                  </span>
                  {item.done && <CheckCircle size={14} className="text-emerald-500" />}
                </div>
              ))}
            </div>
          </div>

          {/* Badge — performance-based stars */}
          <div className="border border-emerald-500/40 bg-emerald-500/5 rounded-2xl p-5 sm:p-8 text-center">
            <div className="text-7xl mb-3 animate-bounce">{unit.badgeEmoji}</div>
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(3)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={i < effectiveStarCount ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/60"}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {effectiveScore}% tổng điểm
              {retryBonusPct > 0 ? (
                <span className="text-emerald-400 ml-1">(+{retryBonusPct}% bonus)</span>
              ) : null}
            </p>
            <p className="text-emerald-600 font-black text-xl mb-1">
              Huy hiệu: {unit.badgeName}
            </p>
            <p className="text-muted-foreground text-sm">{unit.title}</p>
          </div>

          {/* Motivation */}
          <div className="border-l-4 border-emerald-500 bg-emerald-500/10 rounded-r-2xl p-5">
            <p className="text-emerald-600 font-bold text-lg leading-relaxed">
              Tuyệt vời! Bạn đã hoàn thành xuất sắc chương học này. 🌟
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Hãy tiếp tục phát huy tinh thần tự học mỗi ngày. Lặp lại ngắt quãng sẽ giúp bạn nhớ từ
              vựng lâu hơn!
            </p>
          </div>

          {/* Proof Moment */}
          {unit.situation && (
            <div className="border border-violet-500/30 bg-violet-500/5 rounded-2xl p-5">
              <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">
                🎤 Proof of Progress
              </p>
              <p className="text-foreground font-semibold text-sm mb-1">Hãy thử lại tình huống hôm nay!</p>
              <p className="text-muted-foreground text-xs mb-4">
                Nói to câu trả lời cho tình huống:{" "}
                <span className="text-foreground italic">&ldquo;{unit.situation}&rdquo;</span>
              </p>
              {unit.learningOutcomes && (
                <div className="space-y-1 mb-4">
                  {unit.learningOutcomes.map((outcome, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                      <span className="text-emerald-400">✓</span> {outcome}
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() =>
                  playTTS(`${unit.situation ?? ""} — ${unit.learningOutcomes?.join(", ") ?? ""}`)
                }
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-700 font-bold text-sm hover:bg-violet-500/20 transition-colors"
              >
                <Volume2 size={16} /> Nghe lại tình huống
              </button>
            </div>
          )}

          {/* Completion buttons */}
          {!isCompleted ? (
            <LessonContinueButton
              onClick={handleCompleteUnit}
              disabled={isSubmitting || !readingDone}
              className="!py-5 text-lg"
            >
              {isSubmitting
                ? "Đang lưu..."
                : !readingDone
                ? "Hoàn thành Đọc hiểu để tiếp tục ↑"
                : "Hoàn thành bài học"}
            </LessonContinueButton>
          ) : (
            <div className="text-center">
              <div className="bg-emerald-600/20 border border-emerald-600/40 rounded-xl p-4 mb-4">
                <p className="text-emerald-600 font-bold">✅ Bạn đã hoàn thành chương học này!</p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/quiz"
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-foreground font-bold rounded-xl px-5 py-3 transition-colors text-sm"
                >
                  📝 Quiz từ vựng
                </Link>
                <MinimalButton href={nextRoute} className="!rounded-xl">
                  Tiếp tục <ChevronRight size={16} />
                </MinimalButton>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
