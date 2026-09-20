import { describe, expect, it } from "vitest";
import { evaluateSpeakingTask } from "@/lib/lessons/speaking-task-evaluation";

describe("CEFR-aligned speaking task feedback", () => {
  it("accepts a successful Unit 1 interaction even when it does not copy the lesson hint", () => {
    const result = evaluateSpeakingTask(
      "unit-1",
      "Hi Alex. I'm Hoang. I work in Ho Chi Minh City. How are you? See you later."
    );

    expect(result).toMatchObject({
      unitId: "unit-1",
      accomplished: true,
      metCount: 5,
      total: 5,
      evidenceKind: "practice-task-feedback",
    });
  });

  it("does not pass a fluent-looking sentence that misses the interaction task", () => {
    const result = evaluateSpeakingTask(
      "unit-1",
      "Hello. My name is Hoang. I'm from Vietnam."
    );

    expect(result?.accomplished).toBe(false);
    expect(result?.criteria.find((criterion) => criterion.id === "interaction")?.met).toBe(false);
    expect(result?.criteria.find((criterion) => criterion.id === "closing")?.met).toBe(false);
  });

  it("does not pretend unsupported units have a task rubric", () => {
    expect(evaluateSpeakingTask("unit-2", "Hello there")).toBeUndefined();
  });
});
