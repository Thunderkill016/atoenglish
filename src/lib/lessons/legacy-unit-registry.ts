import type { LessonSpecV1, UnitData } from "@/lib/lessons/lesson-spec";
import type { MissionSpecV1 } from "@/lib/missions/mission-spec";
import { PILOT_LESSON_SPECS } from "@/lib/lessons/pilot-lessons";
// ── Legacy A0 units not yet admitted to the pilot ──────────────────────────
import { unitA07 } from "@/lib/data/units/unitA07";
import { unitA08 } from "@/lib/data/units/unitA08";
// ── A1 — 12 units ───────────────────────────────────────────────────────────
import { unit1 } from "@/lib/data/units/unit1";
import { unit2 } from "@/lib/data/units/unit2";
import { unit3 } from "@/lib/data/units/unit3";
import { unit4 } from "@/lib/data/units/unit4";
import { unit5 } from "@/lib/data/units/unit5";
import { unit6 } from "@/lib/data/units/unit6";
import { unit7 } from "@/lib/data/units/unit7";
import { unit8 } from "@/lib/data/units/unit8";
import { unit9 } from "@/lib/data/units/unit9";
import { unit10 } from "@/lib/data/units/unit10";
import { unit11 } from "@/lib/data/units/unit11";
import { unit12 } from "@/lib/data/units/unit12";
// ── A2 — 6 units ────────────────────────────────────────────────────────────
import { unit13 } from "@/lib/data/units/unit13";
import { unit14 } from "@/lib/data/units/unit14";
import { unit15 } from "@/lib/data/units/unit15";
import { unit16 } from "@/lib/data/units/unit16";
import { unit17 } from "@/lib/data/units/unit17";
import { unit18 } from "@/lib/data/units/unit18";
// ── B1 — 14 units ───────────────────────────────────────────────────────────
import { unit19 } from "@/lib/data/units/unit19";
import { unit20 } from "@/lib/data/units/unit20";
import { unit21 } from "@/lib/data/units/unit21";
import { unit22 } from "@/lib/data/units/unit22";
import { unit23 } from "@/lib/data/units/unit23";
import { unit24 } from "@/lib/data/units/unit24";
import { unit25 } from "@/lib/data/units/unit25";
import { unit26 } from "@/lib/data/units/unit26";
import { unit27 } from "@/lib/data/units/unit27";
import { unit28 } from "@/lib/data/units/unit28";
import { unit29 } from "@/lib/data/units/unit29";
import { unit30 } from "@/lib/data/units/unit30";
import { unit31 } from "@/lib/data/units/unit31";
import { unit32 } from "@/lib/data/units/unit32";
// ── B2 — 10 units ───────────────────────────────────────────────────────────
import { unit33 } from "@/lib/data/units/unit33";
import { unit34 } from "@/lib/data/units/unit34";
import { unit35 } from "@/lib/data/units/unit35";
import { unit36 } from "@/lib/data/units/unit36";
import { unit37 } from "@/lib/data/units/unit37";
import { unit38 } from "@/lib/data/units/unit38";
import { unit39 } from "@/lib/data/units/unit39";
import { unit40 } from "@/lib/data/units/unit40";
import { unit41 } from "@/lib/data/units/unit41";
import { unit42 } from "@/lib/data/units/unit42";

export type RegisteredLesson = UnitData | LessonSpecV1;
export type MissionLesson = LessonSpecV1 & { mission: MissionSpecV1 };

export function isMissionLesson(
  lesson: RegisteredLesson,
): lesson is MissionLesson {
  return "schemaVersion" in lesson && lesson.mission !== undefined;
}

const UNIT_DATA_MAP: Record<string, { data: RegisteredLesson; next: string }> =
  {
    "unit-a0-1": {
      data: PILOT_LESSON_SPECS["unit-a0-1"],
      next: "/checkpoint/trial",
    },
    "unit-a0-2": {
      data: PILOT_LESSON_SPECS["unit-a0-2"],
      next: "/learn/unit-a0-3",
    },
    "unit-a0-3": {
      data: PILOT_LESSON_SPECS["unit-a0-3"],
      next: "/learn/unit-a0-4",
    },
    "unit-a0-4": {
      data: PILOT_LESSON_SPECS["unit-a0-4"],
      next: "/learn/unit-a0-5",
    },
    "unit-a0-5": {
      data: PILOT_LESSON_SPECS["unit-a0-5"],
      next: "/learn/unit-a0-6",
    },
    "unit-a0-6": { data: PILOT_LESSON_SPECS["unit-a0-6"], next: "/learn" },
    "unit-a0-7": { data: unitA07, next: "/learn/unit-a0-8" },
    "unit-a0-8": { data: unitA08, next: "/learn/unit-1" },
    "unit-1": { data: unit1, next: "/learn/unit-2" },
    "unit-2": { data: unit2, next: "/learn/unit-3" },
    "unit-3": { data: unit3, next: "/learn/unit-4" },
    "unit-4": { data: unit4, next: "/learn/unit-5" },
    "unit-5": { data: unit5, next: "/learn/unit-6" },
    "unit-6": { data: unit6, next: "/learn/unit-7" },
    "unit-7": { data: unit7, next: "/learn/unit-8" },
    "unit-8": { data: unit8, next: "/learn/unit-9" },
    "unit-9": { data: unit9, next: "/learn/unit-10" },
    "unit-10": { data: unit10, next: "/learn/unit-11" },
    "unit-11": { data: unit11, next: "/learn/unit-12" },
    "unit-12": { data: unit12, next: "/learn/unit-13" },
    "unit-13": { data: unit13, next: "/learn/unit-14" },
    "unit-14": { data: unit14, next: "/learn/unit-15" },
    "unit-15": { data: unit15, next: "/learn/unit-16" },
    "unit-16": { data: unit16, next: "/learn/unit-17" },
    "unit-17": { data: unit17, next: "/learn/unit-18" },
    "unit-18": { data: unit18, next: "/learn/unit-19" },
    "unit-19": { data: unit19, next: "/learn/unit-20" },
    "unit-20": { data: unit20, next: "/learn/unit-21" },
    "unit-21": { data: unit21, next: "/learn/unit-22" },
    "unit-22": { data: unit22, next: "/learn/unit-23" },
    "unit-23": { data: unit23, next: "/learn/unit-24" },
    "unit-24": { data: unit24, next: "/learn/unit-25" },
    "unit-25": { data: unit25, next: "/learn/unit-26" },
    "unit-26": { data: unit26, next: "/learn/unit-27" },
    "unit-27": { data: unit27, next: "/learn/unit-28" },
    "unit-28": { data: unit28, next: "/learn/unit-29" },
    "unit-29": { data: unit29, next: "/learn/unit-30" },
    "unit-30": { data: unit30, next: "/learn/unit-31" },
    "unit-31": { data: unit31, next: "/learn/unit-32" },
    "unit-32": { data: unit32, next: "/learn/unit-33" },
    "unit-33": { data: unit33, next: "/learn/unit-34" },
    "unit-34": { data: unit34, next: "/learn/unit-35" },
    "unit-35": { data: unit35, next: "/learn/unit-36" },
    "unit-36": { data: unit36, next: "/learn/unit-37" },
    "unit-37": { data: unit37, next: "/learn/unit-38" },
    "unit-38": { data: unit38, next: "/learn/unit-39" },
    "unit-39": { data: unit39, next: "/learn/unit-40" },
    "unit-40": { data: unit40, next: "/learn/unit-41" },
    "unit-41": { data: unit41, next: "/learn/unit-42" },
    "unit-42": { data: unit42, next: "/roadmap" },
  };

export function legacyUnitEntry(unitSlug: string) {
  return UNIT_DATA_MAP[unitSlug] ?? null;
}

export function legacyUnitSlugs(): readonly string[] {
  return Object.keys(UNIT_DATA_MAP);
}
