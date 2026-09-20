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
  dueCardsCount: number;
  lessonCompletedToday: boolean;
  srsReviewedToday: boolean;
  quizDoneToday: boolean;
  speakingDoneToday: boolean;
};

export function buildDailyMissions(input: DailyMissionInput): DailyMission[] {
  const srsDone = input.dueCardsCount === 0 || input.srsReviewedToday;

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
        input.dueCardsCount > 0
          ? `Ôn tập ${input.dueCardsCount} thẻ SRS`
          : "Ôn tập SRS (đã xong hôm nay!)",
      href: "/flashcards",
      completed: srsDone,
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
      href: "/speaking",
      completed: input.speakingDoneToday,
    },
  ];
}

export function countCompletedMissions(missions: DailyMission[]): number {
  return missions.filter((mission) => mission.completed).length;
}
