import { getDueCards } from "@/app/actions/cards";
import { getZeroPathReviewIndex } from "@/app/actions/zero-path";
import { legacyUnitEntry } from "@/lib/lessons/legacy-unit-registry";
import {
  isLegacyContractLessonId,
  LEGACY_CONTRACT_ID_PREFIX,
} from "@/lib/nep/legacy-unit-contract.v1";
import { MISSION_LESSON_IDS } from "@/lib/missions/mission-catalog";
import { attemptRowToTransferEvidence } from "@/lib/missions/mission-progress";
import { zeroPathLessonIndex } from "@/lib/nep/zero-path-pilot.v1";
import { createClient } from "@/lib/supabase/server";

import { deriveDueTransfers, type DueTransferItem } from "./due-transfers";

/**
 * Unified review-queue read model for `/review` (full list) and the `/learn`
 * today-card (counts only). Derived from three honest sources:
 *
 * - SRS cards (`cards` table, FSRS `due_date`)
 * - lesson reviews (`learning_attempts` history → `deriveZeroPathReviewStates`)
 * - delayed transfer probes (mission completion dates + verified attempts)
 *
 * Nothing here fabricates work: an item appears only when its own schedule
 * says it is due.
 */
export type DueLessonReview = {
  readonly lessonId: string;
  readonly title: string;
  readonly href: string;
  readonly nextReviewAt: string | null;
};

export type ReviewQueueData = {
  readonly signedIn: boolean;
  readonly srsDueCount: number;
  readonly lessonReviews: readonly DueLessonReview[];
  readonly transfers: readonly DueTransferItem[];
};

function lessonReviewTarget(lessonId: string): { title: string; href: string } {
  if (isLegacyContractLessonId(lessonId)) {
    const slug = lessonId.slice(LEGACY_CONTRACT_ID_PREFIX.length);
    const entry = legacyUnitEntry(slug);
    return {
      title: entry?.data.title ?? slug,
      href: `/learn/${slug}?mode=review`,
    };
  }
  const registryEntry = zeroPathLessonIndex().find(
    (item) => item.lessonId === lessonId,
  );
  return {
    title: registryEntry?.mission ?? registryEntry?.learnerCanDo ?? lessonId,
    href: `/zero-path?lesson=${encodeURIComponent(lessonId)}&mode=review`,
  };
}

export async function getReviewQueueData(): Promise<ReviewQueueData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      signedIn: false,
      srsDueCount: 0,
      lessonReviews: [],
      transfers: [],
    };
  }

  const [cardsRes, reviewIndex, completedLessonsRes, transferAttemptsRes] =
    await Promise.all([
      getDueCards(),
      getZeroPathReviewIndex(),
      supabase
        .from("user_lesson_progress")
        .select("unit_id, completed_at")
        .eq("user_id", user.id),
      supabase
        .from("learning_attempts")
        .select("prompt_id, session_id, metadata, created_at")
        .eq("user_id", user.id)
        .like("prompt_id", "%:transfer:%"),
    ]);

  const completedLessons = (completedLessonsRes.data ?? [])
    .filter((row) => row.completed_at !== null)
    .map((row) => ({ unit_id: row.unit_id, completed_at: row.completed_at! }));
  const transferAttempts = (transferAttemptsRes.data ?? [])
    .map(attemptRowToTransferEvidence)
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .filter((row) =>
      MISSION_LESSON_IDS.some((lessonId) =>
        row.activity_id.startsWith(`${lessonId}:`),
      ),
    );

  const lessonReviews = reviewIndex.signedIn
    ? reviewIndex.states
        .filter((state) => state.due)
        .map((state) => ({
          lessonId: state.lessonId,
          nextReviewAt: state.nextReviewAt,
          ...lessonReviewTarget(state.lessonId),
        }))
    : [];

  return {
    signedIn: true,
    srsDueCount: cardsRes.success ? (cardsRes.cards?.length ?? 0) : 0,
    lessonReviews,
    transfers: deriveDueTransfers({ completedLessons, transferAttempts }),
  };
}
