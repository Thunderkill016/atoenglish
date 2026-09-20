import type { Metadata } from "next";
import { getDueCards } from "@/app/actions/cards";
import { getUserProgress, getTodayMissionFlags } from "@/app/actions/stats";
import { buildDailyMissions } from "@/lib/dashboard/daily-missions";
import { alignWordOfDayTopic } from "@/lib/dashboard/word-of-day";
import {
  getAllUnitCompletionStatuses,
  getCurrentUnit,
} from "@/app/actions/unit";
import { getRecentSpeakingSessions } from "@/app/actions/speaking";
import { UNITS } from "@/lib/constants/units";
import { UNIT_VOCABULARY } from "@/lib/constants/vocabulary";
import DashboardClient from "./components/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard | AtoEnglish",
  description: "Tiếp tục bài học, luyện tập, ôn tập và theo dõi tiến độ tiếng Anh.",
};

export const revalidate = 30;

export default async function DashboardPage() {
  const [progressRes, cardsRes, unitRes, speakingRes, bulkRes] = await Promise.all([
    getUserProgress(),
    getDueCards(),
    getCurrentUnit(),
    getRecentSpeakingSessions(5),
    getAllUnitCompletionStatuses(),
  ]);

  const VALID_TYPES = ["shadowing", "roleplay", "journal"] as const;
  type SpeakingPracticeType = (typeof VALID_TYPES)[number];
  const recentSpeakingSessions = (
    speakingRes.success && speakingRes.sessions ? speakingRes.sessions : []
  )
    .filter((session) => VALID_TYPES.includes(session.practice_type as SpeakingPracticeType))
    .map((session) => ({
      id: session.id,
      practice_type: session.practice_type as SpeakingPracticeType,
      duration: session.duration,
      accuracy_score: session.accuracy_score,
      scenario_id: session.scenario_id,
      created_at: session.created_at,
    }));

  let userName = "Học viên";
  let userLevel = "A0 Learner";

  if (progressRes.success && progressRes.progress) {
    const progress = progressRes.progress;
    userName = progress.display_name || "Học viên";

    const levelNames: Record<string, string> = {
      A0: "A0 Nền tảng",
      A1: "A1 Beginner",
      A2: "A2 Elementary",
      B1: "B1 Intermediate",
      B2: "B2 Upper-Intermediate",
      C1: "C1 Advanced",
    };
    userLevel = levelNames[progress.current_level] || `${progress.current_level} Learner`;
  }

  const dueCardsCount = cardsRes.success && cardsRes.cards ? cardsRes.cards.length : 0;

  const currentUnitData = {
    unitId: "unit-1",
    title: "Unit 1: Greetings & Self-Introduction",
    description: "Học cách chào hỏi cơ bản, tự giới thiệu bản thân bằng tiếng Anh.",
    currentPhase: "Pha 1: Input",
    progress: 0,
    completed: false,
    route: "/learn/unit-1",
    tags: UNITS.find((unit) => unit.id === "unit-1")?.tags ?? [],
    xp: UNITS.find((unit) => unit.id === "unit-1")?.xp ?? 80,
  };

  if (unitRes.success && unitRes.unitId) {
    currentUnitData.unitId = unitRes.unitId;
    currentUnitData.title = unitRes.title || "";
    currentUnitData.description = unitRes.description || "";
    currentUnitData.currentPhase = unitRes.currentPhase || "";
    currentUnitData.progress = unitRes.progress || 0;
    currentUnitData.completed = !!unitRes.completed;
    currentUnitData.route = unitRes.route || "/learn/unit-1";
    currentUnitData.tags = UNITS.find((unit) => unit.id === unitRes.unitId)?.tags ?? [];
    currentUnitData.xp = UNITS.find((unit) => unit.id === unitRes.unitId)?.xp ?? 80;
  }

  const completedMap = bulkRes.completedMap;
  const completedUnits = completedMap.size;

  const missionFlagsRes = await getTodayMissionFlags(currentUnitData.unitId);
  const flags = missionFlagsRes.flags;

  const dailyMissions = buildDailyMissions({
    currentUnit: {
      title: currentUnitData.title,
      progress: currentUnitData.progress,
      route: currentUnitData.route,
    },
    dueCardsCount,
    lessonCompletedToday: flags.lessonCompletedOnCurrentUnit,
    srsReviewedToday: flags.srsReviewedToday,
    quizDoneToday: flags.quizDoneToday,
    speakingDoneToday: flags.speakingDoneToday,
  });

  const completedUnitIds = UNITS.filter((unit) => completedMap.has(unit.id)).map(
    (unit) => unit.id,
  );

  const allVocab = UNITS.flatMap((unit) => UNIT_VOCABULARY[unit.id] ?? []);
  const currentUnitVocab = UNIT_VOCABULARY[currentUnitData.unitId] ?? [];
  const vocabPool = currentUnitVocab.length > 0 ? currentUnitVocab : allVocab;
  const vnDateStr = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
  const [vyear, vmonth, vday] = vnDateStr.split("-").map(Number);
  const dayIndex = vyear * 10000 + vmonth * 100 + (vday ?? 0);
  const selectedWord = vocabPool.length > 0 ? vocabPool[dayIndex % vocabPool.length] : null;
  const wordOfDay = alignWordOfDayTopic(currentUnitData.unitId, selectedWord);

  return (
    <DashboardClient
      userName={userName}
      userLevel={userLevel}
      completedUnits={completedUnits}
      dueCardsCount={dueCardsCount}
      currentUnitData={currentUnitData}
      dailyMissions={dailyMissions}
      wordOfDay={wordOfDay}
      completedUnitIds={completedUnitIds}
      allUnits={UNITS.map((unit) => ({
        id: unit.id,
        title: unit.title,
        level: unit.level,
        route: unit.route,
        xp: unit.xp,
      }))}
      recentSpeakingSessions={recentSpeakingSessions}
    />
  );
}
