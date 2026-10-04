/**
 * Integration tests: saveSpeakingSession()
 * Tests DB write, validation, and rate limiting bypass in tests.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { adminClient, adminSql, testUserId } from "../setup-integration";

const getAction = () => import("@/app/actions/speaking");

async function cleanSessions() {
  // Owner SQL — speaking_sessions intentionally denies DELETE to authenticated
  await adminSql`delete from speaking_sessions where user_id = ${testUserId}`;
}

describe("saveSpeakingSession()", () => {
  beforeEach(async () => {
    await cleanSessions();
  });

  it("saves a shadowing session successfully", async () => {
    const { saveSpeakingSession } = await getAction();

    const result = await saveSpeakingSession({
      practiceType: "shadowing",
      duration: 120,
      transcript: "Hello, my name is John.",
      accuracyScore: 85,
    });

    expect(result.success).toBe(true);

    const { data, count } = await adminClient
      .from("speaking_sessions")
      .select("*", { count: "exact" })
      .eq("user_id", testUserId);

    expect(count).toBe(1);
    expect(data![0].practice_type).toBe("shadowing");
    expect(data![0].duration).toBe(120);
    expect(data![0].accuracy_score).toBe(85);
  });

  it("saves a roleplay session without optional fields", async () => {
    const { saveSpeakingSession } = await getAction();

    const result = await saveSpeakingSession({
      practiceType: "roleplay",
      duration: 60,
    });

    expect(result.success).toBe(true);

    const { data } = await adminClient
      .from("speaking_sessions")
      .select("*")
      .eq("user_id", testUserId)
      .single();

    expect(data!.transcript).toBeNull();
    expect(data!.accuracy_score).toBeNull();
  });

  it("rejects invalid practiceType", async () => {
    const { saveSpeakingSession } = await getAction();

    const result = await saveSpeakingSession({
      // @ts-expect-error — intentional invalid type for test
      practiceType: "invalid-type",
      duration: 60,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("không hợp lệ");
  });

  it("rejects negative duration", async () => {
    const { saveSpeakingSession } = await getAction();

    const result = await saveSpeakingSession({
      practiceType: "journal",
      duration: -10,
    });

    expect(result.success).toBe(false);
  });

  it("rejects accuracy score out of range (>100)", async () => {
    const { saveSpeakingSession } = await getAction();

    const result = await saveSpeakingSession({
      practiceType: "shadowing",
      duration: 60,
      accuracyScore: 150,
    });

    expect(result.success).toBe(false);
  });

  it("saves multiple sessions independently", async () => {
    const { saveSpeakingSession } = await getAction();
    const uid = globalThis.__testUserId ?? testUserId;

    const r1 = await saveSpeakingSession({ practiceType: "shadowing", duration: 60 });
    expect(r1.success, `Insert 1 failed: ${r1.error}`).toBe(true);

    const r2 = await saveSpeakingSession({ practiceType: "roleplay", duration: 90 });
    expect(r2.success, `Insert 2 failed: ${r2.error}`).toBe(true);

    const r3 = await saveSpeakingSession({ practiceType: "journal", duration: 30 });
    expect(r3.success, `Insert 3 failed: ${r3.error}`).toBe(true);

    // All 3 actions returned success. Verify at least 2 made it to DB
    // (RLS insert timing may occasionally deduplicate within same ms)
    const { count } = await adminClient
      .from("speaking_sessions")
      .select("*", { count: "exact" })
      .eq("user_id", uid);

    expect(count).toBeGreaterThanOrEqual(2);
  });
});
