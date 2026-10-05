import { type NextRequest } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  /** Which backend produced the verdict — diagnostic, surfaced as
   * X-RateLimit-Backend on the auth route. */
  backend?:
    | "durable-object"
    | "workers-binding"
    | "upstash"
    | "memory"
    | "open";
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
        backend: "memory",
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
        backend: "memory",
      };
    }
    return {
      success: true,
      limit: this.limit,
      remaining,
      resetTime: record.resetTime,
      backend: "memory",
    };
  }
}

class InMemoryRateLimiterImpl implements RateLimiter {
  private limiter: InMemoryRateLimiter;
  private warned = false;
  constructor(limit: number, windowMs: number) {
    this.limiter = new InMemoryRateLimiter(limit, windowMs);
  }

  async check(ip: string): Promise<RateLimitResult> {
    // Per-isolate memory cannot survive Cloudflare isolate fan-out — in
    // production this means the limiter effectively never trips. Fail
    // observable (not closed): legitimate traffic still gets best-effort
    // limiting while the missing UPSTASH/CF-binding config is fixed.
    if (!this.warned && process.env.NODE_ENV === "production") {
      this.warned = true;
      console.error(
        "[rate-limit] in-memory limiter active in production — effective only within one isolate. Configure UPSTASH_REDIS_REST_* or a Cloudflare binding for distributed limiting.",
      );
    }
    return this.limiter.check(ip);
  }
}

// ─── Cloudflare Workers native rate-limit binding (production) ────────────────

/**
 * Shape of the Workers `rate-limit` binding (env.AUTH_RATE_LIMITER etc).
 * `.limit()` counts + decides atomically on the edge — works across isolates,
 * unlike the in-memory Map which resets per isolate and therefore never trips
 * under real Cloudflare request fan-out.
 */
interface WorkersRateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export class WorkersRateLimiterImpl implements RateLimiter {
  constructor(
    private binding: WorkersRateLimitBinding,
    private requestsPerWindow: number,
    private windowMs: number,
    private fallback: RateLimiter,
  ) {}

  async check(ip: string): Promise<RateLimitResult> {
    try {
      const { success } = await this.binding.limit({ key: ip });
      return {
        success,
        limit: this.requestsPerWindow,
        // The native binding doesn't expose remaining/reset — approximate
        // from our own config so 429 headers stay sensible.
        remaining: success ? 1 : 0,
        resetTime: Date.now() + this.windowMs,
        backend: "workers-binding",
      };
    } catch (e) {
      // Binding unreachable — degrade to the configured fallback limiter
      // rather than failing open entirely.
      console.warn(
        `[rate-limit] binding.limit threw: ${e instanceof Error ? e.message : String(e)} — using fallback`,
      );
      return this.fallback.check(ip);
    }
  }
}

// ─── Durable Object rate limiter (strict, single-threaded per key) ───────────
//
// The native rate-limit binding above is eventually consistent: counters are
// cached per machine in each Cloudflare location and reconcile asynchronously.
// Live testing showed ~95% of a 120-request burst leaking past a 30/60s limit.
// A Durable Object keyed via getByName(ip) serializes calls on one thread —
// counting is exact. This impl delegates to AuthRateLimiterDO (worker/index.ts).

interface AuthRateLimitVerdict {
  success: boolean;
  remaining: number;
  resetTime: number;
}

interface DurableObjectStubLike {
  check(limit: number, windowMs: number): Promise<AuthRateLimitVerdict>;
}

interface DurableObjectNamespaceLike {
  getByName(name: string): DurableObjectStubLike;
}

export class DurableObjectRateLimiterImpl implements RateLimiter {
  constructor(
    private ns: DurableObjectNamespaceLike,
    private requestsPerWindow: number,
    private windowMs: number,
    private fallback: RateLimiter,
  ) {}

  async check(ip: string): Promise<RateLimitResult> {
    try {
      const verdict = await this.ns
        .getByName(ip)
        .check(this.requestsPerWindow, this.windowMs);
      return {
        success: verdict.success,
        limit: this.requestsPerWindow,
        remaining: verdict.remaining,
        resetTime: verdict.resetTime,
        backend: "durable-object",
      };
    } catch (e) {
      // DO unavailable — degrade to the configured fallback chain.
      console.warn(
        `[rate-limit] DO check threw: ${e instanceof Error ? e.message : String(e)} — using fallback`,
      );
      return this.fallback.check(ip);
    }
  }
}

class BindingResolvingRateLimiter implements RateLimiter {
  private resolved: Promise<RateLimiter> | null = null;

  constructor(
    private bindingName: string | undefined,
    private doBindingName: string | undefined,
    private requestsPerWindow: number,
    private windowMs: number,
    private fallback: RateLimiter,
  ) {}

  private resolve(): Promise<RateLimiter> {
    this.resolved ??= (async () => {
      let mod: { env?: Record<string, unknown> } | null = null;
      let importError: string | null = null;
      try {
        const cfModuleSpecifier = "cloudflare:workers";
        mod = (await import(/* webpackIgnore: true */ cfModuleSpecifier)) as {
          env?: Record<string, unknown>;
        } | null;
      } catch (e) {
        importError = e instanceof Error ? e.message : String(e);
      }
      const cfEnv = mod?.env;

      // Strict path first: the DO counter is exact and survives isolates.
      const doNs = this.doBindingName ? cfEnv?.[this.doBindingName] : undefined;
      if (
        doNs &&
        typeof (doNs as DurableObjectNamespaceLike).getByName === "function"
      ) {
        console.warn(
          `[rate-limit] ${this.doBindingName}: resolved to Durable Object`,
        );
        return new DurableObjectRateLimiterImpl(
          doNs as DurableObjectNamespaceLike,
          this.requestsPerWindow,
          this.windowMs,
          // Chain: DO failure degrades to the native binding, which itself
          // degrades to `this.fallback` (Upstash/in-memory).
          this.resolveNative(cfEnv, null, mod),
        );
      }

      return this.resolveNative(cfEnv, importError, mod);
    })();
    return this.resolved;
  }

  private resolveNative(
    cfEnv: Record<string, unknown> | undefined,
    importError: string | null,
    mod: { env?: Record<string, unknown> } | null,
  ): RateLimiter {
    const binding = this.bindingName ? cfEnv?.[this.bindingName] : undefined;
    if (
      binding &&
      typeof (binding as WorkersRateLimitBinding).limit === "function"
    ) {
      console.warn(
        `[rate-limit] ${this.bindingName}: resolved to Workers binding`,
      );
      return new WorkersRateLimiterImpl(
        binding as WorkersRateLimitBinding,
        this.requestsPerWindow,
        this.windowMs,
        this.fallback,
      );
    }
    console.warn(
      `[rate-limit] no usable binding (importError=${importError ?? "none"}, mod=${mod === null ? "null" : typeof mod}, envKeys=${cfEnv ? Object.keys(cfEnv).join(",") : "n/a"}) — using fallback`,
    );
    return this.fallback;
  }

  async check(ip: string): Promise<RateLimitResult> {
    return (await this.resolve()).check(ip);
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
        backend: "upstash",
      };
    } catch {
      // Upstash unavailable — fail open (allow request)
      return {
        success: true,
        limit: this.requestsPerWindow,
        remaining: 1,
        resetTime: Date.now() + this.windowSeconds * 1000,
        backend: "open",
      };
    }
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

/**
 * Create a rate limiter.
 * - Uses Upstash Redis in production when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set.
 * - Falls back to in-memory (single-instance only) for local development.
 * - An in-memory limiter that ends up serving a production request logs a
 *   one-time error on first .check() — per-isolate counters cannot survive
 *   Cloudflare isolate fan-out, so that state means limiting is effectively
 *   off and must be fixed at the platform level.
 *
 * @param requestsPerMinute  Maximum requests allowed per window
 * @param windowMs           Window duration in milliseconds (used for in-memory fallback)
 * @param prefix             Upstash key prefix (use unique value per limiter)
 * @param cf                 Optional Cloudflare binding names:
 *                           `durableObject` — strict per-key counter
 *                           (AuthRateLimiterDO); wins over everything.
 *                           `rateLimit` — native `rate-limit` binding
 *                           (eventually consistent, coarse backstop).
 *                           Both resolve lazily from `cloudflare:workers` env;
 *                           absent bindings fall through to Upstash/in-memory.
 */
export function createRateLimiter(
  requestsPerMinute: number,
  windowMs: number,
  prefix = "rl",
  cf?: { rateLimit?: string; durableObject?: string },
): RateLimiter {
  // NOTE: no env validation at construction time — module-level checks would
  // crash Next.js static page generation (ISR revalidate runs initializers
  // outside of request context). The production signal fires lazily inside
  // InMemoryRateLimiterImpl.check() instead.

  const isUpstashConfigured =
    typeof process !== "undefined" &&
    !!process.env.UPSTASH_REDIS_REST_URL &&
    !!process.env.UPSTASH_REDIS_REST_TOKEN;

  const fallback: RateLimiter = isUpstashConfigured
    ? new UpstashRateLimiterImpl(
        requestsPerMinute,
        Math.round(windowMs / 1000),
        prefix,
      )
    : // In-memory is per-isolate — correct locally, ineffective under real
      // Cloudflare isolate fan-out. That's why the cf binding wins when set.
      new InMemoryRateLimiterImpl(requestsPerMinute, windowMs);

  if (cf?.rateLimit || cf?.durableObject) {
    return new BindingResolvingRateLimiter(
      cf.rateLimit,
      cf.durableObject,
      requestsPerMinute,
      windowMs,
      fallback,
    );
  }
  return fallback;
}

// ─── IP Helper ───────────────────────────────────────────────────────────────

/**
 * Client IP for rate limiting. Trust order:
 *   1. `cf-connecting-ip` — set by the Cloudflare edge and cannot be spoofed
 *      by the client (CF overwrites any inbound value). This app only ever
 *      serves traffic through Cloudflare Workers.
 *   2. `req.ip` — platform-provided when the adapter populates it.
 *   3. `x-forwarded-for` LAST entry — spoofable, dev-only fallback.
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
