import { describe, expect, it } from "vitest";

import { UNITS } from "@/lib/constants/units";
import { PILOT_LESSON_SPECS } from "@/lib/lessons/pilot-lessons";

import { CATALOG_UNITS, groupUnitsByLevel, LEVEL_GROUPS } from "./catalog";

describe("CATALOG_UNITS", () => {
  it("covers every authored unit exactly once, in authored order", () => {
    expect(CATALOG_UNITS.map((unit) => unit.id)).toEqual(
      UNITS.map((unit) => unit.id),
    );
  });

  it("overrides metadata only where a pilot lesson spec exists", () => {
    for (const unit of CATALOG_UNITS) {
      const lesson = PILOT_LESSON_SPECS[unit.id];
      if (lesson) {
        expect(unit.title).toBe(lesson.title);
      }
    }
  });
});

describe("groupUnitsByLevel", () => {
  it("groups the full catalog into ordered CEFR sections", () => {
    const groups = groupUnitsByLevel(CATALOG_UNITS);
    expect(groups.map((group) => group.level)).toEqual([
      "A0",
      "A1",
      "A2",
      "B1",
      "B2",
    ]);
    expect(groups.map((group) => group.units.length)).toEqual([
      8, 12, 6, 14, 10,
    ]);
    expect(groups.reduce((sum, group) => sum + group.units.length, 0)).toBe(
      UNITS.length,
    );
  });

  it("drops empty levels and keeps declared group order", () => {
    const groups = groupUnitsByLevel([
      { level: "B2", id: "x" },
      { level: "A0", id: "y" },
    ]);
    expect(groups.map((group) => group.level)).toEqual(["A0", "B2"]);
    expect(groups.map((group) => group.title)).toEqual([
      LEVEL_GROUPS[0].title,
      LEVEL_GROUPS[4].title,
    ]);
  });
});
