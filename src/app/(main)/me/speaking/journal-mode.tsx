"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, RotateCcw, BookOpen, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveSpeakingSession, evaluateSpeakingSession } from "@/app/actions/speaking";
import { toast } from "sonner";
import { SpeechRecognitionFallback } from "@/lib/utils/speech-fallback";

const JOURNAL_TOPICS = [
  // A1-A2 level — simple personal topics
  "Mô tả ngày hôm nay của bạn bằng tiếng Anh",
  "Kể về sở thích yêu thích nhất của bạn",
  "Talk about your favorite food and why you like it",
  "What is your daily routine on a weekday?",
  "Describe your family in 5 sentences",
  "What are you grateful for today?",
  // B1 level — slightly more complex
  "Describe your hometown in 3 sentences",
  "What do you want to achieve this year?",
  "Describe a person you admire and why",
  "Talk about a memorable trip you took",
  "Describe your dream job and the skills it requires",
  "What technology do you use every day and how does it help you?",
  // B2 level — opinions and abstract thinking
  "Do you think working from home is better than going to the office? Why?",
  "How has social media changed the way people communicate?",
  "What is one habit you would like to build and why?",
  "Talk about a challenge you overcame and what you learned",
  "If you could live in any country, where would you choose and why?",
  "How important is it to learn a foreign language in today's world?",
  // B2+ level — professional and critical thinking
  "Describe a difficult decision you made at work and how you handled it",
  "What are the pros and cons of AI in education? Give your opinion",
  "Talk about a skill you recently learned and how you applied it",
  "If you were a manager, how would you motivate your team?",
  "Describe a time you had to give someone difficult feedback",
  "What does success mean to you professionally and personally?",
  "How do you manage stress during busy work periods?",
  "What advice would you give someone starting their career?",
  "Describe a product or service you think could be improved and how",
  "Talk about a book, podcast, or course that changed your perspective",
  "What is your strategy for continuous learning in your field?",
  "Describe a cross-cultural experience and what you learned from it",
];

type RecognitionState = "idle" | "listening" | "processing" | "done";

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart?: () => void;
  onresult?: (event: {
    results: {
      [key: number]: { [key: number]: { transcript: string }; isFinal: boolean };
      length: number;
    };
  }) => void;
  onerror?: () => void;
  onend?: () => void;
}

interface SpeechWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
}

export function JournalMode() {
  const [topic, setTopic] = useState(JOURNAL_TOPICS[0]);
  const [state, setState] = useState<RecognitionState>("idle");
  const [transcript, setTranscript] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const [aiEvaluation, setAiEvaluation] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isMountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef(transcript);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const randomizeTopic = () => {
    const remaining = JOURNAL_TOPICS.filter(t => t !== topic);
    setTopic(remaining[Math.floor(Math.random() * remaining.length)]);
    setTranscript("");
    setAiEvaluation(null);
    setState("idle");
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as unknown as SpeechWindow).SpeechRecognition ||
      (window as unknown as SpeechWindow).webkitSpeechRecognition ||
      (SpeechRecognitionFallback as unknown as new () => SpeechRecognitionInstance);

    const recognition: SpeechRecognitionInstance = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      if (isMountedRef.current) setState("listening");
    };
    recognition.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string }; isFinal: boolean }; length: number } }) => {
      if (!isMountedRef.current) return;
      let final = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript + " ";
        else interim += event.results[i][0].transcript;
      }
      setTranscript(final + interim);
    };
    recognition.onerror = () => {
      if (!isMountedRef.current) return;
      setState("idle");
      toast.error("Lỗi nhận dạng giọng nói.");
    };
    recognition.onend = () => {
      if (!isMountedRef.current) return;
      setState(transcriptRef.current ? "done" : "idle");
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setState("processing");
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setState("done");
      }
    }, 500);
  };

  const handleSave = async () => {
    if (!transcript.trim()) return;
    setIsEvaluating(true);
    let savedTranscript = transcript.trim();
    try {
      const evalRes = await evaluateSpeakingSession("journal", transcript.trim());
      if (evalRes.success && evalRes.feedback) {
        setAiEvaluation(evalRes.feedback);
        savedTranscript = `${transcript.trim()}\n\n=== ĐÁNH GIÁ CHI TIẾT TỪ AI ===\n${evalRes.feedback}`;
      } else if (evalRes.error) {
        toast.error(`Không thể lấy đánh giá AI: ${evalRes.error}`);
      }
    } catch (err) {
      // Bỏ qua lỗi đánh giá, lưu transcript thô
    } finally {
      setIsEvaluating(false);
    }

    try {
      const res = await saveSpeakingSession({
        practiceType: "journal",
        transcript: savedTranscript,
        accuracyScore: null,
        duration: wordCount * 0.5, // rough estimate
        scenarioId: null,
      });
      if (!isMountedRef.current) return;
      if (res.success) {
        toast.success(res.xpEarned ? `Đã lưu nhật ký! +${res.xpEarned} XP` : "Đã lưu nhật ký nói!");
        setSavedCount(p => p + 1);
        if (!res.xpEarned) {
          // Guest local history viz (TASK-152)
          try {
            const key = "guest_speaking_sessions";
            const prev = JSON.parse(localStorage.getItem(key) || "[]");
            const entry = { id: `guest-${Date.now()}`, practice_type: "journal" as const, duration: Math.round(wordCount * 0.5), accuracy_score: null, scenario_id: null, created_at: new Date().toISOString() };
            localStorage.setItem(key, JSON.stringify([entry, ...prev].slice(0, 20)));
          } catch {}
        }
      } else {
        toast.error(res.error || "Không thể lưu.");
      }
    } catch {
      if (isMountedRef.current) {
        toast.error("Lỗi hệ thống.");
      }
    }
  };

  const handleReset = () => {
    recognitionRef.current?.stop();
    setTranscript("");
    setAiEvaluation(null);
    setState("idle");
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      recognitionRef.current?.abort();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6 w-full">
      {/* Topic Card */}
      <div className="rounded-3xl border border-border/60 bg-card p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              <BookOpen className="size-3.5" /> Chủ đề hôm nay
            </span>
            <p className="text-base sm:text-lg font-black text-foreground leading-snug">{topic}</p>
          </div>
          <button
            onClick={randomizeTopic}
            className="shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-border/60 bg-card hover:bg-white/10 hover:text-foreground text-muted-foreground transition-all duration-300"
          >
            <RotateCcw className="size-3.5" /> Đổi chủ đề
          </button>
        </div>

        {savedCount > 0 && (
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            ✓ Đã lưu {savedCount} nhật ký trong phiên này
          </div>
        )}
      </div>

      {/* Recording Area */}
      <div className="rounded-3xl border border-border/60 bg-card p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-sm">
        {/* Mic button */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {state === "listening" && (
              <motion.div
                className="absolute inset-0 rounded-full bg-red-500/20"
                animate={{ scale: [1, 1.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            <button
              onClick={state === "listening" ? stopListening : startListening}
              disabled={state === "processing"}
              className={`relative flex size-20 items-center justify-center rounded-full transition-all duration-300 shadow-xl ${
                state === "listening"
                  ? "bg-gradient-to-r from-red-500 to-rose-600 text-white border-none"
                  : state === "done"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none hover:scale-105 active:scale-95"
              }`}
            >
              {state === "listening" ? (
                <MicOff className="size-8" />
              ) : (
                <Mic className="size-8" />
              )}
            </button>
          </div>
          <p className="text-xs font-bold text-muted-foreground text-center">
            {state === "idle" && "Nhấn mic để bắt đầu nói tự do"}
            {state === "listening" && (
              <span className="text-red-500 animate-pulse">● Đang ghi âm... nhấn để dừng</span>
            )}
            {state === "processing" && "Đang xử lý..."}
            {state === "done" && `${wordCount} từ đã nói`}
          </p>
        </div>

        {/* Transcript display */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl bg-muted/50 border border-border/40 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" /> Transcript
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">{wordCount} words</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{transcript}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        {state === "done" && transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button
              onClick={handleSave}
              className="w-full sm:flex-1 h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-500/10 active:scale-[0.98]"
            >
              <Send className="size-4 mr-2" /> Lưu nhật ký
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="h-11 px-4 rounded-xl font-bold border-border/60 bg-card hover:bg-white/5 active:scale-[0.98]"
            >
              <RotateCcw className="size-4" />
            </Button>
          </motion.div>
        )}
      </div>

      {isEvaluating && (
        <div className="rounded-3xl border border-border/60 bg-card p-5 text-center space-y-3 shadow-sm animate-pulse">
          <div className="inline-block size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">AI Tutor đang phân tích bài viết của bạn...</p>
        </div>
      )}

      {aiEvaluation && (
        <div className="rounded-3xl border border-border/60 bg-card p-5 space-y-3 shadow-sm">
          <h4 className="font-extrabold text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="size-3.5" />
            Nhận xét từ AI Tutor
          </h4>
          <div className="text-xs text-foreground/80 leading-relaxed font-sans prose prose-sm prose-invert whitespace-pre-wrap">
            {aiEvaluation}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4 text-xs text-muted-foreground space-y-1.5">
        <p className="font-bold text-primary">💡 Mẹo Journal Mode:</p>
        <ul className="space-y-1 list-disc list-inside font-normal">
          <li>Nói ít nhất 30 giây về chủ đề</li>
          <li>Đừng lo sai ngữ pháp — cứ nói tự nhiên</li>
          <li>Mỗi ngày 1 chủ đề = phản xạ tiếng Anh cực nhanh</li>
        </ul>
      </div>
    </div>
  );
}
