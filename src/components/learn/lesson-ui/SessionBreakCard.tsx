"use client";

import { motion } from "framer-motion";

interface SessionBreakCardProps {
  onContinue: () => void;
}

const COMPLETED_SECTIONS = [
  "✅ Khởi động",
  "✅ Từ vựng",
  "✅ Ngữ pháp",
  "✅ Luyện tập",
];

const UPCOMING_SECTIONS = [
  "⏳ Hội thoại",
  "⏳ Phản xạ",
  "⏳ Dịch câu",
  "⏳ Shadowing",
  "⏳ Luyện nói",
  "⏳ Quiz",
];

export default function SessionBreakCard({ onContinue }: SessionBreakCardProps) {
  return (
    <motion.div
      key="session-break"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/8 to-teal-500/5 p-6 sm:p-8 space-y-6 text-center"
    >
      <div className="flex size-16 mx-auto items-center justify-center rounded-2xl bg-emerald-500/10 text-3xl">
        ☕
      </div>
      <div>
        <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-1">
          Phần 1 hoàn thành!
        </p>
        <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 leading-tight">
          Bạn đã học xong ~15 phút đầu tiên
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-sm mx-auto">
          Nghỉ ngơi hoặc tiếp tục ngay Phần 2 — Hội thoại, Shadowing, Luyện nói và Hoàn thành.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {COMPLETED_SECTIONS.map((section) => (
          <span
            key={section}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
          >
            {section}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {UPCOMING_SECTIONS.map((section) => (
          <span
            key={section}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/40 text-zinc-500"
          >
            {section}
          </span>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onContinue}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm shadow-lg shadow-emerald-900/20 transition-all"
        >
          Tiếp tục Phần 2 →
        </button>
        <a
          href="/learn"
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-400 font-bold text-sm hover:border-zinc-300 dark:hover:border-zinc-600 transition-all"
        >
          💾 Lưu và nghỉ ngơi
        </a>
      </div>
      <p className="text-[11px] text-zinc-400">
        Tiến độ tự động được lưu — quay lại lúc nào cũng được
      </p>
    </motion.div>
  );
}
