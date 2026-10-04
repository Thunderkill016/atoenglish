import MissionRunner from "@/components/learn/MissionRunner";
import type { LessonSpecV1 } from "@/lib/lessons/lesson-spec";
import type { MissionSpecV1 } from "@/lib/missions/mission-spec";

type MissionLesson = LessonSpecV1 & { mission: MissionSpecV1 };

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
