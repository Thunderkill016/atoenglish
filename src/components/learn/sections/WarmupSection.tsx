"use client";

import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { reviewCard } from "@/app/actions/cards";
import type { UnitData, WarmupCard } from "../UnitTemplate";
import LessonSectionHeader from "../lesson-ui/LessonSectionHeader";
import SituationCard from "../lesson-ui/SituationCard";
import LessonContinueButton from "../lesson-ui/LessonContinueButton";
import { lessonSectionMotion } from "../lesson-ui/motion";
import HowToLearnCard from "../lesson-ui/HowToLearnCard";

interface WarmupSectionProps {
  unit: UnitData;
  sectionOrderIdx: number;
  TOTAL_SECTIONS: number;
  playTTS: (text: string) => void;
  warmupRated: Record<number, "known" | "unknown">;
  setWarmupRated: React.Dispatch<React.SetStateAction<Record<number, "known" | "unknown">>>;
  warmupCards: WarmupCard[];
  warmupFlipped: Set<number>;
  setWarmupFlipped: React.Dispatch<React.SetStateAction<Set<number>>>;
  warmupDone: boolean;
  setWarmupDone: React.Dispatch<React.SetStateAction<boolean>>;
  goNext: () => void;
}

export default function WarmupSection({
  unit,
  sectionOrderIdx,
  TOTAL_SECTIONS,
  playTTS,
  warmupRated,
  setWarmupRated,
  warmupCards,
  warmupFlipped,
  setWarmupFlipped,
  warmupDone,
  setWarmupDone,
  goNext,
}: WarmupSectionProps) {
  return (
    <motion.div
      key="s1"
      initial={lessonSectionMotion.initial}
      animate={lessonSectionMotion.animate}
      exit={lessonSectionMotion.exit}
      transition={lessonSectionMotion.transition}
    >
      <LessonSectionHeader
        sectionId={1}
        sectionOrderIdx={sectionOrderIdx}
        totalSections={TOTAL_SECTIONS}
        subtitle="Làm quen ngữ cảnh + ôn SRS"
      />

      <HowToLearnCard />

      {unit.situation && (
        <SituationCard
          unitId={unit.unitId}
          situation={unit.situation}
          outcomes={unit.learningOutcomes}
        />
      )}

      <div className="grid grid-cols-2 gap-4 mb-8">
        {unit.warmupGreetings.map((g, i) => (
          <motion.button
            key={i}
            onClick={() => playTTS(g.en)}
            whileHover={{ y: -3, border: "1px solid rgba(16, 185, 129, 0.4)", boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.15)" }}
            whileTap={{ scale: 0.98, y: 1 }}
            transition={{ type: "spring", stiffness: 450, damping: 15 }}
            className="flex flex-col items-center text-center gap-3 p-5 border border-border/60 bg-card rounded-2xl transition-all duration-200 group hover:shadow-lg"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform duration-200">{g.emoji}</span>
            <div>
              <p className="font-bold text-foreground text-sm leading-tight">{g.en}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{g.vn}</p>
            </div>
            <span className="text-[9px] text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">▶ Nghe</span>
          </motion.button>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-border/60 bg-card p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-foreground">🧠 Bạn đã biết những từ này chưa?</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tự đánh giá trước khi học — không ảnh hưởng điểm số</p>
          </div>
          <span className="text-xs font-bold text-emerald-400">
            {Object.values(warmupRated).filter((v) => v === "known").length}/{Math.min(5, unit.vocab.length)}
          </span>
        </div>
        <div className="space-y-2">
          {unit.vocab.slice(0, 5).map((v, i) => {
            const rated = warmupRated[i];
            return (
              <div
                key={i}
                className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 border transition-all duration-200 ${
                  rated === "known"
                    ? "bg-emerald-500/10 border-emerald-500/50 shadow-sm"
                    : rated === "unknown"
                    ? "bg-card border-border/60 opacity-60"
                    : "bg-card border-border/60 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {v.emoji && <span className="text-xl shrink-0">{v.emoji}</span>}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{v.word}</p>
                    <p className="text-[11px] text-muted-foreground">{v.phonetic}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => setWarmupRated((p) => ({ ...p, [i]: "known" }))}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      rated === "known"
                        ? "bg-emerald-500 text-white shadow-sm scale-105"
                        : "bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 active:scale-95"
                    }`}
                  >
                    ✓ Biết
                  </button>
                  <button
                    onClick={() => setWarmupRated((p) => ({ ...p, [i]: "unknown" }))}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      rated === "unknown"
                        ? "bg-muted text-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    Chưa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {Object.keys(warmupRated).length === Math.min(5, unit.vocab.length) && (
          <p className="text-xs text-muted-foreground mt-3 text-center italic">
            {Object.values(warmupRated).filter((v) => v === "known").length >= 3
              ? "Bạn đã biết nhiều rồi — bài học này giúp bạn dùng thành thạo hơn."
              : "Tiếp tục học và kiểm tra lại ở phần thực hành."
            }
          </p>
        )}
      </div>

      {unit.grammar?.vnNote && (
        <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/40 p-4">
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">⚠️ Bẫy ngữ pháp của người Việt trong bài này</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {unit.grammar.vnNote.length > 150
              ? unit.grammar.vnNote.slice(0, 150) + "... (chi tiết ở phần Ngữ pháp)"
              : unit.grammar.vnNote}
          </p>
        </div>
      )}

      {warmupCards.length > 0 && !warmupDone && (
        <div className="bg-amber-950/20 border border-amber-900/50 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <RefreshCw size={16} /> Ôn tập nhanh ({warmupCards.length})
            </h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {warmupCards.map((card, wi) => {
              const isWFlipped = warmupFlipped.has(wi);
              return (
                <div
                  key={card.id}
                  onClick={() =>
                    setWarmupFlipped((p) => {
                      const n = new Set(p);
                      if (n.has(wi)) n.delete(wi);
                      else n.add(wi);
                      return n;
                    })
                  }
                  className="shrink-0 w-40 h-24 cursor-pointer"
                  style={{ perspective: "500px" }}
                >
                  <div
                    style={{
                      transition: "transform 0.4s",
                      transformStyle: "preserve-3d",
                      transform: isWFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                      position: "relative",
                      height: "100%",
                    }}
                  >
                    <div
                      className="absolute inset-0 border border-border/60 bg-card rounded-xl p-3 flex flex-col justify-center text-center shadow-md"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <p className="text-foreground font-bold text-sm">{card.word}</p>
                      <p className="text-[10px] text-muted-foreground">{card.phonetic}</p>
                    </div>
                    <div
                      className="absolute inset-0 border border-primary/40 bg-card rounded-xl p-3 flex flex-col justify-center text-center"
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                      <p className="text-primary font-bold text-xs">{card.meaning_vn}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {warmupFlipped.size === warmupCards.length && (
            <button
              onClick={() => {
                setWarmupDone(true);
                warmupCards.forEach((card, wi) => {
                  if (warmupFlipped.has(wi)) {
                    reviewCard(card.id, "Good").catch(() => {
                      /* ignore */
                    });
                  }
                });
              }}
              className="mt-3 w-full bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl py-2 text-sm transition-colors border border-primary/30"
            >
              Đã ôn xong ({warmupCards.length} thẻ)
            </button>
          )}
        </div>
      )}

      {unit.culturalNote && (
        <div className="border-l-4 border-primary bg-muted/30 rounded-r-2xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🌐</span>
            <p className="text-sm font-bold text-primary">Ghi chú sử dụng ngôn ngữ</p>
          </div>
          <p
            className="text-muted-foreground text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: unit.culturalNote }}
          />
        </div>
      )}

      <LessonContinueButton onClick={goNext}>Bắt đầu học</LessonContinueButton>
    </motion.div>
  );
}
