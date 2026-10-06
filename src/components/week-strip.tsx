import { cn } from "@/lib/utils";

/** Hand-written Vietnamese weekday labels, Monday-first. */
const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] as const;

/**
 * T5 "Lịch" — 7-day activity strip (Trancy home rail). `days` holds the 7
 * dates of the current week (Mon→Sun) as "YYYY-MM-DD"; `activeDays` marks
 * which had any activity. Today gets a ring; active days fill with primary.
 * Server-renderable — no interactivity.
 */
export function WeekStrip({
  days,
  activeDays,
  todayIndex,
}: {
  /** 7 day-numbers of the current week, Mon→Sun. */
  days: number[];
  /** Same order — true when the learner did anything that day. */
  activeDays: boolean[];
  /** Index of today inside `days` (0–6) or -1 if out of range. */
  todayIndex: number;
}) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day, i) => (
        <div
          key={i}
          className={cn(
            "flex flex-col items-center gap-0.5 rounded-md py-1.5",
            activeDays[i] ? "bg-primary/15" : "bg-muted/50",
            i === todayIndex && "ring-1 ring-primary",
          )}
        >
          <span className="text-[10px] font-medium uppercase leading-none text-muted-foreground">
            {WEEKDAY_LABELS[i]}
          </span>
          <span
            className={cn(
              "text-sm font-semibold leading-tight",
              activeDays[i] ? "text-primary" : "text-foreground",
            )}
          >
            {day}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Compute the current Mon–Sun week: day numbers + which days had activity. */
export function currentWeekActivity(
  activityDates: string[],
  now = new Date(),
): { days: number[]; activeDays: boolean[]; todayIndex: number } {
  const day = (now.getDay() + 6) % 7; // JS Sun=0 → Mon-first index
  const monday = new Date(now);
  monday.setDate(now.getDate() - day);
  monday.setHours(0, 0, 0, 0);

  const activeSet = new Set(
    activityDates.map((iso) => {
      const d = new Date(iso);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }),
  );

  const days: number[] = [];
  const activeDays: boolean[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d.getDate());
    activeDays.push(
      activeSet.has(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`),
    );
  }
  return { days, activeDays, todayIndex: day };
}
