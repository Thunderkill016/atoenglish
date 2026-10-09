/**
 * Curated video catalog for `/discover` (SPEC §10).
 *
 * Data lives in `videos.json`; `schema.ts` validates every entry at import
 * time. Each id was verified through the app's own caption fetch chain —
 * `npx tsx scripts/catalog-verify.ts` — before being listed. `level` is
 * curator judgement — never a CEFR/band label.
 */

import rawVideos from "./videos.json";
import {
  catalogSchema,
  type CatalogLevel,
  type CatalogTopic,
  type CatalogVideo,
} from "./schema";

export { CAPTION_KINDS, CATALOG_LEVELS, CATALOG_TOPICS } from "./schema";
export type { CatalogLevel, CatalogTopic, CatalogVideo };

export const CATALOG_VIDEOS: CatalogVideo[] = catalogSchema.parse(rawVideos);

/** The whole catalog. Order is curated display order, not alphabetical. */
export function getCatalog(): CatalogVideo[] {
  return CATALOG_VIDEOS;
}

/** Topics actually present in the catalog, in first-appearance order. */
export function catalogTopics(): CatalogTopic[] {
  return [...new Set(CATALOG_VIDEOS.map((v) => v.topic))];
}

/** Levels actually present in the catalog, easy → hard order. */
export function catalogLevels(): CatalogLevel[] {
  const order: CatalogLevel[] = ["easy", "medium", "hard"];
  return order.filter((l) => CATALOG_VIDEOS.some((v) => v.level === l));
}

/** Vietnamese UI labels — hand-written, keyed by catalog enum values. */
export const TOPIC_LABELS: Record<CatalogTopic, string> = {
  ted: "TED Talks",
  music: "Âm nhạc",
  vlog: "Vlog đời sống",
  news: "Tin tức",
  science: "Khoa học",
  explainer: "Giải thích",
};

export const LEVEL_LABELS: Record<CatalogLevel, string> = {
  easy: "Dễ",
  medium: "Vừa",
  hard: "Khó",
};

/** Caption-source labels for card badges / filter notes. */
export const CAPTION_LABELS: Record<CatalogVideo["captions"], string> = {
  manual: "Phụ đề tay",
  asr: "Phụ đề tự động",
  "manual+vi": "Phụ đề tay + tiếng Việt",
};
