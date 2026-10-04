"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  Mic,
  MicOff,
  Play,
  Square,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import {
  VOWELS,
  CONSONANTS,
  ALL_SOUNDS,
  type IpaSound,
} from "@/lib/data/ipa-sounds";
import { SecondaryPageShell } from "@/components/design-system";

const STORAGE_KEY = "ato-ipa-mastered";

type FilterMode = "all" | "vowel" | "consonant" | "hard";

export default function PronunciationClient() {
  const [selected, setSelected] = useState<IpaSound | null>(null);
  const [mastered, setMastered] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterMode>("all");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlayingBack, setIsPlayingBack] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioUrlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load mastered from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setMastered(new Set(JSON.parse(saved) as string[]));
    } catch { /* ignore */ }
  }, []);

  function saveMastered(next: Set<string>) {
    setMastered(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch { /* ignore */ }
  }

  function toggleMastered(id: string) {
    const next = new Set(mastered);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    saveMastered(next);
  }

  // Web Speech API — speak example word
  const speak = useCallback((sound: IpaSound) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(true);
    const utt = new SpeechSynthesisUtterance(sound.exampleWord);
    utt.lang = "en-US";
    utt.rate = 0.8;
    utt.pitch = 1;
    // Try to pick a native English voice
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(
      (v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Microsoft") || v.localService === false)
    ) ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
    if (enVoice) utt.voice = enVoice;
    utt.onend = () => setIsPlaying(false);
    utt.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utt);
  }, []);

  // Record user voice
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = URL.createObjectURL(blob);
        setHasRecording(true);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      setIsRecording(true);
      setHasRecording(false);
    } catch { /* microphone denied */ }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  const playRecording = useCallback(() => {
    if (!audioUrlRef.current) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(audioUrlRef.current);
    audioRef.current = audio;
    setIsPlayingBack(true);
    audio.onended = () => setIsPlayingBack(false);
    audio.onerror = () => setIsPlayingBack(false);
    audio.play();
  }, []);

  // Filtered sounds
  const filteredVowels = filter === "consonant"
    ? []
    : filter === "hard"
      ? VOWELS.filter((s) => s.difficulty === "hard")
      : VOWELS;

  const filteredConsonants = filter === "vowel"
    ? []
    : filter === "hard"
      ? CONSONANTS.filter((s) => s.difficulty === "hard")
      : CONSONANTS;

  const masteredCount = ALL_SOUNDS.filter((s) => mastered.has(s.id)).length;
  const totalCount = ALL_SOUNDS.length;

  const DIFFICULTY_LABEL = {
    easy: "Dễ",
    medium: "Vừa",
    hard: "Khó",
  };

  // V2 design-system colors (no inline styles)
  const DIFF = {
    easy: {
      border: "border-emerald-500",
      bg: "bg-emerald-500/10",
      text: "text-emerald-500",
      dot: "bg-emerald-500",
      ring: "ring-emerald-500/50",
    },
    medium: {
      border: "border-amber-500",
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      dot: "bg-amber-500",
      ring: "ring-amber-500/50",
    },
    hard: {
      border: "border-red-500",
      bg: "bg-red-500/10",
      text: "text-red-500",
      dot: "bg-red-500",
      ring: "ring-red-500/50",
    },
  } as const;

  function SoundCard({ sound }: { sound: IpaSound }) {
    const isMastered = mastered.has(sound.id);
    const isSelected = selected?.id === sound.id;
    const d = DIFF[sound.difficulty];
    const baseCard = "rounded-xl p-2.5 flex flex-col items-center gap-0.5 border-2 relative transition-all active:scale-[0.985]";
    const cardCls = `${baseCard} ${isSelected ? `${d.border} ${d.bg}` : isMastered ? "border-emerald-500/50 bg-emerald-500/5" : "border-border/60 bg-card"}`;
    const symCls = `text-[22px] font-mono font-bold leading-none ${isSelected ? d.text : isMastered ? "text-emerald-400" : "text-foreground"}`;
    return (
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          setSelected(isSelected ? null : sound);
          setHasRecording(false);
          setIsRecording(false);
        }}
        className={cardCls}
      >
        {isMastered && (
          <CheckCircle2 size={10} className="absolute top-1 right-1 text-emerald-500" />
        )}
        <span className={symCls}>
          {sound.symbol}
        </span>
        <span className="text-[9px] text-muted-foreground font-semibold">
          {sound.exampleWord}
        </span>
        <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${d.dot}`} />
      </motion.button>
    );
  }

  return (
    <SecondaryPageShell
      title="44 Âm IPA Tiếng Anh"
      subtitle="Nhấn vào âm để xem hướng dẫn · Nghe audio · Luyện giọng"
    >
      <div className="max-w-[520px] mx-auto pb-16">

        {/* Progress bar */}
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 mb-3.5">
          <div className="flex-1">
            <div className="flex justify-between mb-1.5">
              <span className="text-[11px] text-muted-foreground font-semibold">Đã thuộc</span>
              <span className="text-[11px] text-emerald-500 font-bold">
                {masteredCount}/{totalCount}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(masteredCount / totalCount) * 100}%` }}
                transition={{ duration: 0.6 }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </div>
          <button
            onClick={() => saveMastered(new Set())}
            title="Reset tiến độ"
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="grid grid-cols-4 gap-1.5 mb-4">
          {(
            [
              { key: "all", label: "Tất cả", count: ALL_SOUNDS.length },
              { key: "vowel", label: "Vowels", count: VOWELS.length },
              { key: "consonant", label: "Consonants", count: CONSONANTS.length },
              { key: "hard", label: "🇻🇳 Khó", count: ALL_SOUNDS.filter(s => s.difficulty === "hard").length },
            ] as { key: FilterMode; label: string; count: number }[]
          ).map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex flex-col items-center gap-0.5 rounded-xl border py-2 px-1 text-[11px] font-bold transition-colors ${active ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border/60 text-muted-foreground"}`}
              >
                <span className={active ? "text-[11px] font-bold" : "text-[11px] font-bold text-muted-foreground"}>{f.label}</span>
                <span className={`text-[10px] ${active ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{f.count}</span>
              </button>
            );
          })}
        </div>

        {/* Difficulty legend */}
        <div className="flex gap-4 mb-4 text-xs">
          {(["easy", "medium", "hard"] as const).map((d) => (
            <div key={d} className="flex items-center gap-1.5 text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${DIFF[d].dot}`} />
              <span>{DIFFICULTY_LABEL[d]}</span>
            </div>
          ))}
        </div>

        {/* Vowels section */}
        {filteredVowels.length > 0 && (
          <div className="mb-5">
            <div className="text-[11px] text-muted-foreground font-bold mb-2.5 uppercase tracking-[0.08em]">
              Nguyên âm (Vowels) — {filteredVowels.length} âm
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {filteredVowels.map((s) => (
                <SoundCard key={s.id} sound={s} />
              ))}
            </div>
          </div>
        )}

        {/* Consonants section */}
        {filteredConsonants.length > 0 && (
          <div className="mb-5">
            <div className="text-[11px] text-muted-foreground font-bold mb-2.5 uppercase tracking-[0.08em]">
              Phụ âm (Consonants) — {filteredConsonants.length} âm
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {filteredConsonants.map((s) => (
                <SoundCard key={s.id} sound={s} />
              ))}
            </div>
          </div>
        )}

        {/* Detail panel (slide up) */}
        <AnimatePresence>
          {selected && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelected(null)}
                className="fixed inset-0 bg-black/60 z-40"
              />

              {/* Panel */}
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 28, stiffness: 350 }}
                className={`fixed bottom-0 left-0 right-0 z-50 max-h-[85dvh] overflow-y-auto max-w-[520px] mx-auto rounded-t-3xl border-t-2 bg-card p-5 pb-10 ${DIFF[selected.difficulty].border}`}
              >
                {/* Handle bar */}
                <div className="flex justify-center mb-4">
                  <div className="w-10 h-1 rounded-full bg-border" />
                </div>

                {/* Close */}
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-5 right-5 rounded-lg border border-border/70 bg-muted/60 p-1.5"
                >
                  <X size={14} className="text-muted-foreground" />
                </button>

                {/* Sound header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-mono font-bold flex-shrink-0 border-2 ${DIFF[selected.difficulty].bg} ${DIFF[selected.difficulty].border} ${DIFF[selected.difficulty].text}`}>
                    {selected.symbol}
                  </div>
                  <div>
                    <div className={`text-xs font-bold mb-0.5 ${DIFF[selected.difficulty].text}`}>
                      {selected.subtype} · {DIFFICULTY_LABEL[selected.difficulty]}
                    </div>
                    <div className="text-xl font-extrabold text-foreground mb-0.5">
                      {selected.exampleWord}
                    </div>
                    <div className="text-sm text-muted-foreground font-mono">
                      {selected.exampleIpa}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selected.exampleVn}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mb-4">
                  {/* Listen */}
                  <button
                    onClick={() => speak(selected)}
                    disabled={isPlaying}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition ${isPlaying ? "bg-muted border-border text-muted-foreground cursor-not-allowed" : "bg-emerald-500/10 border-emerald-500/40 text-emerald-500"}`}
                  >
                    <Volume2 size={15} />
                    {isPlaying ? "Đang phát..." : "Nghe"}
                  </button>

                  {/* Record */}
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold ${isRecording ? "bg-red-500/10 border-red-500/40 text-red-500" : "bg-blue-500/10 border-blue-500/40 text-blue-500"}`}
                  >
                    {isRecording ? <Square size={15} /> : <Mic size={15} />}
                    {isRecording ? "Dừng" : "Ghi âm"}
                  </button>

                  {/* Playback */}
                  {hasRecording && (
                    <button
                      onClick={playRecording}
                      disabled={isPlayingBack}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold ${isPlayingBack ? "bg-muted border-border text-muted-foreground cursor-not-allowed" : "bg-violet-500/10 border-violet-500/40 text-violet-500"}`}
                    >
                      <Play size={15} />
                      {isPlayingBack ? "..." : "Nghe lại"}
                    </button>
                  )}
                </div>

                {/* Record hint */}
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 p-3 mb-3"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0"
                    />
                    <span className="text-xs text-red-500">
                      Đang ghi âm... Phát âm &quot;{selected.exampleWord}&quot; rồi nhấn Dừng
                    </span>
                  </motion.div>
                )}

                {/* How to pronounce */}
                <div className="rounded-xl bg-muted/40 p-3 mb-3">
                  <div className="text-[11px] text-muted-foreground font-bold mb-1.5">
                    🗣️ CÁCH PHÁT ÂM
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed m-0">
                    {selected.howTo}
                  </p>
                </div>

                {/* Vietnamese tip */}
                {selected.vietnameseTip && (
                  <div className="flex gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 mb-3">
                    <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] text-amber-500 font-bold mb-1">
                        ⚠️ LỖI HAY GẶP (người Việt)
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug m-0">
                        {selected.vietnameseTip}
                      </p>
                    </div>
                  </div>
                )}

                {/* More examples */}
                <div className="mb-4">
                  <div className="text-[11px] text-muted-foreground font-bold mb-2">
                    📝 THÊM VÍ DỤ
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[selected.exampleWord, ...selected.moreExamples].map((word) => (
                      <button
                        key={word}
                        onClick={() => {
                          window.speechSynthesis.cancel();
                          const utt = new SpeechSynthesisUtterance(word);
                          utt.lang = "en-US";
                          utt.rate = 0.85;
                          window.speechSynthesis.speak(utt);
                        }}
                        className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/60 px-2.5 py-1 text-xs font-semibold text-foreground"
                      >
                        <Volume2 size={10} className="text-muted-foreground" />
                        {word}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation: prev/next */}
                <div className="flex gap-2 mb-4">
                  {(() => {
                    const all = ALL_SOUNDS;
                    const idx = all.findIndex((s) => s.id === selected.id);
                    const prev = all[idx - 1];
                    const next = all[idx + 1];
                    return (
                      <>
                        {prev && (
                          <button
                            onClick={() => { setSelected(prev); setHasRecording(false); }}
                            className="flex-1 flex items-center gap-1.5 rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-xs font-semibold text-muted-foreground"
                          >
                            ← <span className="font-mono">{prev.symbol}</span> {prev.exampleWord}
                          </button>
                        )}
                        {next && (
                          <button
                            onClick={() => { setSelected(next); setHasRecording(false); }}
                            className="flex-1 flex items-center justify-end gap-1.5 rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-xs font-semibold text-muted-foreground"
                          >
                            <span className="font-mono">{next.symbol}</span> {next.exampleWord} →
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Mark as mastered */}
                <button
                  onClick={() => toggleMastered(selected.id)}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition ${mastered.has(selected.id) ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-muted border-border/70 text-muted-foreground"}`}
                >
                  <CheckCircle2 size={16} />
                  {mastered.has(selected.id) ? "✓ Đã thuộc — bỏ đánh dấu" : "Đánh dấu đã thuộc"}
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </SecondaryPageShell>
  );
}
