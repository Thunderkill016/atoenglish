import { UNITS } from "@/lib/constants/units";
import type { VocabularyItem } from "@/lib/constants/vocabulary";

const UNIT_TITLE_PREFIX = /^(?:Bài|Unit)\s+[^:]+:\s*/u;

/**
 * Replace legacy vocabulary topic labels with the canonical title of the unit
 * currently shown across dashboard, roadmap and lesson surfaces.
 */
export function alignWordOfDayTopic(
  unitId: string,
  word: VocabularyItem | null | undefined,
): VocabularyItem | null {
  if (!word) return null;

  const canonicalTitle = UNITS.find((unit) => unit.id === unitId)?.title;
  if (!canonicalTitle) return word;

  return {
    ...word,
    topic: canonicalTitle.replace(UNIT_TITLE_PREFIX, ""),
  };
}
