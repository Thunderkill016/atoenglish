"use client";

import { useState } from "react";
import { Volume2, BookOpen, Turtle } from "lucide-react";

interface WordOfDayProps {
  word: string;
  phonetic: string;
  meaning_vn: string;
  example_en: string;
  topic: string;
  level: string;
}

export default function WordOfDayCard({ word, phonetic, meaning_vn, example_en, topic, level }: WordOfDayProps) {
  const [slowMode, setSlowMode] = useState(false);

  const speak = (text: string, rate: number) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "en-US";
      utt.rate = rate;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utt);
    }
  };

  const handleSpeak = () => speak(word, slowMode ? 0.5 : 0.85);
  const handleSpeakExample = () => speak(example_en, slowMode ? 0.5 : 0.75);

  const levelColor: Record<string, string> = {
    A1: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    A2: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    B1: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20",
    B2: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20",
  };

  return (
    <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-gradient-to-br from-white/60 to-emerald-500/5 dark:from-zinc-900/25 dark:to-emerald-500/5 backdrop-blur-sm p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-black text-zinc-900 dark:text-zinc-50 tracking-tight uppercase">Từ hôm nay</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Speed toggle */}
          <button
            type="button"
            onClick={() => setSlowMode((s) => !s)}
            aria-label={slowMode ? "Tốc độ bình thường" : "Tốc độ chậm"}
            title={slowMode ? "Đang ở chế độ chậm — nhấn để bình thường" : "Nghe chậm 0.5×"}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold transition-all ${
              slowMode
                ? "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400"
                : "bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <Turtle className="size-3" />
            {slowMode ? "0.5×" : "1×"}
          </button>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${levelColor[level] ?? levelColor.A1}`}>
            {level}
          </span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">{topic}</span>
        </div>
      </div>

      {/* Word + phonetic */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50 capitalize">{word}</span>
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{phonetic}</span>
        </div>
        <button
          type="button"
          onClick={handleSpeak}
          aria-label={`Phát âm từ ${word}${slowMode ? " (chậm)" : ""}`}
          className="ml-auto flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all duration-150 border border-emerald-500/20"
        >
          <Volume2 className="size-4" />
        </button>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800/60" />

      {/* Meaning + example */}
      <div className="space-y-1.5">
        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
          🇻🇳 {meaning_vn}
        </p>
        <div className="flex items-start gap-2">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed italic flex-1">
            &ldquo;{example_en}&rdquo;
          </p>
          {/* Speak example button */}
          <button
            type="button"
            onClick={handleSpeakExample}
            aria-label="Nghe câu ví dụ"
            title="Nghe câu ví dụ"
            className="shrink-0 flex size-6 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700/60 transition-all border border-zinc-200 dark:border-zinc-700/40"
          >
            <Volume2 className="size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
