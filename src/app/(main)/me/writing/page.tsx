"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Zap,
  RotateCcw,
  ChevronRight,
  BookOpen,
  BookmarkPlus,
  BookmarkCheck,
  History,
} from "lucide-react";
import { analyzeWriting, saveWritingSentence, type WritingFeedback } from "@/app/actions/writing";
import { SecondaryPageShell } from "@/components/design-system";

// ─── Level selector ────────────────────────────────────────────────────────────
const LEVELS = [
  { value: "A1" as const, label: "A1 — Cơ bản", desc: "Câu đơn giản" },
  { value: "A2" as const, label: "A2 — Sơ cấp", desc: "Câu phức đơn giản" },
  { value: "B1" as const, label: "B1 — Trung cấp", desc: "Câu phức, từ vựng rộng hơn" },
  { value: "B2" as const, label: "B2 — Nâng cao", desc: "Văn phức tạp, học thuật" },
];

// ─── Prompt suggestions by level ───────────────────────────────────────────────
const PROMPTS: Record<string, string[]> = {
  A1: [
    "My name is Lan. I am student. I like reading book.",
    "She go to school every day. She have many friends.",
    "I am from Vietnam. I lives in Hanoi.",
    "He is a engineer. He work in office every day.",
    "I have 25 years old. I live with my family.",
    "They are very happy because they win the game.",
    "My mother is teacher. She teach English in school.",
    "I no understand this question. Please explain again.",
  ],
  A2: [
    "Yesterday I go to the market and buyed vegetables.",
    "He can speaks three language fluently.",
    "I am agree with you. This idea is very good.",
    "We discussed about the new plan for one hour.",
    "She is more taller than her sister by five centimeters.",
    "I was very boring in the meeting this afternoon.",
    "He didn't went to work because he felt sick.",
    "They have lived here since five years ago.",
  ],
  B1: [
    "I have been working here since three years.",
    "Despite of the rain, we decided to go for a walk.",
    "She is looking forward to meet you next week.",
    "The manager suggested to reorganize the whole department.",
    "He told me that he will finish the report tomorrow.",
    "This is the most important information that I need to tell you about it.",
    "By the time we arrived, the meeting already started.",
    "She has been waiting for you since two hours.",
  ],
  B2: [
    "The new policy will effect all employees from next month.",
    "Despite the fact that he worked hard, but he didn't get the promotion.",
    "The report, which was written by the intern, it contains several errors.",
    "If I would have known about the meeting, I would have attended it.",
    "The company has made a significant progress in reducing carbon emissions.",
    "She is very concerning about the impact of automation on employment.",
    "The data suggests that there are a strong correlation between stress and productivity.",
    "We need to take into account all the factors before to make a final decision.",
  ],
};

const ERROR_TYPE_LABEL: Record<string, { label: string; color: string }> = {
  grammar:    { label: "Ngữ pháp",   color: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30" },
  vocabulary: { label: "Từ vựng",    color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30" },
  spelling:   { label: "Chính tả",   color: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30" },
  word_order: { label: "Trật tự từ", color: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/30" },
};

// ─── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 85 ? "#10b981" : score >= 65 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={r} strokeWidth="6" className="stroke-zinc-200 dark:stroke-zinc-800" fill="none" />
        <motion.circle
          cx="42" cy="42" r={r} strokeWidth="6"
          stroke={color} fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-black text-zinc-900 dark:text-white">{score}</p>
        <p className="text-[10px] text-zinc-400 font-bold">/ 100</p>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function WriteImprovePage() {
  const [text, setText] = useState("");
  const [level, setLevel] = useState<"A1" | "A2" | "B1" | "B2">("A1");
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAnalyze = () => {
    if (!text.trim() || isPending) return;
    setError(null);
    setFeedback(null);
    startTransition(async () => {
      const res = await analyzeWriting({ text: text.trim(), level });
      if (res.success) {
        setFeedback(res.feedback);
      } else {
        setError(res.error);
      }
    });
  };

  const handleReset = () => {
    setText("");
    setFeedback(null);
    setError(null);
    setSavedId(null);
  };

  const handleSave = async () => {
    if (!feedback || !text || isSaving) return;
    setIsSaving(true);
    const res = await saveWritingSentence({
      sentence_en: feedback.corrected,
      meaning_vn: text.trim(),
      level,
    });
    if (res.success) setSavedId(res.id);
    setIsSaving(false);
  };

  const handlePrompt = (p: string) => {
    setText(p);
    setFeedback(null);
    setError(null);
  };

  return (
    <SecondaryPageShell
      title="Viết & Cải thiện"
      subtitle="Nhập câu tiếng Anh — AI sẽ sửa lỗi, giải thích bằng tiếng Việt, và gợi ý cách viết hay hơn."
    >
    <div className="space-y-6 pb-16">
      <div className="flex justify-end -mt-2">
        <Link
          href="/me/writing/history"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/60 bg-card text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
        >
          <History className="w-3.5 h-3.5" />
          Lịch sử
        </Link>
      </div>

      {/* Level selector */}
      <div className="flex gap-2 flex-wrap">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            onClick={() => { setLevel(l.value); setFeedback(null); }}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
              level === l.value
                ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-300"
                : "bg-white/60 dark:bg-white/5 border-zinc-200/60 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/25"
            }`}
          >
            <span className="block">{l.label}</span>
            <span className={`block font-normal ${
              level === l.value
                ? "text-emerald-500 dark:text-emerald-400/70"
                : "text-zinc-400 dark:text-zinc-600"
            }`}>
              {l.desc}
            </span>
          </button>
        ))}
      </div>

      {/* Prompt suggestions */}
      <div className="space-y-2">
        <p className="text-xs text-zinc-500 dark:text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" /> Câu mẫu để luyện tập
        </p>
        <div className="space-y-1.5">
          {(PROMPTS[level] ?? []).map((p, i) => (
            <button
              key={i}
              onClick={() => handlePrompt(p)}
              className="w-full text-left px-3 py-2 rounded-xl bg-white/60 dark:bg-white/4 border border-zinc-200/60 dark:border-white/8 text-zinc-700 dark:text-zinc-300 text-sm hover:bg-zinc-50 dark:hover:bg-white/8 hover:border-zinc-300 dark:hover:border-white/15 transition-colors flex items-center gap-2 group"
            >
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 group-hover:text-emerald-500 transition-colors shrink-0" />
              <span className="italic">&ldquo;{p}&rdquo;</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setFeedback(null); }}
          placeholder="Nhập câu hoặc đoạn văn tiếng Anh của bạn tại đây..."
          rows={4}
          maxLength={500}
          className="w-full bg-white/70 dark:bg-white/5 border border-zinc-200/60 dark:border-white/10 rounded-2xl px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm resize-none"
        />
        <div className="flex items-center justify-between gap-3">
          {/* Character count bar */}
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  text.length > 400 ? "bg-red-500" : text.length > 250 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min((text.length / 500) * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono shrink-0">{text.length}/500</span>
          </div>
          <div className="flex gap-2 shrink-0">
            {(feedback || text) && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-white/5 border border-zinc-200/60 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Làm lại
              </button>
            )}
            <button
              onClick={handleAnalyze}
              disabled={!text.trim() || isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-zinc-300 disabled:to-zinc-300 dark:disabled:from-zinc-700 dark:disabled:to-zinc-700 disabled:text-zinc-400 text-white font-bold text-sm transition-all active:scale-95 shadow-sm"
            >
              {isPending ? (
                <><Zap className="w-4 h-4 animate-pulse" /> Đang phân tích...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Phân tích</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30"
          >
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Score + encouragement */}
            <div className="bg-white/60 dark:bg-white/5 border border-zinc-200/60 dark:border-white/10 rounded-2xl p-5 flex items-center gap-5">
              <ScoreRing score={feedback.score} />
              <div className="flex-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Độ chính xác</p>
                <p className="text-zinc-900 dark:text-white font-semibold text-sm leading-relaxed">
                  {feedback.encouragement_vn}
                </p>
              </div>
            </div>

            {/* Corrected */}
            <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Câu đã sửa</p>
              </div>
              <p className="text-white text-sm leading-relaxed">{feedback.corrected}</p>
            </div>

            {/* Errors */}
            {feedback.errors.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Lỗi cần sửa ({feedback.errors.length})
                </p>
                {feedback.errors.map((err, i) => {
                  const typeInfo = ERROR_TYPE_LABEL[err.type] ?? ERROR_TYPE_LABEL.grammar;
                  return (
                    <div key={i} className="bg-white/60 dark:bg-white/4 border border-zinc-200/60 dark:border-white/8 rounded-xl p-3.5 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        <span className="text-red-500 dark:text-red-400 text-sm line-through opacity-70">{err.original}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold">{err.correction}</span>
                      </div>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs">{err.explanation_vn}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* No errors */}
            {feedback.errors.length === 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <p className="text-emerald-300 text-sm font-medium">Không có lỗi ngữ pháp! 🎉</p>
              </div>
            )}

            {/* Improved version + Save */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-500/20 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Cách viết hay hơn</p>
                </div>
                {/* Save to My Sentences */}
                <button
                  onClick={() => void handleSave()}
                  disabled={isSaving || !!savedId}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    savedId
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 cursor-default"
                      : "bg-white/60 dark:bg-white/5 border-zinc-200/60 dark:border-white/15 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/30"
                  }`}
                >
                  {savedId ? (
                    <><BookmarkCheck className="w-3.5 h-3.5" /> Đã lưu</>
                  ) : isSaving ? (
                    <><Zap className="w-3.5 h-3.5 animate-pulse" /> Đang lưu...</>
                  ) : (
                    <><BookmarkPlus className="w-3.5 h-3.5" /> Lưu vào bộ sưu tập</>
                  )}
                </button>
              </div>
              <p className="text-zinc-800 dark:text-white text-sm leading-relaxed italic">&ldquo;{feedback.improved}&rdquo;</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </SecondaryPageShell>
  );
}
