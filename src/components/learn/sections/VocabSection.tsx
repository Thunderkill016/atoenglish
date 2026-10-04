"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { toast } from "sonner";
import { saveCardToSRS } from "@/app/actions/cards";
import type { UnitData } from "../UnitTemplate";
import { playUnitAudio } from "@/lib/utils/unit-audio";
import { VOCAB_ACTIVE_RECALL_HINT } from "@/lib/lessons/learning-flow";
import LessonSectionHeader from "../lesson-ui/LessonSectionHeader";
import LessonContinueButton from "../lesson-ui/LessonContinueButton";
import LessonCard from "../lesson-ui/LessonCard";
import { lessonSectionMotion } from "../lesson-ui/motion";

interface VocabSectionProps {
  unit: UnitData;
  sectionOrderIdx: number;
  TOTAL_SECTIONS: number;
  seenCards: Set<number>;
  setSeenCards: React.Dispatch<React.SetStateAction<Set<number>>>;
  flippedCards: Set<number>;
  setFlippedCards: React.Dispatch<React.SetStateAction<Set<number>>>;
  playTTS: (text: string, rate?: number) => void;
  autoPlay: boolean;
  goNext: () => void;
}

export default function VocabSection({
  unit,
  sectionOrderIdx,
  TOTAL_SECTIONS,
  seenCards,
  setSeenCards,
  flippedCards,
  setFlippedCards,
  playTTS,
  autoPlay,
  goNext,
}: VocabSectionProps) {
  const [savedCards, setSavedCards] = useState<Set<number>>(new Set());
  const VOCAB_LIMIT = unit.vocab.length;
  const VOCAB_DISPLAY = unit.vocab;

  return (
    <motion.div
      key="s2"
      initial={lessonSectionMotion.initial}
      animate={lessonSectionMotion.animate}
      exit={lessonSectionMotion.exit}
      transition={lessonSectionMotion.transition}
    >
      <LessonSectionHeader
        sectionId={2}
        sectionOrderIdx={sectionOrderIdx}
        totalSections={TOTAL_SECTIONS}
      />
      <LessonCard variant="muted" className="mb-5">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <span className="text-primary font-semibold">Active recall — </span>
          {VOCAB_ACTIVE_RECALL_HINT}
        </p>
      </LessonCard>

      {/* Counter */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(seenCards.size / VOCAB_LIMIT) * 100}%` }}
          />
        </div>
        <span className="text-sm font-bold text-primary">{seenCards.size}/{VOCAB_LIMIT} từ</span>
        <button
          onClick={() => setSeenCards(new Set(VOCAB_DISPLAY.map((_, i) => i)))}
          className="text-xs text-muted-foreground hover:text-foreground font-bold px-2 py-1 rounded-lg transition-colors border border-border/60 hover:border-border ml-2"
        >
          Tôi biết hết →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {VOCAB_DISPLAY.map((v, i) => {
          const isFlipped = flippedCards.has(i);
          return (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 450, damping: 15 }}
              onClick={() => {
                const isNowFlipped = !flippedCards.has(i);
                setFlippedCards((p) => {
                  const n = new Set(p);
                  if (n.has(i)) n.delete(i);
                  else n.add(i);
                  return n;
                });
                setSeenCards((p) => {
                  const n = new Set(p);
                  n.add(i);
                  return n;
                });
                if (isNowFlipped && autoPlay) {
                  void playUnitAudio({ src: v.audio, text: v.word, rate: 0.85 }, playTTS);
                }
              }}
              className="cursor-pointer"
              style={{ perspective: "600px" }}
            >
              <div
                style={{
                  transition: "transform 0.55s cubic-bezier(.4,2,.6,1)",
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  position: "relative",
                  minHeight: "150px",
                }}
              >
                {/* Front */}
                <div
                  className={`absolute inset-0 border border-border/60 bg-card rounded-2xl p-4 flex flex-col justify-between shadow-md transition-all duration-300 ${
                    seenCards.has(i) ? "border-primary/30" : "border-border/60 hover:border-primary/40"
                  }`}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  {/* S2-2: Image flashcard (Paivio dual coding) */}
                  {v.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={v.image_url}
                      alt={v.word}
                      className="w-16 h-16 object-cover rounded-xl mb-1 border border-border/40"
                      loading="lazy"
                    />
                  ) : v.emoji && (
                    <p className="text-3xl mb-1 leading-none">{v.emoji}</p>
                  )}
                  <div>
                    <p className="text-foreground font-bold text-base tracking-wide">{v.word}</p>
                    <p className="text-muted-foreground text-xs mt-0.5 font-mono">{v.phonetic}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSeenCards((p) => {
                          const n = new Set(p);
                          n.add(i);
                          return n;
                        });
                      }}
                      aria-label="Đã biết từ này"
                      className={`text-xs font-bold px-2 py-0.5 rounded-lg transition-all ${
                        seenCards.has(i) && !flippedCards.has(i)
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {seenCards.has(i) && !flippedCards.has(i) ? "✓ Biết rồi" : "Biết rồi?"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void playUnitAudio({ src: v.audio, text: v.word, rate: 0.7 }, playTTS);
                      }}
                      aria-label={`Nghe: ${v.word}`}
                      className="p-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all active:scale-90"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                </div>
                {/* Back */}
                <div
                  className="absolute inset-0 border border-primary/30 bg-card rounded-2xl p-4 flex flex-col justify-between shadow-md"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div className="space-y-2">
                    <p className="text-primary font-black text-sm">{v.meaning}</p>
                    {v.collocation && (
                      <span className="inline-flex items-center gap-1 bg-primary/10 border border-primary/30 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                        💬 {v.collocation}
                      </span>
                    )}
                    <p className="text-foreground text-xs italic leading-relaxed">&ldquo;{v.example}&rdquo;</p>
                    {v.example2 && <p className="text-muted-foreground text-xs italic">&ldquo;{v.example2}&rdquo;</p>}
                    {v.l1_interference_vn && (
                      <div className="mt-1 bg-amber-500/10 border border-amber-500/30 rounded-xl px-2.5 py-1.5">
                        <p className="text-amber-400 text-xs leading-relaxed">{v.l1_interference_vn}</p>
                      </div>
                    )}
                  </div>
                   <div className="flex items-center justify-between">
                    <p className="text-xs text-teal-600/80">Nhấn để lật lại ↩</p>
                    <div className="flex gap-2">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (savedCards.has(i)) return;
                          try {
                            const unitLevel = (unit.level?.match(/A[012]|B[12]|C1/) ?? ["A1"])[0] as "A0" | "A1" | "A2" | "B1" | "B2" | "C1";
                            const res = await saveCardToSRS({
                              word: v.word,
                              phonetic: v.phonetic,
                              meaning_vn: v.meaning,
                              example_en: v.example,
                              topic: unit.title,
                              level: unitLevel,
                            });
                            if (res.success) {
                              toast.success(res.message);
                              setSavedCards((prev) => {
                                const next = new Set(prev);
                                next.add(i);
                                return next;
                              });
                            } else {
                              toast.error(res.error);
                            }
                          } catch (err) {
                            toast.error("Không thể lưu từ vựng.");
                          }
                        }}
                        disabled={savedCards.has(i)}
                        className={`text-xs font-bold px-2 py-1 rounded-lg transition-all active:scale-95 flex items-center gap-1 ${
                          savedCards.has(i)
                            ? "bg-primary/10 text-primary border border-primary/30 cursor-default"
                            : "bg-muted text-foreground border border-border/60 hover:bg-muted/60"
                        }`}
                      >
                        {savedCards.has(i) ? "✓ Đã lưu" : "+ SRS"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void playUnitAudio({ src: v.audio, text: v.word, rate: 0.7 }, playTTS);
                        }}
                        aria-label={`Nghe: ${v.word}`}
                        className="p-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all active:scale-90"
                      >
                        <Volume2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {seenCards.size < VOCAB_LIMIT ? (
        <div className="text-center text-muted-foreground text-sm py-4">
          Xem thêm {VOCAB_LIMIT - seenCards.size} thẻ để tiếp tục...
        </div>
      ) : (
        <LessonContinueButton onClick={goNext}>Hoàn thành từ vựng</LessonContinueButton>
      )}
    </motion.div>
  );
}
