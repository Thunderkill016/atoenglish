"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mic, ChevronRight } from "lucide-react";

interface SpeakingSession {
  id: string;
  practice_type: "shadowing" | "roleplay" | "journal";
  duration: number;
  accuracy_score: number | null;
  scenario_id: string | null;
  created_at: string;
}

interface SpeakingFeedCardProps {
  sessions: SpeakingSession[];
}

const TYPE_META: Record<
  string,
  { label: string; icon: string; color: string; bg: string; href: string }
> = {
  shadowing: {
    label: "Shadowing",
    icon: "🎧",
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-500/10 border-teal-500/20",
    href: "/me/speaking",
  },
  roleplay: {
    label: "AI Roleplay",
    icon: "🤖",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    href: "/me/speaking",
  },
  journal: {
    label: "Journal",
    icon: "📓",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    href: "/me/speaking",
  },
};

const SCENARIO_LABELS: Record<string, string> = {
  "hotel-checkin": "Hotel Check-in",
  "job-interview": "Job Interview",
  "coffee-shop": "Ordering Coffee",
  "airport-security": "Airport Security",
  "restaurant-dining": "Restaurant Dining",
  "doctors-appointment": "Doctor's Appointment",
  "saas-product-demo": "Product Demo",
  "investor-pitch": "Investor Pitch",
  "customer-support": "Customer Support",
};

function timeAgo(isoStr: string): string {
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 172800) return "Hôm qua";
  return `${Math.floor(diff / 86400)} ngày trước`;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative size-9 shrink-0">
      <svg className="size-9 -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18" cy="18" r={radius}
          fill="none" stroke="currentColor" strokeWidth="3"
          className="text-zinc-200 dark:text-zinc-800"
        />
        <circle
          cx="18" cy="18" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${circumference - offset} ${offset}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-[9px] font-black"
        style={{ color }}
      >
        {score}%
      </span>
    </div>
  );
}

export default function SpeakingFeedCard({ sessions }: SpeakingFeedCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (sessions.length === 0) return null;

  const totalMinutes = sessions.reduce(
    (sum, s) => sum + Math.round(s.duration / 60),
    0
  );
  const avgScore =
    sessions.filter((s) => s.accuracy_score !== null).length > 0
      ? Math.round(
          sessions
            .filter((s) => s.accuracy_score !== null)
            .reduce((sum, s) => sum + (s.accuracy_score ?? 0), 0) /
            sessions.filter((s) => s.accuracy_score !== null).length
        )
      : null;

  return (
    <div className="rounded-2xl border border-teal-500/20 bg-teal-500/3 dark:bg-teal-500/5 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-teal-500/10 shrink-0">
          <Mic className="size-5 text-teal-500" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-teal-500 uppercase tracking-widest">
            Lịch sử luyện nói
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
            {sessions.length} buổi · {totalMinutes} phút
            {avgScore !== null && ` · Điểm TB: ${avgScore}%`}
          </p>
        </div>
        <ChevronRight
          className={`size-4 text-teal-400/60 shrink-0 transition-transform duration-200 ${
            collapsed ? "" : "rotate-90"
          }`}
        />
      </button>

      {/* Collapsed: show mini pills */}
      {collapsed && (
        <div className="px-4 pb-4 flex gap-1.5 flex-wrap">
          {sessions.slice(0, 3).map((s) => {
            const meta = TYPE_META[s.practice_type] ?? TYPE_META.shadowing!;
            return (
              <span
                key={s.id}
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${meta.bg} ${meta.color}`}
              >
                {meta.icon} {meta.label}
              </span>
            );
          })}
          {sessions.length > 3 && (
            <span className="text-[10px] font-bold text-zinc-400 px-1 py-1">
              +{sessions.length - 3} khác
            </span>
          )}
        </div>
      )}

      {/* Expanded: full list */}
      {!collapsed && (
        <div className="px-4 pb-4 space-y-2 border-t border-teal-500/10 pt-3">
          {sessions.map((s) => {
            const meta = TYPE_META[s.practice_type] ?? TYPE_META.shadowing!;
            const scenarioLabel =
              s.scenario_id && SCENARIO_LABELS[s.scenario_id]
                ? SCENARIO_LABELS[s.scenario_id]
                : null;
            const durationMin = Math.max(1, Math.round(s.duration / 60));

            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/40 dark:bg-zinc-800/30 border border-zinc-200/50 dark:border-zinc-700/30"
              >
                {/* Type icon */}
                <span
                  className={`flex size-9 items-center justify-center rounded-xl border text-base shrink-0 ${meta.bg}`}
                >
                  {meta.icon}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${meta.color}`}>
                    {meta.label}
                    {scenarioLabel && (
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                        {" "}· {scenarioLabel}
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                    {durationMin} phút · {timeAgo(s.created_at)}
                  </p>
                </div>

                {/* Score ring or no-score placeholder */}
                {s.accuracy_score !== null ? (
                  <ScoreRing score={s.accuracy_score} />
                ) : (
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0 font-medium">
                    —
                  </span>
                )}
              </motion.div>
            );
          })}

          {/* CTA */}
          <Link
            href="/me/speaking"
            className="mt-1 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 transition-colors"
          >
            <Mic className="size-3.5 text-teal-500" />
            <span className="text-xs font-bold text-teal-500">
              Bắt đầu buổi luyện nói mới
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
