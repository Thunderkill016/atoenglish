import { nepLessonRegistryV1 } from "./lesson-registry.v1";
import type { LessonAction } from "./lesson-contract";

/**
 * Zero-path pilot surface: learner-safe lesson envelopes.
 *
 * Hidden evaluator internals (targetSignals, requiredSignalGroups, assessment
 * targets) are deliberately excluded — the browser receives only what a learner
 * is allowed to see. Canonical recompute happens server-side on submission.
 */

export const ZERO_PATH_PILOT_LESSON_ID = "LESSON-CAP002-FIRST-MEETING-V1" as const;

export type ZeroPathActionEnvelope = {
  readonly actionId: string;
  readonly kind: LessonAction["kind"];
  readonly modality: LessonAction["modality"];
  readonly title: string;
  readonly instruction: string;
  readonly prompt: string | null;
  readonly model: string | null;
  readonly choices: readonly string[];
  readonly supportVi: string | null;
  /** Ordered support rungs the learner may reveal one at a time (0 = none used). */
  readonly supportSteps: readonly string[];
  readonly revealsAnswer: boolean;
  readonly changedContext: boolean;
  /**
   * Whether this action collects a learner response (any assessed, attempt-only
   * or unassessed self-report action). Attempt-only actions like `retry` still
   * collect a response and return feedback — they just mint no evidence.
   */
  readonly respondable: boolean;
};

export type ZeroPathLessonEnvelope = {
  readonly lessonId: string;
  readonly lessonVersion: number;
  readonly mission: string;
  readonly learnerCanDo: string;
  readonly actions: readonly ZeroPathActionEnvelope[];
};

export type ZeroPathLessonIndexEntry = {
  readonly lessonId: string;
  readonly mission: string;
  readonly learnerCanDo: string;
};

/** Learner-safe index of registered lessons for session pickers. */
export function zeroPathLessonIndex(): readonly ZeroPathLessonIndexEntry[] {
  return nepLessonRegistryV1.map((lesson) => ({
    lessonId: lesson.id,
    mission: lesson.mission,
    learnerCanDo: lesson.learnerCanDo,
  }));
}

export function zeroPathLessonEnvelope(
  lessonId: string = ZERO_PATH_PILOT_LESSON_ID,
): ZeroPathLessonEnvelope | null {
  const lesson = nepLessonRegistryV1.find((item) => item.id === lessonId);
  if (!lesson) return null;

  return {
    lessonId: lesson.id,
    lessonVersion: lesson.version,
    mission: lesson.mission,
    learnerCanDo: lesson.learnerCanDo,
    actions: lesson.actions.map((action) => ({
      actionId: action.id,
      kind: action.kind,
      modality: action.modality,
      title: action.title,
      instruction: action.instruction,
      prompt: action.prompt ?? null,
      model: action.model ?? null,
      choices: [...(action.choices ?? [])],
      supportVi: action.supportVi ?? null,
      supportSteps: action.supportLadder ?? (action.supportVi ? [action.supportVi] : []),
      revealsAnswer: action.revealsAnswer === true,
      changedContext: action.changedContext === true,
      respondable: action.assessment != null || action.collectsResponse === true,
    })),
  };
}
