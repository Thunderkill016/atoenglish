"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Layers,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  Target,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { WeeklyReportData } from "@/app/actions/weekly-summary";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getWeekLabel() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" });
  return `${fmt(start)} – ${fmt(now)}`;
}

function Delta({ now, prev, suffix = "" }: { now: number; prev: number; suffix?: string }) {
  const diff = now - prev;
  if (diff === 0) return <span className="text-xs font-bold text-zinc-400 flex items-center gap-0.5"><Minus className="w-2.5 h-2.5" />Bằng tuần trước</span>;
  const up = diff > 0;
  return (
    <span className={`text-xs font-bold flex items-center gap-0.5 ${up ? "text-emerald-500" : "text-red-400"}`}>
      {up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {up ? "+" : ""}{diff}{suffix} so với tuần trước
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  iconClass,
  label,
  value,
  now,
  prev,
  suffix = "",
  delay = 0,
}: {
  icon: React.ElementType;
  iconClass: string;
  label: string;
  value: string | number;
  now: number;
  prev: number;
  suffix?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      className="flex flex-col gap-2 p-4 rounded-2xl bg-white/70 dark:bg-white/4 border border-zinc-200/60 dark:border-white/8"
    >
      <div className="flex items-center gap-2">
        <span className={`flex w-7 h-7 items-center justify-center rounded-lg ${iconClass}`}>
          <Icon className="w-3.5 h-3.5" />
        </span>
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-2xl font-black text-zinc-900 dark:text-white leading-none">{value}</span>
      <Delta now={now} prev={prev} suffix={suffix} />
    </motion.div>
  );
}

// ─── Rating bar ───────────────────────────────────────────────────────────────
function RatingBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-semibold text-zinc-600 dark:text-zinc-400">{label}</span>
        <span className="font-black text-zinc-700 dark:text-zinc-300">{count} <span className="text-zinc-400">({pct}%)</span></span>
      </div>
      <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WeeklyReportClient({ report }: { report: WeeklyReportData | null }) {
  if (!report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-4">
        <span className="text-4xl">📊</span>
        <h1 className="text-xl font-black text-zinc-900 dark:text-white">Chưa có dữ liệu</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
          Hãy học ít nhất 1 bài hoặc ôn thẻ từ để xem báo cáo tuần của bạn.
        </p>
        <Link
          href="/learn"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-400 transition-colors"
        >
          Về Học
        </Link>
      </div>
    );
  }

  const {
    streak,
    lessonsThisWeek, cardsThisWeek, activeDaysThisWeek,
    lessonsLastWeek, cardsLastWeek, activeDaysLastWeek,
    ratingBreakdown, dailyActivity,
  } = report;

  const totalCards = ratingBreakdown.again + ratingBreakdown.hard + ratingBreakdown.good + ratingBreakdown.easy;
  const maxBarValue = Math.max(...dailyActivity.map(d => d.cards + d.lessons), 1);
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });

  // Overall week grade
  const grade =
    activeDaysThisWeek >= 6 ? { label: "Xuất sắc 🏆", color: "text-amber-500" }
    : activeDaysThisWeek >= 4 ? { label: "Tốt 💪", color: "text-emerald-500" }
    : activeDaysThisWeek >= 2 ? { label: "Khá 📈", color: "text-blue-500" }
    : { label: "Cần cải thiện 📚", color: "text-zinc-400" };

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-6 sm:py-8 sm:px-6 space-y-5 min-h-screen pb-24">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-96 h-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <Link
          href="/me/progress"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Tiến Độ
        </Link>

        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              <Calendar className="w-3.5 h-3.5" />
              {getWeekLabel()}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Báo Cáo Tuần
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Tổng kết 7 ngày học tập của bạn
            </p>
          </div>
          {/* Week grade badge */}
          <div className="shrink-0 text-right">
            <p className={`text-lg font-black ${grade.color}`}>{grade.label}</p>
            <p className="text-xs text-zinc-400 font-medium">{activeDaysThisWeek}/7 ngày hoạt động</p>
          </div>
        </div>
      </motion.div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Calendar}
          iconClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          label="Ngày học"
          value={activeDaysThisWeek}
          now={activeDaysThisWeek}
          prev={activeDaysLastWeek}
          suffix=" ngày"
          delay={0}
        />
        <StatCard
          icon={BookOpen}
          iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          label="Bài học"
          value={lessonsThisWeek}
          now={lessonsThisWeek}
          prev={lessonsLastWeek}
          suffix=" bài"
          delay={0.05}
        />
        <StatCard
          icon={Layers}
          iconClass="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          label="Thẻ ôn tập"
          value={cardsThisWeek}
          now={cardsThisWeek}
          prev={cardsLastWeek}
          suffix=" thẻ"
          delay={0.1}
        />
        <StatCard
          icon={Flame}
          iconClass="bg-orange-500/10 text-orange-600 dark:text-orange-400"
          label="Streak hiện tại"
          value={`${streak} ngày`}
          now={streak}
          prev={streak}
          delay={0.15}
        />
      </div>

      {/* Daily Activity Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-2xl bg-white/70 dark:bg-white/4 border border-zinc-200/60 dark:border-white/8 space-y-4"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-black text-zinc-700 dark:text-zinc-200">Hoạt động 7 ngày qua</p>
          <span className="text-xs font-bold text-zinc-400">🟩 Bài học  🟦 Thẻ từ</span>
        </div>
        <div className="flex items-end justify-between gap-1.5 h-20">
          {dailyActivity.map((day) => {
            const total = day.cards + day.lessons;
            const heightPct = Math.round((total / maxBarValue) * 100);
            const lessonPct = total > 0 ? Math.round((day.lessons / total) * heightPct) : 0;
            const cardPct = heightPct - lessonPct;
            const isToday = day.date === today;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end h-16 gap-0">
                  {day.cards > 0 && (
                    <motion.div
                      className="w-full rounded-t bg-violet-400/70 dark:bg-violet-500/60"
                      style={{ height: `${cardPct}%` }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
                    />
                  )}
                  {day.lessons > 0 && (
                    <motion.div
                      className="w-full rounded-t bg-emerald-400/80 dark:bg-emerald-500/70"
                      style={{ height: `${lessonPct}%` }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
                    />
                  )}
                  {total === 0 && (
                    <div className="w-full h-1 rounded bg-zinc-100 dark:bg-zinc-800" />
                  )}
                </div>
                <span className={`text-xs font-black ${isToday ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Card Rating Breakdown */}
      {totalCards > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-4 rounded-2xl bg-white/70 dark:bg-white/4 border border-zinc-200/60 dark:border-white/8 space-y-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-zinc-700 dark:text-zinc-200">Kết quả ôn thẻ tuần này</p>
            <span className="text-xs font-bold text-zinc-400">{totalCards} lượt ôn</span>
          </div>
          <div className="space-y-2.5">
            <RatingBar label="Dễ (Easy)" count={ratingBreakdown.easy} total={totalCards} color="bg-emerald-500" />
            <RatingBar label="Tốt (Good)" count={ratingBreakdown.good} total={totalCards} color="bg-blue-500" />
            <RatingBar label="Khó (Hard)" count={ratingBreakdown.hard} total={totalCards} color="bg-amber-500" />
            <RatingBar label="Quên (Again)" count={ratingBreakdown.again} total={totalCards} color="bg-red-500" />
          </div>
          {/* Accuracy indicator */}
          {totalCards > 0 && (
            <div className="pt-1 border-t border-zinc-100 dark:border-white/6">
              {(() => {
                const accuracy = Math.round(((ratingBreakdown.good + ratingBreakdown.easy) / totalCards) * 100);
                const isGood = accuracy >= 70;
                return (
                  <div className="flex items-center gap-2">
                    {isGood
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      : <XCircle className="w-4 h-4 text-amber-500" />}
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Độ chính xác:{" "}
                      <span className={`font-black ${isGood ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {accuracy}%
                      </span>
                      {isGood ? " — Xuất sắc! 🎯" : " — Hãy dùng 'Từ Khó Nhất' để ôn lại"}
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
        </motion.div>
      )}

      {/* Motivational message + CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/8 to-teal-500/8 border border-emerald-500/15 space-y-1">
          <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            Mục tiêu tuần sau
          </p>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {activeDaysThisWeek < 5
              ? `Tuần này bạn học ${activeDaysThisWeek} ngày. Hãy thử đạt 5 ngày tuần sau để xây dựng thói quen bền vững!`
              : lessonsThisWeek < 3
              ? "Streak tốt! Tuần sau hãy thử hoàn thành ít nhất 3 bài học để tăng tiến độ nhanh hơn."
              : "Bạn đang trên đà tuyệt vời! Hãy duy trì nhịp độ này để đạt mục tiêu CEFR tiếp theo."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/review"
            className="flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-bold hover:from-violet-400 hover:to-purple-400 transition-all active:scale-95"
          >
            <Layers className="w-4 h-4" />
            Ôn Flashcard
          </Link>
          <Link
            href="/review/hard"
            className="flex items-center justify-center gap-2 h-11 rounded-xl border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-500/5 hover:border-red-500/40 transition-all active:scale-95"
          >
            Từ Khó Nhất →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
