"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ChevronRight,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
} from "lucide-react";
import {
  PLACEMENT_QUESTIONS,
  calculateResult,
  buildSelfSelectResult,
  TOTAL_QUESTIONS,
  READING_COUNT,
  VOCAB_COUNT,
  LANG_USE_COUNT,
  type CEFRLevel,
} from "@/lib/data/placement-test";
import {
  savePlacementResult,
  setPlacementLevel,
} from "@/app/actions/placement";
import { PLACEMENT_LEVEL_OPTIONS } from "@/lib/placement/starting-unit";
import {
  SecondaryPageShell,
  MinimalButton,
  ListSection,
  Screen,
} from "@/components/design-system";

type Stage = "pick" | "test" | "saving" | "results";

const SKILL_LABEL: Record<string, string> = {
  "language-use": "Language Use",
  vocabulary: "Vocabulary",
  reading: "Reading",
};

const SKILL_ICON: Record<string, string> = {
  "language-use": "💬",
  vocabulary: "📝",
  reading: "📖",
};

export default function PlacementTestClient() {
  const [stage, setStage] = useState<Stage>("pick");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<ReturnType<
    typeof calculateResult
  > | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [learnPath, setLearnPath] = useState<string | null>(null);
  const [isSelfSelect, setIsSelfSelect] = useState(false);

  const currentQ = PLACEMENT_QUESTIONS[currentIdx]!;
  const isLast = currentIdx === TOTAL_QUESTIONS - 1;
  const progressPct = Math.round((currentIdx / TOTAL_QUESTIONS) * 100);

  const handleAnswer = useCallback(
    (optIdx: number) => {
      if (selected !== null) return;
      setSelected(optIdx);
    },
    [selected],
  );

  const handleNext = useCallback(async () => {
    if (selected === null) return;

    const newAnswers = { ...answers, [currentQ.id]: selected };
    setAnswers(newAnswers);

    if (isLast) {
      setStage("saving");
      setIsSelfSelect(false);
      const res = calculateResult(newAnswers);
      setResult(res);
      const saveRes = await savePlacementResult(res.cefrLevel, res.totalScore);
      if (saveRes.success) {
        setLearnPath(saveRes.learnPath);
      } else {
        setSaveError(saveRes.error ?? null);
      }
      setStage("results");
    } else {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
    }
  }, [selected, answers, currentQ.id, isLast]);

  const handleSelfSelect = useCallback(async (level: CEFRLevel) => {
    setStage("saving");
    setIsSelfSelect(true);
    setSaveError(null);
    const res = buildSelfSelectResult(level);
    setResult(res);
    const saveRes = await setPlacementLevel(level);
    if (saveRes.success) {
      setLearnPath(saveRes.learnPath);
    } else {
      setSaveError(saveRes.error ?? null);
    }
    setStage("results");
  }, []);

  // ── PICK LEVEL OR TAKE TEST ──────────────────────────────────────────────────
  if (stage === "pick") {
    return (
      <SecondaryPageShell
        title="Chọn điểm bắt đầu"
        subtitle="CEFR Placement · Không cần học lại từ đầu"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5 pb-16"
        >
          <ListSection title="Tôi biết điểm bắt đầu phù hợp">
            {PLACEMENT_LEVEL_OPTIONS.map((opt) => (
              <button
                key={opt.level}
                type="button"
                onClick={() => handleSelfSelect(opt.level)}
                className="w-full text-left rounded-xl border border-border/60 bg-card p-3.5 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{opt.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-black text-primary">
                        {opt.level}
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {opt.title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {opt.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Bắt đầu: {opt.startLabel}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-muted-foreground shrink-0"
                  />
                </div>
              </button>
            ))}
          </ListSection>

          <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Hoặc làm bài test đầy đủ
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {TOTAL_QUESTIONS} câu Reading · Vocabulary · Language Use · ~15–25
              phút
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Reading", count: READING_COUNT },
                { label: "Vocab", count: VOCAB_COUNT },
                { label: "Grammar", count: LANG_USE_COUNT },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg bg-muted/50 p-2 text-center"
                >
                  <div className="text-sm font-black text-foreground">
                    {s.count}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <MinimalButton
            fullWidth
            onClick={() => {
              setIsSelfSelect(false);
              setStage("test");
            }}
          >
            Làm bài test đầy đủ <ArrowRight size={18} />
          </MinimalButton>
        </motion.div>
      </SecondaryPageShell>
    );
  }

  // ── SAVING SCREEN ───────────────────────────────────────────────────────────
  if (stage === "saving") {
    return (
      <Screen narrow={false} className="flex items-center justify-center">
        <div className="flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-10 h-10 border-4 border-border border-t-primary rounded-full"
          />
        </div>
      </Screen>
    );
  }

  // ── RESULTS SCREEN ──────────────────────────────────────────────────────────
  if (stage === "results" && result) {
    return (
      <Screen narrow={false}>
        <div className="max-w-[480px] mx-auto pt-1 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Level badge hero */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  damping: 12,
                  stiffness: 200,
                  delay: 0.2,
                }}
                className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary flex items-center justify-center mx-auto mb-4 text-3xl font-black text-primary font-sans"
              >
                {result.cefrLevel}
              </motion.div>
              <h1 className="text-[22px] font-extrabold text-foreground mb-1.5">
                {result.levelLabel}
              </h1>
              <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[340px] mx-auto">
                {result.levelDescription}
              </p>
              <p className="mt-2 text-xs text-muted-foreground/80">
                {isSelfSelect
                  ? "Mức bạn tự chọn — điểm bắt đầu, không phải kết quả đo."
                  : "Ước tính từ bài test ngắn — chưa đo được nói và viết."}
              </p>
            </div>

            {!isSelfSelect && (
              <div className="rounded-xl border border-border/60 bg-card p-4 mb-3.5">
                <div className="flex justify-between mb-2.5">
                  <span className="text-xs font-bold text-muted-foreground tracking-wider">
                    TỔNG ĐIỂM
                  </span>
                  <span className="text-lg font-black text-primary">
                    {result.totalScore}/{TOTAL_QUESTIONS}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(result.totalScore / TOTAL_QUESTIONS) * 100}%`,
                    }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            )}

            {isSelfSelect && (
              <div className="rounded-xl border border-border/60 bg-card p-3.5 mb-3.5 text-xs text-muted-foreground leading-relaxed">
                ✅ Lộ trình mở từ điểm bắt đầu{" "}
                <strong className="text-primary">{result.cefrLevel}</strong> —
                các bài trước đó có thể ôn lại tuỳ chọn, không bắt buộc.
              </div>
            )}

            {/* Skill breakdown */}
            {!isSelfSelect && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  {
                    key: "reading",
                    score: result.readingScore,
                    total: READING_COUNT,
                  },
                  {
                    key: "vocabulary",
                    score: result.vocabularyScore,
                    total: VOCAB_COUNT,
                  },
                  {
                    key: "language-use",
                    score: result.languageUseScore,
                    total: LANG_USE_COUNT,
                  },
                ].map((s) => (
                  <div
                    key={s.key}
                    className="rounded-xl border border-border/60 bg-card p-3 text-center"
                  >
                    <div className="text-lg mb-1">{SKILL_ICON[s.key]}</div>
                    <div className="text-base font-extrabold text-foreground">
                      {s.score}/{s.total}
                    </div>
                    <div className="text-xs text-muted-foreground font-semibold">
                      {SKILL_LABEL[s.key]}
                    </div>
                    <div className="mt-1.5 h-0.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.score / s.total) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Next steps */}
            <div className="rounded-xl border border-border/60 bg-card p-4 mb-4">
              <div className="text-xs text-muted-foreground font-bold mb-3 tracking-[0.08em] uppercase">
                🎯 Bước tiếp theo
              </div>
              {result.nextSteps.map((step, i) => (
                <div key={i} className="flex gap-2.5 items-start mb-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/50 flex items-center justify-center text-xs font-extrabold text-primary shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-xs text-muted-foreground leading-snug">
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {/* Review wrong answers */}
            {!isSelfSelect && (
              <div className="rounded-xl border border-border/60 bg-card p-4 mb-5">
                <div className="text-xs text-muted-foreground font-bold mb-3 tracking-[0.08em] uppercase">
                  📋 Review đáp án
                </div>
                {PLACEMENT_QUESTIONS.map((q) => {
                  const userAns = answers[q.id];
                  const correct = userAns === q.correctAnswer;
                  return (
                    <div
                      key={q.id}
                      className="flex gap-2 items-start mb-2.5 pb-2.5 border-b border-border/40 last:border-0 last:mb-0 last:pb-0"
                    >
                      <div className="shrink-0 mt-0.5">
                        {correct ? (
                          <CheckCircle2 size={14} className="text-primary" />
                        ) : (
                          <XCircle size={14} className="text-destructive" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-xs font-bold mb-0.5 ${correct ? "text-primary" : "text-destructive"}`}
                        >
                          {`Q${q.id}`} · {SKILL_LABEL[q.skill]} · {q.level}
                        </div>
                        <div className="text-xs text-muted-foreground leading-snug mb-0.5">
                          {q.question.length > 60
                            ? q.question.slice(0, 60) + "…"
                            : q.question}
                        </div>
                        {!correct && (
                          <div className="text-xs text-muted-foreground leading-snug">
                            ✓{" "}
                            <span className="text-primary">
                              {q.options[q.correctAnswer]}
                            </span>
                            {" · "}
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {saveError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 mb-3.5 text-xs text-destructive">
                ⚠️ {saveError} — Level đã tính xong nhưng chưa lưu được DB.
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-2">
              {learnPath && (
                <MinimalButton fullWidth href={learnPath}>
                  <ArrowRight size={16} /> Bắt đầu học ngay
                </MinimalButton>
              )}
              <div className="flex gap-2">
                <MinimalButton
                  href="/learn"
                  variant={learnPath ? "secondary" : "primary"}
                  className="flex-1"
                >
                  <Trophy size={16} />{" "}
                  {learnPath ? "Xem lộ trình học" : "Về Bài học"}
                </MinimalButton>
                <MinimalButton
                  href="/roadmap"
                  variant="secondary"
                  className="flex-1"
                >
                  Lộ trình
                </MinimalButton>
              </div>
            </div>
          </motion.div>
        </div>
      </Screen>
    );
  }

  // ── TEST SCREEN ─────────────────────────────────────────────────────────────
  return (
    <Screen narrow={false}>
      <div className="max-w-[480px] mx-auto pb-24">
        {/* Progress header */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{SKILL_ICON[currentQ.skill]}</span>
              <span className="text-xs text-muted-foreground font-bold">
                {SKILL_LABEL[currentQ.skill]} · {currentQ.level}
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-semibold">
              {currentIdx + 1}/{TOTAL_QUESTIONS}
            </span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            {/* Reading passage */}
            {currentQ.context && (
              <div className="rounded-xl border border-border/60 bg-card p-3.5 mb-4">
                <div className="text-xs text-muted-foreground font-bold mb-2 uppercase tracking-wider">
                  📖 Đoạn văn
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed m-0">
                  {currentQ.context}
                </p>
              </div>
            )}

            {/* Question */}
            <div className="rounded-xl border border-border/60 bg-card p-4.5 mb-4">
              <p className="text-base font-bold text-foreground leading-snug m-0">
                {currentQ.question}
              </p>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-2 mb-5">
              {currentQ.options.map((opt, i) => {
                const isSelected = selected === i;
                return (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(i)}
                    disabled={selected !== null}
                    className={`w-full text-left rounded-xl px-4 py-3.5 flex items-center gap-3 transition-all text-sm ${
                      isSelected
                        ? "bg-primary/10 border-2 border-primary text-foreground"
                        : "bg-card border-2 border-border/60 text-muted-foreground hover:border-primary/40"
                    } ${selected !== null ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted border border-border/70 text-muted-foreground"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span
                      className={`leading-snug ${isSelected ? "font-semibold text-foreground" : ""}`}
                    >
                      {opt}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <MinimalButton
              fullWidth
              onClick={handleNext}
              disabled={selected === null}
            >
              {isLast ? "Nộp bài & Xem kết quả" : "Câu tiếp theo"}
              <ChevronRight size={18} />
            </MinimalButton>
          </motion.div>
        </AnimatePresence>
      </div>
    </Screen>
  );
}
