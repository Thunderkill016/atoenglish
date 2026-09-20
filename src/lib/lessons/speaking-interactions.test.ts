import { describe, expect, it } from "vitest";

import { evaluateSpeakingTask } from "@/lib/lessons/speaking-task-evaluation";
import { getSpeakingInteraction } from "@/lib/lessons/speaking-interactions";

const successfulTurns = [
  "Hello! My name is Minh.",
  "M I N H.",
  "I don't understand. Can you say that again, please?",
  "I'm from Vietnam.",
  "Nice to meet you too.",
  "Good morning. My name is Minh. M I N H.",
];

describe("A0 English Life speaking interaction", () => {
  it("authors a changed-context transfer turn without a language hint", () => {
    const interaction = getSpeakingInteraction("unit-a0-1");
    const transferTurn = interaction?.turns.at(-1);

    expect(interaction).toBeDefined();
    expect(interaction?.title).toBe("Episode 1 · Meet Alex");
    expect(transferTurn).toMatchObject({
      speaker: "Receptionist",
      phase: "transfer",
    });
    expect(transferTurn).not.toHaveProperty("hint");
    expect(interaction?.transferCriteria).toHaveLength(3);
  });

  it("passes when the learner communicates every authored target including transfer", () => {
    const result = evaluateSpeakingTask(
      "unit-a0-1",
      successfulTurns.join(" "),
      successfulTurns
    );

    expect(result).toMatchObject({
      unitId: "unit-a0-1",
      accomplished: true,
      evidenceKind: "practice-task-feedback",
      transfer: {
        accomplished: true,
        metCount: 3,
        total: 3,
      },
    });
    expect(result?.metCount).toBe(result?.total);
  });

  it("does not let guided evidence hide a failed transfer turn", () => {
    const failedTransferTurns = [...successfulTurns];
    failedTransferTurns[5] = "Banana.";

    const result = evaluateSpeakingTask(
      "unit-a0-1",
      failedTransferTurns.join(" "),
      failedTransferTurns
    );

    expect(result?.criteria.every((criterion) => criterion.met)).toBe(true);
    expect(result?.transfer?.accomplished).toBe(false);
    expect(result?.transfer?.metCount).toBe(0);
    expect(result?.accomplished).toBe(false);
  });

  it("does not pass when the repair strategy is missing", () => {
    const missingRepairTurns = [...successfulTurns];
    missingRepairTurns[2] = "I'm a driver.";

    const result = evaluateSpeakingTask(
      "unit-a0-1",
      missingRepairTurns.join(" "),
      missingRepairTurns
    );

    expect(result?.accomplished).toBe(false);
    expect(result?.criteria.find((criterion) => criterion.id === "repair")?.met).toBe(false);
  });

  it("does not invent a rubric for an unauthored unit", () => {
    expect(evaluateSpeakingTask("unit-a0-99", "Hello")).toBeUndefined();
  });
});
