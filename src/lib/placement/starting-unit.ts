import { UNITS } from "@/lib/constants/units";

export type PlacementCefrLevel = "A0" | "A1" | "A2" | "B1" | "B2";

export const PLACEMENT_CEFR_LEVELS: PlacementCefrLevel[] = [
  "A0",
  "A1",
  "A2",
  "B1",
  "B2",
];

/** First curriculum index for each CEFR band (matches UNITS[] order). */
const LEVEL_START_INDEX: Record<PlacementCefrLevel, number> = {
  A0: 0,
  A1: UNITS.findIndex((u) => u.level === "A1"),
  A2: UNITS.findIndex((u) => u.level === "A2"),
  B1: UNITS.findIndex((u) => u.level === "B1"),
  B2: UNITS.findIndex((u) => u.level === "B2"),
};

export function normalizePlacementLevel(level: string): PlacementCefrLevel | null {
  const upper = level.toUpperCase() as PlacementCefrLevel;
  return PLACEMENT_CEFR_LEVELS.includes(upper) ? upper : null;
}

export function getStartingUnitIndex(level: string): number {
  const normalized = normalizePlacementLevel(level);
  if (!normalized) return 0;
  const index = LEVEL_START_INDEX[normalized];
  return index >= 0 ? index : 0;
}

export function getStartingUnitSlug(level: string): string {
  const index = getStartingUnitIndex(level);
  return UNITS[index]?.id ?? "unit-a0-1";
}

/** Default: full lesson. Pass mini=true only for explicit review shortcut. */
export function getPlacementLearnPath(level: string, mini = false): string {
  const slug = getStartingUnitSlug(level);
  return mini ? `/learn/${slug}?mini=1` : `/learn/${slug}`;
}

/** Next incomplete unit respecting placement entry point (used by getCurrentUnit for ContinueCard + roadmap). */
export function getNextUnitFromProgress(
  completedUnitIds: string[],
  startingUnitIndex = 0,
) {
  const fromPlacement = UNITS.find(
    (u, i) => i >= startingUnitIndex && !completedUnitIds.includes(u.id),
  );
  if (fromPlacement) return fromPlacement;

  return UNITS.find((u) => !completedUnitIds.includes(u.id));
}

export function getNextUnitRoute(
  completedUnitIds: string[],
  startingUnitIndex = 0,
): string {
  return getNextUnitFromProgress(completedUnitIds, startingUnitIndex)?.route ?? "/learn";
}

/** Units at or before the placement entry point are accessible without prior completion. */
export function isUnitUnlocked(
  index: number,
  startingUnitIndex: number,
  completedUnitIds: string[],
  unitIds: string[],
): boolean {
  if (index <= startingUnitIndex) return true;
  const prevId = unitIds[index - 1];
  if (!prevId) return true;
  if (index - 1 < startingUnitIndex) return true;
  return completedUnitIds.includes(prevId);
}

/** Skipped via placement — optional review, not required for progression. */
export function isPlacedOutUnit(
  index: number,
  startingUnitIndex: number,
  completedUnitIds: string[],
): boolean {
  return index < startingUnitIndex && !completedUnitIds.includes(UNITS[index]?.id ?? "");
}

export const PLACEMENT_LEVEL_OPTIONS: Array<{
  level: PlacementCefrLevel;
  emoji: string;
  title: string;
  description: string;
  startLabel: string;
}> = [
  {
    level: "A0",
    emoji: "🌱",
    title: "Mất gốc",
    description: "Chưa biết hoặc mới học — bắt đầu từ bảng chữ cái",
    startLabel: "Unit A0-1",
  },
  {
    level: "A1",
    emoji: "📚",
    title: "Cơ bản",
    description: "Biết từ vựng đơn giản, chưa nói trôi chảy",
    startLabel: "Unit 1 — Chào hỏi & Giới thiệu",
  },
  {
    level: "A2",
    emoji: "💬",
    title: "Sơ trung cấp",
    description: "Giao tiếp được nhưng phản xạ còn chậm",
    startLabel: "Unit 13 — Past Experiences",
  },
  {
    level: "B1",
    emoji: "🎯",
    title: "Trung cấp",
    description: "Tự tin hội thoại, cần nâng business English",
    startLabel: "Unit 19 — Stories & Narratives",
  },
  {
    level: "B2",
    emoji: "🚀",
    title: "Khá",
    description: "Nói trôi chảy, muốn polish & chuyên ngành",
    startLabel: "Unit 33 — Imagining & Hypothesizing",
  },
];