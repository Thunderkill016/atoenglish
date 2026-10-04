import { answerInformationLessonV1 } from "./answer-info-lesson.v1";
import { askInformationLessonV1 } from "./ask-info-lesson.v1";
import { greetCloseLessonV1 } from "./bootstrap-lessons.v1";
import { confirmUnderstandingLessonV1 } from "./confirm-lesson.v1";
import { firstMeetingLessonV1, type LessonContract } from "./lesson-contract";
import { needHelpLessonV1 } from "./need-help-lesson.v1";
import { sustainInteractionLessonV1 } from "./sustain-interaction-lesson.v1";

export const nepLessonRegistryV1: readonly LessonContract[] = [
  greetCloseLessonV1,
  firstMeetingLessonV1,
  confirmUnderstandingLessonV1,
  askInformationLessonV1,
  answerInformationLessonV1,
  needHelpLessonV1,
  sustainInteractionLessonV1,
];

export function resolveNếpLessonFromRegistry(lessonId: string, lessonVersion: number) {
  return nepLessonRegistryV1.find(
    (lesson) => lesson.id === lessonId && lesson.version === lessonVersion,
  ) ?? null;
}
