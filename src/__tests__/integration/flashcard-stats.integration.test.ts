/**
 * Integration tests: recordFlashcardSession()
 * Tests streak logic, session counting, and DB writes.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { adminClient, adminSql, testUserId } from "../setup-integration";

const getAction = () => import("@/app/actions/flashcard-stats");

async function cleanStats() {
  // Owner SQL — consistent with RLS-denied deletes on sibling tables
  await adminSql`delete from user_flashcard_progress where user_id = ${testUserId}`;
}

describe("recordFlashcardSession()", () => {
  beforeEach(async () => {
    await cleanStats();
  });

  it("creates a new session record on first call", async () => {
    const { recordFlashcardSession } = await getAction();
    const result = await recordFlashcardSession(10);

    expect(result.success, `Action failed: ${result.error}`).toBe(true);

    const { data } = await adminClient
      .from("user_flashcard_progress")
      .select("*")
      .eq("user_id", testUserId)
      .single();

    expect(data).toBeTruthy();
    expect(data!.cards_reviewed_today).toBe(10);
    expect(data!.streak_days).toBe(1);
    expect(data!.total_cards_reviewed).toBe(10);
  });

  it("increments cards_reviewed_today on same-day second call", async () => {
    const { recordFlashcardSession } = await getAction();

    const r1 = await recordFlashcardSession(5);
    expect(r1.success, `First call failed: ${r1.error}`).toBe(true);

    const r2 = await recordFlashcardSession(8);
    expect(r2.success, `Second call failed: ${r2.error}`).toBe(true);

    const { data } = await adminClient
      .from("user_flashcard_progress")
      .select("cards_reviewed_today, total_cards_reviewed")
      .eq("user_id", testUserId)
      .single();

    expect(data!.cards_reviewed_today).toBe(13);
    expect(data!.total_cards_reviewed).toBe(13);
  });

  it("maintains streak of 1 for first session", async () => {
    const { recordFlashcardSession } = await getAction();
    const result = await recordFlashcardSession(5);
    expect(result.success, `Action failed: ${result.error}`).toBe(true);

    const { data } = await adminClient
      .from("user_flashcard_progress")
      .select("streak_days, best_streak")
      .eq("user_id", testUserId)
      .single();

    expect(data!.streak_days).toBe(1);
    expect(data!.best_streak).toBeGreaterThanOrEqual(1);
  });

  it("rejects when cardsReviewed is 0 or negative", async () => {
    const { recordFlashcardSession } = await getAction();
    const result = await recordFlashcardSession(0);
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("rejects negative cardsReviewed", async () => {
    const { recordFlashcardSession } = await getAction();
    const result = await recordFlashcardSession(-5);
    expect(result.success).toBe(false);
  });
});
