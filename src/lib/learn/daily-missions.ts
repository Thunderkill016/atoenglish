export type DailyMission = {
  id: string;
  kind: "primary" | "task";
  label: string;
  detail?: string;
  href: string;
  completed: boolean;
};

export type DailyMissionInput = {
  currentUnit: {
    title: string;
    progress: number;
    route: string;
  };
  /**
   * Total due review work across the unified `/review` queue — SRS cards,
   * due lesson reviews and transfer probes — so the mission row reflects
   * everything waiting, not only flashcards.
   */
  dueReviewCount: number;
  lessonCompletedToday: boolean;
  srsReviewedToday: boolean;
  quizDoneToday: boolean;
  speakingDoneToday: boolean;
};

export function buildDailyMissions(input: DailyMissionInput): DailyMission[] {
  const reviewDone = input.dueReviewCount === 0 || input.srsReviewedToday;

  return [
    {
      id: "lesson",
      kind: "primary",
      label: input.currentUnit.title,
      detail: `${input.currentUnit.progress}% tiến độ`,
      href: input.currentUnit.route,
      completed: input.lessonCompletedToday,
    },
    {
      id: "srs",
      kind: "task",
      label:
        input.dueReviewCount > 0
          ? `Ôn tập — ${input.dueReviewCount} mục đến hạn`
          : "Ôn tập (không có gì đến hạn)",
      href: "/review",
      completed: reviewDone,
    },
    {
      id: "quiz",
      kind: "task",
      label: input.quizDoneToday
        ? "Quiz từ vựng (đã xong!)"
        : "Quiz từ vựng — 5 câu",
      href: "/quiz",
      completed: input.quizDoneToday,
    },
    {
      id: "speaking",
      kind: "task",
      label: input.speakingDoneToday
        ? "Luyện nói (đã xong!)"
        : "Luyện nói — 5 phút",
      href: "/me/speaking",
      completed: input.speakingDoneToday,
    },
  ];
}

export function countCompletedMissions(missions: DailyMission[]): number {
  return missions.filter((mission) => mission.completed).length;
}
