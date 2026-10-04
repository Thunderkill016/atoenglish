import { describe, expect, it } from "vitest";

import { PILOT_LESSON_SPECS } from "@/lib/lessons/pilot-lessons";
import {
  MISSION_BY_LESSON_ID,
  PILOT_MISSIONS,
} from "@/lib/missions/mission-catalog";
import {
  evaluateMissionTranscript,
  listDueTransferVariants,
} from "@/lib/missions/mission-evaluator";
import {
  createMissionSession,
  transitionMissionSession,
} from "@/lib/missions/mission-engine";
import {
  attemptRowToTransferEvidence,
  summarizeTransferEvidence,
} from "@/lib/missions/mission-progress";
import { validateMissionSpec } from "@/lib/missions/mission-spec";

const VALID_TRANSCRIPTS: Record<string, string[]> = {
  "unit-a0-1": [
    "Hi, I am Minh.",
    "I work as a designer at Ato.",
    "What is your name?",
    "Sorry, could you say that again?",
  ],
  "unit-a0-2": [
    "How much is this?",
    "I will take it.",
    "Can I pay by card?",
    "Could you say the price again?",
  ],
  "unit-a0-3": [
    "I am looking for a shirt.",
    "I need a blue shirt in medium.",
    "Do you have this in black?",
    "I will take this one.",
  ],
  "unit-a0-4": [
    "Good morning.",
    "I am fine, thanks. And you?",
    "Busy day today?",
    "See you later.",
  ],
  "unit-a0-5": [
    "My name is Minh.",
    "I am from Vietnam.",
    "I work as an engineer. I am staying at Central Hotel.",
    "Could you repeat the question?",
  ],
  "unit-a0-6": [
    "This is my family.",
    "This is my father. He is a doctor.",
    "This is my mother. She is a teacher. They live in Hanoi.",
    "Do you have any brothers or sisters?",
  ],
};

describe("pilot mission catalog", () => {
  it("converts all six A0 pilot lessons to bounded missions", () => {
    expect(PILOT_MISSIONS).toHaveLength(6);

    for (const mission of PILOT_MISSIONS) {
      expect(validateMissionSpec(mission)).toEqual([]);
      expect(mission.targetChunks.length).toBeGreaterThanOrEqual(4);
      expect(mission.targetChunks.length).toBeLessThanOrEqual(8);
      expect(mission.evaluation.maxCorrections).toBe(2);
      expect(mission.review.transferAfterDays).toEqual([1, 7, 30]);
      expect(mission.transferVariants).toHaveLength(3);
      expect(
        mission.transferVariants.every(
          (variant) => variant.partnerLines.length === mission.roleplayTurns.length,
        ),
      ).toBe(true);
    }
  });

  it("attaches each mission, can-do and checkpoint evidence to its lesson", () => {
    for (const mission of PILOT_MISSIONS) {
      const lesson = PILOT_LESSON_SPECS[mission.lessonId];
      expect(lesson.mission?.id).toBe(mission.id);
      expect(lesson.estimatedTime).toBe(mission.estimatedMinutes);
      expect(lesson.canDo).toEqual([mission.canDoVi]);
      expect(lesson.assessment.activityIds).toEqual([
        `${mission.lessonId}:mission:${mission.id}`,
      ]);
      expect(lesson.assessment.passThreshold).toBe(100);
    }
  });
});

describe("mission evaluator", () => {
  it("scores every reference roleplay without claiming acoustic evidence", () => {
    for (const mission of PILOT_MISSIONS) {
      const result = evaluateMissionTranscript(
        mission,
        VALID_TRANSCRIPTS[mission.lessonId],
      );

      expect(result.taskCompleted, mission.lessonId).toBe(true);
      expect(result.taskScore, mission.lessonId).toBe(100);
      expect(result.missingIntentIds, mission.lessonId).toEqual([]);
      expect(result.rubric.pronunciation).toBeNull();
      expect(result.rubric.comprehensibility).toBeNull();
      expect(result.evidence.acousticEvidenceAvailable).toBe(false);
    }
  });

  it("uses the expected intents for each roleplay turn", () => {
    const mission = MISSION_BY_LESSON_ID["unit-a0-2"];
    const result = evaluateMissionTranscript(mission, [
      "I will take it.",
      "How much is this?",
      "Could you say the price again?",
      "Can I pay by card?",
    ]);

    expect(result.taskCompleted).toBe(false);
    expect(result.completedIntentIds).toEqual([]);
  });

  it("limits content-driven feedback to two corrections", () => {
    const mission = MISSION_BY_LESSON_ID["unit-a0-3"];
    const result = evaluateMissionTranscript(mission, [
      "I am looking for shirt.",
      "I need a shirt blue.",
      "No.",
      "Okay.",
    ]);

    expect(result.taskCompleted).toBe(false);
    expect(result.corrections).toHaveLength(2);
    expect(result.retryRequired).toBe(true);
  });

  it("scores a full-task retry independently from the first attempt", () => {
    const mission = MISSION_BY_LESSON_ID["unit-a0-1"];
    const result = evaluateMissionTranscript(mission, [
      ...VALID_TRANSCRIPTS[mission.lessonId],
      "Hello.",
    ]);

    expect(result.taskCompleted).toBe(false);
    expect(result.taskScore).toBe(0);
    expect(result.completedIntentIds).toEqual([]);
  });
});

describe("mission state machine", () => {
  it("requires feedback and retry before transfer", () => {
    const mission = MISSION_BY_LESSON_ID["unit-a0-2"];
    let state = createMissionSession(mission);
    state = transitionMissionSession(mission, state, { type: "START" });
    state = transitionMissionSession(mission, state, { type: "MODEL_COMPLETE" });
    state = transitionMissionSession(mission, state, { type: "GUIDED_COMPLETE" });

    for (const transcript of ["Hello.", "Okay.", "Card.", "What?"]) {
      state = transitionMissionSession(mission, state, {
        type: "SUBMIT_TURN",
        transcript,
      });
    }

    const firstEvaluation = evaluateMissionTranscript(mission, state.transcripts);
    state = transitionMissionSession(mission, state, {
      type: "EVALUATE",
      result: firstEvaluation,
    });
    expect(state.stage).toBe("feedback");

    state = transitionMissionSession(mission, state, { type: "SHOW_FEEDBACK" });
    expect(state.stage).toBe("retry");

    state = transitionMissionSession(mission, state, {
      type: "SUBMIT_RETRY",
      transcript:
        "How much is this? I will take it. Can I pay by card? Could you say the price again?",
    });
    const retryEvaluation = evaluateMissionTranscript(mission, state.transcripts);
    state = transitionMissionSession(mission, state, {
      type: "RETRY_EVALUATED",
      result: retryEvaluation,
    });

    expect(state.stage).toBe("transfer");
    expect(state.evaluation?.taskCompleted).toBe(true);
    expect(state.attempts).toBe(2);
  });
});

describe("transfer scheduling and integrity", () => {
  const completedAt = new Date("2026-08-01T00:00:00.000Z");

  it("returns all due windows in chronological order", () => {
    const mission = MISSION_BY_LESSON_ID["unit-a0-1"];
    expect(
      listDueTransferVariants(
        mission,
        completedAt,
        new Date("2026-08-31T00:00:00.000Z"),
      ).map((variant) => variant.dueAfterDays),
    ).toEqual([1, 7, 30]);
  });

  it("uses the latest retry in one session rather than the best historical score", () => {
    const activityId = "unit-a0-1:transfer:transfer-day-1-cafe";
    const failedRetry = summarizeTransferEvidence(
      [
        {
          activity_id: activityId,
          session_id: "session-a",
          score: 100,
          created_at: "2026-08-02T08:00:00.000Z",
        },
        {
          activity_id: activityId,
          session_id: "session-a",
          score: 25,
          created_at: "2026-08-02T08:03:00.000Z",
        },
      ],
      activityId,
      100,
    );

    expect(failedRetry.verified).toBe(false);
    expect(failedRetry.retryScore).toBe(25);
  });

  it("does not combine attempts from different sessions", () => {
    const activityId = "unit-a0-1:transfer:transfer-day-1-cafe";
    const summary = summarizeTransferEvidence(
      [
        {
          activity_id: activityId,
          session_id: "old-session",
          score: 100,
          created_at: "2026-08-02T08:00:00.000Z",
        },
        {
          activity_id: activityId,
          session_id: "new-session",
          score: 100,
          created_at: "2026-08-03T08:00:00.000Z",
        },
      ],
      activityId,
      100,
    );

    expect(summary.sessionId).toBe("new-session");
    expect(summary.attemptCount).toBe(1);
    expect(summary.retryScore).toBeNull();
    expect(summary.verified).toBe(false);
  });
});

describe("attemptRowToTransferEvidence (canonical learning_attempts adapter)", () => {
  const row = {
    prompt_id: "unit-a0-1:transfer:transfer-day-1-cafe",
    session_id: "session-a",
    metadata: {
      compatibilitySource: "legacy-learning-attempt-v1",
      lessonId: "unit-a0-1",
      activityId: "unit-a0-1:transfer:transfer-day-1-cafe",
      legacyModality: "speaking",
      legacyStatus: "scored",
      legacyScore: 75,
      legacyErrorTags: [],
      legacyEvaluator: "transcript-intent",
      legacyEvaluatorVersion: "1.0.0",
    },
    created_at: "2026-08-02T08:00:00.000Z",
  };

  it("maps canonical columns back to the legacy evidence shape", () => {
    expect(attemptRowToTransferEvidence(row)).toEqual({
      activity_id: "unit-a0-1:transfer:transfer-day-1-cafe",
      session_id: "session-a",
      score: 75,
      created_at: "2026-08-02T08:00:00.000Z",
    });
  });

  it("rejects rows without prompt or session ids instead of fabricating evidence", () => {
    expect(attemptRowToTransferEvidence({ ...row, prompt_id: null })).toBeNull();
    expect(attemptRowToTransferEvidence({ ...row, session_id: null })).toBeNull();
  });

  it("falls back to a null score when metadata lacks legacyScore", () => {
    expect(
      attemptRowToTransferEvidence({ ...row, metadata: null })?.score,
    ).toBeNull();
  });
});
