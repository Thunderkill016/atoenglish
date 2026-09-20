"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Circle } from "lucide-react";

import {
  countCompletedMissions,
  type DailyMission,
} from "@/lib/dashboard/daily-missions";
import { cn } from "@/lib/utils";

interface TodayMissionProps {
  missions: DailyMission[];
}

/**
 * Focused daily learning hub. Completion comes from server-side learning evidence.
 */
export default function TodayMission({ missions }: TodayMissionProps) {
  const primary = missions.find((mission) => mission.kind === "primary");
  const tasks = missions.filter((mission) => mission.kind !== "primary");
  const completedCount = countCompletedMissions(missions);
  const progressPct = missions.length
    ? Math.round((completedCount / missions.length) * 100)
    : 0;
  const allDone = missions.length > 0 && completedCount === missions.length;

  return (
    <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/30 backdrop-blur-sm overflow-hidden">
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10">
              <BookOpen className="size-4 text-emerald-600 dark:text-emerald-400" />
            </span>
            <p className="text-xs font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
              Kế hoạch học hôm nay
            </p>
          </div>
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
            {completedCount}/{missions.length} hoàn thành
          </span>
        </div>
        <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3">
        {primary && (
          <div>
            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
              Ưu tiên — làm trước
            </p>
            <Link
              href={primary.href}
              id="today-mission-primary"
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-colors duration-150 group",
                primary.completed
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/30",
              )}
            >
              <div
                className={cn(
                  "size-8 rounded-full border-2 flex items-center justify-center shrink-0",
                  primary.completed
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-emerald-400 dark:border-emerald-600",
                )}
              >
                {primary.completed ? (
                  <CheckCircle2 className="size-4 text-white" />
                ) : (
                  <BookOpen className="size-3.5 text-emerald-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-xs font-bold truncate",
                    primary.completed
                      ? "line-through text-zinc-400"
                      : "text-zinc-900 dark:text-zinc-50",
                  )}
                >
                  {primary.label}
                </p>
                {primary.detail && (
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {primary.detail}
                  </p>
                )}
              </div>
              {!primary.completed && (
                <ArrowRight className="size-3.5 shrink-0 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
              )}
            </Link>
          </div>
        )}

        <div>
          <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
            Các bước còn lại
          </p>
          <div className="space-y-1">
            {tasks.map((mission) => (
              <Link
                key={mission.id}
                href={mission.href}
                id={`today-mission-${mission.id}`}
                className={cn(
                  "flex items-center gap-3 py-2.5 px-3 rounded-xl border transition-colors duration-150",
                  mission.completed
                    ? "border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/20 opacity-80"
                    : "border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
                )}
              >
                <span className="shrink-0 text-emerald-600 dark:text-emerald-400">
                  {mission.completed ? (
                    <CheckCircle2 className="size-4.5 fill-emerald-600 dark:fill-emerald-500 text-white dark:text-zinc-950" />
                  ) : (
                    <Circle className="size-4.5 text-zinc-300 dark:text-zinc-600" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-xs font-semibold leading-snug",
                      mission.completed
                        ? "text-zinc-400 dark:text-zinc-500 line-through"
                        : "text-zinc-800 dark:text-zinc-200",
                    )}
                  >
                    {mission.label}
                  </p>
                  {mission.detail && !mission.completed && (
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {mission.detail}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {allDone && (
          <p className="text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-1">
            Đã hoàn thành kế hoạch học hôm nay.
          </p>
        )}
      </div>
    </div>
  );
}
