import { describe, expect, it } from "vitest";

import { YOUTUBE_VIDEO_ID_RE } from "@/lib/video/youtube-url";
import { catalogSchema, catalogVideoSchema } from "./schema";
import {
  CATALOG_VIDEOS,
  catalogTopics,
  getCatalog,
  LEVEL_LABELS,
  TOPIC_LABELS,
} from "./videos";

describe("catalog", () => {
  it("uses only valid 11-char YouTube ids, all unique", () => {
    const ids = CATALOG_VIDEOS.map((v) => v.id);
    for (const id of ids) {
      expect(YOUTUBE_VIDEO_ID_RE.test(id), id).toBe(true);
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps durations within 30–3600s", () => {
    for (const v of CATALOG_VIDEOS) {
      expect(v.durationSec, v.id).toBeGreaterThanOrEqual(30);
      expect(v.durationSec, v.id).toBeLessThanOrEqual(3600);
    }
  });

  it("spans at least 5 topics", () => {
    expect(catalogTopics().length).toBeGreaterThanOrEqual(5);
  });

  it("mixes at least 2 curator levels", () => {
    expect(
      new Set(CATALOG_VIDEOS.map((v) => v.level)).size,
    ).toBeGreaterThanOrEqual(2);
  });

  it("labels every topic and level actually used", () => {
    for (const v of CATALOG_VIDEOS) {
      expect(TOPIC_LABELS[v.topic], `topic ${v.topic}`).toBeTruthy();
      expect(LEVEL_LABELS[v.level], `level ${v.level}`).toBeTruthy();
    }
  });

  it("has non-empty title and channel on every entry", () => {
    for (const v of CATALOG_VIDEOS) {
      expect(v.title.trim(), v.id).not.toBe("");
      expect(v.channel.trim(), v.id).not.toBe("");
    }
  });

  it("records an ISO selection date on every entry", () => {
    for (const v of CATALOG_VIDEOS) {
      expect(v.addedAt, v.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(v.addedAt)), v.id).toBe(false);
    }
  });

  it("includes the three confirmed-caption anchor videos", () => {
    const ids = new Set(CATALOG_VIDEOS.map((v) => v.id));
    expect(ids.has("dQw4w9WgXcQ")).toBe(true); // Rick Astley
    expect(ids.has("UF8uR6Z6KLc")).toBe(true); // Steve Jobs Stanford
    expect(ids.has("8jPQjjsBbIc")).toBe(true); // TED stress talk
  });

  it("provides a separate Vietnamese meaning for every curated English title", () => {
    for (const video of getCatalog()) {
      expect(video.titleVi.trim(), video.id).not.toBe("");
      expect(video.titleVi, video.id).not.toBe(video.title);
    }
  });

  it("getCatalog returns the full catalog", () => {
    expect(getCatalog()).toEqual(CATALOG_VIDEOS);
    expect(getCatalog().length).toBeGreaterThanOrEqual(30);
  });
});

describe("catalogSchema", () => {
  const validEntry = {
    id: "dQw4w9WgXcQ",
    title: "Never Gonna Give You Up",
    titleVi: "Sẽ không bao giờ từ bỏ em",
    channel: "Rick Astley",
    topic: "music",
    level: "easy",
    durationSec: 213,
    captions: "manual",
    addedAt: "2026-10-06",
  };

  it("accepts a well-formed entry", () => {
    expect(catalogVideoSchema.safeParse(validEntry).success).toBe(true);
  });

  it("rejects malformed video ids", () => {
    for (const id of ["", "short", "not a video!", "dQw4w9WgXcQz"]) {
      const r = catalogVideoSchema.safeParse({ ...validEntry, id });
      expect(r.success, id).toBe(false);
    }
  });

  it("rejects out-of-range durations and unknown enum values", () => {
    expect(
      catalogVideoSchema.safeParse({ ...validEntry, durationSec: 10 }).success,
    ).toBe(false);
    expect(
      catalogVideoSchema.safeParse({ ...validEntry, topic: "cooking" }).success,
    ).toBe(false);
    expect(
      catalogVideoSchema.safeParse({ ...validEntry, level: "C1" }).success,
    ).toBe(false);
    expect(
      catalogVideoSchema.safeParse({ ...validEntry, captions: "auto" }).success,
    ).toBe(false);
    expect(
      catalogVideoSchema.safeParse({ ...validEntry, addedAt: "Oct 6" }).success,
    ).toBe(false);
  });

  it("rejects duplicate ids inside a catalog array", () => {
    const dup = Array.from({ length: 30 }, (_, i) => ({
      ...validEntry,
      // i=0 and i=29 share an id — the array must be rejected
      id:
        i === 29
          ? `abc${String(0).padStart(8, "0")}`
          : `abc${String(i).padStart(8, "0")}`,
    }));
    const r = catalogSchema.safeParse(dup);
    expect(r.success).toBe(false);
  });
});
