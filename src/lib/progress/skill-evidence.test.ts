import { describe, expect, it } from "vitest";

import {
  bandEvidenceEstimate,
  BAND_LABELS,
  CHANNEL_LABELS,
  readSkillStateRow,
  type SkillStateRow,
} from "./skill-evidence";

const EMPTY_ROW: SkillStateRow = {
  target_id: "legacy.unit-1",
  recognition: 0,
  retrieval: 0,
  listening: 0,
  production: 0,
  repair: 0,
  transfer: 0,
  retention: 0,
  evidence_count: 0,
  last_evidence_at: null,
};

describe("bandEvidenceEstimate", () => {
  it("treats zero as unobserved — never as weakness", () => {
    expect(bandEvidenceEstimate(0)).toBe("unobserved");
    expect(bandEvidenceEstimate(Number.NaN)).toBe("unobserved");
    expect(bandEvidenceEstimate(-0.5)).toBe("unobserved");
  });

  it("bands observed estimates without claiming mastery", () => {
    expect(bandEvidenceEstimate(0.1)).toBe("new");
    expect(bandEvidenceEstimate(0.35)).toBe("forming");
    expect(bandEvidenceEstimate(0.7)).toBe("steady");
    expect(bandEvidenceEstimate(0.9)).toBe("steady");
  });
});

describe("readSkillStateRow", () => {
  it("returns no observed channels for an untouched learner", () => {
    const read = readSkillStateRow(EMPTY_ROW);
    expect(read.observedChannels).toEqual([]);
    expect(read.evidenceCount).toBe(0);
  });

  it("lists only channels with real evidence, strongest first", () => {
    const read = readSkillStateRow({
      ...EMPTY_ROW,
      recognition: 0.9,
      retrieval: 0.4,
      evidence_count: 7,
      last_evidence_at: "2026-10-04T00:00:00Z",
    });
    expect(read.observedChannels.map((c) => c.channel)).toEqual([
      "recognition",
      "retrieval",
    ]);
    expect(read.observedChannels[0]!.label).toBe(CHANNEL_LABELS.recognition);
    expect(read.observedChannels[0]!.bandLabel).toBe(BAND_LABELS.steady);
    expect(read.observedChannels[1]!.bandLabel).toBe(BAND_LABELS.forming);
  });

  it("never emits a band label that claims ability level", () => {
    const read = readSkillStateRow({ ...EMPTY_ROW, production: 0.99 });
    for (const channel of read.observedChannels) {
      // Labels describe evidence sufficiency — never "thành thạo", "A1",
      // "mastery" or a percentage that implies calibrated ability.
      expect(channel.bandLabel).not.toMatch(/thành thạo|A0|A1|A2|B1|B2|%/);
    }
  });
});
