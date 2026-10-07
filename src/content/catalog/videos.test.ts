import { describe, expect, it } from "vitest";

import { YOUTUBE_VIDEO_ID_RE } from "@/lib/video/youtube-url";
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

  it("spans at least 4 topics", () => {
    expect(catalogTopics().length).toBeGreaterThanOrEqual(4);
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
    expect(getCatalog().length).toBeGreaterThanOrEqual(15);
  });
});
