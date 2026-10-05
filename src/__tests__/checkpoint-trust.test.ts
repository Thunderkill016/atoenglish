import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { claimMissionCheckpoint } from "@/app/actions/mission-checkpoint";
import {
  TRIAL_CHECKPOINT_PASS_THRESHOLD,
  TRIAL_CHECKPOINT_QUESTIONS,
  scoreTrialCheckpoint,
} from "@/lib/lessons/trial-checkpoint";
import { UNIT_A0_1_CHECKPOINT } from "@/lib/missions/checkpoint-banks";
import { PILOT_MISSIONS } from "@/lib/missions/mission-catalog";
import { toLearnerMission } from "@/lib/missions/mission-spec";

/**
 * P2-1 checkpoint trust tests.
 *
 * The audit found three diverging checkpoint definitions for unit-a0-1 and
 * answer keys shipping inside the client bundle. These tests pin the single
 * authored bank, the trial/mission/DB parity, the learner-safe view model,
 * and the post-submit reveal semantics of `claimMissionCheckpoint`.
 */

const USER_ID = "00000000-0000-4000-8000-0000000000aa";
const SESSION_ID = "123e4567-e89b-42d3-a456-426614174000";

let trustedResult: Record<string, unknown> = {};
let rpcCalls: Array<{ name: string; args: Record<string, unknown> }> = [];
let recordedAttempts: Array<Record<string, unknown>> = [];
let seedCalls = 0;

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "10.0.0.1" }),
  cookies: async () => ({ get: () => undefined, set: () => {} }),
}));

vi.mock("@/lib/security/rate-limit", () => ({
  createRateLimiter: () => ({ check: async () => ({ success: true }) }),
  getClientIpFromHeaders: () => "10.0.0.1",
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({
        data: { user: { id: USER_ID } },
        error: null,
      }),
    },
    rpc: async (name: string, args: Record<string, unknown>) => {
      rpcCalls.push({ name, args });
      return { data: trustedResult, error: null };
    },
  }),
}));

vi.mock("@/app/actions/learning-attempts", () => ({
  recordLearningAttempts: async (input: { attempts: unknown[] }) => {
    recordedAttempts = input.attempts as Array<Record<string, unknown>>;
    return { success: true };
  },
}));

vi.mock("@/app/actions/cards", () => ({
  seedUnitVocabToSRS: async () => {
    seedCalls += 1;
    return { success: true, added: 6 };
  },
}));

function checkpointAnswers(
  questions: ReadonlyArray<{ id: string; answer: string }>,
  correctCount: number,
): Record<string, string> {
  return Object.fromEntries(
    questions.map((question, index) => [
      question.id,
      index < correctCount ? question.answer : "wrong answer",
    ]),
  );
}

beforeEach(() => {
  trustedResult = {};
  rpcCalls = [];
  recordedAttempts = [];
  seedCalls = 0;
});

describe("canonical checkpoint bank", () => {
  it("is the exact object the A0-1 mission embeds — no drift possible", () => {
    const mission = PILOT_MISSIONS.find(
      (entry) => entry.lessonId === "unit-a0-1",
    );
    expect(mission?.checkpoint).toBe(UNIT_A0_1_CHECKPOINT);
  });

  it("drives the trial checkpoint with identical ids, answers and threshold", () => {
    expect(TRIAL_CHECKPOINT_QUESTIONS).toHaveLength(
      UNIT_A0_1_CHECKPOINT.questions.length,
    );
    expect(TRIAL_CHECKPOINT_PASS_THRESHOLD).toBe(
      UNIT_A0_1_CHECKPOINT.passThreshold,
    );
    for (const [index, question] of UNIT_A0_1_CHECKPOINT.questions.entries()) {
      const trial = TRIAL_CHECKPOINT_QUESTIONS[index];
      expect(trial.id).toBe(question.id);
      expect(trial.options).toEqual(question.options);
      expect(trial.answer).toBe(question.answer);
      expect(trial.explanation).toBe(question.explanationVi);
    }
  });

  it("keeps the database's trusted answer keys in parity with every mission", () => {
    const migration = readFileSync(
      resolve(
        process.cwd(),
        "supabase/migrations/20260907054500_harden_unit_completion_trust_boundary.sql",
      ),
      "utf8",
    );
    const seedRows = new Map<
      string,
      { threshold: number; answers: Record<string, string> }
    >();
    const rowPattern =
      /\('(unit-a0-\d)',\s*(\d+),\s*'(\{[^']*(?:''[^']*)*\})'::jsonb\)/g;
    for (const match of migration.matchAll(rowPattern)) {
      seedRows.set(match[1], {
        threshold: Number(match[2]),
        answers: JSON.parse(match[3].replaceAll("''", "'")) as Record<
          string,
          string
        >,
      });
    }

    for (const mission of PILOT_MISSIONS) {
      const seed = seedRows.get(mission.lessonId);
      expect(
        seed,
        `no trusted checkpoint definition seeded for ${mission.lessonId}`,
      ).toBeDefined();
      expect(seed!.threshold).toBe(mission.checkpoint.passThreshold);
      expect(seed!.answers).toEqual(
        Object.fromEntries(
          mission.checkpoint.questions.map((question) => [
            question.id,
            question.answer,
          ]),
        ),
      );
    }
  });
});

describe("learner-safe mission view", () => {
  it("strips the checkpoint answer key before a mission reaches the client", () => {
    const mission = PILOT_MISSIONS.find(
      (entry) => entry.lessonId === "unit-a0-1",
    )!;
    const learner = toLearnerMission(mission);

    expect("checkpoint" in learner).toBe(false);
    expect(learner.id).toBe(mission.id);
    expect(learner.roleplayTurns).toEqual(mission.roleplayTurns);
    // Bundle-leak proxy: checkpoint explanations are checkpoint-only
    // content (answer strings legitimately reappear inside intent
    // examples/matchers — that is learning content, not the key field).
    const serialized = JSON.stringify(learner);
    for (const question of mission.checkpoint.questions) {
      expect(serialized).not.toContain(question.explanationVi);
    }
  });
});

describe("scoreTrialCheckpoint", () => {
  it("passes at the shared threshold and fails below it", () => {
    const passing = scoreTrialCheckpoint(
      checkpointAnswers(
        UNIT_A0_1_CHECKPOINT.questions,
        UNIT_A0_1_CHECKPOINT.passThreshold,
      ),
    );
    expect(passing.passed).toBe(true);

    const failing = scoreTrialCheckpoint(
      checkpointAnswers(
        UNIT_A0_1_CHECKPOINT.questions,
        UNIT_A0_1_CHECKPOINT.passThreshold - 1,
      ),
    );
    expect(failing.passed).toBe(false);
    expect(failing.correctCount).toBe(UNIT_A0_1_CHECKPOINT.passThreshold - 1);
  });
});

describe("claimMissionCheckpoint", () => {
  const lessonId = "unit-a0-1";
  const questions = UNIT_A0_1_CHECKPOINT.questions;

  it("rejects incomplete answer sets without recording or grading", async () => {
    const result = await claimMissionCheckpoint({
      sessionId: SESSION_ID,
      lessonId,
      answers: { [questions[0].id]: questions[0].answer },
    });

    expect(result.success).toBe(false);
    expect(recordedAttempts).toHaveLength(0);
    expect(rpcCalls).toHaveLength(0);
  });

  it("rejects unknown lesson ids", async () => {
    const result = await claimMissionCheckpoint({
      sessionId: SESSION_ID,
      lessonId: "unit-b2-99",
      answers: {},
    });

    expect(result.success).toBe(false);
    expect(recordedAttempts).toHaveLength(0);
  });

  it("records deterministic per-question attempts recomputed server-side", async () => {
    const answers = checkpointAnswers(questions, questions.length);
    trustedResult = {
      success: true,
      passed: true,
      correct_count: questions.length,
      total_count: questions.length,
      mastery_recorded: true,
    };

    const result = await claimMissionCheckpoint({
      sessionId: SESSION_ID,
      lessonId,
      answers: { ...answers, [questions[1].id]: "wrong answer" },
    });

    expect(result.success).toBe(true);
    expect(recordedAttempts).toHaveLength(questions.length);
    const byId = new Map(
      recordedAttempts.map((attempt) => [
        (attempt.activityId as string).split(":").pop(),
        attempt,
      ]),
    );
    expect(byId.get(questions[0].id)?.score).toBe(100);
    expect(byId.get(questions[1].id)?.score).toBe(0);
    expect(byId.get(questions[1].id)?.errorTags).toEqual(["answer_mismatch"]);
  });

  it("withholds the answer key when the trusted claim fails", async () => {
    trustedResult = {
      success: true,
      passed: false,
      correct_count: 1,
      total_count: questions.length,
      mastery_recorded: false,
    };

    const result = await claimMissionCheckpoint({
      sessionId: SESSION_ID,
      lessonId,
      answers: checkpointAnswers(questions, 1),
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.passed).toBe(false);
    expect(result.masteryRecorded).toBe(false);
    expect(result.reviewTargetsAdded).toBe(0);
    expect(seedCalls).toBe(0);
    for (const item of result.review ?? []) {
      expect(item.correctAnswer).toBeNull();
      expect(item.explanationVi).toBeNull();
    }
    expect(result.review?.[0]?.correct).toBe(true);
    expect(result.review?.[1]?.correct).toBe(false);
  });

  it("returns the canonical answer key only after a passed claim", async () => {
    trustedResult = {
      success: true,
      passed: true,
      correct_count: questions.length,
      total_count: questions.length,
      mastery_recorded: true,
    };

    const result = await claimMissionCheckpoint({
      sessionId: SESSION_ID,
      lessonId,
      answers: checkpointAnswers(questions, questions.length),
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.passed).toBe(true);
    expect(result.reviewTargetsAdded).toBe(6);
    expect(result.review).toHaveLength(questions.length);
    for (const [index, item] of (result.review ?? []).entries()) {
      expect(item.correct).toBe(true);
      expect(item.correctAnswer).toBe(questions[index].answer);
      expect(item.explanationVi).toBe(questions[index].explanationVi);
    }
    // The trusted RPC — not the client — decided pass/mastery.
    expect(rpcCalls[0]?.name).toBe("claim_unit_checkpoint_transaction");
    expect(rpcCalls[0]?.args.p_unit_id).toBe(lessonId);
  });
});
