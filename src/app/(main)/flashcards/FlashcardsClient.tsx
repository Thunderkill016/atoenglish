"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import {
  Volume2,
  Layers,
  ArrowLeftRight,
  RotateCcw,
  HelpCircle,
  Folder,
  Award,
  Loader2,
  CheckCircle,
  Zap,
  Filter,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getDueCards, reviewCard, getAllCards, getCardTopics } from "@/app/actions/cards";
import { recordFlashcardSession, type FlashcardStats } from "@/app/actions/flashcard-stats";
import { toast } from "sonner";
import { SecondaryPageShell, PrimaryRow } from "@/components/design-system";

interface Flashcard {
  id: string;
  word: string;
  phonetic: string;
  pos: string;
  meaning_vn: string;
  example_en: string;
  example_vn: string;
  topic: string;
  level: string;
  stability?: number;
  difficulty?: number;
  state?: number;
}

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFinished, setShowFinished] = useState(false);
  const [responseLog, setResponseLog] = useState<{ word: string; score: string }[]>([]);
  const [sessionStats, setSessionStats] = useState<FlashcardStats | null>(null);
  const router = useRouter();
  const [cramMode, setCramMode] = useState(false);
  const [reverseMode, setReverseMode] = useState(false);
  const [difficultMode, setDifficultMode] = useState(false);
  // Track "Again" count per word to detect leeches (≥3 Agains in session)
  const [againCounts, setAgainCounts] = useState<Record<string, number>>({});
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  // Drag state using Framer Motion
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacityLeft = useTransform(x, [-150, 0], [1, 0]);
  const opacityRight = useTransform(x, [0, 150], [0, 1]);

  // Fetch topics on mount
  useEffect(() => {
    getCardTopics().then(res => {
      if (res.success) setTopics(res.topics);
    });
  }, []);

  // Fetch thẻ đến hạn từ Supabase
  const fetchCards = async (cram = cramMode, topic = selectedTopic, difficult = difficultMode) => {
    setIsLoading(true);
    try {
      let maxNewCards: number | undefined;
      try {
        const stored = localStorage.getItem("ato_settings");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (typeof parsed.fsrsMaxNewCards === "number") {
            maxNewCards = parsed.fsrsMaxNewCards;
          }
        }
      } catch {
        // ignore
      }

      const res = (cram || difficult)
        ? await getAllCards(topic !== "all" ? topic : undefined)
        : await getDueCards(maxNewCards);
      if (res.success && res.cards) {
        let mappedCards: Flashcard[] = res.cards.map((c) => ({
          id: c.id,
          word: c.word,
          phonetic: c.phonetic || "",
          pos: c.topic || "Vocabulary",
          meaning_vn: c.meaning_vn,
          example_en: c.example_en || "",
          example_vn: "",
          topic: c.topic || "General",
          level: c.level || "B1",
          stability: c.stability,
          difficulty: c.difficulty,
          state: c.state,
        }));
        // Difficult mode: filter cards with FSRS stability < 2 days
        if (difficult) {
          mappedCards = mappedCards.filter(c => (c.stability ?? 999) < 2);
        }
        setCards(mappedCards);
      } else {
        toast.error(res.error || "Không thể tải thẻ ôn tập.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`Có lỗi xảy ra khi tải thẻ: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAudioPlay = (e: React.MouseEvent | null, text: string) => {
    if (e) e.stopPropagation(); // Ngăn lật thẻ khi click nút âm thanh
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleResponse = async (scoreLabel: "Again" | "Hard" | "Good" | "Easy") => {
    if (isReviewing) return;
    
    const currentCard = cards[currentIndex];
    setIsReviewing(true);
    
    try {
      let retentionRate: number | undefined;
      try {
        const stored = localStorage.getItem("ato_settings");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (typeof parsed.fsrsRetention === "number") {
            retentionRate = parsed.fsrsRetention;
          }
        }
      } catch {
        // ignore
      }

      const res = await reviewCard(currentCard.id, scoreLabel, retentionRate);
      if (res.success) {
        setResponseLog((prev) => [...prev, { word: currentCard.word, score: scoreLabel }]);
        if (scoreLabel === "Again") {
          setAgainCounts(prev => ({ ...prev, [currentCard.word]: (prev[currentCard.word] ?? 0) + 1 }));
        }
        toast.success(res.message);
        
        if (currentIndex < cards.length - 1) {
          setIsFlipped(false);
          x.set(0); // Reset vị trí kéo
          setCurrentIndex((prev) => prev + 1);
        } else {
          setShowFinished(true);
          // Record session stats
          const finalLog = [...responseLog, { word: currentCard.word, score: scoreLabel }];
          recordFlashcardSession(finalLog.length).then(res => {
            if (res.success && res.stats) setSessionStats(res.stats);
          });
        }
      } else {
        toast.error(res.error || "Không thể ghi nhận kết quả đánh giá.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`Lỗi hệ thống khi đánh giá: ${errorMessage}`);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 140;
    if (info.offset.x > swipeThreshold) {
      handleResponse("Easy");
    } else if (info.offset.x < -swipeThreshold) {
      handleResponse("Again");
    }
  };

  const resetReview = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowFinished(false);
    setResponseLog([]);
    setAgainCounts({});
    x.set(0);
    fetchCards();
  };

  const handleToggleCram = () => {
    const next = !cramMode;
    setCramMode(next);
    if (next) setDifficultMode(false); // mutually exclusive
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowFinished(false);
    setResponseLog([]);
    x.set(0);
    fetchCards(next, selectedTopic, false);
  };

  const handleToggleDifficult = () => {
    const next = !difficultMode;
    setDifficultMode(next);
    if (next) setCramMode(false); // mutually exclusive
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowFinished(false);
    setResponseLog([]);
    x.set(0);
    fetchCards(false, selectedTopic, next);
  };

  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowFinished(false);
    setResponseLog([]);
    x.set(0);
    fetchCards(cramMode, topic);
  };

  // Lắng nghe phím tắt bàn phím
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showFinished || cards.length === 0 || isReviewing) return;
      
      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === "1") handleResponse("Again");
        if (e.key === "2") handleResponse("Hard");
        if (e.key === "3") handleResponse("Good");
        if (e.key === "4") handleResponse("Easy");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isFlipped, showFinished, cards, isReviewing]);

  // Loading state UI
  if (isLoading) {
    return (
      <SecondaryPageShell title="Ôn tập" subtitle="Đang tải thẻ SRS...">
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <Loader2 className="size-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-semibold">Đang tải thẻ đến hạn...</p>
        </div>
      </SecondaryPageShell>
    );
  }

  // Empty state UI (No due cards)
  if (!isLoading && cards.length === 0) {
    return (
      <SecondaryPageShell title="Ôn tập" subtitle="Hôm nay bạn đã ôn xong!">
        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle className="size-7" />
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Không có thẻ đến hạn. Tiếp tục học hoặc ôn thêm.
          </p>
        </div>
        <div className="space-y-2">
          <PrimaryRow href="/learn" label="Học bài mới" description="Tiếp tục lộ trình" icon={Layers} />
          <PrimaryRow href="/quiz" label="Quiz từ vựng" description="Trắc nghiệm nhanh" icon={HelpCircle} />
          <PrimaryRow href="/flashcards/hard" label="Từ khó nhất" description="Ôn các thẻ leech" icon={AlertTriangle} />
        </div>
      </SecondaryPageShell>
    );
  }

  const currentCard = cards[currentIndex];
  const progressPercentage = cards.length > 0 ? ((currentIndex + (isFlipped ? 0.5 : 0)) / cards.length) * 100 : 0;

  const dueCount = cards.length - currentIndex;

  return (
    <SecondaryPageShell
      title="Ôn tập"
      subtitle={`${dueCount} thẻ còn lại · SRS`}
    >
      <div className="space-y-5 sm:space-y-6 pb-16">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3 border-b border-foreground/[0.05] pb-4"
      >
        <div className="flex items-center justify-end">
          <div className="flex flex-col items-end gap-2">
            {/* Cram Mode Toggle */}
            <button
              onClick={handleToggleCram}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                cramMode
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                  : "bg-muted border-border/40 text-muted-foreground hover:border-amber-500/30"
              }`}
            >
              <Zap className="size-3.5" />
              {cramMode ? "Cram Mode: ON" : "Cram Mode"}
            </button>
            {/* Difficult Words Toggle */}
            <button
              onClick={handleToggleDifficult}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                difficultMode
                  ? "bg-red-500/10 border-red-500/30 text-red-500"
                  : "bg-muted border-border/40 text-muted-foreground hover:border-red-500/30"
              }`}
            >
              <Filter className="size-3.5" />
              {difficultMode ? "⚠️ Từ Khó: ON" : "Từ Khó"}
            </button>
            {/* Reverse Mode Toggle */}
            <button
              onClick={() => { setReverseMode(p => !p); setIsFlipped(false); }}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                reverseMode
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400"
                  : "bg-muted border-border/40 text-muted-foreground hover:border-purple-500/30"
              }`}
            >
              <ArrowLeftRight className="size-3.5" />
              {reverseMode ? "VN→EN" : "EN→VN"}
            </button>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-extrabold">Đang ôn tập</div>
              <div className="text-sm font-black text-foreground font-mono mt-0.5">
                {currentIndex + 1} / {cards.length} thẻ
              </div>
            </div>
          </div>
          {/* Hard Words link */}
          <Link
            href="/flashcards/hard"
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all duration-200 bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400 hover:border-red-500/40"
          >
            <AlertTriangle className="size-3.5" />
            Từ Khó
          </Link>
        </div>

        {/* Topic Filter — chỉ hiện khi Cram Mode */}
        {cramMode && topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTopicChange("all")}
              className={`flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                selectedTopic === "all"
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-muted border-border/40 text-muted-foreground hover:border-primary/20"
              }`}
            >
              <Filter className="size-3" /> Tất cả
            </button>
            {topics.map(t => (
              <button
                key={t}
                onClick={() => handleTopicChange(t)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  selectedTopic === t
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-muted border-border/40 text-muted-foreground hover:border-primary/20"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Main Arena */}
      {!showFinished ? (
        <div className="space-y-8">
          {/* Progress bar */}
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden relative">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Swipe Hint overlay */}
          <div className="text-center text-xs text-muted-foreground/80 font-medium">
            💡 <span className="font-bold">Mẹo:</span> Kéo thẻ sang <span className="text-emerald-500 font-bold">Phải (Đã thuộc)</span> hoặc sang <span className="text-red-500 font-bold">Trái (Quên)</span>. Nhấn <span className="bg-muted px-1.5 py-0.5 rounded font-mono border border-foreground/10 text-[11px]">Space</span> để lật.
          </div>

          {/* 3D Swipe Flashcard Arena */}
          <div className="flex justify-center items-center py-4 relative overflow-visible">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={currentIndex}
                style={{ x, rotate }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                whileDrag={{ scale: 1.02, cursor: "grabbing" }}
                className="w-full max-w-md h-72 sm:h-96 perspective-1000 cursor-grab relative z-10"
              >
                {/* Visual Feedback Overlays */}
                <motion.div 
                  style={{ opacity: opacityRight }} 
                  className="absolute inset-0 bg-emerald-500/10 border-2 border-emerald-500 rounded-3xl z-20 pointer-events-none flex items-center justify-center"
                >
                  <span className="bg-emerald-500 text-white font-black px-6 py-3 rounded-2xl shadow-lg uppercase text-sm tracking-wider">Đã Thuộc</span>
                </motion.div>
                <motion.div 
                  style={{ opacity: opacityLeft }} 
                  className="absolute inset-0 bg-red-500/10 border-2 border-red-500 rounded-3xl z-20 pointer-events-none flex items-center justify-center"
                >
                  <span className="bg-red-500 text-white font-black px-6 py-3 rounded-2xl shadow-lg uppercase text-sm tracking-wider">Quên Từ</span>
                </motion.div>

                {/* 3D Flip Card Shell */}
                <motion.div
                  onClick={() => setIsFlipped((prev) => !prev)}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  className="w-full h-full preserve-3d relative"
                >
                  {/* CARD FRONT */}
                  <div className="absolute w-full h-full backface-hidden rounded-3xl border border-border/60 bg-card p-5 sm:p-8 flex flex-col justify-between shadow-[0_15px_40px_rgba(0,0,0,0.025)]">
                    <div className="flex justify-between items-start">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-foreground/[0.04] text-muted-foreground border border-foreground/[0.05]">
                        <Folder className="size-3.5" />
                        {currentCard.topic}
                      </span>
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-primary/25 text-primary border border-primary/25">
                        {currentCard.level}
                      </span>
                    </div>

                    <div className="text-center space-y-4">
                      {reverseMode ? (
                        <>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-purple-500 mb-2">Tiếng Việt → Tiếng Anh</p>
                          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight select-all">
                            {currentCard.meaning_vn}
                          </h2>
                          <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg bg-foreground/[0.04] text-muted-foreground font-mono">
                            {currentCard.pos}
                          </span>
                        </>
                      ) : (
                        <>
                          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text select-all leading-tight">
                            {currentCard.word}
                          </h2>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-sm font-mono text-muted-foreground">{currentCard.phonetic}</span>
                            <Button
                              onClick={(e) => handleAudioPlay(e, currentCard.word)}
                              variant="ghost"
                              size="icon"
                              className="size-9 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200 text-muted-foreground"
                              aria-label="Phát âm tiếng Anh"
                            >
                              <Volume2 className="size-5" />
                            </Button>
                          </div>
                          <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg bg-foreground/[0.04] text-muted-foreground font-mono">
                            {currentCard.pos}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="text-center text-[11px] text-muted-foreground/60 flex items-center justify-center gap-1.5 font-normal">
                      <HelpCircle className="size-4 text-primary animate-pulse" />
                      <span>Nhấp chuột để lật / Nhấn Space</span>
                    </div>
                  </div>

                  {/* CARD BACK */}
                  <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-3xl border border-border/60 bg-card p-8 flex flex-col justify-between shadow-[0_15px_40px_rgba(0,0,0,0.025)]">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {reverseMode ? "Từ Tiếng Anh" : "Nghĩa Tiếng Việt"}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground font-mono uppercase tracking-widest">Mặt sau</span>
                    </div>

                    <div className="space-y-5">
                      <div className="text-center">
                        {reverseMode ? (
                          <>
                            <p className="text-3xl sm:text-4xl font-black text-foreground leading-tight">{currentCard.word}</p>
                            <div className="flex items-center justify-center gap-2 mt-2">
                              <span className="text-sm font-mono text-muted-foreground">{currentCard.phonetic}</span>
                              <Button onClick={(e) => handleAudioPlay(e, currentCard.word)} variant="ghost" size="icon" className="size-7 rounded-full hover:bg-primary/10 text-primary transition-all duration-200">
                                <Volume2 className="size-4" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <p className="text-xl sm:text-2xl font-black text-foreground leading-tight">
                            {currentCard.meaning_vn}
                          </p>
                        )}
                      </div>

                      {currentCard.example_en && (
                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-2 text-left shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-bold text-primary tracking-widest">Ví dụ thực tế</span>
                            <Button
                              onClick={(e) => handleAudioPlay(e, currentCard.example_en)}
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-full hover:bg-primary/10 text-primary transition-all duration-200"
                            >
                              <Volume2 className="size-4" />
                            </Button>
                          </div>
                          <p className="text-sm font-semibold text-foreground/90 italic leading-relaxed">
                            &quot;{currentCard.example_en}&quot;
                          </p>
                        </div>
                      )}
                    </div>
 
                    <div className="text-center text-[11px] text-muted-foreground/60 flex items-center justify-center gap-1.5 font-normal pt-4">
                      <HelpCircle className="size-4 text-primary animate-pulse" />
                      <span>Nhấp chuột để lật lại mặt trước</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* SRS Response Controls */}
          <div className="flex flex-col items-center gap-4">
            <AnimatePresence mode="wait">
              {!isFlipped ? (
                <motion.div
                  key="flip-btn"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full max-w-xs flex flex-col items-center gap-2.5"
                >
                  <Button
                    onClick={() => setIsFlipped(true)}
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-300 active:scale-[0.98] text-xs sm:text-sm"
                  >
                    Lật mặt sau (Xem đáp án)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (currentIndex < cards.length - 1) {
                        setCurrentIndex((prev) => prev + 1);
                      } else {
                        setShowFinished(true);
                      }
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground hover:bg-transparent rounded-xl h-11 px-4"
                  >
                    Để sau / Bỏ qua thẻ này
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="srs-btns"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="w-full max-w-xl space-y-4"
                >
                  <p className="text-[10px] font-bold text-center uppercase tracking-widest text-muted-foreground">
                    Đánh giá mức độ nhớ (Phím tắt: 1 - 2 - 3 - 4):
                  </p>
                  <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                    {[
                      { label: "Again", code: "again", key: "1", desc: "Quên từ", color: "hover:bg-red-500 hover:text-white hover:shadow-red-500/25 text-red-600 bg-red-500/5 dark:bg-red-500/10 border-red-500/20 hover:border-red-500" },
                      { label: "Hard", code: "hard", key: "2", desc: "Mơ hồ", color: "hover:bg-orange-500 hover:text-white hover:shadow-orange-500/25 text-orange-600 bg-orange-500/5 dark:bg-orange-500/10 border-orange-500/20 hover:border-orange-500" },
                      { label: "Good", code: "good", key: "3", desc: "Nhớ tốt", color: "hover:bg-blue-500 hover:text-white hover:shadow-blue-500/25 text-blue-600 bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/20 hover:border-blue-500" },
                      { label: "Easy", code: "easy", key: "4", desc: "Rất dễ", color: "hover:bg-emerald-500 hover:text-white hover:shadow-emerald-500/25 text-emerald-600 bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500" },
                    ].map((btn) => (
                      <button
                        key={btn.code}
                        disabled={isReviewing}
                        onClick={() => handleResponse(btn.label as "Again" | "Hard" | "Good" | "Easy")}
                        className={`flex flex-col items-center justify-center h-16 sm:h-20 rounded-2xl border text-xs sm:text-sm font-black transition-all duration-300 shadow-sm active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed ${btn.color}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{btn.label}</span>
                          <span className="hidden sm:inline-block text-[9px] bg-foreground/5 px-1.5 py-0.2 rounded border border-foreground/10 font-mono font-normal">{btn.key}</span>
                        </div>
                        <span className="text-[10px] opacity-85 font-medium mt-1">{btn.desc}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        /* Finished Arena */
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-border/60 bg-card p-5 sm:p-8 text-center max-w-md mx-auto space-y-6 shadow-[0_15px_40px_rgba(0,0,0,0.015)]"
        >
          <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Award className="size-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-foreground">Học xong mục tiêu ngày!</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
              Bạn đã ôn tập xong tất cả {cards.length} từ vựng trong lịch hôm nay. Thuật toán Spaced Repetition đã lập trình lại thời điểm ôn tiếp theo.
            </p>
          </div>

          {/* Session Stats */}
          {sessionStats && (
            <div className="grid grid-cols-3 gap-3 w-full">
              <div className="flex flex-col items-center p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
                <span className="text-xl sm:text-2xl font-black text-emerald-500">{sessionStats.cards_reviewed_today}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Hôm nay</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-2xl bg-orange-500/5 border border-orange-500/15">
                <span className="text-xl sm:text-2xl font-black text-orange-500">🔥 {sessionStats.streak_days}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Streak</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-2xl bg-blue-500/5 border border-blue-500/15">
                <span className="text-xl sm:text-2xl font-black text-blue-500">{sessionStats.total_cards_reviewed}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Tổng cộng</span>
              </div>
            </div>
          )}

          {/* Log summaries */}
          <div className="p-5 rounded-2xl bg-foreground/[0.02] border border-foreground/[0.04] text-left space-y-3 text-xs sm:text-sm shadow-inner">
            <span className="font-extrabold text-xs text-muted-foreground uppercase tracking-widest">Bảng tự đánh giá của bạn:</span>
            <div className="divide-y divide-foreground/[0.04]">
              {responseLog.map((log, idx) => (
                <div key={idx} className="flex justify-between py-2.5 first:pt-0 last:pb-0 font-semibold">
                  <span className="text-foreground flex items-center gap-1.5">
                    {log.word}
                    {(againCounts[log.word] ?? 0) >= 3 && (
                      <span className="text-[9px] font-black bg-red-500/15 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded-md">⚠️ Từ khó</span>
                    )}
                  </span>
                  <span className={`font-black ${
                    log.score === "Easy" ? "text-emerald-500" : log.score === "Good" ? "text-blue-500" : log.score === "Hard" ? "text-orange-500" : "text-red-500"
                  }`}>{log.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Leech summary — words rated Again ≥ 3 times */}
          {Object.entries(againCounts).filter(([, count]) => count >= 3).length > 0 && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 space-y-2 text-left">
              <p className="text-xs font-black text-red-500 uppercase tracking-widest">⚠️ Từ cần chú ý đặc biệt</p>
              <p className="text-[11px] text-muted-foreground">Bạn đã bấm &ldquo;Again&rdquo; 3+ lần cho những từ sau. Hãy dành thêm thời gian luyện tập chúng:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(againCounts).filter(([, count]) => count >= 3).map(([word, count]) => (
                  <span key={word} className="text-xs font-bold px-2.5 py-1 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                    {word} <span className="opacity-60">({count}×)</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 w-full">
            <Button
              onClick={resetReview}
              variant="outline"
              className="w-full sm:w-auto rounded-xl text-xs sm:text-sm font-semibold border-border/60 h-12 sm:h-11 px-5 hover:bg-muted active:scale-[0.98] flex items-center justify-center"
            >
              <RotateCcw className="size-4 mr-1.5" />
              Ôn tập lại
            </Button>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl text-xs sm:text-sm font-semibold h-12 sm:h-11 px-5 shadow-lg shadow-emerald-600/15 active:scale-[0.98]"
            >
              Quay về Dashboard
            </Button>
          </div>
        </motion.div>
      )}
      </div>
    </SecondaryPageShell>
  );
}