"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Star, BookOpen, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { completeUnit, getUnitCompletionStatus } from "@/app/actions/unit";
import { getDueWarmupCards, seedUnitVocabToSRS, scheduleWrongWordsForReview } from "@/app/actions/cards";

import WarmupSection from "./sections/WarmupSection";
import VocabSection from "./sections/VocabSection";
import GrammarSection from "./sections/GrammarSection";
import PracticeSection from "./sections/PracticeSection";
import DialogueSection from "./sections/DialogueSection";
import ShadowingSection from "./sections/ShadowingSection";
import SpeakingSection from "./sections/SpeakingSection";
import QuizSection from "./sections/QuizSection";
import TranslateSection from "./sections/TranslateSection";
import FluencySection from "./sections/FluencySection";
import LessonProgress from "./lesson-ui/LessonProgress";
import SessionBreakCard from "./lesson-ui/SessionBreakCard";
import useLessonProgress from "./hooks/useLessonProgress";
import {
  trackPilotEventOnce,
  trackPilotEventPersistentlyOnce,
} from "@/lib/pilot/pilot-analytics-client";
import {
  SECTION_LABELS,
  SECTION_ORDER,
  TOTAL_SECTIONS,
  type SectionNumber,
} from "./lesson-sections";
import type {
  Dialogue,
  DialogueLine,
  FluencyDrill,
  GrammarPoint,
  ListenAndChooseItem,
  ListenArrangeItem,
  MatchingExercise,
  MatchingPair,
  PronunciationFocus,
  QuizQuestion,
  SentenceCorrectionExercise,
  SentenceScramble,
  SpeakingData,
  UnitData,
  VocabItem,
  WarmupCard,
  WarmupGreeting,
  WordBankQuestion,
} from "./lesson-types";

export type {
  Dialogue,
  DialogueLine,
  FluencyDrill,
  GrammarPoint,
  ListenAndChooseItem,
  ListenArrangeItem,
  MatchingExercise,
  MatchingPair,
  PronunciationFocus,
  QuizQuestion,
  SentenceCorrectionExercise,
  SentenceScramble,
  SpeakingData,
  UnitData,
  VocabItem,
  WarmupCard,
  WarmupGreeting,
  WordBankQuestion,
} from "./lesson-types";

interface UnitTemplateProps {
  unit: UnitData;
  nextRoute?: string;
}

interface CompletionData {
  starCount: 1 | 2 | 3;
  effectiveScore: number;
  vocabPreview: Array<{ word: string; meaning: string }>;
  nextRoute: string;
}

// ── Video Shadowing Card (lite-embed: thumbnail click → iframe) ──────────────
function VideoShadowingCard({ videoId }: { videoId: string }) {
  const [playing, setPlaying] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="max-w-3xl mx-auto px-4 mb-6">
      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/60 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800/50">
          <div className="flex size-9 items-center justify-center rounded-xl bg-red-500/10 shrink-0">
            <svg className="size-5 text-red-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">🎬 Video Shadowing</p>
            <p className="text-sm font-bold text-zinc-100">Xem → Nói theo → Shadow</p>
          </div>
        </div>

        {/* Video area */}
        <div className="relative aspect-video bg-zinc-950">
          {playing ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              allowFullScreen
              title="Shadowing video"
            />
          ) : (
            <button
              onClick={() => setPlaying(true)}
              className="absolute inset-0 w-full h-full group"
              aria-label="Phát video"
            >
              {/* Thumbnail */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumb}
                alt="Video thumbnail"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Play overlay */}
              <div className="absolute inset-0 bg-zinc-950/40 group-hover:bg-zinc-950/20 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-red-500 shadow-xl shadow-red-900/40 group-hover:scale-110 transition-transform">
                  <svg className="size-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="px-5 py-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { step: "1", icon: "👀", label: "Xem 1 lần", desc: "Nghe + đọc phụ đề" },
              { step: "2", icon: "🔁", label: "Xem lại", desc: "Nói theo từng câu" },
              { step: "3", icon: "🎙️", label: "Shadow", desc: "Nói cùng lúc với video" },
            ].map(({ step, icon, label, desc }) => (
              <div key={step} className="flex flex-col items-center gap-1 text-center p-2 rounded-xl bg-zinc-800/40">
                <span className="text-lg">{icon}</span>
                <span className="text-[10px] font-black text-zinc-300">{label}</span>
                <span className="text-[9px] text-zinc-500">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnitTemplate({ unit, nextRoute = "/dashboard" }: UnitTemplateProps) {
  const [section, setSection] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [miniSession, setMiniSession] = useState(false);
  const [sessionBreak, setSessionBreak] = useState(false); // mid-lesson break after Practice
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);

  // Shared orchestrator states needed for results calculations
  const [seenCards, setSeenCards] = useState<Set<number>>(new Set());
  const [warmupCards, setWarmupCards] = useState<WarmupCard[]>([]);
  const [warmupFlipped, setWarmupFlipped] = useState<Set<number>>(new Set());
  const [warmupDone, setWarmupDone] = useState(false);
  const [warmupRated, setWarmupRated] = useState<Record<number, "known" | "unknown">>({});

  const [lacAnswers, setLacAnswers] = useState<Record<number, string>>({});
  const [lacSubmitted, setLacSubmitted] = useState(false);

  const [shadowScores, setShadowScores] = useState<Record<number, number>>({});
  const [shadowDone, setShadowDone] = useState(false);

  // Quiz States
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizClozeInputs, setQuizClozeInputs] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Retry States
  const [retryAnswers, setRetryAnswers] = useState<Record<string, string>>({});
  const [retryClozeInputs, setRetryClozeInputs] = useState<Record<string, string>>({});
  const [retrySubmitted, setRetrySubmitted] = useState(false);

  // Spaced Cumulative Review States
  const [cumulativeAnswers, setCumulativeAnswers] = useState<Record<string, string>>({});
  const [cumulativeClozeInputs, setCumulativeClozeInputs] = useState<Record<string, string>>({});
  const [cumulativeSubmitted, setCumulativeSubmitted] = useState(false);

  // Grammar CCQ states
  const [ccqAnswer, setCcqAnswer] = useState("");
  const [ccqSubmitted, setCcqSubmitted] = useState(false);

  // Vocab flipped states
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  // Derive Dialogues safely
  const rawDialogues = unit.dialogues_list ?? (Array.isArray(unit.dialogues) ? unit.dialogues : unit.dialogues ? [unit.dialogues] : []);
  const normalizedUnit = {
    ...unit,
    dialogues: rawDialogues,
  };

  const VOCAB_LIMIT = normalizedUnit.vocab.length;
  const LISTEN_CHOOSE = normalizedUnit.listenAndChoose;
  const FINAL_QS = normalizedUnit.quiz;

  useEffect(() => {
    getDueWarmupCards(5).then((res) => {
      if (res.success && res.cards.length > 0) setWarmupCards(res.cards as WarmupCard[]);
    });
    getUnitCompletionStatus(normalizedUnit.unitId).then((res) => {
      if (res.success && res.completed) setIsCompleted(true);
    });
    // guest local from best pre-minimal version
    try {
      const g = JSON.parse(localStorage.getItem("guest_completed_units") || "[]");
      if (Array.isArray(g) && g.includes(normalizedUnit.unitId)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsCompleted(true);
      }
    } catch {}
  }, [normalizedUnit.unitId]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    trackPilotEventOnce("unit_started", normalizedUnit.unitId, {
      source: "lesson",
      unitId: normalizedUnit.unitId,
    });
  }, [normalizedUnit.unitId]);

useLessonProgress({
  unitId: normalizedUnit.unitId,
  section,
  setSection,
});

  // Settings
  const userSettings = (() => {
    if (typeof window === "undefined") return { soundEffects: true, autoPlayAudio: false };
    try {
      const s = localStorage.getItem("ato_settings");
      return s ? (JSON.parse(s) as { soundEffects?: boolean; autoPlayAudio?: boolean }) : {};
    } catch {
      return {};
    }
  })();
  const sfxEnabled = userSettings.soundEffects !== false;
  const autoPlay = userSettings.autoPlayAudio === true;

  const playCorrectSound = () => {
    if (!sfxEnabled) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch { /* ignored */ }
  };

  const playWrongSound = () => {
    if (!sfxEnabled) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch { /* ignored */ }
  };

  const pickEnglishVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    // Prefer high-quality voices: Google UK Female > Microsoft Aria > Google US > any en
    return (
      voices.find((v) => v.lang === "en-GB" && v.name.toLowerCase().includes("female")) ??
      voices.find((v) => v.name.includes("Google UK English Female")) ??
      voices.find((v) => v.name.includes("Microsoft Aria")) ??
      voices.find((v) => v.name.includes("Microsoft Zira")) ??
      voices.find((v) => v.lang === "en-US" && v.name.includes("Google")) ??
      voices.find((v) => v.lang === "en-US" && v.name.toLowerCase().includes("female")) ??
      voices.find((v) => v.lang === "en-US") ??
      voices.find((v) => v.lang.startsWith("en")) ??
      null
    );
  };

  // Standard TTS (sentences, phrases — rate 0.85)
  const playTTS = (text: string, rate = 0.85) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = rate;
    u.pitch = 1.05; // slight lift — clearer for non-native listeners
    const voice = pickEnglishVoice();
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  };

  // Slow TTS for individual vocabulary words (rate 0.7 — matches ELSA model speed)
  const playTTSSlow = (word: string) => playTTS(word, 0.7);

  const goNext = () => {
    window.speechSynthesis?.cancel();
    // S3-2: Micro-session mode — after Practice (4) jump straight to Quiz (8)
    if (miniSession && section === 4) {
      setSection(8);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // Session-break checkpoint — show break card after Practice before Dialogue
    if (section === 4 && !sessionBreak) {
      setSessionBreak(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSessionBreak(false);
    const idx = SECTION_ORDER.indexOf(section as SectionNumber);
    const nextSection = SECTION_ORDER[Math.min(idx + 1, SECTION_ORDER.length - 1)];
    setSection(nextSection);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const PASSIVE_SECTIONS: number[] = [1, 2, 3, 5];
    const handler = (e: KeyboardEvent) => {
      if (!PASSIVE_SECTIONS.includes(section)) return;
      if (e.key !== "ArrowRight" && e.key !== " ") return;
      const tag = (e.target as HTMLElement)?.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "button" || tag === "select") return;
      e.preventDefault();
      goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // Score calculations
  const normalizeAnswer = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:'"]/g, "")
      .replace(/\s+/g, " ")
      .replace(/\bi'm\b/g, "i am")
      .replace(/\byou're\b/g, "you are")
      .replace(/\bhe's\b/g, "he is")
      .replace(/\bshe's\b/g, "she is")
      .replace(/\bit's\b/g, "it is")
      .replace(/\bwe're\b/g, "we are")
      .replace(/\bthey're\b/g, "they are")
      .replace(/\bdon't\b/g, "do not")
      .replace(/\bdoesn't\b/g, "does not")
      .trim();

  const finalQuizScore = FINAL_QS.filter((q) => {
    if (q.type === "cloze" || q.type === "translate") {
      return normalizeAnswer(quizClozeInputs[q.id] ?? "") === normalizeAnswer(q.answer);
    }
    return quizAnswers[q.id] === q.answer;
  }).length;

  const lacScore = LISTEN_CHOOSE.filter((item, i) => lacAnswers[i] === item.answer).length;

  const shadowValues = Object.values(shadowScores);
  const shadowAvg = shadowValues.length > 0
    ? Math.round(shadowValues.reduce((a, b) => a + b, 0) / shadowValues.length)
    : 100;

  const lacPct = LISTEN_CHOOSE.length > 0 ? (lacScore / LISTEN_CHOOSE.length) * 100 : 100;
  const quizPct = FINAL_QS.length > 0 ? (finalQuizScore / FINAL_QS.length) * 100 : 100;
  const overallScore = Math.round(lacPct * 0.3 + shadowAvg * 0.3 + quizPct * 0.4);

  const wrongQuestions = quizSubmitted
    ? FINAL_QS.filter((q) =>
        q.type === "cloze" || q.type === "translate"
          ? normalizeAnswer(quizClozeInputs[q.id] ?? "") !== normalizeAnswer(q.answer)
          : quizAnswers[q.id] !== q.answer
      )
    : [];

  const wrongWordsRef = useRef<string[]>([]);
  useEffect(() => {
    if (!quizSubmitted || wrongQuestions.length === 0) return;
    const words = wrongQuestions
      .map((q) => {
        const match = normalizedUnit.vocab.find(
          (v) =>
            q.question.toLowerCase().includes(v.word.toLowerCase()) ||
            (q.options ?? []).some((o) => o.toLowerCase() === v.word.toLowerCase()) ||
            q.answer.toLowerCase() === v.word.toLowerCase()
        );
        return match?.word ?? null;
      })
      .filter((w): w is string => !!w);
    const newWords = words.filter((w) => !wrongWordsRef.current.includes(w));
    if (!newWords.length) return;
    wrongWordsRef.current = [...wrongWordsRef.current, ...newWords];
    toast.promise(scheduleWrongWordsForReview(newWords), {
      loading: "Đang xếp lịch ôn lại các từ bạn trả lời sai...",
      success: "Đã xếp lịch lặp lại ngắt quãng (FSRS) cho các từ sai!",
      error: "Không thể lưu lịch ôn tập.",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizSubmitted]);

  const retryCorrectCount = retrySubmitted
    ? wrongQuestions.filter((q) =>
        q.type === "cloze"
          ? normalizeAnswer(retryClozeInputs[q.id] ?? "") === normalizeAnswer(q.answer)
          : retryAnswers[q.id] === q.answer
      ).length
    : 0;

  const retryBonusPct =
    wrongQuestions.length > 0 && retrySubmitted
      ? Math.round((retryCorrectCount / wrongQuestions.length) * 10)
      : 0;

  const effectiveScore = Math.min(100, overallScore + retryBonusPct);
  const effectiveStarCount: 1 | 2 | 3 = effectiveScore >= 85 ? 3 : effectiveScore >= 60 ? 2 : 1;


  const handleCompleteUnit = async () => {
    setIsSubmitting(true);
    const res = await completeUnit(normalizedUnit.unitId, effectiveStarCount);
    if (res.success) {
      setIsCompleted(true);
      toast.success("Đã hoàn thành bài học.");

      // ── Rich completion overlay data ──
      setCompletionData({
        starCount: effectiveStarCount,
        effectiveScore,
        vocabPreview: normalizedUnit.vocab.slice(0, 5).map(v => ({ word: v.word, meaning: v.meaning })),
        nextRoute,
      });
      trackPilotEventPersistentlyOnce("unit_completed", normalizedUnit.unitId, {
        source: "lesson",
        unitId: normalizedUnit.unitId,
        score: effectiveScore,
        starCount: effectiveStarCount,
        passed: true,
      });

      if (res.leveledUp && res.newLevel) {
        localStorage.setItem(
          "pending-level-up",
          JSON.stringify({
            prev: null,
            next: res.newLevel,
          })
        );
      }
      const unitLevel = (normalizedUnit.level?.match(/A[012]|B[12]|C1/) ?? ["A1"])[0] as
        | "A0"
        | "A1"
        | "A2"
        | "B1"
        | "B2"
        | "C1";
      void seedUnitVocabToSRS({
        vocab: normalizedUnit.vocab.map((v) => ({
          word: v.word,
          phonetic: v.phonetic || null,
          meaning_vn: v.meaning,
          example_en: v.example || null,
        })),
        topic: normalizedUnit.unitId,
        level: unitLevel,
      });
      if (normalizedUnit.grammar) {
        void seedUnitVocabToSRS({
          vocab: [
            {
              word: normalizedUnit.grammar.title.slice(0, 100),
              phonetic: null,
              meaning_vn: normalizedUnit.grammar.rule.slice(0, 300),
              example_en: normalizedUnit.grammar.examples[0]?.en?.slice(0, 500) ?? null,
            },
          ],
          topic: "Grammar",
          level: unitLevel,
        });
      }
    } else if (res.error && res.error.includes("đăng nhập")) {
      // guest fallback from rolled best version
      setIsCompleted(true);
      try {
        const k = "guest_completed_units";
        const a = JSON.parse(localStorage.getItem(k) || "[]");
        localStorage.setItem(k, JSON.stringify(Array.isArray(a) ? [...new Set([...a, normalizedUnit.unitId])] : [normalizedUnit.unitId]));
      } catch {}
      toast.success("🎉 Hoàn thành! (guest mode - local only)");
      setCompletionData({ starCount: effectiveStarCount, effectiveScore, vocabPreview: normalizedUnit.vocab.slice(0,5).map(v=>({word:v.word,meaning:v.meaning})), nextRoute });
      trackPilotEventPersistentlyOnce("unit_completed", normalizedUnit.unitId, {
        source: "lesson",
        unitId: normalizedUnit.unitId,
        score: effectiveScore,
        starCount: effectiveStarCount,
        passed: true,
      });
    } else {
      toast.error(res.error || "Có lỗi xảy ra");
    }
    setIsSubmitting(false);
  };

  const sectionOrderIdx = SECTION_ORDER.indexOf(section as SectionNumber);
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950/20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <Link
                href="/dashboard"
                aria-label="Về Dashboard"
                className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={16} />
              </Link>
              <div className="min-w-0">
                <p className="text-xs text-zinc-500">{normalizedUnit.level}</p>
                <p className="text-sm font-semibold text-white truncate max-w-[130px] sm:max-w-xs">
                  {normalizedUnit.title}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0 flex items-center gap-2">
              {/* S3-2: Mini-session toggle / active indicator */}
              {miniSession ? (
                <div className="flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300">
                  ⚡ <span>5 phút</span>
                </div>
              ) : section < 8 && (
                <button
                  onClick={() => {
                    setMiniSession(true);
                    setSection(4);
                    try {
                      localStorage.setItem(
                        `lesson-progress-${normalizedUnit.unitId}`,
                        JSON.stringify({ section: 4 })
                      );
                    } catch { /* ignore */ }
                  }}
                  className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all whitespace-nowrap active:scale-95"
                  title="Bỏ qua các phần đầu, chỉ làm luyện tập + quiz ~5 phút"
                >
                  ⚡ <span>Ôn nhanh</span>
                  <span className="text-amber-500/60 text-[9px] font-bold">~5p</span>
                </button>
              )}
              <div>
                <p className="text-xs text-zinc-500">{SECTION_LABELS[section] ?? "Học"}</p>
                <p className="text-sm font-bold text-emerald-400">
                  {sectionOrderIdx + 1}/{TOTAL_SECTIONS}
                </p>
              </div>
            </div>
          </div>

          <LessonProgress sectionOrderIdx={sectionOrderIdx} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto px-4 py-4 sm:py-8 pb-24">
        <AnimatePresence mode="wait">

          {sessionBreak && <SessionBreakCard onContinue={goNext} />}

          {section === 1 && !sessionBreak && (
            <WarmupSection
              unit={normalizedUnit}
              sectionOrderIdx={sectionOrderIdx}
              TOTAL_SECTIONS={TOTAL_SECTIONS}
              playTTS={playTTS}
              warmupRated={warmupRated}
              setWarmupRated={setWarmupRated}
              warmupCards={warmupCards}
              warmupFlipped={warmupFlipped}
              setWarmupFlipped={setWarmupFlipped}
              warmupDone={warmupDone}
              setWarmupDone={setWarmupDone}
              goNext={goNext}
            />
          )}

          {section === 2 && !sessionBreak && (
            <VocabSection
              unit={normalizedUnit}
              sectionOrderIdx={sectionOrderIdx}
              TOTAL_SECTIONS={TOTAL_SECTIONS}
              playTTS={playTTSSlow}
              seenCards={seenCards}
              setSeenCards={setSeenCards}
              flippedCards={flippedCards}
              setFlippedCards={setFlippedCards}
              autoPlay={autoPlay}
              goNext={goNext}
            />
          )}

          {section === 3 && !sessionBreak && (
            <GrammarSection
              unit={normalizedUnit}
              sectionOrderIdx={sectionOrderIdx}
              TOTAL_SECTIONS={TOTAL_SECTIONS}
              playTTS={playTTS}
              ccqAnswer={ccqAnswer}
              setCcqAnswer={setCcqAnswer}
              ccqSubmitted={ccqSubmitted}
              setCcqSubmitted={setCcqSubmitted}
              playCorrectSound={playCorrectSound}
              playWrongSound={playWrongSound}
              goNext={goNext}
            />
          )}

          {section === 4 && !sessionBreak && (
            <PracticeSection
              unit={normalizedUnit}
              sectionOrderIdx={sectionOrderIdx}
              TOTAL_SECTIONS={TOTAL_SECTIONS}
              playCorrectSound={playCorrectSound}
              playWrongSound={playWrongSound}
              goNext={goNext}
            />
          )}

          {section === 5 && !sessionBreak && (
            <DialogueSection
              unit={normalizedUnit}
              sectionOrderIdx={sectionOrderIdx}
              TOTAL_SECTIONS={TOTAL_SECTIONS}
              lacAnswers={lacAnswers}
              setLacAnswers={setLacAnswers}
              lacSubmitted={lacSubmitted}
              setLacSubmitted={setLacSubmitted}
              playTTS={playTTS}
              goNext={goNext}
            />
          )}

          {section === 10 && !sessionBreak && (
            <FluencySection
              unit={normalizedUnit}
              sectionOrderIdx={sectionOrderIdx}
              TOTAL_SECTIONS={TOTAL_SECTIONS}
              goNext={goNext}
            />
          )}

          {section === 9 && !sessionBreak && (
            <TranslateSection
              unit={normalizedUnit}
              sectionOrderIdx={sectionOrderIdx}
              TOTAL_SECTIONS={TOTAL_SECTIONS}
              goNext={goNext}
            />
          )}

          {section === 6 && !sessionBreak && (
            <>
              {normalizedUnit.shadowingVideoId && (
                <VideoShadowingCard videoId={normalizedUnit.shadowingVideoId} />
              )}
              <ShadowingSection
                unit={normalizedUnit}
                sectionOrderIdx={sectionOrderIdx}
                TOTAL_SECTIONS={TOTAL_SECTIONS}
                shadowScores={shadowScores}
                setShadowScores={setShadowScores}
                shadowDone={shadowDone}
                setShadowDone={setShadowDone}
                playTTS={playTTS}
                goNext={goNext}
              />
            </>
          )}

          {section === 7 && !sessionBreak && (
            <SpeakingSection
              unit={normalizedUnit}
              sectionOrderIdx={sectionOrderIdx}
              TOTAL_SECTIONS={TOTAL_SECTIONS}
              playTTS={playTTS}
              goNext={goNext}
            />
          )}

          {section === 8 && !sessionBreak && (
            <QuizSection
              unit={normalizedUnit}
              sectionOrderIdx={sectionOrderIdx}
              TOTAL_SECTIONS={TOTAL_SECTIONS}
              seenCards={seenCards}
              VOCAB_LIMIT={VOCAB_LIMIT}
              shadowAvg={shadowAvg}
              shadowDone={shadowDone}
              lacScore={lacScore}
              LISTEN_CHOOSE_LENGTH={LISTEN_CHOOSE.length}
              isCompleted={isCompleted}
              isSubmitting={isSubmitting}
              handleCompleteUnit={handleCompleteUnit}
              playCorrectSound={playCorrectSound}
              playWrongSound={playWrongSound}
              cumulativeAnswers={cumulativeAnswers}
              setCumulativeAnswers={setCumulativeAnswers}
              cumulativeClozeInputs={cumulativeClozeInputs}
              setCumulativeClozeInputs={setCumulativeClozeInputs}
              cumulativeSubmitted={cumulativeSubmitted}
              setCumulativeSubmitted={setCumulativeSubmitted}
              quizAnswers={quizAnswers}
              setQuizAnswers={setQuizAnswers}
              quizClozeInputs={quizClozeInputs}
              setQuizClozeInputs={setQuizClozeInputs}
              quizSubmitted={quizSubmitted}
              setQuizSubmitted={setQuizSubmitted}
              retryAnswers={retryAnswers}
              setRetryAnswers={setRetryAnswers}
              retryClozeInputs={retryClozeInputs}
              setRetryClozeInputs={setRetryClozeInputs}
              retrySubmitted={retrySubmitted}
              setRetrySubmitted={setRetrySubmitted}
              finalQuizScore={finalQuizScore}
              wrongQuestions={wrongQuestions}
              retryCorrectCount={retryCorrectCount}
              retryBonusPct={retryBonusPct}
              effectiveScore={effectiveScore}
              effectiveStarCount={effectiveStarCount}
              nextRoute={nextRoute}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Animated Lesson Completion Overlay ── */}
      <AnimatePresence>
        {completionData && (
          <motion.div
            key="completion-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 32 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
              className="w-full max-w-md bg-gradient-to-b from-zinc-900 to-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Top gradient bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

              <div className="p-6 sm:p-8 space-y-6">
                {/* Badge + Stars */}
                <div className="text-center space-y-3">
                  <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.25 }}
                    className="text-6xl sm:text-7xl"
                  >
                    {normalizedUnit.badgeEmoji}
                  </motion.div>

                  <div className="flex justify-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8, scale: 0.5 }}
                        animate={{
                          opacity: i < completionData.starCount ? 1 : 0.25,
                          y: 0,
                          scale: 1,
                        }}
                        transition={{ delay: 0.35 + i * 0.12, type: "spring", stiffness: 400 }}
                      >
                        <Star
                          size={26}
                          className={i < completionData.starCount ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.8)]" : "text-zinc-700 fill-zinc-700"}
                        />
                      </motion.div>
                    ))}
                  </div>

                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-white font-black text-xl tracking-tight"
                  >
                    {completionData.starCount === 3
                      ? "Xuất sắc! 🏆"
                      : completionData.starCount === 2
                      ? "Khá tốt! 🎯"
                      : "Hoàn thành! 💪"}
                  </motion.p>
                  <p className="text-zinc-400 text-sm">{normalizedUnit.title}</p>
                </div>

                {/* Vocab recap */}
                {completionData.vocabPreview.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white/5 border border-white/8 rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen size={14} className="text-teal-400" />
                      <p className="text-xs font-bold text-teal-400 uppercase tracking-widest">
                        Từ vựng hôm nay
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      {completionData.vocabPreview.map((v, i) => (
                        <motion.div
                          key={v.word}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.72 + i * 0.07 }}
                          className="flex items-center justify-between gap-3"
                        >
                          <span className="text-sm font-semibold text-white truncate">{v.word}</span>
                          <span className="text-xs text-zinc-400 truncate max-w-[55%] text-right">{v.meaning}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.82 }}
                  className="flex flex-col gap-3"
                >
                  <Link
                    href={completionData.nextRoute}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black rounded-2xl py-4 text-base transition-all duration-200 shadow-lg shadow-emerald-900/50 active:scale-95"
                  >
                    Bài tiếp theo <ChevronRight size={18} />
                  </Link>
                  <div className="flex gap-3">
                    <Link
                      href="/flashcards"
                      className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-bold rounded-2xl py-3 text-sm transition-colors"
                    >
                      <BookOpen size={14} /> Ôn flashcard
                    </Link>
                    <button
                      onClick={() => setCompletionData(null)}
                      className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 font-bold rounded-2xl py-3 text-sm transition-colors"
                    >
                      Xem lại bài
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
