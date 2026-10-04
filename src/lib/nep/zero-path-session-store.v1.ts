import { createZeroPathSession, type ZeroPathSessionRunner } from "./session-runner.v1";

/**
 * In-memory session store for the zero-path pilot.
 *
 * Certified evidence records carry a non-enumerable symbol brand guarded by a
 * WeakSet (`certified-evidence.ts`) — they cannot cross the server→client
 * boundary and remain valid. Session accumulation therefore lives server-side,
 * keyed by a server-minted session id; only plain read-model DTOs leave.
 *
 * Same lifecycle as the module-level rate limiters: ephemeral, single-process,
 * lost on restart — acceptable for the pilot slice; durable persistence is a
 * separate decision. Entries expire after TTL and the store is capped.
 */

const SESSION_TTL_MS = 4 * 60 * 60 * 1000;
const MAX_SESSIONS = 500;

/**
 * A review session re-observes a previously introduced lesson after a delay.
 * The mode is bound server-side at session creation — submissions in a review
 * session mint `retention` evidence and carry `reviewMode` in attempt
 * metadata, so a client cannot relabel its own attempts.
 */
export type ZeroPathSessionMode = "learn" | "review";

type Entry = {
  runner: ZeroPathSessionRunner;
  touchedAt: number;
  mode: ZeroPathSessionMode;
};

const sessions = new Map<string, Entry>();

function sweep(now: number) {
  for (const [id, entry] of sessions) {
    if (now - entry.touchedAt > SESSION_TTL_MS) sessions.delete(id);
  }
  while (sessions.size > MAX_SESSIONS) {
    const oldest = sessions.keys().next().value;
    if (oldest === undefined) break;
    sessions.delete(oldest);
  }
}

export function startZeroPathSession(
  mode: ZeroPathSessionMode = "learn",
  sessionId: string = crypto.randomUUID(),
): string {
  const now = Date.now();
  sweep(now);
  sessions.set(sessionId, {
    runner: createZeroPathSession({ sessionId }),
    touchedAt: now,
    mode,
  });
  return sessionId;
}

export function getZeroPathSession(
  sessionId: string,
): { runner: ZeroPathSessionRunner; mode: ZeroPathSessionMode } | null {
  const entry = sessions.get(sessionId);
  if (!entry) return null;
  entry.touchedAt = Date.now();
  return { runner: entry.runner, mode: entry.mode };
}
