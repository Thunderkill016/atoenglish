"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookmarkCheck,
  Trash2,
  ArrowLeft,
  Volume2,
  Filter,
  Loader2,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { getUserSentences, deleteUserSentence, type SavedSentence } from "@/app/actions/writing";

const LEVEL_FILTERS = ["all", "A1", "A2", "B1"] as const;
type LevelFilter = (typeof LEVEL_FILTERS)[number];

const LEVEL_COLORS: Record<string, string> = {
  A1: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  A2: "text-blue-400 bg-blue-500/10 border-blue-500/25",
  B1: "text-violet-400 bg-violet-500/10 border-violet-500/25",
};

function speak(text: string) {
  if (typeof window === "undefined") return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "en-US";
  utt.rate = 0.85;
  window.speechSynthesis.speak(utt);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Sentence card ────────────────────────────────────────────────────────────
function SentenceCard({
  sentence,
  onDelete,
}: {
  sentence: SavedSentence;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    const res = await deleteUserSentence(sentence.id);
    if (res.success) {
      onDelete(sentence.id);
    } else {
      setDeleting(false);
    }
  };

  // Find level tag (A1/A2/B1)
  const levelTag = sentence.tags.find((t) => ["A1", "A2", "B1"].includes(t));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white/60 dark:bg-white/4 border border-zinc-200/60 dark:border-white/8 rounded-2xl p-4 space-y-3 group hover:border-zinc-300 dark:hover:border-white/15 transition-colors"
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          {levelTag && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${LEVEL_COLORS[levelTag] ?? ""}`}>
              {levelTag}
            </span>
          )}
          <span className="text-[10px] text-zinc-600">{formatDate(sentence.created_at)}</span>
        </div>
        <button
          onClick={() => void handleDelete()}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          aria-label="Xóa câu này"
        >
          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Corrected English sentence */}
      <div className="space-y-1">
        <div className="flex items-start gap-2">
          <p className="flex-1 text-sm font-semibold text-zinc-900 dark:text-white leading-relaxed">
            {sentence.sentence_en}
          </p>
          <button
            onClick={() => speak(sentence.sentence_en)}
            className="shrink-0 mt-0.5 p-1.5 rounded-lg text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
            aria-label="Nghe phát âm"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Original learner text */}
        <p className="text-xs text-zinc-500 italic pl-0.5">
          Bản gốc: &ldquo;{sentence.meaning_vn}&rdquo;
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function WritingHistoryPage() {
  const [allSentences, setAllSentences] = useState<SavedSentence[] | null>(null);
  const [filter, setFilter] = useState<LevelFilter>("all");
  const [error, setError] = useState<string | null>(null);

  const loadSentences = useCallback(() => {
    getUserSentences("writing-practice").then((res) => {
      if (res.success) {
        setAllSentences(res.sentences ?? []);
        setError(null);
      } else {
        setAllSentences([]);
        setError(res.error ?? "Lỗi tải dữ liệu");
      }
    });
  }, []);

  useEffect(() => {
    loadSentences();
  }, [loadSentences]);

  const handleDelete = useCallback((id: string) => {
    setAllSentences((prev) => prev?.filter((s) => s.id !== id) ?? null);
  }, []);

  const displayed =
    filter === "all"
      ? (allSentences ?? [])
      : (allSentences ?? []).filter((s) => s.tags.includes(filter));

  const loading = allSentences === null && error === null;

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-6 sm:py-8 sm:px-6 space-y-6 min-h-screen pb-24">
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-96 h-80 rounded-full bg-emerald-500/4 blur-3xl pointer-events-none" />

      {/* Back + Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <Link
          href="/me/writing"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại Viết &amp; Cải thiện
        </Link>

        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <BookmarkCheck className="w-3.5 h-3.5" />
            Bộ sưu tập câu
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Câu Đã Lưu
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Những câu đã được AI sửa — luyện lại bằng cách nghe và so sánh.
          </p>
        </div>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap items-center">
        <Filter className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
        {LEVEL_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              filter === f
                ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-300"
                : "bg-white/60 dark:bg-white/5 border-zinc-200/60 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/25"
            }`}
          >
            {f === "all" ? "Tất cả" : f}
          </button>
        ))}
        {allSentences !== null && (
          <span className="ml-auto text-xs text-zinc-600 font-mono">
            {displayed.length} câu
          </span>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="popLayout">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-zinc-100 dark:bg-white/4 border border-zinc-200/60 dark:border-white/8 animate-pulse" />
            ))}
          </motion.div>
        ) : error ? (
          <motion.p key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-red-400 text-sm py-12">
            {error}
          </motion.p>
        ) : displayed.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 space-y-3"
          >
            <BookOpen className="w-10 h-10 text-zinc-700 mx-auto" />
            <p className="text-zinc-500 text-sm">
              {filter === "all"
                ? "Chưa có câu nào được lưu. Hãy luyện viết và nhấn \"Lưu vào bộ sưu tập\"!"
                : `Chưa có câu ${filter} nào. Thử luyện ở trình độ này!`}
            </p>
            <Link
              href="/me/writing"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Đến trang Viết &amp; Cải thiện →
            </Link>
          </motion.div>
        ) : (
          <motion.div key="list" className="space-y-2">
            {displayed.map((s) => (
              <SentenceCard key={s.id} sentence={s} onDelete={handleDelete} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
