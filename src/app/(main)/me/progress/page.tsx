import type { Metadata } from "next";
import { BookOpen, Layers, Mic } from "lucide-react";

import { getDailyActivity, getProgressStats } from "@/app/actions/stats";
import { SecondaryPageShell, StatLine, ListSection } from "@/components/design-system";
import { ActivityHeatmap } from "@/components/progress/ActivityHeatmap";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tiến Độ Học Tập | AtoEnglish",
  description: "Theo dõi bài đã hoàn thành, hoạt động học, SRS và luyện nói tiếng Anh.",
  robots: { index: false },
};

export default async function ProgressPage() {
  const [statsRes, activityRes] = await Promise.all([
    getProgressStats(),
    getDailyActivity(),
  ]);

  const stats = statsRes.stats ?? {
    totalXp: 0,
    streak: 0,
    bestStreak: 0,
    currentLevel: "A1",
    totalCards: 0,
    cardsByState: { new: 0, learning: 0, review: 0, relearning: 0 },
    completedUnits: 0,
    totalSpeakingSessions: 0,
    streakFreezeCount: 0,
  };

  const activityDays = activityRes.days ?? [];
  const totalActiveDays = activityDays.filter((day) => day.xp > 0).length;

  let longestStudyRun = 0;
  let currentRun = 0;
  for (const day of activityDays) {
    if (day.xp > 0) {
      currentRun += 1;
      longestStudyRun = Math.max(longestStudyRun, currentRun);
    } else {
      currentRun = 0;
    }
  }

  const srsStates = [
    { name: "Mới", count: stats.cardsByState.new },
    { name: "Đang học", count: stats.cardsByState.learning },
    { name: "Đang ôn", count: stats.cardsByState.review },
    { name: "Học lại", count: stats.cardsByState.relearning },
  ];
  const totalSrs = Math.max(srsStates.reduce((sum, state) => sum + state.count, 0), 1);

  return (
    <SecondaryPageShell
      title="Tiến độ học"
      subtitle={`Trình độ ${stats.currentLevel} · ${stats.completedUnits} bài đã hoàn thành`}
    >
      <div className="space-y-5 pb-16 sm:space-y-8">
        <ListSection title="Tổng quan">
          <div className="rounded-xl border border-border/60 bg-card px-4">
            <StatLine
              label="Trình độ hiện tại"
              value={stats.currentLevel}
              caption="Mức học hiện đang được sử dụng"
            />
            <StatLine
              label="Bài đã hoàn thành"
              value={`${stats.completedUnits} bài`}
              caption="Nội dung đã hoàn thành trong khoá học"
            />
            <StatLine
              label="Từ vựng SRS"
              value={`${stats.totalCards} từ`}
              caption={`${stats.cardsByState.review} từ đang đến chu kỳ ôn`}
            />
            <StatLine
              label="Luyện nói"
              value={`${stats.totalSpeakingSessions ?? 0} buổi`}
              caption="Shadowing, roleplay và nhật ký nói"
            />
          </div>
        </ListSection>

        <ActivityHeatmap
          days={activityDays}
          totalActiveDays={totalActiveDays}
          longestStreak={longestStudyRun}
        />

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-zinc-200/60 bg-white/60 p-5 dark:border-zinc-800/60 dark:bg-zinc-900/30 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <BookOpen className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-black text-foreground">Hoàn thành nội dung</h2>
                <p className="text-xs text-muted-foreground">Theo dõi bài học thay vì điểm thưởng.</p>
              </div>
            </div>
            <p className="text-3xl font-black text-foreground">{stats.completedUnits}</p>
            <p className="mt-1 text-xs text-muted-foreground">bài đã hoàn thành</p>
          </section>

          <section className="rounded-3xl border border-zinc-200/60 bg-white/60 p-5 dark:border-zinc-800/60 dark:bg-zinc-900/30 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                <Mic className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-black text-foreground">Luyện nói</h2>
                <p className="text-xs text-muted-foreground">Số buổi đã thực hành đầu ra bằng tiếng Anh.</p>
              </div>
            </div>
            <p className="text-3xl font-black text-foreground">{stats.totalSpeakingSessions ?? 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">buổi luyện nói</p>
          </section>
        </div>

        <section className="rounded-3xl border border-zinc-200/60 bg-white/60 p-5 dark:border-zinc-800/60 dark:bg-zinc-900/30 sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Layers className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-black text-foreground">Trạng thái SRS</h2>
              <p className="text-xs text-muted-foreground">Phân bố từ vựng theo trạng thái ôn tập.</p>
            </div>
          </div>

          <div className="space-y-4">
            {srsStates.map((state) => {
              const pct = Math.round((state.count / totalSrs) * 100);
              return (
                <div key={state.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-foreground">{state.name}</span>
                    <span className="font-mono text-muted-foreground">{state.count}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </SecondaryPageShell>
  );
}
