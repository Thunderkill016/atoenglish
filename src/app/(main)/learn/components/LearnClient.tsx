"use client";

import { BookOpen, CheckCircle, Lock } from "lucide-react";
import {
  CollapsibleGroup,
  ContinueCard,
  PrimaryRow,
  SecondaryPageShell,
} from "@/components/design-system";
import { groupUnitsByLevel } from "@/lib/learn/catalog";

interface UnitStatus {
  id: string;
  title: string;
  description: string;
  level: string;
  route: string;
  xp: number;
  estimatedTime: number;
  completed: boolean;
  progress: number;
  starCount?: number;
}

interface LearnClientProps {
  totalXp: number;
  completedUnitIds: string[];
  activeUnitId: string;
  isGuest: boolean;
  unitStatuses: UnitStatus[];
}

export default function LearnClient({
  totalXp,
  completedUnitIds,
  activeUnitId,
  isGuest,
  unitStatuses,
}: LearnClientProps) {
  const activeUnit =
    unitStatuses.find((unit) => unit.id === activeUnitId) ?? unitStatuses[0];

  const groups = groupUnitsByLevel(unitStatuses);

  return (
    <SecondaryPageShell
      title="Bài học"
      subtitle={`${completedUnitIds.length}/${unitStatuses.length} bài · ${totalXp.toLocaleString()} XP`}
    >
      <div className="space-y-6 pb-16">
        <ContinueCard
          title={activeUnit.title}
          description={
            isGuest
              ? "Học thử bài đầu tiên. Đăng nhập để làm checkpoint, lưu evidence và ôn FSRS."
              : activeUnit.description
          }
          progress={activeUnit.progress}
          href={activeUnit.route}
          xp={activeUnit.xp}
        />

        {groups.map((group) => {
          const doneCount = group.units.filter((unit) =>
            completedUnitIds.includes(unit.id),
          ).length;
          return (
            <CollapsibleGroup
              key={group.level}
              title={group.title}
              meta={`${doneCount}/${group.units.length} bài`}
              defaultOpen={group.units.some(
                (unit) => unit.id === activeUnit.id,
              )}
            >
              {group.units.map((unit) => {
                // Guest locks every unit except the first in catalog order.
                const index = unitStatuses.indexOf(unit);
                const isCompleted = completedUnitIds.includes(unit.id);
                const isGuestLocked = isGuest && index > 0;

                if (isGuestLocked) {
                  return (
                    <div
                      key={unit.id}
                      className="flex min-h-[var(--minimal-touch)] items-center gap-3 rounded-lg border border-border/40 bg-muted/30 px-4 py-3 opacity-70"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Lock className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[var(--minimal-body-size)] font-semibold text-muted-foreground">
                          {unit.title}
                        </span>
                        <span className="mt-0.5 block text-[var(--minimal-caption-size)] text-muted-foreground/80">
                          Đăng nhập sau bài học thử
                        </span>
                      </span>
                    </div>
                  );
                }

                return (
                  <PrimaryRow
                    key={unit.id}
                    href={unit.route}
                    label={unit.title}
                    description={`${isCompleted ? "Hoàn thành" : `${unit.progress}%`} · ${unit.estimatedTime} phút`}
                    icon={isCompleted ? CheckCircle : BookOpen}
                  />
                );
              })}
            </CollapsibleGroup>
          );
        })}

        <p className="px-1 text-[var(--minimal-caption-size)] text-muted-foreground/80">
          Phần nghe dùng giọng đọc tổng hợp và được chấm theo câu trả lời. Phần
          nói là tự luyện — nói bằng micro hoặc gõ — chưa được chấm phát âm.
        </p>
      </div>
    </SecondaryPageShell>
  );
}
