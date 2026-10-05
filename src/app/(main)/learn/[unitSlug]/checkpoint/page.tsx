import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import MissionCheckpointRunner from "@/components/learn/MissionCheckpointRunner";
import {
  getNextPilotLessonId,
  getPilotLessonSpec,
} from "@/lib/lessons/pilot-lessons";
import type { LessonSpecV1 } from "@/lib/lessons/lesson-spec";
import type { MissionSpecV1 } from "@/lib/missions/mission-spec";
import { createClient } from "@/lib/supabase/server";

type MissionLesson = LessonSpecV1 & { mission: MissionSpecV1 };

function isMissionLesson(lesson: LessonSpecV1 | null): lesson is MissionLesson {
  return lesson?.mission !== undefined;
}

export const metadata: Metadata = {
  title: "Mission checkpoint | AtoEnglish",
  description: "Xác nhận mastery cho một nhiệm vụ giao tiếp A0.",
  robots: { index: false },
};

export default async function MissionCheckpointPage({
  params,
}: {
  params: Promise<{ unitSlug: string }>;
}) {
  const { unitSlug } = await params;
  const lesson = getPilotLessonSpec(unitSlug);
  if (!isMissionLesson(lesson)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/login?mode=login&next=${encodeURIComponent(
        `/learn/${unitSlug}/checkpoint`,
      )}`,
    );
  }

  const nextLessonId = getNextPilotLessonId(unitSlug);
  const nextRoute = nextLessonId ? `/learn/${nextLessonId}` : "/learn";

  // Learner-safe view: the checkpoint answer key and explanations stay
  // server-side. They reach the client only inside the claim response,
  // after the full answer set has been submitted.
  const { mission } = lesson;
  return (
    <MissionCheckpointRunner
      checkpoint={{
        lessonId: mission.lessonId,
        titleVi: mission.titleVi,
        canDoVi: mission.canDoVi,
        passThreshold: mission.checkpoint.passThreshold,
        questions: mission.checkpoint.questions.map((question) => ({
          id: question.id,
          questionVi: question.questionVi,
          options: question.options,
        })),
      }}
      nextRoute={nextRoute}
    />
  );
}
