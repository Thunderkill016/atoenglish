/**
 * Zod contract for the curated `/discover` catalog (`videos.json`).
 *
 * The JSON file is the data; this schema is the gate — the catalog fails to
 * parse at import time if an entry violates any field contract, so a bad
 * row can never reach the page.
 */

import { z } from "zod";

import { YOUTUBE_VIDEO_ID_RE } from "@/lib/video/youtube-url";

export const CATALOG_TOPICS = [
  "ted",
  "music",
  "vlog",
  "news",
  "science",
  "explainer",
] as const;

export const CATALOG_LEVELS = ["easy", "medium", "hard"] as const;

export const CAPTION_KINDS = ["manual", "asr", "manual+vi"] as const;

export const catalogVideoSchema = z.object({
  /** YouTube video id, 11 chars. */
  id: z.string().regex(YOUTUBE_VIDEO_ID_RE),
  title: z.string().min(1),
  /** Vietnamese discovery gloss, authored in the catalog; not official YouTube metadata. */
  titleVi: z.string().min(1),
  channel: z.string().min(1),
  topic: z.enum(CATALOG_TOPICS),
  /** Curator judgement only — never a CEFR label. */
  level: z.enum(CATALOG_LEVELS),
  /** Verified duration in whole seconds, 30s–60min. */
  durationSec: z.int().min(30).max(3600),
  /** manual+vi = also has a Vietnamese caption track. */
  captions: z.enum(CAPTION_KINDS),
  /** YYYY-MM-DD — the date the curator selected this video into the catalog. */
  addedAt: z.iso.date(),
});

export const catalogSchema = z
  .array(catalogVideoSchema)
  .min(30)
  .refine((arr) => new Set(arr.map((v) => v.id)).size === arr.length, {
    message: "duplicate video id in catalog",
  });

export type CatalogTopic = (typeof CATALOG_TOPICS)[number];
export type CatalogLevel = (typeof CATALOG_LEVELS)[number];
export type CatalogVideo = z.infer<typeof catalogVideoSchema>;
