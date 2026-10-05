import type { Metadata } from "next";
import { BookOpen, Layers, Mic } from "lucide-react";

import { getDailyActivity, getProgressStats } from "@/app/actions/stats";
import {
  SecondaryPageShell,
  StatLine,
  ListSection,
  EmptyState,
} from "@/components/design-system";
import { ActivityHeatmap } from "@/components/progress/ActivityHeatmap";
import { createClient } from "@/lib/supabase/server";
import {
  readSkillStateRow,
  type SkillStateRow,
} from "@/lib/progress/skill-evidence";
import { legacyUnitEntry } from "@/lib/lessons/legacy-unit-registry";
import { LEGACY_CONTRACT_ID_PREFIX } from "@/lib/nep/legacy-unit-contract.v1";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tiến Độ Học Tập | AtoEnglish",
  description:
    "Theo dõi bài đã hoàn thành, hoạt động học, SRS và luyện nói tiếng Anh.",
  robots: { index: false },
};

function skillTargetLabel(targetId: string): string {
  if (targetId.startsWith(LEGACY_CONTRACT_ID_PREFIX)) {
    const slug = targetId.slice(LEGACY_CONTRACT_ID_PREFIX.length);
    return legacyUnitEntry(slug)?.data.title ?? targetId;
  }
  return targetId;
}

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [statsRes, activityRes, skillStatesRes] = await Promise.all([
    getProgressStats(),
    getDailyActivity(),
    user
      ? supabase
          .from("learner_skill_states")
          .select(
            "target_id, recognition, retrieval, listening, production, repair, transfer, retention, evidence_count, last_evidence_at",
          )
          .eq("user_id", user.id)
          .order("last_evidence_at", { ascending: false })
          .limit(20)
      : Promise.resolve({ data: null }),
  ]);

  const stats = statsRes.stats ?? {
    totalXp: 0,
    streak: 0,
    bestStreak: 0,
    currentLevel: "A1",
    placementCompletedAt: null as string | null,
    totalCards: 0,
    cardsByState: { new: 0, learning: 0, review: 0, relearning: 0 },
    completedUnits: 0,
    totalSpeakingSessions: 0,
    streakFreezeCount: 0,
  };
  const placementDone = Boolean(stats.placementCompletedAt);

  const skillEvidence = ((skillStatesRes.data ?? []) as SkillStateRow[]).map(
    (row) => ({
      read: readSkillStateRow(row),
      label: skillTargetLabel(row.target_id),
    }),
  );

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
  const totalSrs = Math.max(
    srsStates.reduce((sum, state) => sum + state.count, 0),
    1,
  );

  return (
    <SecondaryPageShell
      title="Tiến độ học"
      subtitle={`${stats.completedUnits} bài đã hoàn thành${placementDone ? ` · Trình độ đầu vào ${stats.currentLevel}` : ""}`}
    >
      <div className="space-y-5 pb-16 sm:space-y-8">
        {stats.completedUnits === 0 &&
          stats.totalCards === 0 &&
          (stats.totalSpeakingSessions ?? 0) === 0 && (
            <EmptyState
              icon={BookOpen}
              title="Chưa có dữ liệu học tập"
              description="Số liệu tiến độ sẽ xuất hiện ở đây sau buổi học đầu tiên — bài hoàn thành, từ vựng SRS và buổi luyện nói."
              actionLabel="Học bài đầu tiên"
              actionHref="/learn"
            />
          )}
        <ListSection title="Tổng quan">
          <div className="rounded-xl border border-border/60 bg-card px-4">
            {placementDone ? (
              <StatLine
                label="Trình độ đầu vào"
                value={stats.currentLevel}
                caption="Từ bài kiểm tra đầu vào — không phải thước đo tiến độ"
              />
            ) : null}
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

        {skillEvidence.length > 0 ? (
          <ListSection title="Bằng chứng kỹ năng">
            <p className="px-1 pb-1 text-[var(--minimal-caption-size)] text-muted-foreground leading-relaxed">
              Ghi nhận từ các lượt trả lời được chấm — đây là tín hiệu quan sát,
              không phải điểm thành tích.
            </p>
            {skillEvidence.map(({ read, label }) => (
              <div
                key={read.targetId}
                className="rounded-xl border border-border/60 bg-card px-4 py-3"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[var(--minimal-body-size)] font-semibold text-foreground">
                    {label}
                  </p>
                  <span className="shrink-0 text-[var(--minimal-caption-size)] text-muted-foreground">
                    {read.evidenceCount} lần quan sát
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {read.observedChannels.map((channel) => (
                    <span
                      key={channel.channel}
                      title={channel.bandLabel}
                      className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                    >
                      {channel.label} · {channel.bandLabel}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </ListSection>
        ) : null}

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-border/60 bg-white/60 p-5 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-black text-foreground">
                  Hoàn thành nội dung
                </h2>
                <p className="text-xs text-muted-foreground">
                  Theo dõi bài học thay vì điểm thưởng.
                </p>
              </div>
            </div>
            <p className="text-3xl font-black text-foreground">
              {stats.completedUnits}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              bài đã hoàn thành
            </p>
          </section>

          <section className="rounded-3xl border border-border/60 bg-white/60 p-5 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mic className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-black text-foreground">
                  Luyện nói
                </h2>
                <p className="text-xs text-muted-foreground">
                  Số buổi đã thực hành đầu ra bằng tiếng Anh.
                </p>
              </div>
            </div>
            <p className="text-3xl font-black text-foreground">
              {stats.totalSpeakingSessions ?? 0}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">buổi luyện nói</p>
          </section>
        </div>

        <section className="rounded-3xl border border-border/60 bg-white/60 p-5 sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-black text-foreground">
                Trạng thái SRS
              </h2>
              <p className="text-xs text-muted-foreground">
                Phân bố từ vựng theo trạng thái ôn tập.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {srsStates.map((state) => {
              const pct = Math.round((state.count / totalSrs) * 100);
              return (
                <div key={state.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-foreground">{state.name}</span>
                    <span className="font-mono text-muted-foreground">
                      {state.count}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
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
