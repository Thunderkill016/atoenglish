"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { UnitData } from "../UnitTemplate";
import { gradeTranslation, type TranslationGrade } from "@/app/actions/translate";
import LessonSectionHeader from "../lesson-ui/LessonSectionHeader";
import LessonContinueButton from "../lesson-ui/LessonContinueButton";
import { lessonSectionMotion } from "../lesson-ui/motion";

interface TranslateSectionProps {
  unit: UnitData;
  sectionOrderIdx: number;
  TOTAL_SECTIONS: number;
  goNext: () => void;
}

const ERROR_LABELS: Record<string, string> = {
  grammar: "Ngữ pháp",
  "word-choice": "Chọn từ",
  "missing-word": "Thiếu từ",
  "word-order": "Trật tự từ",
};

export default function TranslateSection({
  unit,
  sectionOrderIdx,
  TOTAL_SECTIONS,
  goNext,
}: TranslateSectionProps) {
  const [translateInputs, setTranslateInputs] = useState<Record<string, string>>({});
  const [translateSubmitted, setTranslateSubmitted] = useState(false);
  const [aiGrades, setAiGrades] = useState<Record<string, TranslationGrade | null>>({});
  const [isPending, startTransition] = useTransition();

  const normalizeTranslation = (s: string) =>
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

  const handleSubmit = () => {
    setTranslateSubmitted(true);
    if (!unit.practiceTranslate) return;

    startTransition(async () => {
      const grades = await Promise.all(
        unit.practiceTranslate!.map(async (item) => {
          const userAnswer = translateInputs[item.id] ?? "";
          if (!userAnswer.trim()) return [item.id, null] as const;
          const result = await gradeTranslation(item.prompt_vn, item.answer, userAnswer);
          return [item.id, result.success ? (result.grade ?? null) : null] as const;
        })
      );
      setAiGrades(Object.fromEntries(grades));
    });
  };

  const correctCount =
    unit.practiceTranslate?.filter((item) => {
      const grade = aiGrades[item.id];
      if (grade !== undefined && grade !== null) return grade.correct;
      const userAnswer = translateInputs[item.id] ?? "";
      return normalizeTranslation(userAnswer) === normalizeTranslation(item.answer);
    }).length ?? 0;

  const totalItems = unit.practiceTranslate?.length ?? 0;

  return (
    <motion.div
      key="s9"
      initial={lessonSectionMotion.initial}
      animate={lessonSectionMotion.animate}
      exit={lessonSectionMotion.exit}
      transition={lessonSectionMotion.transition}
    >
      <LessonSectionHeader
        sectionId={9}
        sectionOrderIdx={sectionOrderIdx}
        totalSections={TOTAL_SECTIONS}
        subtitle="Sản xuất ngôn ngữ — không nhìn gợi ý"
      />
      <p className="text-muted-foreground mb-6 text-sm">
        Đọc câu tiếng Việt và gõ bản dịch tiếng Anh của bạn.
      </p>

      {unit.practiceTranslate && unit.practiceTranslate.length > 0 ? (
        <div className="space-y-5">
          {unit.practiceTranslate.map((item, i) => {
            const userAnswer = translateInputs[item.id] ?? "";
            const grade = aiGrades[item.id];
            const isCorrect = translateSubmitted
              ? grade !== undefined && grade !== null
                ? grade.correct
                : normalizeTranslation(userAnswer) === normalizeTranslation(item.answer)
              : false;
            const isGraded = grade !== undefined && grade !== null;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-5 transition-all duration-300 ${
                  translateSubmitted
                    ? isCorrect
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-red-500/40 bg-red-500/5"
                    : "border-border/60 bg-card"
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className="bg-primary/10 text-primary rounded-full w-7 h-7 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Tiếng Việt</p>
                    <p className="text-foreground font-semibold">{item.prompt_vn}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Bản dịch tiếng Anh</p>
                  <input
                    type="text"
                    value={userAnswer}
                    disabled={translateSubmitted}
                    onChange={(e) =>
                      setTranslateInputs((p) => ({ ...p, [item.id]: e.target.value }))
                    }
                    placeholder="Gõ câu tiếng Anh ở đây..."
                    className="w-full bg-muted/40 border border-border/60 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:border-primary/60 transition-colors disabled:opacity-60"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !translateSubmitted) e.currentTarget.blur();
                    }}
                  />

                  {translateSubmitted && (
                    <AnimatePresence>
                      <motion.div
                        key={`feedback-${item.id}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 space-y-2"
                      >
                        {isPending && !isGraded && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="size-3 animate-spin" />
                            AI đang chấm bài...
                          </div>
                        )}

                        {isGraded && grade && (
                          <>
                            <div className="flex items-center gap-2 flex-wrap">
                              {isCorrect ? (
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                  ✓ Chính xác!
                                </span>
                              ) : (
                                <span className="text-xs font-black text-red-500">✗ Chưa đúng</span>
                              )}
                              {grade.errorType && ERROR_LABELS[grade.errorType] && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted border border-border/60 text-muted-foreground">
                                  {ERROR_LABELS[grade.errorType]}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-foreground/80 leading-relaxed bg-muted/40 rounded-lg px-3 py-2 border border-border/60">
                              {grade.feedbackVn}
                            </p>

                            {grade.naturalAlternative && (
                              <p className="text-xs text-primary leading-relaxed">
                                Cách nói tự nhiên hơn:{" "}
                                <span className="font-semibold italic">{grade.naturalAlternative}</span>
                              </p>
                            )}

                            {!isCorrect && (
                              <p className="text-xs text-muted-foreground">
                                Đáp án tham khảo:{" "}
                                <span className="font-semibold text-foreground">{item.answer}</span>
                              </p>
                            )}
                          </>
                        )}

                        {!isPending && !isGraded &&
                          (isCorrect ? (
                            <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                              ✓ Chính xác!
                            </p>
                          ) : (
                            <p className="text-red-500 text-xs">
                              Đáp án tham khảo:{" "}
                              <span className="font-semibold">{item.answer}</span>
                            </p>
                          ))}
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              </div>
            );
          })}

          {!translateSubmitted ? (
            <LessonContinueButton
              onClick={handleSubmit}
              disabled={unit.practiceTranslate.some(
                (item) => !(translateInputs[item.id] ?? "").trim()
              )}
            >
              Kiểm tra bản dịch
            </LessonContinueButton>
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl p-4 text-center border border-border/60 bg-card">
                <p className="text-lg font-black text-foreground">
                  {correctCount}/{totalItems} câu chính xác
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  {correctCount === totalItems
                    ? "Hoàn hảo! Kỹ năng dịch xuất sắc."
                    : correctCount >= Math.ceil(totalItems / 2)
                      ? "Tốt! Xem lại các câu chưa đúng nhé."
                      : "Cần luyện thêm — đọc lại giải thích của AI."}
                </p>
                {isPending && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                    <Loader2 className="size-3 animate-spin" /> AI đang phân tích...
                  </p>
                )}
              </div>
              <LessonContinueButton onClick={goNext} disabled={isPending}>
                Tiếp tục
              </LessonContinueButton>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground text-sm">Unit này chưa có bài dịch câu.</p>
          <div className="mt-4">
            <LessonContinueButton onClick={goNext}>Bỏ qua · Tiếp tục</LessonContinueButton>
          </div>
        </div>
      )}
    </motion.div>
  );
}