"use client";

import { useState, useCallback, useRef, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, ChevronRight, RotateCcw, Zap, BookOpen } from "lucide-react";
import { assessPronunciation, type PhonemeResult } from "@/app/actions/phoneme";

// ─── Practice sentences A1-A2 (common problem phonemes for Vietnamese learners) ─
const PRACTICE_SENTENCES = [
  { id: 1, text: "Thank you very much.", focus: "/θ/ — âm 'th'", tip: "Đặt lưỡi giữa hai răng" },
  { id: 2, text: "This is my friend.", focus: "/ð/ — âm 'th' có rung", tip: "Giống 'th' nhưng có rung cổ họng" },
  { id: 3, text: "I work at a bank.", focus: "Âm cuối /k/", tip: "Đừng bỏ âm cuối" },
  { id: 4, text: "She likes cats and dogs.", focus: "Âm cuối /s/ và /z/", tip: "/s/ sau âm vô thanh, /z/ sau âm hữu thanh" },
  { id: 5, text: "What time does it start?", focus: "Âm cuối /t/", tip: "Bật nhẹ âm /t/ cuối từ" },
  { id: 6, text: "I studied English last night.", focus: "Âm cuối /d/ và /t/", tip: "studied=/d/, last=/t/, night=/t/" },
  { id: 7, text: "The weather is bad today.", focus: "/ð/ trong 'the', 'weather'", tip: "Âm /ð/ xuất hiện nhiều — luyện chậm" },
  { id: 8, text: "Can you help me please?", focus: "Nhấn trọng âm", tip: "Nhấn vào: HELP — không nhấn vào 'can', 'you'" },
  { id: 9, text: "I want to eat some noodles.", focus: "/w/ và /v/ khác nhau", tip: "/w/ = tròn môi, /v/ = răng cắn môi dưới" },
  { id: 10, text: "My father is a teacher.", focus: "/f/ — âm 'f'", tip: "Răng trên chạm môi dưới, thổi hơi ra" },
];

// ─── Score display ─────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "emerald" : score >= 60 ? "amber" : "red";
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-lg
        ${color === "emerald" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
          : color === "amber" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
          : "bg-red-500/15 text-red-400 border border-red-500/30"}`}
    >
      {score}%
      {score >= 80 ? " 🎉" : score >= 60 ? " 👍" : " 💪"}
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function PhonemeChecker() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [result, setResult] = useState<PhonemeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const sentence = PRACTICE_SENTENCES[selectedIdx];

  const playTTS = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.8;
    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find(v => v.lang === "en-US" && v.name.includes("Google")) ??
      voices.find(v => v.lang === "en-US") ?? null;
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognitionClass =
      (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ??
      (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setError("Trình duyệt không hỗ trợ nhận giọng nói. Dùng Chrome để luyện tập.");
      return;
    }

    setError(null);
    setResult(null);
    setSpokenText("");
    const recognition = new SpeechRecognitionClass();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const heard = event.results[0]?.[0]?.transcript ?? "";
      setSpokenText(heard);
      setIsListening(false);

      if (!heard.trim()) {
        setError("Không nghe được. Thử lại — nói to và rõ hơn.");
        return;
      }

      startTransition(async () => {
        const res = await assessPronunciation({
          target: sentence.text,
          spoken: heard,
        });
        setResult(null);
        setError(res.error);
      });
    };

    recognition.onerror = () => {
      setIsListening(false);
      setError("Lỗi nhận giọng. Cho phép microphone và thử lại.");
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [sentence.text]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const handleSelect = (idx: number) => {
    setSelectedIdx(idx);
    setResult(null);
    setSpokenText("");
    setError(null);
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 bg-violet-500/10 rounded-xl">
          <Mic className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h2 className="text-white font-bold text-base">Luyện phát âm theo mẫu</h2>
          <p className="text-zinc-500 text-xs">Tự luyện có hướng dẫn, chưa chấm điểm phát âm</p>
        </div>
      </div>

      {/* Sentence selector */}
      <div className="space-y-1.5">
        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" /> Chọn câu luyện tập
        </p>
        <div className="space-y-1">
          {PRACTICE_SENTENCES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => handleSelect(i)}
              className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${
                selectedIdx === i
                  ? "bg-violet-500/15 border-violet-500/40 text-white"
                  : "bg-white/4 border-white/8 text-zinc-300 hover:bg-white/8 hover:border-white/15"
              }`}
            >
              <div className="flex items-start gap-2">
                <ChevronRight className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${selectedIdx === i ? "text-violet-400" : "text-zinc-600"}`} />
                <div>
                  <p className="font-medium">{s.text}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    <span className="text-violet-400/80">{s.focus}</span> — {s.tip}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Practice panel */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        {/* Target sentence */}
        <div className="bg-zinc-900/60 rounded-xl p-4 space-y-2">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Câu mục tiêu</p>
          <p className="text-white text-lg font-semibold leading-relaxed">{sentence.text}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded-lg">
              {sentence.focus}
            </span>
            <button
              onClick={() => { playTTS(sentence.text); }}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" /> Nghe mẫu
            </button>
            <button
              onClick={() => {
                const u = new SpeechSynthesisUtterance(sentence.text);
                u.lang = "en-US"; u.rate = 0.55;
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(u);
              }}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              🐢 Chậm
            </button>
          </div>
        </div>

        {/* Mic button */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={isListening ? stopListening : startListening}
            disabled={isPending}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
              isListening
                ? "bg-red-500 hover:bg-red-400 text-white"
                : "bg-violet-500 hover:bg-violet-400 text-white disabled:bg-zinc-700 disabled:text-zinc-500"
            }`}
          >
            {isListening ? (
              <><MicOff className="w-4 h-4" /> Dừng lại</>
            ) : isPending ? (
              <><Zap className="w-4 h-4 animate-pulse" /> Đang phân tích...</>
            ) : (
              <><Mic className="w-4 h-4" /> Bắt đầu nói</>
            )}
          </motion.button>
          {(result || spokenText) && (
            <button
              onClick={() => { setResult(null); setSpokenText(""); setError(null); }}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Thử lại
            </button>
          )}
        </div>

        {/* Listening indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
              <p className="text-red-300 text-sm font-medium">Đang nghe... Hãy đọc câu trên</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* What AI heard */}
        <AnimatePresence>
          {spokenText && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">AI nghe được</p>
              <p className="text-zinc-300 text-sm italic">&ldquo;{spokenText}&rdquo;</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Feedback */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pt-2 border-t border-white/8"
            >
              {/* Score */}
              <div className="flex items-center gap-3">
                <ScoreBadge score={result.score} />
                <p className="text-zinc-300 text-sm flex-1">{result.praise_vn}</p>
              </div>

              {/* Phoneme errors */}
              {result.phoneme_errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">⚠️ Lỗi phát âm cần cải thiện</p>
                  {result.phoneme_errors.map((e, i) => (
                    <div key={i} className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{e.word}</span>
                        <span className="text-zinc-500 text-xs">{e.ipa_target}</span>
                      </div>
                      <p className="text-zinc-400 text-xs">{e.common_mistake_vn}</p>
                      <p className="text-amber-300 text-xs font-medium">💡 {e.tip_vn}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* No errors */}
              {result.phoneme_errors.length === 0 && result.score >= 80 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                  <span>🎯</span>
                  <p className="text-emerald-300 text-sm font-medium">Phát âm rất tốt!</p>
                </div>
              )}

              {/* Overall tip */}
              <div className="bg-violet-950/20 border border-violet-500/20 rounded-xl p-3">
                <p className="text-xs text-violet-400 font-bold mb-1">📌 Gợi ý tổng thể</p>
                <p className="text-zinc-300 text-xs">{result.overall_tip_vn}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
