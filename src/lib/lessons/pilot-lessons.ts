import { unitA02 } from "@/lib/data/units/unitA02";
import { unitA03 } from "@/lib/data/units/unitA03";
import { unitA04 } from "@/lib/data/units/unitA04";
import { unitA05 } from "@/lib/data/units/unitA05";
import { unitA06 } from "@/lib/data/units/unitA06";
import { GOLD_DAY_ONE_UNIT } from "@/lib/lessons/gold-day-one";
import { LESSON_SECTIONS } from "@/lib/lessons/learning-flow";
import { getMissionForLesson } from "@/lib/missions/mission-catalog";
import type {
  LessonActivity,
  LessonAsset,
  LessonSkill,
  LessonSpecV1,
  UnitData,
} from "@/lib/lessons/lesson-spec";
import { lemmaKey } from "@/lib/vocab/lemma";

const SECTION_SKILLS: Record<number, LessonSkill> = {
  1: "vocabulary",
  2: "vocabulary",
  3: "grammar",
  4: "grammar",
  5: "listening",
  6: "pronunciation",
  7: "speaking",
  8: "reading",
  9: "writing",
  10: "speaking",
};

function buildActivities(unit: UnitData): LessonActivity[] {
  return LESSON_SECTIONS.map((section) => ({
    id: `${unit.unitId}:section:${section.id}`,
    phase: section.phase,
    skill: SECTION_SKILLS[section.id] ?? "vocabulary",
    promptVi: section.goalVi,
    input: { sectionId: section.id },
    feedback: {
      correctVi: "Đúng rồi. Tiếp tục nhé.",
      incorrectVi: "Chưa đúng. Xem gợi ý và thử lại một lần.",
      unavailableVi: "Hoạt động này chưa thể chấm điểm đáng tin cậy.",
    },
    srsTargets:
      section.id === 2
        ? unit.vocab.map(
            (item) =>
              `vocab:${lemmaKey(item.word) ?? `${unit.unitId}:${item.id}`}`,
          )
        : [],
  }));
}

function buildAssets(unit: UnitData): LessonAsset[] {
  const paths = [
    ...unit.vocab
      .map((item) => item.audio)
      .filter((path): path is string => Boolean(path)),
    ...unit.dialogues.map((dialogue) => dialogue.audio).filter(Boolean),
  ];

  return [...new Set(paths)].map((path, index) => ({
    id: `${unit.unitId}:audio:${index + 1}`,
    type: "audio" as const,
    path,
  }));
}

function toPilotSpec(unit: UnitData, prerequisites: string[]): LessonSpecV1 {
  const mission = getMissionForLesson(unit.unitId) ?? undefined;
  const missionActivityId = mission
    ? `${unit.unitId}:mission:${mission.id}`
    : null;
  const activities: LessonActivity[] = [
    ...buildActivities(unit),
    ...(mission && missionActivityId
      ? [
          {
            id: missionActivityId,
            phase: "output" as const,
            skill: "speaking" as const,
            promptVi: mission.canDoVi,
            input: {
              missionId: mission.id,
              requiredIntentIds: mission.intents
                .filter((intent) => intent.required)
                .map((intent) => intent.id),
            },
            feedback: {
              correctVi:
                "Bạn đã thể hiện đủ mục tiêu. Hãy thực hiện full-task retry.",
              incorrectVi:
                "Xem tối đa hai điểm sửa và thực hiện lại toàn bộ nhiệm vụ.",
              unavailableVi:
                "Không có transcript để kiểm tra nội dung; không suy đoán điểm phát âm.",
            },
            srsTargets: mission.targetChunks.map(
              (chunk) =>
                `vocab:${lemmaKey(chunk.english) ?? `${unit.unitId}:mission-chunk:${chunk.id}`}`,
            ),
          },
        ]
      : []),
  ];

  return {
    ...unit,
    ...(mission
      ? {
          title: `Bài ${unit.unitId.replace("unit-", "").toUpperCase()}: ${mission.titleVi}`,
          estimatedTime: mission.estimatedMinutes,
          description: mission.canDoVi,
          situation: mission.scenarioVi,
          learningOutcomes: [mission.canDoVi],
        }
      : {}),
    schemaVersion: 1,
    id: unit.unitId,
    version: mission ? 2 : 1,
    cefr: "A0",
    canDo: mission
      ? [mission.canDoVi]
      : (unit.learningOutcomes ?? [unit.description]).slice(0, 3),
    prerequisites,
    activities,
    assessment: {
      activityIds: [missionActivityId ?? `${unit.unitId}:section:8`],
      passThreshold: mission
        ? Math.round(mission.evaluation.requiredIntentPassRatio * 100)
        : 70,
      canDoEvidence: mission
        ? mission.intents
            .filter((intent) => intent.required)
            .map((intent) => `${mission.id}:intent:${intent.id}`)
        : unit.quiz.map((question) => `${unit.unitId}:quiz:${question.id}`),
    },
    assets: buildAssets(unit),
    sourceRefs: [
      {
        id: "atoenglish-content-design-v2",
        title: "AtoEnglish learning content design",
        note: "Internal curriculum and Vietnamese learner guidance",
      },
      {
        id: "cefr-companion-volume",
        title: "CEFR Companion Volume",
        url: "https://www.coe.int/en/web/common-european-framework-reference-languages",
      },
      ...(mission
        ? [
            {
              id: "mission-based-speaking-v1",
              title: "AtoEnglish mission-based speaking contract",
              note: "Scenario, bounded chunks, controlled roleplay, feedback, retry, checkpoint and transfer testing.",
            },
          ]
        : []),
    ],
    qaStatus: "automated_pass",
    mission,
  };
}

const PILOT_SOURCE_UNITS = [
  GOLD_DAY_ONE_UNIT,
  unitA02,
  unitA03,
  unitA04,
  unitA05,
  unitA06,
];

export const PILOT_LESSON_ORDER = PILOT_SOURCE_UNITS.map((unit) => unit.unitId);

export const PILOT_LESSON_SPECS = Object.fromEntries(
  PILOT_SOURCE_UNITS.map((unit, index) => [
    unit.unitId,
    toPilotSpec(
      unit,
      index === 0 ? [] : [PILOT_SOURCE_UNITS[index - 1].unitId],
    ),
  ]),
) as Record<string, LessonSpecV1>;

export const PILOT_LESSON_IDS = Object.keys(PILOT_LESSON_SPECS);

export function getPilotLessonSpec(lessonId: string) {
  return PILOT_LESSON_SPECS[lessonId] ?? null;
}

export function getNextPilotLessonId(lessonId: string) {
  const index = PILOT_LESSON_ORDER.indexOf(lessonId);
  if (index < 0 || index >= PILOT_LESSON_ORDER.length - 1) return null;
  return PILOT_LESSON_ORDER[index + 1];
}
