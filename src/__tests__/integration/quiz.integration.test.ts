/**
 * Integration tests: saveQuizResult()
 */

import { describe, it, expect, beforeEach } from "vitest";
import { adminClient, adminSql, testUserId } from "../setup-integration";

const getActions = () => import("@/app/actions/quiz");

const UNIT = "unit-a0-1";

async function cleanQuiz() {
  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
  // Owner SQL — quiz_results has no DELETE policy for authenticated
  await adminSql`
    delete from quiz_results
    where user_id = ${testUserId} and unit_id = ${UNIT} and quiz_date = ${today}
  `;
  await adminSql`
    update user_progress set total_xp = 0, streak = 0
    where user_id = ${testUserId}
  `;
}

describe("saveQuizResult()", () => {
  beforeEach(async () => {
    await cleanQuiz();
  });

  it("persists result and awards XP on first completion", async () => {
    const { saveQuizResult } = await getActions();

    const result = await saveQuizResult({
      unitId: UNIT,
      score: 8,
      total: 10,
    });

    expect(result.success).toBe(true);
    expect(result.xpEarned).toBe(15);

    const { data: row } = await adminClient
      .from("quiz_results")
      .select("score, pct, xp_earned")
      .eq("user_id", testUserId)
      .eq("unit_id", UNIT)
      .single();

    expect(row?.score).toBe(8);
    expect(row?.pct).toBe(80);
    expect(row?.xp_earned).toBe(15);

    const { data: progress } = await adminClient
      .from("user_progress")
      .select("total_xp")
      .eq("user_id", testUserId)
      .single();

    expect(progress!.total_xp).toBe(15);
  });

  it("improves score on retry and awards XP delta only", async () => {
    const { saveQuizResult } = await getActions();

    await saveQuizResult({ unitId: UNIT, score: 4, total: 10 });

    const { data: mid } = await adminClient
      .from("user_progress")
      .select("total_xp")
      .eq("user_id", testUserId)
      .single();

    expect(mid!.total_xp).toBe(5);

    const second = await saveQuizResult({ unitId: UNIT, score: 9, total: 10 });
    expect(second.success).toBe(true);
    expect(second.xpEarned).toBe(10);

    const { data: row } = await adminClient
      .from("quiz_results")
      .select("score, xp_earned")
      .eq("user_id", testUserId)
      .eq("unit_id", UNIT)
      .single();

    expect(row?.score).toBe(9);
    expect(row?.xp_earned).toBe(15);

    const { data: after } = await adminClient
      .from("user_progress")
      .select("total_xp")
      .eq("user_id", testUserId)
      .single();

    expect(after!.total_xp).toBe(mid!.total_xp + 10);
  });

  it("does not award XP when retry score is worse", async () => {
    const { saveQuizResult } = await getActions();

    await saveQuizResult({ unitId: UNIT, score: 9, total: 10 });

    const { data: mid } = await adminClient
      .from("user_progress")
      .select("total_xp")
      .eq("user_id", testUserId)
      .single();

    const second = await saveQuizResult({ unitId: UNIT, score: 3, total: 10 });
    expect(second.success).toBe(true);
    expect(second.alreadyRecorded).toBe(true);
    expect(second.xpEarned).toBe(0);

    const { data: after } = await adminClient
      .from("user_progress")
      .select("total_xp")
      .eq("user_id", testUserId)
      .single();

    expect(after!.total_xp).toBe(mid!.total_xp);
  });
});