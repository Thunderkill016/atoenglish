import { cn } from "@/lib/utils";

export interface MonthCell {
  /** Day-of-month label; empty for leading/trailing padding cells. */
  day: number | null;
  active: boolean;
  today: boolean;
}

/**
 * Trancy "Activity" widget — current-month grid, Mon-first, one cell per day.
 * Days with real activity (content_sources.updated_at) are filled; today gets
 * a ring. Honest data only — empty grid for guests.
 */
export function monthActivity(activityDates: string[], now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const active = new Set(
    activityDates.map((d) => new Date(d).toDateString()),
  );
  const today = now.getDate();
  const cells: MonthCell[] = [];

  // Mon-first padding: JS getDay() is Sun-first (0=Sun) → shift to Mon-first.
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ day: null, active: false, today: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      active: active.has(new Date(year, month, d).toDateString()),
      today: d === today,
    });
  }
  return {
    cells,
    monthLabel: now.toLocaleDateString("vi-VN", {
      month: "long",
      year: "numeric",
    }),
  };
}

export function ActivityGrid({ cells }: { cells: MonthCell[] }) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {cells.map((c, i) => (
        <span
          key={i}
          aria-hidden={c.day == null}
          className={cn(
            "flex aspect-square items-center justify-center rounded text-[10px] leading-none",
            c.day == null && "invisible",
            c.active ? "bg-primary font-bold text-primary-foreground" : "text-muted-foreground",
            c.today && !c.active && "ring-1 ring-primary",
            c.today && c.active && "ring-1 ring-foreground/60",
          )}
        >
          {c.day}
        </span>
      ))}
    </div>
  );
}
