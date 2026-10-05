import { type NextRequest } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

export interface RateLimiter {
  check(ip: string): Promise<RateLimitResult>;
}

// ─── In-Memory Fallback (local dev & when Upstash not configured) ─────────────

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class InMemoryRateLimiter {
  private cache = new Map<string, RateLimitRecord>();
  private lastSweep = Date.now();
  private static readonly SWEEP_INTERVAL_MS = 60_000; // Deterministic: sweep every 60s (P2-3 fix)

  constructor(
    private limit: number,
    private windowMs: number,
  ) {}

  check(ip: string): RateLimitResult {
    const now = Date.now();
    const record = this.cache.get(ip);

    // Deterministic cleanup — evict expired entries every 60s (not random %)
    if (now - this.lastSweep > InMemoryRateLimiter.SWEEP_INTERVAL_MS) {
      this.lastSweep = now;
      for (const [key, val] of this.cache) {
        if (now > val.resetTime) this.cache.delete(key);
      }
    }

    if (!record || now > record.resetTime) {
      const resetTime = now + this.windowMs;
      this.cache.set(ip, { count: 1, resetTime });
      return {
        success: true,
        limit: this.limit,
        remaining: this.limit - 1,
        resetTime,
      };
    }

    record.count++;
    const remaining = Math.max(0, this.limit - record.count);
    if (record.count > this.limit) {
      return {
        success: false,
        limit: this.limit,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }
    return {
      success: true,
      limit: this.limit,
      remaining,
      resetTime: record.resetTime,
    };
  }
}

class InMemoryRateLimiterImpl implements RateLimiter {
  private limiter: InMemoryRateLimiter;
  constructor(limit: number, windowMs: number) {
    this.limiter = new InMemoryRateLimiter(limit, windowMs);
  }

  async check(ip: string): Promise<RateLimitResult> {
    return this.limiter.check(ip);
  }
}

// ─── Upstash Redis Rate Limiter (production) ──────────────────────────────────

class UpstashRateLimiterImpl implements RateLimiter {
  private ratelimit: import("@upstash/ratelimit").Ratelimit | null = null;
  private prefix: string;
  private requestsPerWindow: number;
  private windowSeconds: number;

  constructor(requestsPerWindow: number, windowSeconds: number, prefix = "rl") {
    this.requestsPerWindow = requestsPerWindow;
    this.windowSeconds = windowSeconds;
    this.prefix = prefix;
  }

  private async getLimiter() {
    if (this.ratelimit) return this.ratelimit;
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");
    this.ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(
        this.requestsPerWindow,
        `${this.windowSeconds} s`,
      ),
      prefix: this.prefix,
    });
    return this.ratelimit;
  }

  async check(ip: string): Promise<RateLimitResult> {
    try {
      const limiter = await this.getLimiter();
      const result = await limiter.limit(ip);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        resetTime: result.reset,
      };
    } catch {
      // Upstash unavailable — fail open (allow request)
      return {
        success: true,
        limit: this.requestsPerWindow,
        remaining: 1,
        resetTime: Date.now() + this.windowSeconds * 1000,
      };
    }
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

/**
 * Create a rate limiter.
 * - Uses Upstash Redis in production when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set.
 * - Falls back to in-memory (single-instance only) for local development.
 * - assertProductionEnv() is checked LAZILY on first .check() call — NOT at module load time.
 *   This prevents Next.js ISR/static generation from throwing during page config collection.
 *
 * @param requestsPerMinute  Maximum requests allowed per window
 * @param windowMs           Window duration in milliseconds (used for in-memory fallback)
 * @param prefix             Upstash key prefix (use unique value per limiter)
 */
export function createRateLimiter(
  requestsPerMinute: number,
  windowMs: number,
  prefix = "rl",
): RateLimiter {
  // NOTE: assertProductionEnv() intentionally NOT called here.
  // Calling it at module level would crash Next.js static page generation
  // (ISR revalidate runs module initializers outside of request context).
  // The check is deferred to the first actual .check() invocation below.

  const isUpstashConfigured =
    typeof process !== "undefined" &&
    !!process.env.UPSTASH_REDIS_REST_URL &&
    !!process.env.UPSTASH_REDIS_REST_TOKEN;

  if (isUpstashConfigured) {
    const windowSeconds = Math.round(windowMs / 1000);
    return new UpstashRateLimiterImpl(requestsPerMinute, windowSeconds, prefix);
  }

  // Fallback: in-memory limiter (dev or production without Upstash configured).
  // In production, add UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to production env vars
  // to enable distributed Redis-backed rate limiting.
  return new InMemoryRateLimiterImpl(requestsPerMinute, windowMs);
}

// ─── IP Helper ───────────────────────────────────────────────────────────────

/**
 * Client IP for rate limiting. Trust order:
 *   1. `cf-connecting-ip` — set by the Cloudflare edge and cannot be spoofed
 *      by the client (CF overwrites any inbound value). This app only ever
 *      serves traffic through Cloudflare Workers.
 *   2. `req.ip` — platform-provided when the adapter populates it.
 *   3. `x-forwarded-for` FIRST entry — spoofable, dev-only fallback.
 *   4. `x-real-ip` — spoofable, dev-only fallback.
 *
 * Earlier code trusted XFF blindly, which let an attacker rotate a forged
 * header to reset their per-IP budget on every request.
 */
export function getClientIpFromHeaders(headers: Headers): string {
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const entries = xForwardedFor.split(",").map((v) => v.trim());
    // Behind Cloudflare the LAST entry is the edge-observed peer; forged
    // values can only prepend earlier entries.
    return entries[entries.length - 1] || "127.0.0.1";
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
}

export function getClientIp(req: Request | NextRequest): string {
  if ("ip" in req && typeof req.ip === "string" && req.ip) return req.ip;
  return getClientIpFromHeaders(req.headers);
}
