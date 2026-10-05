/**
 * Integration tests: completeUnit()
 * Tests XP award, idempotency, and DB writes.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { adminClient, adminSql, testUserId } from "../setup-integration";

const getAction = () => import("@/lib/progress/complete-unit");

async function cleanProgress() {
  // Owner SQL — user_lesson_progress has no DELETE policy for authenticated
  await adminSql`delete from user_lesson_progress where user_id = ${testUserId}`;

  const today = new Date().toISOString().split("T")[0];

  await adminSql`
    update user_progress set
      total_xp = 0,
      streak = 0,
      current_level = 'A0',
      starting_unit_index = 0,
      placement_completed_at = null,
      last_active_date = ${today}
    where user_id = ${testUserId}
  `;
}

describe("completeUnit()", () => {
  beforeEach(async () => {
    await cleanProgress();
  });

  it("adds XP when completing a unit for the first time", async () => {
    const { completeUnit } = await getAction();

    const { data: before } = await adminClient
      .from("user_progress")
      .select("total_xp")
      .eq("user_id", testUserId)
      .single();

    const xpBefore = before?.total_xp ?? 0;

    const result = await completeUnit("unit-1");
    expect(result.success, "error" in result ? result.error : "").toBe(true);
    expect(result.alreadyCompleted).not.toBe(true);

    const { data: after } = await adminClient
      .from("user_progress")
      .select("total_xp")
      .eq("user_id", testUserId)
      .single();

    expect(after!.total_xp).toBeGreaterThan(xpBefore);
  });

  it("is idempotent — completing same unit twice does not award XP twice", async () => {
    const { completeUnit } = await getAction();
    const uid = globalThis.__testUserId ?? testUserId;

    const xp = async () => {
      const { data } = await adminClient
        .from("user_progress")
        .select("total_xp")
        .eq("user_id", uid)
        .single();
      return data?.total_xp ?? 0;
    };

    const xpBefore = await xp();

    // First completion — must award XP
    await completeUnit("unit-2");
    const xpAfterFirst = await xp();
    expect(xpAfterFirst).toBeGreaterThan(xpBefore);

    // Second completion of SAME unit — must NOT award more XP
    await completeUnit("unit-2");
    const xpAfterSecond = await xp();

    // Key invariant: XP frozen after duplicate completion
    expect(xpAfterSecond).toBe(xpAfterFirst);
  });

  it("creates a user_lesson_progress record", async () => {
    const { completeUnit } = await getAction();
    await completeUnit("unit-3");

    const { data, count } = await adminClient
      .from("user_lesson_progress")
      .select("*", { count: "exact" })
      .eq("user_id", testUserId)
      .eq("unit_id", "unit-3");

    expect(count).toBe(1);
    expect(data![0].unit_id).toBe("unit-3");
  });

  it("rejects invalid unitId (SQL injection attempt)", async () => {
    const { completeUnit } = await getAction();
    const result = await completeUnit("'; DROP TABLE user_progress; --");
    expect(result.success).toBe(false);
  });

  it("rejects empty unitId", async () => {
    const { completeUnit } = await getAction();
    const result = await completeUnit("");
    expect(result.success).toBe(false);
  });
});

async function cleanOnboardingProfile() {
  // Owner SQL — user_onboarding_profile has no DELETE policy for authenticated
  await adminSql`delete from user_onboarding_profile where user_id = ${testUserId}`;
}

describe("user_onboarding_profile (RLS + columns)", () => {
  beforeEach(async () => {
    await cleanOnboardingProfile();
  });

  it("allows authenticated user to insert own profile row; columns goal/obstacle/daily_minutes persist", async () => {
    const client = (globalThis as any).__testSupabaseClient;
    expect(client).toBeDefined();

    const payload = {
      user_id: testUserId,
      goal: "work",
      obstacle: "fear",
      daily_minutes: 15,
    };

    const { error: insErr } = await client
      .from("user_onboarding_profile")
      .insert(payload);
    expect(
      insErr,
      insErr?.message || "insert should succeed under RLS own",
    ).toBeNull();

    const { data, error: selErr } = await adminClient
      .from("user_onboarding_profile")
      .select("goal, obstacle, daily_minutes, user_id")
      .eq("user_id", testUserId)
      .single();

    expect(selErr).toBeNull();
    expect(data).toMatchObject(payload);
  });

  it("RLS prevents insert of profile for other user_id (auth.uid != user_id)", async () => {
    const client = (globalThis as any).__testSupabaseClient;
    const fakeOtherId = "00000000-0000-0000-0000-000000000000";

    const { error: insErr } = await client
      .from("user_onboarding_profile")
      .insert({
        user_id: fakeOtherId,
        goal: "work",
        obstacle: "fear",
        daily_minutes: 15,
      });

    // Expect policy error (or no success); 42501 is insufficient_privilege in PG
    if (insErr) {
      expect(String(insErr.code || insErr.message)).toMatch(
        /42501|permission|policy|RLS|violates/i,
      );
    }

    const { count } = await adminClient
      .from("user_onboarding_profile")
      .select("*", { count: "exact", head: true })
      .eq("user_id", fakeOtherId);

    expect(count).toBe(0);
  });
});
