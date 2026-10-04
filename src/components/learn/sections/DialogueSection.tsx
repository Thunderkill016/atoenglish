"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Eye, EyeOff } from "lucide-react";
import type { UnitData } from "../UnitTemplate";
import { playUnitAudio, stopUnitAudio } from "@/lib/utils/unit-audio";
import { MinimalButton } from "@/components/design-system";
import LessonSectionHeader from "../lesson-ui/LessonSectionHeader";
import LessonContinueButton from "../lesson-ui/LessonContinueButton";
import { lessonSectionMotion } from "../lesson-ui/motion";

interface DialogueSectionProps {
  unit: UnitData;
  sectionOrderIdx: number;
  TOTAL_SECTIONS: number;
  lacAnswers: Record<number, string>;
  setLacAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  lacSubmitted: boolean;
  setLacSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  playTTS: (text: string) => void;
  goNext: () => void;
}

export default function DialogueSection({
  unit,
  sectionOrderIdx,
  TOTAL_SECTIONS,
  lacAnswers,
  setLacAnswers,
  lacSubmitted,
  setLacSubmitted,
  playTTS,
  goNext,
}: DialogueSectionProps) {
  const [selectedDialogue, setSelectedDialogue] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isPlayingDialogue, setIsPlayingDialogue] = useState(false);

  const DIALOGUES = unit.dialogues;
  const LISTEN_CHOOSE = unit.listenAndChoose;
  const lacScore = LISTEN_CHOOSE.filter((item, i) => lacAnswers[i] === item.answer).length;

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

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

  const playDialogueTTS = (dialogueIdx: number, speed: number) => {
    if (DIALOGUES.length === 0) return;
    const dialogue = DIALOGUES[dialogueIdx];
    const lines = dialogue.lines;
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    stopUnitAudio();
    setIsPlayingDialogue(true);
    const voice = pickEnglishVoice();
    let i = 0;
    const playNext = () => {
      if (i >= lines.length) {
        setIsPlayingDialogue(false);
        return;
      }
      const u = new SpeechSynthesisUtterance(lines[i].text);
      u.lang = "en-US";
      u.rate = speed;
      if (voice) u.voice = voice;
      u.onend = () => {
        i++;
        setTimeout(playNext, 800);
      };
      u.onerror = () => {
        i++;
        setTimeout(playNext, 800);
      };
      window.speechSynthesis.speak(u);
    };
    playNext();
  };

  const playDialogue = async (dialogueIdx: number, speed: number) => {
    if (DIALOGUES.length === 0) return;
    const dialogue = DIALOGUES[dialogueIdx];
    const fullText = dialogue.lines.map((l) => l.text).join(" ");
    window.speechSynthesis?.cancel();
    stopUnitAudio();

    const usedNative = await playUnitAudio(
      { src: dialogue.audio, text: fullText, rate: speed },
      () => { /* TTS fallback handled below */ }
    );

    if (usedNative) {
      setIsPlayingDialogue(false);
      return;
    }

    playDialogueTTS(dialogueIdx, speed);
  };

  return (
    <motion.div
      key="s5"
      initial={lessonSectionMotion.initial}
      animate={lessonSectionMotion.animate}
      exit={lessonSectionMotion.exit}
      transition={lessonSectionMotion.transition}
    >
      <LessonSectionHeader
        sectionId={5}
        sectionOrderIdx={sectionOrderIdx}
        totalSections={TOTAL_SECTIONS}
        subtitle="Nghe & hiểu hội thoại thực tế"
      />

      {DIALOGUES.length > 1 && (
        <div className="flex gap-2 mb-5">
          {DIALOGUES.map((d, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedDialogue(i);
                setShowTranscript(false);
                window.speechSynthesis?.cancel();
                setIsPlayingDialogue(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedDialogue === i
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {d.title}
            </button>
          ))}
        </div>
      )}

      {DIALOGUES.length > 0 && (
        <div className="border border-border/60 bg-card rounded-2xl p-5 mb-4 shadow-md">
          <p className="text-xs text-muted-foreground mb-2">{DIALOGUES[selectedDialogue].desc}</p>
          <div className="flex gap-3 mb-4 flex-wrap">
            <MinimalButton
              type="button"
              variant={isPlayingDialogue ? "secondary" : "primary"}
              onClick={() =>
                isPlayingDialogue
                  ? (window.speechSynthesis?.cancel(), stopUnitAudio(), setIsPlayingDialogue(false))
                  : void playDialogue(selectedDialogue, 1.0)
              }
              className="!rounded-xl"
            >
              <Volume2 size={16} />
              {isPlayingDialogue ? "Dừng" : "Nghe hội thoại"}
            </MinimalButton>
            <MinimalButton
              type="button"
              variant="secondary"
              onClick={() =>
                isPlayingDialogue
                  ? (window.speechSynthesis?.cancel(), stopUnitAudio(), setIsPlayingDialogue(false))
                  : void playDialogue(selectedDialogue, 0.75)
              }
              className="!rounded-xl"
            >
              🐢 Chậm
            </MinimalButton>
            <button
              onClick={() => setShowTranscript((p) => !p)}
              className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              {showTranscript ? <EyeOff size={14} /> : <Eye size={14} />}
              Transcript
            </button>
          </div>

          <AnimatePresence>
            {showTranscript && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {DIALOGUES[selectedDialogue].lines.map((line, i) => (
                  <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-black mt-1 bg-muted text-muted-foreground">
                      {line.speaker.charAt(0).toUpperCase()}
                    </div>
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-3 border ${
                        i % 2 === 0
                          ? "bg-muted/40 border-border/60"
                          : "bg-primary/5 border-primary/30"
                      }`}
                    >
                      <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide">
                        {line.speaker}
                      </p>
                      <p className="text-foreground text-sm leading-relaxed">{line.text}</p>
                      <p className="text-muted-foreground text-xs mt-1.5 italic">{line.translation}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {LISTEN_CHOOSE.length > 0 && (
        <div className="border border-border/60 bg-card rounded-2xl p-5 mb-6 shadow-md">
          <p className="text-sm font-bold text-foreground mb-4">🎧 Nghe và chọn đáp án đúng</p>
          <div className="space-y-5">
            {LISTEN_CHOOSE.map((item, qi) => (
              <div key={qi}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground">Câu {qi + 1}</span>
                  <button
                    onClick={() => playTTS(item.audio_text)}
                    aria-label="Nghe câu"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors"
                  >
                    <Volume2 size={12} /> Nghe
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {item.options.map((opt, oi) => {
                    const isSelected = lacAnswers[qi] === opt;
                    const isCorrect = opt === item.answer;
                    let cls =
                      "px-3 py-2 rounded-xl text-sm font-medium border transition-all duration-150 cursor-pointer text-left ";
                    if (lacSubmitted) {
                      if (isCorrect) cls += "bg-emerald-500/10 border-emerald-500 text-emerald-600";
                      else if (isSelected) cls += "bg-red-500/10 border-red-500 text-red-600";
                      else cls += "bg-card border-border/60 text-muted-foreground";
                    } else {
                      cls += isSelected
                        ? "bg-primary/10 border-primary text-primary ring-2 ring-primary/20"
                        : "bg-card border-border/60 text-foreground hover:border-primary/60 hover:bg-muted/40 active:scale-95";
                    }
                    return (
                      <button
                        key={oi}
                        onClick={() =>
                          !lacSubmitted && setLacAnswers((p) => ({ ...p, [qi]: opt }))
                        }
                        className={cls}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!lacSubmitted ? (
            <MinimalButton
              type="button"
              fullWidth
              className="mt-5 !rounded-2xl"
              disabled={Object.keys(lacAnswers).length < LISTEN_CHOOSE.length}
              onClick={() => setLacSubmitted(true)}
            >
              Kiểm tra đáp án
            </MinimalButton>
          ) : (
            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-center">
              <p className="text-emerald-600 font-bold text-lg">
                {lacScore}/{LISTEN_CHOOSE.length} đúng 🎯
              </p>
            </div>
          )}
        </div>
      )}

      {(!LISTEN_CHOOSE.length || lacSubmitted) && (
        <LessonContinueButton onClick={goNext}>Tiếp tục</LessonContinueButton>
      )}
    </motion.div>
  );
}