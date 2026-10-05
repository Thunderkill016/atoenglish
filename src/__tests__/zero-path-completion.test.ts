import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { completeZeroPathUnitSession } from "@/app/actions/zero-path";
import { compileLegacyUnitContract } from "@/lib/nep/legacy-unit-contract.v1";

/**
 * P1-4 trust-boundary tests: unit completion must be evidence-gated.
 *
 * `completeUnit` used to be a public server action — any authenticated client
 * could forge `user_lesson_progress` rows (and the derived `current_level`)
 * without submitting a single answer. Completion now flows only through
 * evidence paths; this session bridge additionally requires persisted
 * submissions for every action in the compiled contract.
 */

const USER_ID = "00000000-0000-0000-0000-0000000000aa";
const SESSION_ID = "00000000-0000-0000-0000-0000000000bb";
const OTHER_USER_ID = "00000000-0000-0000-0000-0000000000cc";

type SessionRowShape = {
  session_id: string;
  user_id: string;
  lesson_id: string;
  mode: "learn" | "review";
  status: "open" | "closed" | "expired";
  expires_at: string;
};

type SubmissionRowShape = {
  action_id: string;
  outcome_kind: string;
  outcome: Record<string, unknown>;
};

let sessionRow: SessionRowShape | null = null;
let submissionRows: SubmissionRowShape[] = [];
const completionCalls: Array<{ unitId: string; starCount: number }> = [];

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
    rpc: async (fn: string) => {
      if (fn === "zero_path_get_session") {
        return { data: sessionRow ? [sessionRow] : [], error: null };
      }
      if (fn === "zero_path_list_submissions") {
        return { data: submissionRows, error: null };
      }
      return { data: null, error: { message: `unmocked rpc ${fn}` } };
    },
  }),
}));

vi.mock("@/lib/progress/complete-unit", () => ({
  completeUnit: async (unitId: string, starCount: number) => {
    completionCalls.push({ unitId, starCount });
    return { success: true };
  },
}));

function learnSession(lessonId: string, userId = USER_ID): SessionRowShape {
  return {
    session_id: SESSION_ID,
    user_id: userId,
    lesson_id: lessonId,
    mode: "learn",
    status: "open",
    expires_at: new Date(Date.now() + 60_000).toISOString(),
  };
}

function fullCoverageSubmissions(
  actionIds: readonly string[],
  successRate = 1,
): SubmissionRowShape[] {
  return actionIds.map((actionId, index) => ({
    action_id: actionId,
    outcome_kind: "evidence",
    outcome: {
      evaluation: { success: index < actionIds.length * successRate },
    },
  }));
}

describe("completeZeroPathUnitSession", () => {
  beforeEach(() => {
    sessionRow = null;
    submissionRows = [];
    completionCalls.length = 0;
  });

  it("rejects completion for a mission lesson (checkpoint path only)", async () => {
    const contract = compileLegacyUnitContract("unit-a0-1");
    expect(contract).toBeNull();
    sessionRow = learnSession("legacy.unit-a0-1");

    const result = await completeZeroPathUnitSession(SESSION_ID, "unit-a0-1");

    expect(result.success).toBe(false);
    expect(completionCalls).toHaveLength(0);
  });

  it("rejects completion when the session has unanswered actions", async () => {
    const contract = compileLegacyUnitContract("unit-1");
    expect(contract).not.toBeNull();
    sessionRow = learnSession(contract!.id);
    // Forge attempt: open a session, submit nothing, claim completion.
    submissionRows = [];

    const result = await completeZeroPathUnitSession(SESSION_ID, "unit-1");

    expect(result.success).toBe(false);
    expect(result.error).toContain("chưa hoàn thành");
    expect(completionCalls).toHaveLength(0);
  });

  it("rejects completion when only some actions were submitted", async () => {
    const contract = compileLegacyUnitContract("unit-1")!;
    sessionRow = learnSession(contract.id);
    const allButLast = contract.actions.slice(0, -1).map((a) => a.id);
    submissionRows = fullCoverageSubmissions(allButLast);

    const result = await completeZeroPathUnitSession(SESSION_ID, "unit-1");

    expect(result.success).toBe(false);
    expect(completionCalls).toHaveLength(0);
  });

  it("completes with derived stars once every action is submitted", async () => {
    const contract = compileLegacyUnitContract("unit-1")!;
    sessionRow = learnSession(contract.id);
    submissionRows = fullCoverageSubmissions(
      contract.actions.map((a) => a.id),
      1,
    );

    const result = await completeZeroPathUnitSession(SESSION_ID, "unit-1");

    expect(result.success).toBe(true);
    expect(completionCalls).toEqual([{ unitId: "unit-1", starCount: 3 }]);
  });

  it("derives fewer stars from evaluated failures instead of client claims", async () => {
    const contract = compileLegacyUnitContract("unit-1")!;
    sessionRow = learnSession(contract.id);
    const actionIds = contract.actions.map((a) => a.id);
    // All submitted, ~half of the evaluated outcomes succeed → 2 stars max.
    submissionRows = fullCoverageSubmissions(actionIds, 0.5);

    const result = await completeZeroPathUnitSession(SESSION_ID, "unit-1");

    expect(result.success).toBe(true);
    expect(completionCalls[0]?.unitId).toBe("unit-1");
    expect(completionCalls[0]?.starCount).toBeLessThanOrEqual(2);
  });

  it("rejects sessions owned by another learner", async () => {
    const contract = compileLegacyUnitContract("unit-1")!;
    sessionRow = learnSession(contract.id, OTHER_USER_ID);
    submissionRows = fullCoverageSubmissions(contract.actions.map((a) => a.id));

    const result = await completeZeroPathUnitSession(SESSION_ID, "unit-1");

    expect(result.success).toBe(false);
    expect(completionCalls).toHaveLength(0);
  });

  it("skips review-mode sessions without awarding completion", async () => {
    const contract = compileLegacyUnitContract("unit-1")!;
    sessionRow = { ...learnSession(contract.id), mode: "review" };

    const result = await completeZeroPathUnitSession(SESSION_ID, "unit-1");

    expect(result.success).toBe(true);
    expect(completionCalls).toHaveLength(0);
  });
});

describe("completion action surface", () => {
  it("exposes no server-action endpoint that writes unit completion", () => {
    const actionsDir = resolve(__dirname, "../app/actions");
    const offenders: string[] = [];
    for (const file of readdirSync(actionsDir)) {
      if (!file.endsWith(".ts")) continue;
      const source = readFileSync(resolve(actionsDir, file), "utf8");
      if (!/^\s*["']use server["']/m.test(source)) continue;
      if (/export\s+async\s+function\s+completeUnit\b/.test(source)) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });
});
