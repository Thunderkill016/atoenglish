import Link from "next/link";
import type { Metadata } from "next";

import { getUserProgress } from "@/app/actions/stats";
import { getCurrentUnit } from "@/app/actions/unit";
import { UNITS } from "@/lib/constants/units";
import { PILOT_LESSON_SPECS } from "@/lib/lessons/pilot-lessons";
import {
  getMissionForLesson,
  MISSION_LESSON_IDS,
} from "@/lib/missions/mission-catalog";
import { listDueTransferVariants } from "@/lib/missions/mission-evaluator";
import { summarizeTransferEvidence } from "@/lib/missions/mission-progress";
import { createClient } from "@/lib/supabase/server";
import LearnClient from "./components/LearnClient";

export const metadata: Metadata = {
  title: "Bài A0 | AtoEnglish",
  description: "Lộ trình A0 theo nhiệm vụ giao tiếp cho người Việt mới bắt đầu.",
};

export const revalidate = 0;

const PILOT_UNITS = UNITS.slice(0, 6).map((unit) => {
  const lesson = PILOT_LESSON_SPECS[unit.id];
  return lesson
    ? {
        ...unit,
        title: lesson.title,
        description: lesson.description,
        estimatedTime: lesson.estimatedTime,
      }
    : unit;
});

export default async function LearnPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    progressRes,
    activeUnitRes,
    completedLessonsRes,
    transferAttemptsRes,
  ] = await Promise.all([
    getUserProgress(),
    getCurrentUnit(),
    user
      ? supabase
          .from("user_lesson_progress")
          .select("unit_id, xp_earned, completed_at")
          .eq("user_id", user.id)
          .in(
            "unit_id",
            PILOT_UNITS.map((unit) => unit.id),
          )
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from("learning_attempts")
          .select("activity_id, session_id, score, created_at")
          .eq("user_id", user.id)
          .in("lesson_id", MISSION_LESSON_IDS)
          .like("activity_id", "%:transfer:%")
      : Promise.resolve({ data: null }),
  ]);

  const completedLessons = completedLessonsRes.data ?? [];
  const transferAttempts = transferAttemptsRes.data ?? [];
  const completedUnitIds = completedLessons.map((lesson) => lesson.unit_id);
  const completedXp = new Map(
    completedLessons.map((lesson) => [lesson.unit_id, lesson.xp_earned || 0]),
  );
  const firstIncomplete = PILOT_UNITS.find(
    (unit) => !completedUnitIds.includes(unit.id),
  );
  const activeUnitId =
    PILOT_UNITS.some((unit) => unit.id === activeUnitRes.unitId) &&
    !completedUnitIds.includes(activeUnitRes.unitId || "")
      ? activeUnitRes.unitId!
      : firstIncomplete?.id || PILOT_UNITS[0].id;

  const now = new Date();
  const dueTransfers = completedLessons.flatMap((completion) => {
    const mission = getMissionForLesson(completion.unit_id);
    if (!mission) return [];

    const firstUnverified = listDueTransferVariants(
      mission,
      new Date(completion.completed_at),
      now,
    ).find((variant) => {
      const activityId = `${mission.lessonId}:transfer:${variant.id}`;
      return !summarizeTransferEvidence(
        transferAttempts,
        activityId,
        mission.evaluation.requiredIntentPassRatio * 100,
      ).verified;
    });

    if (!firstUnverified) return [];

    return [
      {
        id: `${mission.lessonId}:${firstUnverified.id}`,
        label: `${mission.titleVi} · +${firstUnverified.dueAfterDays} ngày`,
        description: firstUnverified.scenarioVi,
        href: `/learn/${mission.lessonId}/transfer/${firstUnverified.id}`,
      },
    ];
  });

  return (
    <div className="space-y-4">
      <Link
        href="/read"
        className="mx-4 mt-4 flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 transition-colors hover:border-sky-400 sm:mx-auto sm:max-w-2xl"
      >
        <span className="font-medium">Đọc tiếng Anh — chạm từng từ để xem nghĩa và đánh dấu từ bạn biết</span>
        <span aria-hidden>→</span>
      </Link>
      <LearnClient
      userLevel={
        progressRes.success ? progressRes.progress?.current_level || "A0" : "A0"
      }
      totalXp={progressRes.success ? progressRes.progress?.total_xp || 0 : 0}
      completedUnitIds={completedUnitIds}
      activeUnitId={activeUnitId}
      isGuest={!user}
      dueTransfers={dueTransfers}
      unitStatuses={PILOT_UNITS.map((unit) => {
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
