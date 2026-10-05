import { describe, it, expect } from "vitest";
import {
  SECTION_ORDER,
  TOTAL_SECTIONS,
  getSectionPhase,
  LESSON_SECTIONS,
} from "@/lib/lessons/learning-flow";
import { combineEvidenceScores } from "@/lib/lessons/lesson-spec";
import { scoreTrialCheckpoint } from "@/lib/lessons/trial-checkpoint";

describe("learning-flow", () => {
  it("has 10 sections in evidence-based order (vocab before dialogue)", () => {
    expect(TOTAL_SECTIONS).toBe(10);
    const vocabIdx = SECTION_ORDER.indexOf(2);
    const dialogueIdx = SECTION_ORDER.indexOf(5);
    expect(vocabIdx).toBeGreaterThan(-1);
    expect(dialogueIdx).toBeGreaterThan(vocabIdx);
  });

  it("maps every section to an IPOR phase", () => {
    for (const s of LESSON_SECTIONS) {
      expect(["input", "processing", "output", "review"]).toContain(
        getSectionPhase(s.id),
      );
    }
  });

  it("ends with review phase (quiz)", () => {
    expect(getSectionPhase(SECTION_ORDER[SECTION_ORDER.length - 1])).toBe(
      "review",
    );
  });

  it("returns unscored when no assessment evidence exists", () => {
    const result = combineEvidenceScores([
      { id: "listening", score: null, weight: 0.3 },
      { id: "speaking", score: null, weight: 0.3 },
    ]);

    expect(result).toMatchObject({
      status: "unscored",
      score: null,
      source: "none",
    });
    expect(result.evidence).toEqual([]);
  });

  it("renormalizes weights instead of awarding missing evidence", () => {
    const result = combineEvidenceScores([
      { id: "listening", score: 80, weight: 0.3 },
      { id: "speaking", score: null, weight: 0.3 },
      { id: "quiz", score: 60, weight: 0.4 },
    ]);

    expect(result.status).toBe("scored");
    expect(result.score).toBe(69);
  });
});

describe("trial checkpoint", () => {
  it("requires evidence from every mission-aligned checkpoint question", () => {
    expect(
      scoreTrialCheckpoint({
        name: "My name is Lan.",
        role: "I work as a designer.",
        "ask-name": "What is your name?",
        repair: "Could you say that again?",
      }),
    ).toEqual({ correctCount: 4, passed: true });

    expect(
      scoreTrialCheckpoint({
        name: "My name is Lan.",
        role: "I work as a designer.",
        "ask-name": "What is your name?",
        repair: "Nice yesterday.",
      }),
    ).toEqual({ correctCount: 3, passed: false });
  });
});
