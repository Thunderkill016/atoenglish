import { UNITS } from "@/lib/constants/units";
import { PILOT_LESSON_SPECS } from "@/lib/lessons/pilot-lessons";

// Mission lessons override catalog metadata where a pilot spec exists.
export const CATALOG_UNITS = UNITS.map((unit) => {
  const lesson = PILOT_LESSON_SPECS[unit.id];
  return lesson
    ? {
        ...unit,
        title: lesson.title,
        description: lesson.description,
        estimatedTime: lesson.estimatedTime,
      }
    : unit;
});

export const LEVEL_GROUPS: ReadonlyArray<{ level: string; title: string }> = [
  { level: "A0", title: "A0 · Nền tảng" },
  { level: "A1", title: "A1 · Giao tiếp cơ bản" },
  { level: "A2", title: "A2 · Chủ đề đời thường" },
  { level: "B1", title: "B1 · Kể chuyện & công việc" },
  { level: "B2", title: "B2 · Ngôn ngữ nâng cao" },
];

export function groupUnitsByLevel<T extends { level: string }>(
  units: readonly T[],
): Array<{ level: string; title: string; units: T[] }> {
  return LEVEL_GROUPS.map((group) => ({
    ...group,
    units: units.filter((unit) => unit.level === group.level),
  })).filter((group) => group.units.length > 0);
}
