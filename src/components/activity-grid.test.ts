import { describe, expect, it } from "vitest";
import {
  activityDayKey,
  activityHistory,
  activityWindowStart,
} from "./activity-grid";
import { currentWeekActivity } from "./week-strip";

const NOW = new Date("2026-10-06T12:00:00Z");

describe("sidebar activity calendar", () => {
  it("uses Vietnamese calendar days at the UTC day boundary", () => {
    expect(activityDayKey("2026-10-05T18:00:00Z")).toBe("2026-10-06");
    expect(activityWindowStart(NOW).toISOString()).toBe(
      "2026-05-31T17:00:00.000Z",
    );
  });

  it("renders five labelled months and whole week columns for guests", () => {
    const history = activityHistory([], NOW);
    expect(history.months.map((m) => m.label)).toEqual([
      "Th6",
      "Th7",
      "Th8",
      "Th9",
      "Th10",
    ]);
    expect(history.cells.length).toBe(history.columns * 7);
    expect(history.activeDates).toEqual([]);
    expect(history.cells.filter((c) => c.today).map((c) => c.date)).toEqual([
      "2026-10-06",
    ]);
  });

  it("deduplicates source snapshots, excludes older and future dates, and hides padding", () => {
    const history = activityHistory(
      [
        "2026-10-05T18:00:00Z",
        "2026-10-06T02:00:00Z",
        "2026-09-15T00:00:00Z",
        "2026-05-01T00:00:00Z",
        "2026-10-10T00:00:00Z",
      ],
      NOW,
    );
    expect(history.activeDates).toEqual(["2026-09-15", "2026-10-06"]);
    expect(
      history.cells.slice(-5).every((c) => c.date === null && !c.active),
    ).toBe(true);
  });

  it("handles leap February and the December to January transition", () => {
    const leap = activityHistory(
      ["2024-02-29T10:00:00Z"],
      new Date("2024-03-01T10:00:00Z"),
    );
    expect(leap.activeDates).toEqual(["2024-02-29"]);
    const january = activityHistory([], new Date("2027-01-01T10:00:00Z"));
    expect(january.months.map((m) => m.label)).toEqual([
      "Th9",
      "Th10",
      "Th11",
      "Th12",
      "Th1",
    ]);
    expect(january.cells.filter((c) => c.date).map((c) => c.date)[0]).toBe(
      "2026-09-01",
    );
  });

  it("uses the same day boundary in the week strip and history grid", () => {
    const now = new Date("2026-10-04T18:00:00Z");
    const week = currentWeekActivity(["2026-10-04T18:00:00Z"], now);
    expect(week.days).toEqual([5, 6, 7, 8, 9, 10, 11]);
    expect(week.todayIndex).toBe(0);
    expect(week.activeDays).toEqual([
      true,
      false,
      false,
      false,
      false,
      false,
      false,
    ]);
  });
});
