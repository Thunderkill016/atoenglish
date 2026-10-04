'use client';

import { useMemo } from 'react';
import type { DayActivity } from '@/app/actions/stats';

interface ActivityHeatmapProps {
  days: DayActivity[];
  totalActiveDays: number;
  longestStreak: number;
}

const LEVEL_CLASSES = [
  'bg-zinc-800/60',            // 0 – no activity
  'bg-emerald-900/70',         // 1 – low
  'bg-emerald-700/80',         // 2 – medium
  'bg-emerald-500',            // 3 – high
  'bg-emerald-400',            // 4 – peak
] as const;

const MONTH_LABELS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
const DAY_LABELS   = ['', 'T2', '', 'T4', '', 'T6', ''];  // Mon, Wed, Fri only

export function ActivityHeatmap({ days, totalActiveDays, longestStreak }: ActivityHeatmapProps) {
  // Group days into weeks (columns), each col = 7 days Sun→Sat
  const { weeks, monthPositions } = useMemo(() => {
    const cols: DayActivity[][] = [];
    let col: DayActivity[] = [];
    // Pad start so first day aligns to its weekday (0=Sun)
    if (days.length > 0) {
      const firstDate = new Date(days[0].date + 'T12:00:00');
      const pad = firstDate.getDay(); // 0=Sun
      for (let p = 0; p < pad; p++) col.push({ date: '', xp: 0, level: 0 });
    }
    for (const day of days) {
      col.push(day);
      if (col.length === 7) { cols.push(col); col = []; }
    }
    if (col.length > 0) { while (col.length < 7) col.push({ date: '', xp: 0, level: 0 }); cols.push(col); }

    // Month label positions: find first column where month changes
    const positions: { label: string; col: number }[] = [];
    let lastMonth = -1;
    cols.forEach((week, ci) => {
      const first = week.find(d => d.date);
      if (!first) return;
      const m = new Date(first.date + 'T12:00:00').getMonth();
      if (m !== lastMonth) { positions.push({ label: MONTH_LABELS[m], col: ci }); lastMonth = m; }
    });

    return { weeks: cols, monthPositions: positions };
  }, [days]);

  const tooltip = (day: DayActivity) => {
    if (!day.date) return '';
    const d = new Date(day.date + 'T12:00:00');
    const fmt = d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' });
    return day.xp > 0 ? `${fmt}: ${day.xp} XP` : `${fmt}: Chưa học`;
  };

  return (
    <div className="rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/30 backdrop-blur-sm p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-xs text-foreground uppercase tracking-widest">Lịch hoạt động</h3>
          <p className="text-xs text-muted-foreground mt-0.5">52 tuần gần nhất</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span><span className="font-bold text-emerald-400">{totalActiveDays}</span> ngày học</span>
          <span><span className="font-bold text-orange-400">{longestStreak}</span> ngày liên tiếp kỷ lục</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Month labels row */}
          <div className="flex mb-1" style={{ paddingLeft: '28px' }}>
            {monthPositions.map(({ label, col }, i) => (
              <div
                key={i}
                className="text-xs text-muted-foreground font-semibold absolute"
                style={{ marginLeft: `${col * 13}px`, position: 'relative', minWidth: 0 }}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="flex gap-0.5">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {DAY_LABELS.map((lbl, i) => (
                <div key={i} className="h-[11px] text-xs text-muted-foreground/60 leading-[11px] w-5 text-right pr-0.5">
                  {lbl}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={tooltip(day)}
                    className={`w-[11px] h-[11px] rounded-[2px] transition-all duration-150 ${
                      day.date
                        ? `${LEVEL_CLASSES[day.level]} hover:ring-1 hover:ring-emerald-400/60 hover:scale-125 cursor-default`
                        : 'opacity-0'
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-2 justify-end">
            <span className="text-xs text-muted-foreground">Ít</span>
            {([0,1,2,3,4] as const).map(l => (
              <div key={l} className={`w-[11px] h-[11px] rounded-[2px] ${LEVEL_CLASSES[l]}`} />
            ))}
            <span className="text-xs text-muted-foreground">Nhiều</span>
          </div>
        </div>
      </div>
    </div>
  );
}
