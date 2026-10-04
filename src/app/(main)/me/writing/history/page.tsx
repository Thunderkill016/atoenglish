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
import {
  getUserSentences,
  deleteUserSentence,
  type SavedSentence,
} from "@/app/actions/writing";

const LEVEL_FILTERS = ["all", "A1", "A2", "B1"] as const;
type LevelFilter = (typeof LEVEL_FILTERS)[number];

const LEVEL_COLORS: Record<string, string> = {
  A1: "text-primary bg-primary/10 border-primary/25",
  A2: "text-primary bg-primary/10 border-primary/25",
  B1: "text-primary bg-primary/10 border-primary/25",
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
      className="bg-white/60 border border-border/60 rounded-2xl p-4 space-y-3 group hover:border-border transition-colors"
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <BookmarkCheck className="w-3.5 h-3.5 text-primary shrink-0" />
          {levelTag && (
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded border ${LEVEL_COLORS[levelTag] ?? ""}`}
            >
              {levelTag}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDate(sentence.created_at)}
          </span>
        </div>
        <button
          onClick={() => void handleDelete()}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          aria-label="Xóa câu này"
        >
          {deleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Corrected English sentence */}
      <div className="space-y-1">
        <div className="flex items-start gap-2">
          <p className="flex-1 text-sm font-semibold text-foreground leading-relaxed">
            {sentence.sentence_en}
          </p>
          <button
            onClick={() => speak(sentence.sentence_en)}
            className="shrink-0 mt-0.5 p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
            aria-label="Nghe phát âm"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Original learner text */}
        <p className="text-xs text-muted-foreground italic pl-0.5">
          Bản gốc: &ldquo;{sentence.meaning_vn}&rdquo;
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function WritingHistoryPage() {
  const [allSentences, setAllSentences] = useState<SavedSentence[] | null>(
    null,
  );
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-96 h-80 rounded-full bg-primary/4 blur-3xl pointer-events-none" />

      {/* Back + Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <Link
          href="/me/writing"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại Viết &amp; Cải thiện
        </Link>

        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <BookmarkCheck className="w-3.5 h-3.5" />
            Bộ sưu tập câu
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Câu Đã Lưu
          </h1>
          <p className="text-muted-foreground text-sm">
            Những câu đã được AI sửa — luyện lại bằng cách nghe và so sánh.
          </p>
        </div>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap items-center">
        <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        {LEVEL_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              filter === f
                ? "bg-primary/15 border-primary/50 text-primary"
                : "bg-white/60 border-border/60 text-muted-foreground hover:border-border"
            }`}
          >
            {f === "all" ? "Tất cả" : f}
          </button>
        ))}
        {allSentences !== null && (
          <span className="ml-auto text-xs text-muted-foreground font-mono">
            {displayed.length} câu
          </span>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="popLayout">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-muted border border-border/60 animate-pulse"
              />
            ))}
          </motion.div>
        ) : error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-destructive text-sm py-12"
          >
            {error}
          </motion.p>
        ) : displayed.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 space-y-3"
          >
            <BookOpen className="w-10 h-10 text-foreground mx-auto" />
            <p className="text-muted-foreground text-sm">
              {filter === "all"
                ? 'Chưa có câu nào được lưu. Hãy luyện viết và nhấn "Lưu vào bộ sưu tập"!'
                : `Chưa có câu ${filter} nào. Thử luyện ở trình độ này!`}
            </p>
            <Link
              href="/me/writing"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary transition-colors"
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
