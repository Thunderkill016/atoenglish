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
  ZeroPathSessionRow,
  ZeroPathSessionSubmissionInsert,
  ZeroPathSessionSubmissionRow,
} from "@/types/learning-tables";

const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";

/**
 * In-memory mirror of the capability-RPC boundary: sessions carry a minted
 * secret; reads only return rows the caller proved access to (ownership for
 * user-bound rows, secret match for anonymous rows — same contract as the
 * zero_path_* SECURITY DEFINER functions).
 */
function inMemoryPersistence(
  opts: {
    callerUserId?: string | null;
    heldSecrets?: ReadonlyMap<string, string>;
  } = {},
) {
  const sessions = new Map<string, ZeroPathSessionRow>();
  const sessionSecrets = new Map<string, string>();
  const submissions = new Map<string, ZeroPathSessionSubmissionRow[]>();
  const callerUserId = opts.callerUserId ?? null;
  const heldSecrets = opts.heldSecrets ?? new Map<string, string>();

  const canAccess = (row: ZeroPathSessionRow) =>
    (row.user_id !== null && row.user_id === callerUserId) ||
    heldSecrets.get(row.id) === sessionSecrets.get(row.id);

  const persistence: ZeroPathSessionPersistence = {
    async openSession({ userId, lessonId, lessonVersion, mode }) {
      const sessionId = crypto.randomUUID();
      const accessSecret = `secret-${sessionId}`;
      sessions.set(sessionId, {
        id: sessionId,
        user_id: userId,
        lesson_id: lessonId,
        lesson_version: lessonVersion,
        mode,
        status: "open",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      });
      sessionSecrets.set(sessionId, accessSecret);
      return { sessionId, accessSecret };
    },
    async getSession(sessionId) {
      const row = sessions.get(sessionId);
      if (!row || !canAccess(row)) return null;
      return row;
    },
    async listSubmissions(sessionId) {
      const row = sessions.get(sessionId);
      if (!row || !canAccess(row)) return [];
      return submissions.get(sessionId) ?? [];
    },
    async insertSubmission(row: ZeroPathSessionSubmissionInsert) {
      const session = sessions.get(row.session_id);
      if (!session || !canAccess(session)) return false;
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
  return { persistence, sessions, sessionSecrets, submissions };
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
    const { persistence } = inMemoryPersistence({ callerUserId: USER_A });
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
    const { persistence } = inMemoryPersistence({ callerUserId: USER_A });
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
    const { persistence: writer } = inMemoryPersistence({
      callerUserId: USER_A,
    });
    const { sessionId } = await startZeroPathSession({
      ...startArgs,
      userId: USER_A,
      persistence: writer,
    });
    // USER_B's persistence only returns rows B proved access to; the shared
    // module-level entry cache still holds A's entry, so the store-level
    // capability check is what decides.
    const { persistence: reader } = inMemoryPersistence({
      callerUserId: USER_B,
    });
    const cached = await getZeroPathSession(sessionId, USER_B, reader);
    expect(cached.status).toBe("forbidden");
  });

  it("denies a guest session to a caller without the access secret", async () => {
    clearZeroPathSessionsForTests();
    const { persistence } = inMemoryPersistence({ callerUserId: null });
    const { sessionId } = await startZeroPathSession({
      ...startArgs,
      userId: null,
      persistence,
    });
    // Warm cache: guest session entry exists; a stranger presents no secret.
    const stranger = await getZeroPathSession(sessionId, null, persistence);
    expect(stranger.status).toBe("forbidden");
  });

  it("grants a guest session to the holder of the access secret", async () => {
    clearZeroPathSessionsForTests();
    const { persistence, sessionSecrets } = inMemoryPersistence({
      callerUserId: null,
    });
    const { sessionId, accessSecret } = await startZeroPathSession({
      ...startArgs,
      userId: null,
      persistence,
    });
    expect(accessSecret).not.toBeNull();
    const holder = await getZeroPathSession(
      sessionId,
      null,
      persistence,
      accessSecret,
    );
    expect(holder.status).toBe("ok");
    expect(sessionSecrets.get(sessionId)).toBe(accessSecret);
  });

  it("treats expired sessions as absent", async () => {
    clearZeroPathSessionsForTests();
    const { persistence, sessions } = inMemoryPersistence({
      callerUserId: USER_A,
    });
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
