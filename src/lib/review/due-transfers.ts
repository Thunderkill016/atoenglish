import { getMissionForLesson } from "@/lib/missions/mission-catalog";
import { listDueTransferVariants } from "@/lib/missions/mission-evaluator";
import {
  summarizeTransferEvidence,
  type TransferAttemptEvidence,
} from "@/lib/missions/mission-progress";

/**
 * Due delayed-transfer probes derived from completed mission lessons.
 *
 * A mission's transfer variants become due on a schedule (e.g. +1/+7/+30 days
 * after completion); each is due until the learner produces verified evidence
 * for it. Shared between the `/learn` nudge card and the `/review` queue so
 * both surfaces report the same work — derivation lives in one place.
 */
export type DueTransferItem = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly href: string;
};

export function deriveDueTransfers(input: {
  readonly completedLessons: readonly {
    unit_id: string;
    completed_at: string;
  }[];
  readonly transferAttempts: readonly TransferAttemptEvidence[];
  readonly now?: Date;
}): DueTransferItem[] {
  const now = input.now ?? new Date();

  return input.completedLessons.flatMap((completion) => {
    const mission = getMissionForLesson(completion.unit_id);
    if (!mission) return [];

    const firstUnverified = listDueTransferVariants(
      mission,
      new Date(completion.completed_at),
      now,
    ).find((variant) => {
      const activityId = `${mission.lessonId}:transfer:${variant.id}`;
      return !summarizeTransferEvidence(
        input.transferAttempts,
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
}
