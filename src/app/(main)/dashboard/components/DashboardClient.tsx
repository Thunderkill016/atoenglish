"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";

import UnitCard from "./UnitCard";
import SrsCard from "./SrsCard";
import WordOfDayCard from "./WordOfDayCard";
import SpeakingFeedCard from "./SpeakingFeedCard";
import { WidgetErrorBoundary } from "@/components/ui/widget-error-boundary";
import TodayPlanWidget from "./TodayPlanWidget";
import TodayMission from "./TodayMission";
import {
  countCompletedMissions,
  type DailyMission,
} from "@/lib/dashboard/daily-missions";
import DashboardHubNav from "./DashboardHubNav";
import LevelProgressBar from "./LevelProgressBar";

interface DashboardClientProps {
  userName: string;
  userLevel: string;
  completedUnits: number;
  dueCardsCount: number;
  currentUnitData: {
    unitId: string;
    title: string;
    description: string;
    currentPhase: string;
    progress: number;
    completed: boolean;
    route: string;
    tags: string[];
    xp: number;
  };
  dailyMissions: DailyMission[];
  wordOfDay: {
    word: string;
    phonetic: string;
    meaning_vn: string;
    example_en: string;
    topic: string;
    level: "A0" | "A1" | "A2" | "B1" | "B2" | "C1";
  } | null;
  completedUnitIds: string[];
  allUnits: Array<{ id: string; title: string; level: string; route: string; xp: number }>;
  recentSpeakingSessions: Array<{
    id: string;
    practice_type: "shadowing" | "roleplay" | "journal";
    duration: number;
    accuracy_score: number | null;
    scenario_id: string | null;
    created_at: string;
  }>;
}

const getLevelBadgeStyles = (level: string) => {
  switch (level) {
    case "A0":
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300";
    case "A1":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";
    case "A2":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";
    case "B1":
      return "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400";
    case "B2":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
    default:
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300";
  }
};

const getLevelProgressStyles = (level: string) => {
  switch (level) {
    case "A0":
      return "bg-zinc-500";
    case "A1":
      return "bg-emerald-500";
    case "A2":
      return "bg-blue-500";
    case "B1":
      return "bg-purple-500";
    case "B2":
      return "bg-amber-500";
    default:
      return "bg-zinc-500";
  }
};

export default function DashboardClient({
  userName,
  userLevel,
  completedUnits,
  dueCardsCount,
  currentUnitData,
  dailyMissions,
  wordOfDay,
  completedUnitIds,
  allUnits,
  recentSpeakingSessions,
}: DashboardClientProps) {
  const [greeting, setGreeting] = useState("Chào bạn");
  const [showPlacementBanner, setShowPlacementBanner] = useState(true);
  const [expandProgressGrid, setExpandProgressGrid] = useState(false);
  const [showDetailedProgress, setShowDetailedProgress] = useState(false);
  const [localSpeaking] = useState(() => {
    if (typeof window === "undefined") return recentSpeakingSessions;
    try {
      const local = JSON.parse(localStorage.getItem("guest_speaking_sessions") || "[]");
      return Array.isArray(local) && local.length ? local : recentSpeakingSessions;
    } catch {
      return recentSpeakingSessions;
    }
  });

  const shortLevel = userLevel.split(" ")[0] ?? userLevel;

  useEffect(() => {
    const hidden = localStorage.getItem("ato_hide_placement_banner") === "true";
    if (hidden || shortLevel !== "A0") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowPlacementBanner(false);
    }
  }, [shortLevel]);

  useEffect(() => {
    const hour = new Date().getHours();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hour < 12) setGreeting("Chào buổi sáng");
    else if (hour < 18) setGreeting("Chào buổi chiều");
    else setGreeting("Chào buổi tối");
  }, []);

  const handleDismissPlacementBanner = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.setItem("ato_hide_placement_banner", "true");
    setShowPlacementBanner(false);
  };

  const pendingMissions = dailyMissions.length - countCompletedMissions(dailyMissions);
  const hubBadges = {
    "dash-today": pendingMissions,
    "dash-practice": dueCardsCount,
    "dash-progress": 0,
  };

  const levelUnits = allUnits.filter((unit) => unit.level === shortLevel);
  const levelUnitsDone = levelUnits.filter((unit) => completedUnitIds.includes(unit.id)).length;

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8 pb-20 sm:px-6 sm:pb-8 lg:px-8">
      <div className="space-y-6">
        <header className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Tiếp tục học
          </p>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            {greeting}, {userName}!
          </h1>
          <p data-testid="pilot-promise" className="text-sm text-zinc-500 dark:text-zinc-400">
            Tập trung vào bài học, luyện tập, phản hồi và ôn lại những gì cần nhớ.
          </p>
        </header>

        <DashboardHubNav badges={hubBadges} />

        <section id="dash-today" className="space-y-5 scroll-mt-28">
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-50">Hôm nay</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Làm phần học quan trọng nhất trước.</p>
          </div>

          <UnitCard currentUnitData={currentUnitData} />
          <TodayMission missions={dailyMissions} />
        </section>

        <section id="dash-practice" className="space-y-5 scroll-mt-28">
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-50">Luyện tập</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Ôn lại và dùng tiếng Anh thay vì chạy theo điểm thưởng.</p>
          </div>

          {showPlacementBanner && (
            <div className="relative">
              <Link
                href="/placement-test"
                className="flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 transition-colors hover:bg-violet-500/10"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-xl">🎯</span>
                <div className="min-w-0 flex-1 pr-6">
                  <p className="text-xs font-black uppercase tracking-widest text-violet-500">CEFR Placement Test</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Xác định điểm bắt đầu phù hợp</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Reading + vocabulary + language use</p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-violet-400" />
              </Link>
              <button
                onClick={handleDismissPlacementBanner}
                className="absolute right-3 top-3 rounded-full p-1 text-zinc-400 hover:bg-zinc-200/50 hover:text-zinc-700 dark:hover:bg-zinc-800"
                aria-label="Đóng gợi ý placement test"
              >
                ×
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <TodayPlanWidget userLevel={shortLevel} />
            <WidgetErrorBoundary name="SrsCard">
              <SrsCard dueCardsCount={dueCardsCount} />
            </WidgetErrorBoundary>
          </div>

          {wordOfDay && (
            <WidgetErrorBoundary name="WordOfDay">
              <WordOfDayCard
                word={wordOfDay.word}
                phonetic={wordOfDay.phonetic}
                meaning_vn={wordOfDay.meaning_vn}
                example_en={wordOfDay.example_en}
                topic={wordOfDay.topic}
                level={wordOfDay.level}
              />
            </WidgetErrorBoundary>
          )}

          {localSpeaking.length > 0 && (
            <WidgetErrorBoundary name="SpeakingFeed">
              <SpeakingFeedCard sessions={localSpeaking} />
            </WidgetErrorBoundary>
          )}
        </section>

        <section id="dash-progress" className="space-y-5 scroll-mt-28">
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-50">Tiến độ học</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Theo dõi nội dung đã hoàn thành, không dùng XP hay streak làm thước đo năng lực.</p>
          </div>

          <div className="rounded-2xl border border-zinc-200/60 bg-white/60 p-5 dark:border-zinc-800/60 dark:bg-zinc-900/30">
            <button
              onClick={() => setShowDetailedProgress((prev) => !prev)}
              className="flex w-full items-center justify-between text-left"
            >
              <div>
                <p className="text-sm font-black text-zinc-900 dark:text-zinc-50">Trình độ hiện tại: {shortLevel}</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {levelUnitsDone}/{levelUnits.length || 0} bài của mức này đã hoàn thành
                </p>
              </div>
              {showDetailedProgress ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>

            {showDetailedProgress && (
              <div className="mt-4 border-t border-zinc-200/60 pt-4 dark:border-zinc-800/60">
                <LevelProgressBar
                  userLevel={shortLevel}
                  levelUnitsDone={levelUnitsDone}
                  levelUnitsTotal={levelUnits.length}
                />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-200/60 bg-white/60 p-5 dark:border-zinc-800/60 dark:bg-zinc-900/30">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Nội dung khoá học</h3>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                {completedUnitIds.length}/{allUnits.length} bài
              </span>
            </div>

            {(expandProgressGrid ? ["A0", "A1", "A2", "B1", "B2"] : [shortLevel]).map((level) => {
              const units = allUnits.filter((unit) => unit.level === level);
              const doneCount = units.filter((unit) => completedUnitIds.includes(unit.id)).length;
              if (units.length === 0) return null;

              return (
                <div key={level} className="mb-4 last:mb-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${getLevelBadgeStyles(level)}`}>{level}</span>
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">{doneCount}/{units.length} hoàn thành</span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className={`h-full rounded-full ${getLevelProgressStyles(level)}`}
                        style={{ width: `${units.length ? (doneCount / units.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-12">
                    {units.map((unit) => {
                      const done = completedUnitIds.includes(unit.id);
                      const isCurrent = unit.id === currentUnitData.unitId;
                      const displayNum = unit.id.split("-").pop();

                      return (
                        <a
                          key={unit.id}
                          href={unit.route}
                          title={unit.title}
                          className={`relative flex h-9 items-center justify-center rounded-xl border text-xs font-black transition-colors ${
                            done
                              ? "border-emerald-400/70 bg-emerald-500 text-white"
                              : isCurrent
                                ? "border-zinc-700 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-zinc-50 dark:text-zinc-900"
                                : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-emerald-500/40 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400"
                          }`}
                        >
                          {done ? "✓" : displayNum}
                          {isCurrent && !done && (
                            <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-white bg-amber-400 dark:border-zinc-900" />
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="mt-4 flex justify-center border-t border-zinc-100 pt-3 dark:border-zinc-800/60">
              <button
                onClick={() => setExpandProgressGrid((prev) => !prev)}
                className="text-xs font-bold text-emerald-600 hover:underline dark:text-emerald-400"
              >
                {expandProgressGrid ? "Thu gọn" : "Xem toàn bộ A0–B2"}
              </button>
            </div>
          </div>

          {completedUnits > 0 && completedUnits % 5 === 0 && (
            <Link
              href="/placement-test"
              className="flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 transition-colors hover:bg-violet-500/10"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-xl">📝</span>
              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-widest text-violet-500">Checkpoint</p>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Kiểm tra lại sau {completedUnits} bài</p>
              </div>
              <ChevronRight className="size-5 text-violet-400" />
            </Link>
          )}
        </section>
      </div>
    </div>
  );
}
