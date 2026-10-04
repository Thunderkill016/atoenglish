"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Volume2,
  AlertTriangle,
  Flame,
  RefreshCw,
  Layers,
  TrendingUp,
  BookOpen,
  Trophy,
} from "lucide-react";
import { getHardWords } from "@/app/actions/cards";
import { SecondaryPageShell, StatLine } from "@/components/design-system";

type HardWord = {
  id: string;
  word: string;
  phonetic: string | null;
  meaning_vn: string;
  level: string;
  example_en: string | null;
  again_count: number;
  total_reviews: number;
  mastery_pct: number;
};

const LEVEL_COLORS: Record<string, string> = {
  A0: "text-zinc-500 bg-zinc-500/10 border-zinc-500/25",
  A1: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  A2: "text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/25",
  B1: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/25",
  B2: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/25",
  C1: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25",
};

function getMasteryColor(pct: number) {
  if (pct >= 75)
    return {
      bar: "bg-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
    };
  if (pct >= 50)
    return { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" };
  return { bar: "bg-red-500", text: "text-red-600 dark:text-red-400" };
}

function speak(text: string) {
  if (typeof window === "undefined") return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "en-US";
  utt.rate = 0.85;
  window.speechSynthesis.speak(utt);
}

// ─── Word card ───────────────────────────────────────────────────────────────
function WordCard({ word, index }: { word: HardWord; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const levelColor = LEVEL_COLORS[word.level] ?? LEVEL_COLORS.A1;
  const mastery = getMasteryColor(word.mastery_pct);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="bg-white/70 dark:bg-white/4 border border-zinc-200/60 dark:border-white/8 rounded-2xl overflow-hidden hover:border-zinc-300 dark:hover:border-white/15 transition-colors"
    >
      {/* Main row */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full text-left p-4 flex items-center gap-3"
        aria-expanded={expanded}
      >
        {/* Rank badge */}
        <div className="shrink-0 w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-400 dark:text-zinc-500">
          {index + 1}
        </div>

        {/* Word + phonetic */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-base text-zinc-900 dark:text-white tracking-tight">
              {word.word}
            </span>
            {word.phonetic && (
              <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                {word.phonetic}
              </span>
            )}
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded border ${levelColor}`}
            >
              {word.level}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
            {word.meaning_vn}
          </p>
        </div>

        {/* Mastery + Again count */}
        <div className="shrink-0 text-right space-y-1.5">
          <div className={`text-sm font-black ${mastery.text}`}>
            {word.mastery_pct}%
          </div>
          <div className="flex items-center gap-1 justify-end">
            <Flame className="w-3 h-3 text-red-400" />
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-bold">
              {word.again_count}× Again
            </span>
          </div>
        </div>
      </button>

      {/* Mastery bar */}
      <div className="px-4 pb-3">
        <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800/70 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${mastery.bar}`}
            initial={{ width: 0 }}
            animate={{ width: `${word.mastery_pct}%` }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: index * 0.04 + 0.1,
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-zinc-400 dark:text-zinc-600">
            {word.total_reviews} lượt ôn
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-600">
            {word.mastery_pct}% lượt không quên
          </span>
        </div>
      </div>

      {/* Expanded — example + TTS */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-zinc-100 dark:border-white/6 space-y-3">
              {/* TTS buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => speak(word.word)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Nghe từ
                </button>
                {word.example_en && (
                  <button
                    onClick={() => speak(word.example_en!)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Nghe câu ví dụ
                  </button>
                )}
              </div>

              {/* Example sentence */}
              {word.example_en && (
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/4 border border-zinc-100 dark:border-white/6">
                  <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                    Ví dụ
                  </p>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                    &ldquo;{word.example_en}&rdquo;
                  </p>
                </div>
              )}

              {/* Mastery tip */}
              <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
                {word.mastery_pct < 40
                  ? "⚠️ Bạn quên từ này rất thường xuyên. Hãy ôn tập hàng ngày và tạo câu ví dụ riêng để ghi nhớ sâu hơn."
                  : word.mastery_pct < 70
                    ? "💪 Đang cải thiện! Tiếp tục ôn tập đều đặn mỗi ngày."
                    : "✅ Sắp thành thạo rồi! Một vài lần ôn nữa là thuộc chắc."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HardWordsClient() {
  const [words, setWords] = useState<HardWord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getHardWords(20).then((res) => {
      if (res.success) {
        setWords(res.words ?? []);
      } else {
        setError(res.error ?? "Lỗi tải dữ liệu");
        setWords([]);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Stats summary
  const avgMastery =
    words && words.length > 0
      ? Math.round(words.reduce((s, w) => s + w.mastery_pct, 0) / words.length)
      : null;
  const totalAgain = words ? words.reduce((s, w) => s + w.again_count, 0) : 0;
  const criticalCount = words
    ? words.filter((w) => w.mastery_pct < 50).length
    : 0;

  return (
    <SecondaryPageShell
      title="Từ Khó Nhất"
      subtitle="Những từ bạn bấm Again nhiều nhất — ôn để không quên nữa."
    >
      <div className="space-y-6 pb-16">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/review"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Quay lại Flashcards
          </Link>
          <button
            onClick={load}
            disabled={loading}
            className="shrink-0 p-2 rounded-xl border border-border/60 bg-card text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            aria-label="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Stats row */}
        {!loading && words && words.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border/60 bg-card px-4"
          >
            <StatLine label="Cần chú ý" value={String(criticalCount)} />
            <StatLine label="Tổng Again" value={String(totalAgain)} />
            <StatLine label="TB không quên" value={`${avgMastery}%`} />
          </motion.div>
        )}

        {/* CTA to review */}
        {!loading && words && words.length > 0 && (
          <Link
            href="/review"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 hover:border-red-500/40 hover:from-red-500/15 hover:to-orange-500/15 transition-all group"
          >
            <span className="flex w-9 h-9 items-center justify-center rounded-xl bg-red-500/15 shrink-0">
              <Layers className="w-4.5 h-4.5 text-red-500" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-black text-zinc-900 dark:text-white">
                Ôn Từ Khó Ngay
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Bật &ldquo;Từ Khó Mode&rdquo; trong Flashcards để ưu tiên những
                từ này
              </p>
            </div>
            <span className="text-red-500 group-hover:translate-x-0.5 transition-transform text-sm">
              →
            </span>
          </Link>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-zinc-100 dark:bg-white/4 border border-zinc-200/60 dark:border-white/8 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 text-sm">{error}</div>
        ) : words && words.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 space-y-4"
          >
            <Trophy className="w-12 h-12 text-emerald-500 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-lg font-black text-zinc-900 dark:text-white">
                Chưa có dữ liệu luyện tập!
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Hãy ôn tập flashcard vài buổi để hệ thống thống kê từ nào bạn
                hay quên nhất.
              </p>
            </div>
            <div className="flex justify-center gap-3 flex-wrap pt-2">
              <Link
                href="/review"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold hover:from-emerald-400 hover:to-teal-400 transition-all active:scale-95 shadow-sm"
              >
                <Layers className="w-4 h-4" />
                Bắt đầu ôn tập
              </Link>
              <Link
                href="/learn"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 text-sm font-bold hover:border-zinc-300 dark:hover:border-white/25 transition-all"
              >
                <BookOpen className="w-4 h-4" />
                Học bài mới
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Nhấn vào từ để xem chi tiết và nghe phát âm
            </p>
            {words!.map((word, i) => (
              <WordCard key={word.id} word={word} index={i} />
            ))}
          </div>
        )}
      </div>
    </SecondaryPageShell>
  );
}
