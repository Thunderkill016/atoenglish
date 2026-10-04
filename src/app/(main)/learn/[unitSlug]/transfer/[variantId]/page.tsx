import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import MissionTransferTemplate from "@/components/learn/MissionTransferTemplate";
import { PILOT_LESSON_SPECS } from "@/lib/lessons/pilot-lessons";
import type { LessonSpecV1 } from "@/lib/lessons/lesson-spec";
import {
  attemptRowToTransferEvidence,
  summarizeTransferEvidence,
} from "@/lib/missions/mission-progress";
import type { MissionSpecV1 } from "@/lib/missions/mission-spec";
import { createClient } from "@/lib/supabase/server";

type MissionLesson = LessonSpecV1 & { mission: MissionSpecV1 };

function isMissionLesson(lesson: LessonSpecV1 | null): lesson is MissionLesson {
  return lesson?.mission !== undefined;
}

export const metadata: Metadata = {
  title: "Kiểm tra chuyển giao | AtoEnglish",
  description: "Kiểm tra khả năng dùng tiếng Anh trong một tình huống mới.",
  robots: { index: false },
};

export default async function MissionTransferPage({
  params,
}: {
  params: Promise<{ unitSlug: string; variantId: string }>;
}) {
  const { unitSlug, variantId } = await params;
  const lesson = PILOT_LESSON_SPECS[unitSlug] ?? null;
  if (!isMissionLesson(lesson)) notFound();

  const variant = lesson.mission.transferVariants.find(
    (candidate) => candidate.id === variantId,
  );
  if (!variant) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/login?mode=login&next=${encodeURIComponent(
        `/learn/${unitSlug}/transfer/${variantId}`,
      )}`,
    );
  }

  const [{ data: completion }, { data: attempts }] = await Promise.all([
    supabase
      .from("user_lesson_progress")
      .select("completed_at")
      .eq("user_id", user.id)
      .eq("unit_id", unitSlug)
      .maybeSingle(),
    supabase
      .from("learning_attempts")
      .select("prompt_id, session_id, metadata, created_at")
      .eq("user_id", user.id)
      .like("prompt_id", `${unitSlug}:transfer:%`),
  ]);

  if (!completion) redirect(`/learn/${unitSlug}`);

  const transferEvidence = (attempts ?? [])
    .map(attemptRowToTransferEvidence)
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const dueAt = new Date(completion.completed_at);
  const requestTime = new Date();
  dueAt.setUTCDate(dueAt.getUTCDate() + variant.dueAfterDays);
  if (dueAt.getTime() > requestTime.getTime()) redirect("/learn");

  const passScore = lesson.mission.evaluation.requiredIntentPassRatio * 100;
  const orderedVariants = [...lesson.mission.transferVariants].sort(
    (left, right) => left.dueAfterDays - right.dueAfterDays,
  );

  for (const prior of orderedVariants) {
    if (prior.dueAfterDays >= variant.dueAfterDays) break;
    const priorActivityId = `${unitSlug}:transfer:${prior.id}`;
    const priorEvidence = summarizeTransferEvidence(
      transferEvidence,
      priorActivityId,
      passScore,
    );
    if (!priorEvidence.verified) {
      redirect(`/learn/${unitSlug}/transfer/${prior.id}`);
    }
  }

  const currentActivityId = `${unitSlug}:transfer:${variant.id}`;
  const currentEvidence = summarizeTransferEvidence(
    transferEvidence,
    currentActivityId,
    passScore,
  );
  if (currentEvidence.verified) redirect("/learn");

  return (
    <MissionTransferTemplate
      lesson={lesson}
      variant={variant}
      returnRoute="/learn"
    />
  );
}
