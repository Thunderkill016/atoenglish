import { describe, it, expect, vi } from "vitest";
import {
  createRateLimiter,
  getClientIp,
  InMemoryRateLimiter,
  WorkersRateLimiterImpl,
} from "@/lib/security/rate-limit";

const mockLimit = vi.fn();

vi.mock("@upstash/ratelimit", () => {
  return {
    Ratelimit: class {
      static slidingWindow = vi.fn().mockReturnValue({});
      limit = (ip: string) => mockLimit(ip);
    },
  };
});

vi.mock("@upstash/redis", () => {
  return {
    Redis: {
      fromEnv: vi.fn().mockReturnValue({}),
    },
  };
});

describe("createRateLimiter (InMemory fallback)", () => {
  beforeEach(() => {
    // Force InMemory fallback regardless of host/CI .env or prior test pollution
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  });

  it("allows requests under the limit", async () => {
    const limiter = createRateLimiter(5, 60_000, "test-allow");
    const result = await limiter.check("1.2.3.4");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks requests over the limit", async () => {
    const limiter = createRateLimiter(3, 60_000, "test-block");
    const ip = "5.6.7.8";
    await limiter.check(ip);
    await limiter.check(ip);
    await limiter.check(ip);
    const result = await limiter.check(ip);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("returns correct limit value", async () => {
    const limiter = createRateLimiter(10, 60_000, "test-limit");
    const result = await limiter.check("9.9.9.9");
    expect(result.limit).toBe(10);
  });

  it("different IPs are tracked independently", async () => {
    const limiter = createRateLimiter(2, 60_000, "test-ips");
    await limiter.check("10.0.0.1");
    await limiter.check("10.0.0.1");
    await limiter.check("10.0.0.1");
    const resultB = await limiter.check("10.0.0.2");
    expect(resultB.success).toBe(true);
  });

  it("resetTime is in the future", async () => {
    const limiter = createRateLimiter(5, 60_000, "test-reset");
    const before = Date.now();
    const result = await limiter.check("1.1.1.1");
    expect(result.resetTime).toBeGreaterThan(before);
  });

  it("resets count after window expires", async () => {
    vi.useFakeTimers();
    const limiter = createRateLimiter(2, 1_000, "test-expire-window");
    const ip = "2.2.2.2";

    await limiter.check(ip);
    await limiter.check(ip);
    const blocked = await limiter.check(ip);
    expect(blocked.success).toBe(false);

    vi.advanceTimersByTime(1_001);

    const allowed = await limiter.check(ip);
    expect(allowed.success).toBe(true);
    expect(allowed.remaining).toBe(1);

    vi.useRealTimers();
  });
});

describe("getClientIp", () => {
  const makeRequest = (
    overrides: {
      ip?: string;
      headers?: Record<string, string>;
    } = {},
  ) => {
    const headers = new Headers(overrides.headers ?? {});
    const req = {
      headers,
      ...(overrides.ip !== undefined ? { ip: overrides.ip } : {}),
    } as unknown as Request;
    return req;
  };

  it("returns req.ip when available", () => {
    const req = makeRequest({ ip: "1.2.3.4" });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("prefers cf-connecting-ip over spoofable forwarded headers", () => {
    const req = makeRequest({
      headers: {
        "cf-connecting-ip": "203.0.113.7",
        "x-forwarded-for": "1.1.1.1",
        "x-real-ip": "2.2.2.2",
      },
    });
    expect(getClientIp(req)).toBe("203.0.113.7");
  });

  it("returns the LAST x-forwarded-for entry (edge-observed, unforgeable tail)", () => {
    // Attacker-controlled XFF values can only prepend earlier entries; the
    // Cloudflare edge appends the real peer last.
    const req = makeRequest({
      headers: { "x-forwarded-for": "5.6.7.8, 9.10.11.12" },
    });
    expect(getClientIp(req)).toBe("9.10.11.12");
  });

  it("returns x-real-ip when x-forwarded-for is absent", () => {
    const req = makeRequest({ headers: { "x-real-ip": "13.14.15.16" } });
    expect(getClientIp(req)).toBe("13.14.15.16");
  });

  it("falls back to 127.0.0.1 when no IP headers present", () => {
    const req = makeRequest({});
    expect(getClientIp(req)).toBe("127.0.0.1");
  });

  it("trims whitespace and takes the last x-forwarded-for entry", () => {
    const req = makeRequest({
      headers: { "x-forwarded-for": "  192.168.1.1  , 10.0.0.1" },
    });
    expect(getClientIp(req)).toBe("10.0.0.1");
  });
});

describe("createRateLimiter (Additional Coverage)", () => {
  it("P2-3: deterministic sweep evicts expired entries after 60s interval", async () => {
    vi.useFakeTimers();
    const limiter = new InMemoryRateLimiter(5, 500); // 500ms window

    // Fill up a record for IP
    limiter.check("sweep-test-ip");

    // Advance time past the window so the record is expired
    vi.advanceTimersByTime(600);

    // Advance past the 60s sweep interval to trigger cleanup
    vi.advanceTimersByTime(60_001);

    // This check should trigger the sweep (cleaning up expired "sweep-test-ip")
    // and create a fresh record for the new IP — both should succeed
    const result = limiter.check("sweep-test-ip-2");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);

    vi.useRealTimers();
  });

  it("works as expected with synchronous check method wrapper of legacy InMemoryRateLimiter", () => {
    const limiter = new InMemoryRateLimiter(2, 60_000);
    const result1 = limiter.check("127.0.0.1");
    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(1);

    const result2 = limiter.check("127.0.0.1");
    expect(result2.success).toBe(true);
    expect(result2.remaining).toBe(0);

    const result3 = limiter.check("127.0.0.1");
    expect(result3.success).toBe(false);
  });

  it("uses Upstash in production when configured", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://mock-redis.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "mock-token";

    mockLimit.mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: 123456,
    });

    try {
      const limiter = createRateLimiter(10, 60_000, "test-upstash");
      const result = await limiter.check("1.1.1.1");
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
      expect(result.limit).toBe(10);
    } finally {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
    }
  });

  it("fails open if Upstash throws an error", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://mock-redis.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "mock-token";

    mockLimit.mockRejectedValue(new Error("Upstash connection failed"));

    try {
      const limiter = createRateLimiter(10, 60_000, "test-upstash-fail");
      const result = await limiter.check("1.1.1.1");
      expect(result.success).toBe(true); // fails open
      expect(result.remaining).toBe(1);
    } finally {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
    }
  });
});

describe("WorkersRateLimiterImpl (Cloudflare rate-limit binding)", () => {
  const fallback = createRateLimiter(2, 60_000, "test-cf-fallback");

  it("delegates to the binding and honors its deny", async () => {
    const binding = {
      limit: vi.fn().mockResolvedValue({ success: false }),
    };
    const limiter = new WorkersRateLimiterImpl(binding, 30, 60_000, fallback);
    const result = await limiter.check("9.9.9.9");
    expect(binding.limit).toHaveBeenCalledWith({ key: "9.9.9.9" });
    expect(result.success).toBe(false);
    expect(result.limit).toBe(30);
    expect(result.remaining).toBe(0);
  });

  it("reports success when the binding allows", async () => {
    const binding = { limit: vi.fn().mockResolvedValue({ success: true }) };
    const limiter = new WorkersRateLimiterImpl(binding, 30, 60_000, fallback);
    const result = await limiter.check("9.9.9.8");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("falls back when the binding throws", async () => {
    const binding = { limit: vi.fn().mockRejectedValue(new Error("down")) };
    const limiter = new WorkersRateLimiterImpl(binding, 30, 60_000, fallback);
    const result = await limiter.check("9.9.9.7");
    expect(result.success).toBe(true); // fallback (in-memory) allows
  });
});
