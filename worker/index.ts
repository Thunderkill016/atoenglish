import { DurableObject } from "cloudflare:workers";

// Custom Worker entrypoint: vinext's generated handler plus the Durable
// Object classes this app exports. vinext resolves `worker/index.ts` as the
// entrypoint automatically when it exists (resolveWorkerEntry), and
// cloudflare.config.ts points `entrypoint` here explicitly.
export * from "vinext/server/fetch-handler";
export { default } from "vinext/server/fetch-handler";

export interface AuthRateLimitVerdict {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Strictly-consistent fixed-window rate counter, one instance per key
 * (client IP) via getByName(ip). The native `rate-limit` binding is
 * eventually consistent — counters are cached per machine and sync
 * asynchronously, so a 30 req/60s limit leaked ~95% of requests in live
 * testing. Durable Objects serialize all calls for a name on one thread,
 * so count/limit enforcement here is exact. SQLite storage keeps the
 * counter across isolate eviction.
 */
export class AuthRateLimiterDO extends DurableObject {
  check(limit: number, windowMs: number): AuthRateLimitVerdict {
    const now = Date.now();
    const sql = this.ctx.storage.sql;
    sql.exec(
      "CREATE TABLE IF NOT EXISTS window (id INTEGER PRIMARY KEY CHECK (id = 1), count INTEGER NOT NULL, reset_at INTEGER NOT NULL)",
    );
    const rows = sql
      .exec("SELECT count, reset_at AS resetAt FROM window WHERE id = 1")
      .toArray();
    const row = rows[0] as { count: number; resetAt: number } | undefined;
    if (!row || now > row.resetAt) {
      const resetTime = now + windowMs;
      sql.exec(
        "INSERT OR REPLACE INTO window (id, count, reset_at) VALUES (1, 1, ?)",
        resetTime,
      );
      return { success: true, remaining: limit - 1, resetTime };
    }
    const count = row.count + 1;
    sql.exec("UPDATE window SET count = ? WHERE id = 1", count);
    return {
      success: count <= limit,
      remaining: Math.max(0, limit - count),
      resetTime: row.resetAt,
    };
  }
}
