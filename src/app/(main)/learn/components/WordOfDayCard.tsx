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

export default function WordOfDayCard({
  word,
  phonetic,
  meaning_vn,
  example_en,
  topic,
  level,
}: WordOfDayProps) {
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
    A1: "text-primary bg-primary/10 border-primary/20",
    A2: "text-primary bg-primary/10 border-primary/20",
    B1: "text-primary bg-primary/10 border-primary/20",
    B2: "text-warning bg-warning/10 border-warning/20",
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-white/60 to-primary/5 backdrop-blur-sm p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-primary" />
          <span className="text-xs font-black text-foreground tracking-tight uppercase">
            Từ hôm nay
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Speed toggle */}
          <button
            type="button"
            onClick={() => setSlowMode((s) => !s)}
            aria-label={slowMode ? "Tốc độ bình thường" : "Tốc độ chậm"}
            title={
              slowMode
                ? "Đang ở chế độ chậm — nhấn để bình thường"
                : "Nghe chậm 0.5×"
            }
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-bold transition-all ${
              slowMode
                ? "bg-warning/15 border-warning/40 text-warning"
                : "bg-card border-border text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            <Turtle className="size-3" />
            {slowMode ? "0.5×" : "1×"}
          </button>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${levelColor[level] ?? levelColor.A1}`}
          >
            {level}
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            {topic}
          </span>
        </div>
      </div>

      {/* Word + phonetic */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground capitalize">
              {word}
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {phonetic}
          </span>
        </div>
        <button
          type="button"
          onClick={handleSpeak}
          aria-label={`Phát âm từ ${word}${slowMode ? " (chậm)" : ""}`}
          className="ml-auto flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 transition-all duration-150 border border-primary/20"
        >
          <Volume2 className="size-4" />
        </button>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-muted" />

      {/* Meaning + example */}
      <div className="space-y-1.5">
        <p className="text-sm font-bold text-foreground">🇻🇳 {meaning_vn}</p>
        <div className="flex items-start gap-2">
          <p className="text-xs text-muted-foreground leading-relaxed italic flex-1">
            &ldquo;{example_en}&rdquo;
          </p>
          {/* Speak example button */}
          <button
            type="button"
            onClick={handleSpeakExample}
            aria-label="Nghe câu ví dụ"
            title="Nghe câu ví dụ"
            className="shrink-0 flex size-6 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted transition-all border border-border"
          >
            <Volume2 className="size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
