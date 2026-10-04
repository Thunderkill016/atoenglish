import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UNITS } from "@/lib/constants/units";
import CheckpointClient from "./CheckpointClient";

interface Props {
  params: Promise<{ phase: string }>;
}

// Phase definitions: which CEFR levels each phase covers.
// Only `trial` is live — CEFR checkpoints (a0–b2) are removed until real
// item banks exist (blueprint Phase 1 decision); they previously ran as
// self-checks that never persisted evidence.
const PHASE_CONFIG: Record<
  string,
  {
    label: string;
    levels: string[];
    nextPhase: string | null;
    description: string;
  }
> = {
  trial: {
    label: "Sau Bài Học Thử",
    levels: ["A0"],
    nextPhase: null,
    description:
      "Ba câu kiểm tra nhanh trước khi ghi nhận kết quả bài A0 đầu tiên",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { phase } = await params;
  const cfg = PHASE_CONFIG[phase];
  if (!cfg) return { title: "Checkpoint | AtoEnglish" };
  return {
    title: `Kiểm Tra ${cfg.label} | AtoEnglish`,
    description: cfg.description,
    robots: { index: false },
  };
}

export default async function CheckpointPage({ params }: Props) {
  const { phase } = await params;
  const cfg = PHASE_CONFIG[phase];

  if (!cfg) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get completed units for this phase
  const phaseUnits =
    phase === "trial"
      ? UNITS.filter((unit) => unit.id === "unit-a0-1")
      : UNITS.filter((unit) => cfg.levels.includes(unit.level));
  const phaseUnitIds = phaseUnits.map((u) => u.id);

  const { data: completedRows } = await supabase
    .from("user_lesson_progress")
    .select("unit_id")
    .eq("user_id", user.id)
    .in("unit_id", phaseUnitIds);

  const completedUnitIds = new Set((completedRows ?? []).map((r) => r.unit_id));
  const completedCount = completedUnitIds.size;
  const totalCount = phaseUnitIds.length;
  const isUnlocked = phase === "trial" || completedCount === totalCount;

  return (
    <CheckpointClient
      phase={phase}
      phaseLabel={cfg.label}
      description={cfg.description}
      levels={cfg.levels}
      completedCount={completedCount}
      totalCount={totalCount}
      isUnlocked={isUnlocked}
      nextPhase={cfg.nextPhase}
      unitIds={phaseUnitIds}
    />
  );
}
