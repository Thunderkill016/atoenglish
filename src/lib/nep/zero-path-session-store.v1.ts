/**
 * Durable session boundary for zero-path sessions.
 *
 * Layered design:
 *   1. A durable store (zero_path_sessions + zero_path_session_submissions)
 *      holds session identity plus per-submission outcome snapshots — the
 *      pilot's only durable session state.
 *   2. An in-memory runner cache keyed by session id avoids rebuilding the
 *      runner on every request.
 *
 * On a cache miss the store loads the session row and its stored outcome
 * rows, then rehydrates a runner via createZeroPathSession({restored}) — the
 * "durable snapshot" path. Nothing is re-evaluated or re-certified on load;
 * restored records are plain data and projection inputs only.
 *
 * Stored outcome rows deliberately exclude raw learner response strings —
 * only evaluated outcomes and reference evidence fields are persisted.
 */
import crypto from "node:crypto";

import type { ReferenceCoreEvidence } from "@/lib/core/certified-evidence";
import type { ZeroPathClaimId } from "@/lib/nep/core-evidence-wiring.v1";
import type { SessionSubmissionOutcome } from "@/lib/nep/session-runner.v1";
import { createZeroPathSession } from "@/lib/nep/session-runner.v1";
import type {
  ZeroPathSessionRow,
  ZeroPathSessionSubmissionInsert,
  ZeroPathSessionSubmissionRow,
} from "@/types/learning-tables";

export type ZeroPathSessionMode = "learn" | "review";

type StoredOutcome = Exclude<SessionSubmissionOutcome, { kind: "duplicate" }>;

export type SessionEntry = {
  readonly sessionId: string;
  readonly userId: string | null;
  /**
   * Plaintext capability secret for anonymous (user_id NULL) sessions. The
   * database stores only a bcrypt hash; the plaintext lives here for the
   * process cache and in the caller's HttpOnly cookie — holder-of-secret is
   * the guest authorization boundary.
   */
  readonly accessSecret: string | null;
  readonly mode: ZeroPathSessionMode;
  readonly runner: ReturnType<typeof createZeroPathSession>;
  nextSeq: number;
  touchedAt: number;
};

/**
 * Narrow persistence interface — the actions layer injects the real
 * capability-RPC implementation; tests inject in-memory fakes. Every method
 * returns explicit failure states rather than throwing so a storage outage
 * degrades the session to memory-only instead of killing it.
 *
 * All methods operate through the zero_path_* SECURITY DEFINER functions:
 * callers must hold either row ownership (auth.uid()) or the session's
 * access secret. The secret is resolved by the persistence implementation —
 * the store only threads it through for the in-memory owner check.
 */
export type ZeroPathSessionPersistence = {
  openSession(args: {
    /** Present for interface/test fidelity — the real RPC derives the owner
     *  from auth.uid() and ignores caller-supplied identity entirely. */
    userId: string | null;
    lessonId: string;
    lessonVersion: number;
    mode: ZeroPathSessionMode;
  }): Promise<{ sessionId: string; accessSecret: string } | null>;
  getSession(sessionId: string): Promise<ZeroPathSessionRow | null>;
  listSubmissions(
    sessionId: string,
  ): Promise<readonly ZeroPathSessionSubmissionRow[]>;
  insertSubmission(row: ZeroPathSessionSubmissionInsert): Promise<boolean>;
  listOwnedOpenSessions(userId: string): Promise<readonly ZeroPathSessionRow[]>;
};

const entries = new Map<string, SessionEntry>();
const MAX_ENTRIES = 2000;
const SESSION_TTL_MS = 1000 * 60 * 60 * 4; // 4h — mirrors learning_attempts.session_id grouping

export type ZeroPathSessionLookup =
  | { readonly status: "ok"; readonly entry: SessionEntry }
  | { readonly status: "forbidden" }
  | { readonly status: "absent" };

export type StartSessionArgs = {
  readonly mode: ZeroPathSessionMode;
  readonly userId: string | null;
  readonly lessonId: string;
  readonly lessonVersion: number;
  readonly persistence: ZeroPathSessionPersistence | null;
  readonly sessionId?: string;
};

export async function startZeroPathSession(args: StartSessionArgs): Promise<{
  sessionId: string;
  mode: ZeroPathSessionMode;
  accessSecret: string | null;
}> {
  // The durable boundary mints the session id + capability secret atomically;
  // persistence.openSession is the only way a session becomes shared state.
  // Without persistence the session stays isolate-local — memory-only mode
  // gets a random id with no durable capability attached.
  let sessionId = args.sessionId ?? crypto.randomUUID();
  let accessSecret: string | null = null;
  if (args.persistence) {
    // Durable mirror is best-effort: a failed insert degrades this session to
    // memory-only (pre-durability behaviour) rather than failing the learner.
    const opened = await args.persistence.openSession({
      userId: args.userId,
      lessonId: args.lessonId,
      lessonVersion: args.lessonVersion,
      mode: args.mode,
    });
    if (opened) {
      sessionId = opened.sessionId;
      accessSecret = opened.accessSecret;
    }
  }
  const entry: SessionEntry = {
    sessionId,
    userId: args.userId,
    accessSecret,
    mode: args.mode,
    runner: createZeroPathSession({ sessionId }),
    nextSeq: 0,
    touchedAt: Date.now(),
  };
  entries.set(entry.sessionId, entry);
  pruneEntries();
  return { sessionId: entry.sessionId, mode: entry.mode, accessSecret };
}

/**
 * Resolve a session for a submission. Checks the runner cache first; on a
 * miss, loads + rehydrates from the durable store. `userId` is the caller's
 * authenticated id (null for anonymous); `accessSecret` is the per-session
 * capability presented via cookie. A session is usable iff:
 *   - it is owner-bound (user_id set) and the caller IS that owner, or
 *   - it is anonymous (user_id null) and the caller presents the access
 *     secret minted at session creation.
 * Returns:
 *   - "ok"        — session is usable
 *   - "forbidden" — session exists but the caller cannot prove access
 *   - "absent"    — unknown or expired id
 */
export async function getZeroPathSession(
  sessionId: string,
  callerUserId: string | null,
  persistence: ZeroPathSessionPersistence | null,
  accessSecret: string | null = null,
): Promise<ZeroPathSessionLookup> {
  const cached = entries.get(sessionId);
  if (cached) {
    cached.touchedAt = Date.now();
    if (
      !canAccess(cached.userId, cached.accessSecret, callerUserId, accessSecret)
    )
      return { status: "forbidden" };
    return { status: "ok", entry: cached };
  }
  if (!persistence) return { status: "absent" };
  // The capability RPC only returns rows the caller proved access to
  // (ownership or secret). A missing row deliberately collapses "does not
  // exist" and "access denied" into one "absent" — probing for existence
  // must not be possible.
  const row = await persistence.getSession(sessionId);
  if (
    !row ||
    row.status !== "open" ||
    new Date(row.expires_at).getTime() <= Date.now()
  ) {
    return { status: "absent" };
  }
  const restored = await buildRestoredEntry(row, persistence, accessSecret);
  if (!restored) return { status: "absent" };
  entries.set(sessionId, restored);
  pruneEntries();
  return { status: "ok", entry: restored };
}

/**
 * Write-through: persist the outcome snapshot after the runner has produced
 * it. Called by the actions layer — the runner itself stays storage-free.
 */
export async function persistSessionOutcome(
  entry: SessionEntry,
  args: { actionId: string; idempotencyKey: string; outcome: StoredOutcome },
  persistence: ZeroPathSessionPersistence | null,
): Promise<void> {
  if (!persistence) return;
  // The outcome snapshot stores the full evaluated outcome — including the
  // minted evidence record on "evidence" outcomes. Brand symbols are not
  // enumerable, so JSON serialization naturally keeps only the data fields.
  const stored = await persistence.insertSubmission({
    session_id: entry.sessionId,
    seq: entry.nextSeq,
    action_id: args.actionId,
    idempotency_key: args.idempotencyKey,
    outcome_kind: args.outcome.kind,
    outcome: args.outcome as Record<string, unknown>,
  });
  if (stored) entry.nextSeq += 1;
}

/** Resume index: caller's open sessions, newest first. */
export async function listOpenZeroPathSessions(
  userId: string,
  persistence: ZeroPathSessionPersistence | null,
): Promise<readonly ZeroPathSessionRow[]> {
  if (!persistence) return [];
  const rows = await persistence.listOwnedOpenSessions(userId);
  return rows.filter((row) => new Date(row.expires_at).getTime() > Date.now());
}

/**
 * Cache-hit authorization. Anonymous sessions (`userId === null`) require the
 * presented secret to equal the one minted at creation — constant-time since
 * this check decides access to another guest's session state.
 */
function canAccess(
  sessionUserId: string | null,
  sessionSecret: string | null,
  callerUserId: string | null,
  presentedSecret: string | null,
): boolean {
  if (sessionUserId !== null && sessionUserId === callerUserId) {
    return true;
  }
  return secretsEqual(sessionSecret, presentedSecret);
}

function secretsEqual(a: string | null, b: string | null): boolean {
  if (a === null || b === null) return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

async function buildRestoredEntry(
  row: ZeroPathSessionRow,
  persistence: ZeroPathSessionPersistence,
  accessSecret: string | null,
): Promise<SessionEntry | null> {
  const rows = await persistence.listSubmissions(row.id);
  const outcomesByKey = new Map<string, StoredOutcome>();
  const accepted: ReferenceCoreEvidence[] = [];
  const rejectedEvidence: {
    claim: ZeroPathClaimId;
    problems: readonly unknown[];
  }[] = [];
  const claimsByTarget = new Map<string, Set<ZeroPathClaimId>>();

  for (const stored of rows) {
    const raw = stored.outcome as StoredOutcome & {
      evidence?: ReferenceCoreEvidence;
    };
    const { evidence, ...outcome } = raw;
    outcomesByKey.set(stored.idempotency_key, outcome as StoredOutcome);
    const storedClaim = (outcome as { claim?: ZeroPathClaimId }).claim;
    if (evidence) {
      // A stored evidence outcome without its claim is corrupt state — fail
      // hydration honestly rather than inventing a claim id.
      if (!storedClaim) return null;
      accepted.push(evidence);
      const claims =
        claimsByTarget.get(evidence.targetId) ?? new Set<ZeroPathClaimId>();
      claims.add(storedClaim);
      claimsByTarget.set(evidence.targetId, claims);
    } else if (stored.outcome_kind === "invalid-evidence") {
      if (!storedClaim) return null;
      const problems =
        (outcome as { problems?: readonly unknown[] }).problems ?? [];
      rejectedEvidence.push({ claim: storedClaim, problems });
    }
  }

  const counts = {
    submissions: rows.filter((r) => r.outcome_kind !== "rejected").length,
    skippedAttemptOnly: rows.filter((r) => r.outcome_kind === "attempt-only")
      .length,
    selfReports: rows.filter((r) => r.outcome_kind === "self-report").length,
    sequence: rows.length,
  };

  return {
    sessionId: row.id,
    userId: row.user_id,
    // The presented secret was already verified by the capability RPC —
    // storing it keeps cache-hit checks consistent with the DB decision.
    accessSecret,
    mode: row.mode,
    runner: createZeroPathSession({
      sessionId: row.id,
      restored: {
        outcomesByKey,
        accepted,
        rejectedEvidence,
        claimsByTarget,
        counters: counts,
      },
    }),
    nextSeq: rows.length,
    touchedAt: Date.now(),
  };
}

function pruneEntries(): void {
  const now = Date.now();
  for (const [key, value] of entries) {
    if (now - value.touchedAt > SESSION_TTL_MS || entries.size > MAX_ENTRIES) {
      entries.delete(key);
    }
  }
}

/** Test hook: clear the in-memory cache (durable rows are unaffected). */
export function clearZeroPathSessionsForTests(): void {
  entries.clear();
}
