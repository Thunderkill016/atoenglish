import { recordNếpPracticeAttempt } from "@/app/actions/learning-evidence";
import { firstMeetingLessonV1 } from "@/lib/nep/lesson-contract";
import type { NếpPracticeSubmission } from "@/lib/nep/practice-execution.v1";

/**
 * F4 trust-boundary tests. The server action must route evidence-bearing
 * writes through the trusted direct-DB path (record_learning_attempt_trusted)
 * with a server-verified user id, while attempt-only writes stay on the
 * caller-scoped Data API client. Caller-supplied evidence fields never reach
 * the database: the submission carries only observed interaction data and the
 * canonical contract recomputes everything else.
 */

const USER_ID = "00000000-0000-0000-0000-0000000000aa";

let currentUserId: string | null = USER_ID;
const userRpcCalls: Array<{ fn: string; args: Record<string, unknown> }> = [];
const trustedRpcCalls: Array<{ fn: string; args: Record<string, unknown> }> =
  [];
let trustedRpcError: { message: string } | null = null;

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "10.0.0.1" }),
}));

vi.mock("@/lib/security/rate-limit", () => ({
  createRateLimiter: () => ({ check: async () => ({ success: true }) }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({
        data: { user: currentUserId ? { id: currentUserId } : null },
        error: null,
      }),
    },
    rpc: async (fn: string, args: Record<string, unknown>) => {
      userRpcCalls.push({ fn, args });
      return { data: "attempt-data-api-id", error: null };
    },
  }),
}));

vi.mock("@/lib/supabase/service", () => ({
  rpcService: async (fn: string, args: Record<string, unknown>) => {
    trustedRpcCalls.push({ fn, args });
    if (trustedRpcError) return { data: null, error: trustedRpcError };
    return { data: "attempt-trusted-id", error: null };
  },
}));

function submission(
  actionId: string,
  response: string,
  overrides: Partial<NếpPracticeSubmission> = {},
): NếpPracticeSubmission {
  return {
    lessonId: firstMeetingLessonV1.id,
    lessonVersion: firstMeetingLessonV1.version,
    actionId,
    idempotencyKey: crypto.randomUUID(),
    response,
    responseSource: "speech",
    supportLevelUsed: 0,
    latencyMs: 1200,
    ...overrides,
  };
}

beforeEach(() => {
  currentUserId = USER_ID;
  userRpcCalls.length = 0;
  trustedRpcCalls.length = 0;
  trustedRpcError = null;
});

describe("recordNếpPracticeAttempt trust boundary", () => {
  it("routes evidence-bearing attempts through the trusted path with the server-verified user id", async () => {
    const result = await recordNếpPracticeAttempt(
      submission("produce", "my name is hoang"),
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.evidenceRecorded).toBe(true);
    expect(result.evidenceType).not.toBeNull();

    expect(trustedRpcCalls).toHaveLength(1);
    const call = trustedRpcCalls[0];
    expect(call.fn).toBe("record_learning_attempt_trusted");
    expect(call.args.p_user_id).toBe(USER_ID);
    expect(call.args.p_evidence_type).toBe("production");
    expect(call.args.p_response_modality).toBe("speech");
    // Oral observation travels as derived metadata, not a persisted transcript.
    const metadata = call.args.p_metadata as Record<string, unknown>;
    expect(metadata.responseSource).toBe("speech");
    expect(metadata.responseLength).toBeGreaterThan(0);
    expect(metadata.rawResponsePersisted).toBe(false);
    expect(call.args.p_response_text).toBeNull();
    // Evidence arguments are recomputed server-side, never caller fields.
    expect(typeof call.args.p_evidence_confidence).toBe("number");
    expect(call.args.p_evaluator).toBeTruthy();

    expect(userRpcCalls).toHaveLength(0);
  });

  it("keeps attempt-only writes on the Data API boundary", async () => {
    const result = await recordNếpPracticeAttempt(
      submission("retry", "my name is hoang"),
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.persisted).toBe(true);
    expect(result.evidenceRecorded).toBe(false);

    expect(trustedRpcCalls).toHaveLength(0);
    expect(userRpcCalls).toHaveLength(1);
    expect(userRpcCalls[0].fn).toBe("record_learning_attempt");
    expect(userRpcCalls[0].args.p_evidence_type).toBeNull();
    expect(userRpcCalls[0].args.p_evaluator).toBeNull();
  });

  it("does not persist anything for unauthenticated callers", async () => {
    currentUserId = null;
    const result = await recordNếpPracticeAttempt(
      submission("produce", "my name is hoang"),
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.persisted).toBe(false);
    expect(result.persistence).toBe("local-only");
    expect(trustedRpcCalls).toHaveLength(0);
    expect(userRpcCalls).toHaveLength(0);
  });

  it("preserves the immutable attempt when the trusted evidence write loses a transfer race", async () => {
    trustedRpcError = {
      message:
        "Transfer requires a changed context relative to prior successful production",
    };
    const result = await recordNếpPracticeAttempt(
      submission("transfer", "his name is tuan"),
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.persisted).toBe(true);
    expect(result.evidenceRecorded).toBe(false);
    expect(result.evidenceRejection).toContain("Transfer requires");
    expect(trustedRpcCalls).toHaveLength(1);
    expect(userRpcCalls).toHaveLength(1);
    expect(userRpcCalls[0].args.p_evidence_type).toBeNull();
  });

  it("never downgrades infrastructure failures on the trusted path", async () => {
    trustedRpcError = { message: "connection reset by peer" };
    const result = await recordNếpPracticeAttempt(
      submission("produce", "my name is hoang"),
    );

    expect(result.success).toBe(false);
    // The attempt is not silently rewritten through the untrusted path.
    expect(userRpcCalls).toHaveLength(0);
  });
});
