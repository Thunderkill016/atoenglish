"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Circle } from "lucide-react";

import {
  countCompletedMissions,
  type DailyMission,
} from "@/lib/learn/daily-missions";
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
    <div className="rounded-2xl border border-border/60 bg-white/60 backdrop-blur-sm overflow-hidden">
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="size-4 text-primary" />
            </span>
            <p className="text-xs font-black text-foreground uppercase tracking-wider">
              Kế hoạch học hôm nay
            </p>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {completedCount}/{missions.length} hoàn thành
          </span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3">
        {primary && (
          <div>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1.5">
              Ưu tiên — làm trước
            </p>
            <Link
              href={primary.href}
              id="today-mission-primary"
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-colors duration-150 group",
                primary.completed
                  ? "border-primary/30 bg-primary/5"
                  : "border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30",
              )}
            >
              <div
                className={cn(
                  "size-8 rounded-full border-2 flex items-center justify-center shrink-0",
                  primary.completed
                    ? "border-primary bg-primary"
                    : "border-primary",
                )}
              >
                {primary.completed ? (
                  <CheckCircle2 className="size-4 text-white" />
                ) : (
                  <BookOpen className="size-3.5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-xs font-bold truncate",
                    primary.completed
                      ? "line-through text-muted-foreground"
                      : "text-foreground",
                  )}
                >
                  {primary.label}
                </p>
                {primary.detail && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {primary.detail}
                  </p>
                )}
              </div>
              {!primary.completed && (
                <ArrowRight className="size-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </Link>
          </div>
        )}

        <div>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1.5">
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
                    ? "border-border/40 bg-card/50 opacity-80"
                    : "border-border/50 hover:bg-card",
                )}
              >
                <span className="shrink-0 text-primary">
                  {mission.completed ? (
                    <CheckCircle2 className="size-4.5 fill-primary text-white" />
                  ) : (
                    <Circle className="size-4.5 text-primary-foreground" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-xs font-semibold leading-snug",
                      mission.completed
                        ? "text-muted-foreground line-through"
                        : "text-foreground",
                    )}
                  >
                    {mission.label}
                  </p>
                  {mission.detail && !mission.completed && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {mission.detail}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {allDone && (
          <p className="text-center text-xs font-bold text-primary pt-1">
            Đã hoàn thành kế hoạch học hôm nay.
          </p>
        )}
      </div>
    </div>
  );
}
