import { cn } from "@/lib/utils";

/** The Vietnamese learning dashboard uses one calendar zone on server and client. */
export const ACTIVITY_TIME_ZONE = "Asia/Ho_Chi_Minh";
const CALENDAR_MONTHS = 5; // Match the five-month overview in the reference sidebar.
const DAYS_PER_WEEK = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;

const ACTIVITY_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: ACTIVITY_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function activityDayKey(value: string | Date): string {
  return ACTIVITY_DATE_FORMATTER.format(new Date(value));
}

/** UTC date used only for calendar arithmetic, after mapping into the display zone. */
export function activityCalendarDate(now = new Date()): Date {
  return new Date(`${activityDayKey(now)}T00:00:00Z`);
}

export function activityWindowStart(now = new Date()): Date {
  const today = activityCalendarDate(now);
  return new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth() - CALENDAR_MONTHS + 1,
      1,
    ) - VIETNAM_OFFSET_MS,
  );
}

export interface ActivityCell {
  date: string | null;
  active: boolean;
  today: boolean;
}

export interface ActivityHistory {
  cells: ActivityCell[];
  columns: number;
  months: { label: string; column: number }[];
  activeDates: string[];
}

/** Painted days come from real persisted events (attempts, saves) — not a complete learning history. */
export function activityHistory(
  activityDates: string[],
  now = new Date(),
): ActivityHistory {
  const today = activityCalendarDate(now);
  const start = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth() - CALENDAR_MONTHS + 1,
      1,
    ),
  );
  const monday = new Date(start);
  monday.setUTCDate(
    start.getUTCDate() - ((start.getUTCDay() + 6) % DAYS_PER_WEEK),
  );
  const elapsedDays =
    Math.round((today.getTime() - monday.getTime()) / DAY_MS) + 1;
  const columns = Math.ceil(elapsedDays / DAYS_PER_WEEK);
  const active = new Set(activityDates.map(activityDayKey));
  const cells: ActivityCell[] = [];
  const months: ActivityHistory["months"] = [];
  const todayKey = today.toISOString().slice(0, 10);
  for (let index = 0; index < columns * DAYS_PER_WEEK; index++) {
    const day = new Date(monday.getTime() + index * DAY_MS);
    const inRange = day >= start && day <= today;
    const date = inRange ? day.toISOString().slice(0, 10) : null;
    if (inRange && day.getUTCDate() === 1) {
      months.push({
        label: `Th${day.getUTCMonth() + 1}`,
        column: Math.floor(index / DAYS_PER_WEEK),
      });
    }
    cells.push({
      date,
      active: date != null && active.has(date),
      today: date === todayKey,
    });
  }
  return {
    cells,
    columns,
    months,
    activeDates: cells.filter((c) => c.active).map((c) => c.date!),
  };
}

export function ActivityGrid({ activity }: { activity: ActivityHistory }) {
  return (
    <div
      role="img"
      aria-label={`Lịch hoạt động ${activity.months.map((m) => m.label).join(" đến ")}: ${activity.activeDates.length ? `có hoạt động gần nhất vào ${activity.activeDates.join(", ")}` : "chưa có ngày hoạt động"}`}
    >
      <div
        aria-hidden
        className="relative mb-2 h-4 text-[10px] text-muted-foreground"
      >
        {activity.months.map((month) => (
          <span
            key={month.label}
            className="absolute"
            style={{ left: `${(month.column / activity.columns) * 100}%` }}
          >
            {month.label}
          </span>
        ))}
      </div>
      <div
        aria-hidden
        className="grid grid-flow-col grid-rows-7 gap-[3px]"
        style={{
          gridTemplateColumns: `repeat(${activity.columns}, minmax(0, 1fr))`,
        }}
      >
        {activity.cells.map((cell, index) => (
          <span
            key={cell.date ?? index}
            title={
              cell.date
                ? `${cell.date}: ${cell.active ? "Có hoạt động học tập" : "Chưa có hoạt động"}`
                : undefined
            }
            className={cn(
              "aspect-square rounded-[3px]",
              cell.date == null && "invisible",
              cell.active ? "bg-primary" : "bg-card",
              cell.today && "ring-1 ring-primary/60",
            )}
          />
        ))}
      </div>
    </div>
  );
}
