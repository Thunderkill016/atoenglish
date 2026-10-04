import { describe, expect, it } from "vitest";

import { greetCloseLessonV1 } from "@/lib/nep/bootstrap-lessons.v1";
import type { NếpPracticeSubmission } from "@/lib/nep/practice-execution.v1";
import type { ZeroPathSessionPersistence } from "@/lib/nep/zero-path-session-store.v1";
import {
  clearZeroPathSessionsForTests,
  getZeroPathSession,
  listOpenZeroPathSessions,
  persistSessionOutcome,
  startZeroPathSession,
} from "@/lib/nep/zero-path-session-store.v1";
import type {
  ZeroPathSessionInsert,
  ZeroPathSessionRow,
  ZeroPathSessionSubmissionInsert,
  ZeroPathSessionSubmissionRow,
} from "@/types/learning-tables";

const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";

function inMemoryPersistence() {
  const sessions = new Map<string, ZeroPathSessionRow>();
  const submissions = new Map<string, ZeroPathSessionSubmissionRow[]>();
  const persistence: ZeroPathSessionPersistence = {
    async insertSession(row: ZeroPathSessionInsert) {
      sessions.set(row.id, {
        status: "open",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...row,
      });
      return true;
    },
    async getSession(sessionId) {
      return sessions.get(sessionId) ?? null;
    },
    async listSubmissions(sessionId) {
      return submissions.get(sessionId) ?? [];
    },
    async insertSubmission(row: ZeroPathSessionSubmissionInsert) {
      const list = submissions.get(row.session_id) ?? [];
      if (list.some((item) => item.idempotency_key === row.idempotency_key))
        return true;
      list.push({
        id: list.length,
        created_at: new Date().toISOString(),
        ...row,
      } as ZeroPathSessionSubmissionRow);
      submissions.set(row.session_id, list);
      return true;
    },
    async listOwnedOpenSessions(userId) {
      return [...sessions.values()].filter(
        (row) => row.user_id === userId && row.status === "open",
      );
    },
  };
  return { persistence, sessions, submissions };
}

function submission(
  overrides: Partial<NếpPracticeSubmission> = {},
): NếpPracticeSubmission {
  return {
    lessonId: greetCloseLessonV1.id,
    lessonVersion: greetCloseLessonV1.version,
    actionId: greetCloseLessonV1.actions.find((a) => a.id === "retrieve")!.id,
    idempotencyKey: crypto.randomUUID(),
    response: "hi nice to meet you goodbye",
    responseSource: "text",
    supportLevelUsed: 0,
    latencyMs: 1200,
    ...overrides,
  };
}

const startArgs = {
  mode: "learn" as const,
  lessonId: greetCloseLessonV1.id,
  lessonVersion: greetCloseLessonV1.version,
};

describe("durable zero-path session store", () => {
  it("hydrates a runner from stored outcome snapshots after cache loss", async () => {
    clearZeroPathSessionsForTests();
    const { persistence } = inMemoryPersistence();
    const { sessionId } = await startZeroPathSession({
      ...startArgs,
      userId: USER_A,
      persistence,
    });

    const first = await getZeroPathSession(sessionId, USER_A, persistence);
    if (first.status !== "ok") throw new Error("session missing");
    const outcome = first.entry.runner.recordSubmission(submission());
    await persistSessionOutcome(
      first.entry,
      {
        actionId: "actionId" in outcome ? outcome.actionId : "",
        idempotencyKey: "k-1",
        outcome: outcome as never,
      },
      persistence,
    );

    // Simulate restart: cache cleared, durable rows remain.
    clearZeroPathSessionsForTests();
    const hydrated = await getZeroPathSession(sessionId, USER_A, persistence);
    if (hydrated.status !== "ok") throw new Error("session failed to hydrate");
    const model = hydrated.entry.runner.readModel();
    expect(model.submissions).toBe(1);
    expect(model.selfReports).toBe(0);
  });

  it("replays idempotent duplicate across restart without re-minting evidence", async () => {
    clearZeroPathSessionsForTests();
    const { persistence } = inMemoryPersistence();
    const { sessionId } = await startZeroPathSession({
      ...startArgs,
      userId: USER_A,
      persistence,
    });
    const sub = submission();
    const first = await getZeroPathSession(sessionId, USER_A, persistence);
    if (first.status !== "ok") throw new Error("session missing");
    const outcome = first.entry.runner.recordSubmission(sub);
    await persistSessionOutcome(
      first.entry,
      {
        actionId: "actionId" in outcome ? outcome.actionId : "",
        idempotencyKey: sub.idempotencyKey,
        outcome: outcome as never,
      },
      persistence,
    );

    clearZeroPathSessionsForTests();
    const hydrated = await getZeroPathSession(sessionId, USER_A, persistence);
    if (hydrated.status !== "ok") throw new Error("session failed to hydrate");
    const replay = hydrated.entry.runner.recordSubmission(sub);
    expect(replay.kind).toBe("duplicate");
    expect(hydrated.entry.runner.readModel().submissions).toBe(1);
  });

  it("enforces the ownership boundary — another user is forbidden, not absent", async () => {
    clearZeroPathSessionsForTests();
    const { persistence } = inMemoryPersistence();
    const { sessionId } = await startZeroPathSession({
      ...startArgs,
      userId: USER_A,
      persistence,
    });
    const lookup = await getZeroPathSession(sessionId, USER_B, persistence);
    expect(lookup.status).toBe("forbidden");
  });

  it("treats expired sessions as absent", async () => {
    clearZeroPathSessionsForTests();
    const { persistence, sessions } = inMemoryPersistence();
    const { sessionId } = await startZeroPathSession({
      ...startArgs,
      userId: USER_A,
      persistence,
    });
    const row = sessions.get(sessionId)!;
    sessions.set(sessionId, {
      ...row,
      expires_at: new Date(Date.now() - 1000).toISOString(),
    });
    clearZeroPathSessionsForTests();
    const lookup = await getZeroPathSession(sessionId, USER_A, persistence);
    expect(lookup.status).toBe("absent");
  });

  it("lists only the caller's open, unexpired sessions for the resume index", async () => {
    clearZeroPathSessionsForTests();
    const { persistence } = inMemoryPersistence();
    await startZeroPathSession({ ...startArgs, userId: USER_A, persistence });
    await startZeroPathSession({ ...startArgs, userId: USER_B, persistence });
    const rows = await listOpenZeroPathSessions(USER_A, persistence);
    expect(rows).toHaveLength(1);
    expect(rows[0].user_id).toBe(USER_A);
  });
});
