import MissionRunner from "@/components/learn/MissionRunner";
import type { LessonSpecV1 } from "@/lib/lessons/lesson-spec";
import type { MissionLearnerSpecV1 } from "@/lib/missions/mission-spec";

type MissionLesson = Omit<LessonSpecV1, "mission"> & {
  mission: MissionLearnerSpecV1;
};

interface MissionLessonTemplateProps {
  lesson: MissionLesson;
  nextRoute: string;
}

export default function MissionLessonTemplate({
  lesson,
  nextRoute,
}: MissionLessonTemplateProps) {
  return <MissionRunner lesson={lesson} nextRoute={nextRoute} />;
}
