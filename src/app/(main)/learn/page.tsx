import Link from "next/link";
import type { Metadata } from "next";

import { getUserProgress, getTodayMissionFlags } from "@/app/actions/stats";
import { getCurrentUnit } from "@/app/actions/unit";
import { UNITS } from "@/lib/constants/units";
import { UNIT_VOCABULARY } from "@/lib/constants/vocabulary";
import { CATALOG_UNITS } from "@/lib/learn/catalog";
import { buildDailyMissions } from "@/lib/learn/daily-missions";
import { alignWordOfDayTopic } from "@/lib/learn/word-of-day";
import { getReviewQueueData } from "@/lib/review/due-queue";
import { createClient } from "@/lib/supabase/server";
import LearnClient from "./components/LearnClient";
import TodayMission from "./components/TodayMission";
import WordOfDayCard from "./components/WordOfDayCard";

export const metadata: Metadata = {
  title: "Bài học | AtoEnglish",
  description:
    "Lộ trình A0–B2 theo nhiệm vụ giao tiếp cho người Việt học tiếng Anh.",
};

export const revalidate = 0;

function vnGreeting(): string {
  const hour = Number(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "numeric",
      hour12: false,
    }),
  );
  if (hour < 12) return "Chào buổi sáng";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export default async function LearnPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [progressRes, activeUnitRes, completedLessonsRes, reviewQueue] =
    await Promise.all([
      getUserProgress(),
      getCurrentUnit(),
      user
        ? supabase
            .from("user_lesson_progress")
            .select("unit_id, xp_earned, completed_at")
            .eq("user_id", user.id)
            .in(
              "unit_id",
              CATALOG_UNITS.map((unit) => unit.id),
            )
        : Promise.resolve({ data: null }),
      getReviewQueueData(),
    ]);

  const completedLessons = completedLessonsRes.data ?? [];
  const completedUnitIds = completedLessons.map((lesson) => lesson.unit_id);
  const completedXp = new Map(
    completedLessons.map((lesson) => [lesson.unit_id, lesson.xp_earned || 0]),
  );
  const firstIncomplete = CATALOG_UNITS.find(
    (unit) => !completedUnitIds.includes(unit.id),
  );
  const activeUnitId =
    CATALOG_UNITS.some((unit) => unit.id === activeUnitRes.unitId) &&
    !completedUnitIds.includes(activeUnitRes.unitId || "")
      ? activeUnitRes.unitId!
      : firstIncomplete?.id || CATALOG_UNITS[0].id;

  const activeUnit =
    CATALOG_UNITS.find((unit) => unit.id === activeUnitId) ?? CATALOG_UNITS[0];
  const dueReviewCount =
    reviewQueue.srsDueCount +
    reviewQueue.lessonReviews.length +
    reviewQueue.transfers.length;

  const [dailyMissions, wordOfDay] = user
    ? await (async () => {
        const flagsRes = await getTodayMissionFlags(activeUnit.id);
        const flags = flagsRes.flags;
        const missions = buildDailyMissions({
          currentUnit: {
            title: activeUnit.title,
            progress:
              activeUnit.id === activeUnitRes.unitId
                ? activeUnitRes.progress || 0
                : 0,
            route: activeUnit.route,
          },
          dueReviewCount,
          lessonCompletedToday: flags.lessonCompletedOnCurrentUnit,
          srsReviewedToday: flags.srsReviewedToday,
          quizDoneToday: flags.quizDoneToday,
          speakingDoneToday: flags.speakingDoneToday,
        });

        const allVocab = UNITS.flatMap(
          (unit) => UNIT_VOCABULARY[unit.id] ?? [],
        );
        const currentUnitVocab = UNIT_VOCABULARY[activeUnit.id] ?? [];
        const vocabPool =
          currentUnitVocab.length > 0 ? currentUnitVocab : allVocab;
        const vnDateStr = new Date().toLocaleDateString("sv-SE", {
          timeZone: "Asia/Ho_Chi_Minh",
        });
        const [vyear, vmonth, vday] = vnDateStr.split("-").map(Number);
        const dayIndex = vyear * 10000 + vmonth * 100 + (vday ?? 0);
        const selectedWord =
          vocabPool.length > 0 ? vocabPool[dayIndex % vocabPool.length] : null;
        return [
          missions,
          alignWordOfDayTopic(activeUnit.id, selectedWord),
        ] as const;
      })()
    : [null, null];

  const displayName =
    progressRes.success && progressRes.progress?.display_name
      ? progressRes.progress.display_name
      : "bạn";

  return (
    <div className="space-y-4">
      <Link
        href="/read"
        className="mx-4 mt-4 flex items-center justify-between rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary transition-colors hover:border-primary sm:mx-auto sm:max-w-2xl"
      >
        <span className="font-medium">
          Đọc tiếng Anh — chạm từng từ để xem nghĩa và đánh dấu từ bạn biết
        </span>
        <span aria-hidden>→</span>
      </Link>

      {user ? (
        <div className="mx-4 space-y-4 sm:mx-auto sm:max-w-2xl">
          <header>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              {vnGreeting()}
            </p>
            <h1 className="text-xl font-black tracking-tight text-foreground">
              Kế hoạch hôm nay, {displayName}
            </h1>
          </header>
          {dailyMissions ? <TodayMission missions={dailyMissions} /> : null}
          {wordOfDay ? (
            <WordOfDayCard
              word={wordOfDay.word}
              phonetic={wordOfDay.phonetic}
              meaning_vn={wordOfDay.meaning_vn}
              example_en={wordOfDay.example_en}
              topic={wordOfDay.topic}
              level={wordOfDay.level}
            />
          ) : null}
        </div>
      ) : null}

      <LearnClient
        totalXp={progressRes.success ? progressRes.progress?.total_xp || 0 : 0}
        completedUnitIds={completedUnitIds}
        activeUnitId={activeUnitId}
        isGuest={!user}
        unitStatuses={CATALOG_UNITS.map((unit) => {
          const xpEarned = completedXp.get(unit.id) ?? 0;
          const completed = completedUnitIds.includes(unit.id);

          return {
            ...unit,
            completed,
            progress: completed
              ? 100
              : unit.id === activeUnitId
                ? activeUnitRes.progress || 0
                : 0,
            starCount: completed
              ? xpEarned >= unit.xp
                ? 3
                : xpEarned >= Math.round(unit.xp * 0.82)
                  ? 2
                  : 1
              : 0,
          };
        })}
      />
    </div>
  );
}
