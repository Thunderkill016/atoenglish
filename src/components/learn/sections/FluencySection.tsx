"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, ChevronDown, ChevronUp } from "lucide-react";
import type { UnitData, PronunciationFocus } from "../UnitTemplate";
import LessonSectionHeader from "../lesson-ui/LessonSectionHeader";
import LessonContinueButton from "../lesson-ui/LessonContinueButton";
import { ThinProgress } from "@/components/design-system";
import { lessonSectionMotion } from "../lesson-ui/motion";
import { cn } from "@/lib/utils";

function FluencyDrillPanel({
  items,
  timeLimit = 60,
  onDone,
}: {
  items: Array<{ en: string; vn: string }>;
  timeLimit?: number;
  onDone: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          setDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleAnswer = (correct: boolean) => {
    if (correct) setScore((s) => s + 1);
    if (idx >= items.length - 1) {
      setDone(true);
      clearInterval(intervalRef.current!);
    } else {
      setIdx((i) => i + 1);
      setFlipped(false);
    }
  };

  if (done) {
    const pct = Math.round((score / items.length) * 100);
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
        <div className="text-5xl mb-3">{pct >= 80 ? "🔥" : pct >= 50 ? "💪" : "📚"}</div>
        <p className="text-foreground font-black text-2xl mb-1">
          {score}/{items.length}
        </p>
        <p className="text-primary font-semibold mb-1">
          {pct >= 80 ? "Phản xạ tuyệt vời!" : pct >= 50 ? "Đang tiến bộ!" : "Cần luyện thêm!"}
        </p>
        <p className="text-muted-foreground text-xs mb-6">
          Nation (2007): Fluency = tốc độ + độ chính xác với từ đã biết
        </p>
        <LessonContinueButton onClick={onDone}>Tiếp tục</LessonContinueButton>
      </div>
    );
  }

  const item = items[idx];
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div
          className={cn(
            "text-2xl font-black tabular-nums",
            timeLeft <= 10 ? "text-red-500" : "text-primary"
          )}
        >
          {timeLeft}s
        </div>
        <div className="flex-1">
          <ThinProgress value={Math.round((timeLeft / timeLimit) * 100)} />
        </div>
        <span className="text-xs text-muted-foreground font-bold">
          {idx + 1}/{items.length}
        </span>
      </div>

      <div
        className="lesson-flip-scene cursor-pointer mb-4"
        onClick={() => setFlipped((f) => !f)}
      >
        <div className={cn("lesson-flip-inner", flipped && "is-flipped")}>
          <div className="lesson-flip-face rounded-2xl border-2 border-primary/30 bg-card p-6 flex flex-col items-center justify-center">
            <p className="text-muted-foreground text-xs mb-2 uppercase tracking-widest">Tiếng Việt</p>
            <p className="text-foreground font-black text-2xl text-center">{item.vn}</p>
            <p className="text-primary/70 text-xs mt-3">Nhấn để xem tiếng Anh</p>
          </div>
          <div className="lesson-flip-face lesson-flip-back rounded-2xl border-2 border-emerald-500/30 bg-card p-6 flex flex-col items-center justify-center">
            <p className="text-muted-foreground text-xs mb-2 uppercase tracking-widest">Tiếng Anh</p>
            <p className="text-emerald-600 dark:text-emerald-400 font-black text-2xl text-center">
              {item.en}
            </p>
          </div>
        </div>
      </div>

      {flipped ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleAnswer(false)}
            className="bg-red-500/10 hover:bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 font-bold rounded-xl py-3 text-sm transition-colors"
          >
            ✗ Chưa nhớ
          </button>
          <button
            onClick={() => handleAnswer(true)}
            className="bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl py-3 text-sm transition-colors"
          >
            ✓ Nhớ rồi!
          </button>
        </div>
      ) : (
        <p className="text-center text-muted-foreground text-sm">Nhớ chưa? Nhấn thẻ để kiểm tra →</p>
      )}

      <p className="text-center text-muted-foreground text-xs mt-3">✓ {score} từ nhớ được</p>
    </div>
  );
}

function PronunciationFocusCard({
  focus,
  playTTS,
}: {
  focus: PronunciationFocus;
  playTTS?: (text: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 border border-border/60 bg-card rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <span className="text-2xl">🗣️</span>
        <div className="flex-1 min-w-0">
          <p className="text-primary font-black text-sm tracking-wide">Phát âm trọng tâm</p>
          <p className="text-muted-foreground font-mono text-xs truncate">{focus.phoneme}</p>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-muted-foreground shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <p className="text-foreground/80 text-xs leading-relaxed">{focus.description}</p>
              <div className="space-y-2">
                {focus.examples.map((ex, i) => (
                  <div key={i} className="flex items-start gap-2 bg-muted/40 rounded-xl p-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-foreground font-bold text-sm">{ex.word}</span>
                        <span className="text-primary font-mono text-xs">{ex.ipa}</span>
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed">{ex.tip}</p>
                    </div>
                    {playTTS && (
                      <button
                        onClick={() => playTTS(ex.word)}
                        aria-label={`Nghe: ${ex.word}`}
                        className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all shrink-0 active:scale-90"
                      >
                        <Volume2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {focus.minimalPairs && focus.minimalPairs.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1.5">
                    Minimal Pairs
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {focus.minimalPairs.map(([a, b], i) => (
                      <span
                        key={i}
                        className="text-xs bg-muted border border-border/60 rounded-lg px-2 py-0.5 text-foreground/80"
                      >
                        {a} <span className="text-muted-foreground">↔</span> {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface FluencySectionProps {
  unit: UnitData;
  sectionOrderIdx: number;
  TOTAL_SECTIONS: number;
  goNext: () => void;
}

export default function FluencySection({
  unit,
  sectionOrderIdx,
  TOTAL_SECTIONS,
  goNext,
}: FluencySectionProps) {
  const [fluencyActive, setFluencyActive] = useState(false);

  const drillItems =
    unit.fluencyDrill?.items ??
    unit.vocab.slice(0, 8).map((v) => ({ en: v.word, vn: v.meaning }));

  const pron = unit.pronunciationFocus;

  return (
    <motion.div
      key="s10"
      initial={lessonSectionMotion.initial}
      animate={lessonSectionMotion.animate}
      exit={lessonSectionMotion.exit}
      transition={lessonSectionMotion.transition}
    >
      <LessonSectionHeader
        sectionId={10}
        sectionOrderIdx={sectionOrderIdx}
        totalSections={TOTAL_SECTIONS}
        subtitle="~1 phút · Phản xạ tức thì"
      />
      <p className="text-muted-foreground mb-4 text-sm">
        Nhìn tiếng Việt → nhớ ngay tiếng Anh. Không dừng suy nghĩ.
      </p>

      {pron && !fluencyActive && <PronunciationFocusCard focus={pron} />}

      {!fluencyActive ? (
        <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
          <div className="text-5xl mb-4">🏋️</div>
          <p className="text-foreground font-bold text-lg mb-2">Sẵn sàng luyện phản xạ?</p>
          <p className="text-muted-foreground text-sm mb-6">
            {drillItems.length} từ · Nhấn thẻ để lật · Chấm điểm bản thân
          </p>
          <LessonContinueButton onClick={() => setFluencyActive(true)}>
            Bắt đầu luyện phản xạ
          </LessonContinueButton>
        </div>
      ) : (
        <FluencyDrillPanel
          items={drillItems}
          timeLimit={unit.fluencyDrill?.timeLimit ?? 60}
          onDone={goNext}
        />
      )}

      {!fluencyActive && (
        <div className="mt-4">
          <LessonContinueButton onClick={goNext} variant="secondary">
            Bỏ qua
          </LessonContinueButton>
        </div>
      )}
    </motion.div>
  );
}