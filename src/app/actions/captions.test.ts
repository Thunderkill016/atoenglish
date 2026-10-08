/**
 * Contract tests for the caption server actions (TASK_CONTRACT §slice-1,
 * SPEC §4.2 / §4.4).
 *
 * Only module boundaries are mocked — the Supabase client, the upstream
 * YouTube caption chain, the rate limiter, and request headers. The real
 * segmentation (`@/lib/video/segment`) and subtitle parsing
 * (`@/lib/video/subtitle-file`) run against real payloads, so these are
 * integration tests across lib + action.
 *
 * The mocks are deliberately duck-typed at the public contract level
 * (chainable query builder, controllable limiter `check`) so they survive
 * internal refactors of the action module.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchVideoCaptions,
  importYoutubeCaptions,
  saveLearnerTranscript,
  saveWatchPosition,
} from "./captions";

// ─── Hoisted test doubles ────────────────────────────────────────────────────
// Everything the vi.mock factories share must exist before they run.

const h = vi.hoisted(() => {
  interface RecordedCall {
    table: string;
    method: string;
    args: unknown[];
  }
  interface QueryStep {
    method: string;
    args: unknown[];
  }
  /**
   * Per-table resolver: receives the recorded steps of ONE query chain
   * (e.g. `[select, eq, eq, eq, maybeSingle]`) and returns the
   * PostgREST-shaped `{ data, error }` the awaited chain resolves to.
   */
  type TableHandler = (steps: QueryStep[]) => unknown;

  const calls: RecordedCall[] = [];
  const tableHandlers = new Map<string, TableHandler>();

  /**
   * Chainable stand-in for the PostgREST query builder. Any method records
   * itself and returns the same object, so arbitrary chains compile
   * (select/eq/insert/upsert/update/maybeSingle/single/…). The object is
   * thenable: awaiting it at any point resolves the table handler's result,
   * covering both terminal awaits (`maybeSingle()`, `single()`) and bare
   * awaits on write chains (`insert(...)`, `update(...).eq(...)`).
   */
  function makeQueryBuilder(table: string) {
    const steps: QueryStep[] = [];
    const builder: Record<PropertyKey, unknown> = new Proxy(
      {},
      {
        get(_target, prop) {
          if (prop === "then") {
            return (
              onFulfilled?: ((value: unknown) => unknown) | null,
              onRejected?: ((reason: unknown) => unknown) | null,
            ) => {
              const handler = tableHandlers.get(table);
              const result = handler
                ? handler(steps)
                : { data: null, error: null };
              return Promise.resolve(result).then(onFulfilled, onRejected);
            };
          }
          // Symbols (inspection/iteration hooks) are never query methods.
          if (typeof prop === "symbol") return undefined;
          return (...args: unknown[]) => {
            steps.push({ method: prop, args });
            calls.push({ table, method: prop, args });
            return builder;
          };
        },
      },
    );
    return builder;
  }

  const from = vi.fn((table: string) => makeQueryBuilder(table));
  const getUser = vi.fn();
  const supabase = {
    auth: { getUser },
    from,
  };
  // Controllable so tests can simulate env/auth failure (preview without
  // worker secrets) — createClient throws, action must degrade to guest.
  const createClientImpl = vi.fn(async () => supabase);

  const limiterCheck = vi.fn();
  const requestHeaders = vi.fn();
  const fetchYoutubeCaptions = vi.fn();
  const rpcService = vi.fn();

  return {
    calls,
    tableHandlers,
    from,
    getUser,
    supabase,
    createClientImpl,
    limiterCheck,
    requestHeaders,
    fetchYoutubeCaptions,
    rpcService,
  };
});

vi.mock("@/lib/supabase/service", () => ({ rpcService: h.rpcService }));

// ─── Module-boundary mocks ───────────────────────────────────────────────────

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => h.createClientImpl(),
}));

vi.mock("next/headers", () => ({
  headers: h.requestHeaders,
  cookies: async () => ({ get: () => undefined, getAll: () => [] }),
}));

vi.mock("@/lib/video/captions", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/video/captions")>();
  return { ...actual, fetchYoutubeCaptions: h.fetchYoutubeCaptions };
});

vi.mock("@/lib/security/rate-limit", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/security/rate-limit")>();
  return {
    ...actual,
    // Every limiter instance the action constructs delegates to one
    // controllable check — robust if the module grows a second limiter.
    createRateLimiter: () => ({ check: h.limiterCheck }),
  };
});

// ─── Fixtures ────────────────────────────────────────────────────────────────

const VIDEO_ID = "dQw4w9WgXcQ"; // valid 11-char YouTube id
// NB: any 11 chars of [A-Za-z0-9_-] is "valid" — this one has a space + !.
const BAD_VIDEO_ID = "bad video!";
const USER = { id: "user-42", email: "learner@example.com", name: "Learner" };
const GUEST_IP = "203.0.113.42"; // TEST-NET-3 (RFC 5737)
const SOURCE_ID = "9f8e7d6c-0000-4000-8000-000000000001";

/** json3 cues for a manual track — real segmentation runs on these. */
const MANUAL_EVENTS = [
  {
    tStartMs: 0,
    dDurationMs: 1800,
    segs: [{ utf8: "Never gonna give you up," }],
  },
  {
    tStartMs: 1900,
    dDurationMs: 2000,
    segs: [{ utf8: "never gonna let you down." }],
  },
];

/** json3 word events for an asr track (per-word tOffsetMs). */
const ASR_EVENTS = [
  {
    tStartMs: 0,
    dDurationMs: 1600,
    segs: [
      { utf8: "Never", tOffsetMs: 0 },
      { utf8: " gonna", tOffsetMs: 380 },
      { utf8: " give", tOffsetMs: 780 },
      { utf8: " you", tOffsetMs: 1100 },
      { utf8: " up.", tOffsetMs: 1350 },
    ],
  },
];

const CAPTIONS_OK = {
  ok: true as const,
  videoId: VIDEO_ID,
  source: "ios" as const,
  track: { languageCode: "en", kind: "manual" as const },
  events: MANUAL_EVENTS,
  video: { title: "T", channel: "C", durationMs: 212000 },
};

/** Six real-feeling cues — enough timed sentences to pass the share gate. */
const MANUAL_EVENTS_LONG = Array.from({ length: 6 }, (_, i) => ({
  tStartMs: i * 2000,
  dDurationMs: 1800,
  segs: [{ utf8: `Sentence number ${i + 1}.` }],
}));

const SRT = `1
00:00:01,000 --> 00:00:03,000
Hello world.

2
00:00:03,500 --> 00:00:05,000
Goodbye now.
`;

/** Looks like SRT but end <= start — the real parser must reject it. */
const BACKWARDS_SRT = `1
00:00:05,000 --> 00:00:01,000
Backwards timestamps.
`;

const STORED_SENTENCES = [
  { i: 0, start_ms: 0, end_ms: 1000, text: "Stored sentence." },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function asLoggedIn() {
  h.getUser.mockResolvedValue({ data: { user: USER }, error: null });
}

/**
 * Tables behave like an empty-but-writable DB: selects find nothing,
 * the content_sources upsert returns a generated id, writes succeed.
 */
function stubWritableDb() {
  h.tableHandlers.set("content_sources", (steps) =>
    steps.some((s) => s.method === "upsert")
      ? { data: { id: SOURCE_ID }, error: null }
      : { data: null, error: null },
  );
  h.tableHandlers.set("content_transcripts", () => ({
    data: null,
    error: null,
  }));
}

/** A stored transcript already exists for USER + VIDEO_ID. */
function stubStoredTranscript() {
  h.tableHandlers.set("content_sources", (steps) =>
    steps.some((s) => s.method === "select")
      ? {
          data: {
            id: SOURCE_ID,
            title: "Stored T",
            channel: "Stored C",
            duration_ms: 60_000,
          },
          error: null,
        }
      : { data: null, error: null },
  );
  h.tableHandlers.set("content_transcripts", () => ({
    data: {
      origin: "youtube_manual",
      language: "en",
      sentences: STORED_SENTENCES,
    },
    error: null,
  }));
}

const callsFor = (table: string, method?: string) =>
  h.calls.filter(
    (c) => c.table === table && (method === undefined || c.method === method),
  );

beforeEach(() => {
  h.calls.length = 0;
  h.rpcService.mockReset().mockResolvedValue({ data: null, error: null });
  h.tableHandlers.clear();
  h.from.mockClear();
  h.getUser.mockReset().mockResolvedValue({
    data: { user: null },
    error: { message: "Auth session missing!", status: 401 },
  });
  h.limiterCheck.mockReset().mockResolvedValue({
    success: true,
    limit: 20,
    remaining: 19,
    resetTime: Date.now() + 3_600_000,
    backend: "memory",
  });
  h.createClientImpl.mockReset().mockResolvedValue(h.supabase);
  h.requestHeaders
    .mockReset()
    .mockResolvedValue(new Headers({ "cf-connecting-ip": GUEST_IP }));
  h.fetchYoutubeCaptions.mockReset().mockResolvedValue(CAPTIONS_OK);
});

// ─── fetchVideoCaptions ──────────────────────────────────────────────────────

describe("fetchVideoCaptions", () => {
  it("rejects an invalid videoId without touching the upstream chain", async () => {
    const res = await fetchVideoCaptions(BAD_VIDEO_ID);
    expect(res).toEqual({ ok: false, error: "invalid_url" });
    expect(h.fetchYoutubeCaptions).not.toHaveBeenCalled();
  });

  it("guest: returns a segmented transcript and persists nothing", async () => {
    const res = await fetchVideoCaptions(VIDEO_ID);
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.origin).toBe("youtube_manual");
    expect(res.trackKind).toBe("manual");
    expect(res.language).toBe("en");
    expect(res.title).toBe("T");
    expect(res.channel).toBe("C");
    expect(res.durationMs).toBe(212000);
    expect(res.saved).toBe(false);

    // Real segmentation ran: the two cues merge at terminal punctuation.
    expect(res.sentences.length).toBeGreaterThan(0);
    expect(res.sentences.map((s) => s.text).join(" ")).toContain(
      "let you down",
    );

    // Nothing persisted for a guest — only pilot_events telemetry is written.
    expect(callsFor("content_sources")).toEqual([]);
    expect(callsFor("content_transcripts")).toEqual([]);
    expect(
      h.calls.filter((c) => c.method === "upsert" || c.method === "update"),
    ).toEqual([]);
  });

  it("logged-in: upserts content_sources + content_transcripts and reports saved", async () => {
    asLoggedIn();
    stubWritableDb();

    const res = await fetchVideoCaptions(VIDEO_ID);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.saved).toBe(true);

    const srcUpserts = callsFor("content_sources", "upsert");
    expect(srcUpserts).toHaveLength(1);
    expect(srcUpserts[0].args[0]).toMatchObject({
      user_id: USER.id,
      kind: "youtube",
      external_id: VIDEO_ID,
      title: "T",
      channel: "C",
      duration_ms: 212000,
    });

    const trUpserts = callsFor("content_transcripts", "upsert");
    expect(trUpserts).toHaveLength(1);
    expect(trUpserts[0].args[0]).toMatchObject({
      source_id: SOURCE_ID,
      user_id: USER.id,
      origin: "youtube_manual",
      language: "en",
    });
    expect((trUpserts[0].args[0] as { sentences: unknown }).sentences).toEqual(
      res.sentences,
    );
  });

  it("logged-in: returns the stored transcript without an upstream call", async () => {
    asLoggedIn();
    stubStoredTranscript();

    const res = await fetchVideoCaptions(VIDEO_ID);
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.saved).toBe(true);
    expect(res.title).toBe("Stored T");
    expect(res.channel).toBe("Stored C");
    expect(res.durationMs).toBe(60_000);
    expect(res.language).toBe("en");
    expect(res.origin).toBe("youtube_manual");
    expect(res.trackKind).toBe("manual");
    expect(res.sentences).toEqual(STORED_SENTENCES);

    // Dedup: no refetch, no re-persist.
    expect(h.fetchYoutubeCaptions).not.toHaveBeenCalled();
    expect(callsFor("content_sources", "upsert")).toEqual([]);
    expect(callsFor("content_transcripts", "upsert")).toEqual([]);
  });

  it.each([
    { upstream: "no_captions", expected: "no_captions" },
    { upstream: "blocked", expected: "blocked" },
    { upstream: "aborted", expected: "error" },
    { upstream: "error", expected: "error" },
  ] as const)(
    "maps upstream failure $upstream to $expected",
    async ({ upstream, expected }) => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      h.fetchYoutubeCaptions.mockResolvedValue({ ok: false, error: upstream });
      const res = await fetchVideoCaptions(VIDEO_ID);
      expect(res).toEqual({ ok: false, error: expected });
      // Failure is observed via pilot_events, nothing else is written.
      expect(callsFor("pilot_events", "insert")[0]?.args[0]).toMatchObject({
        event_name: "caption_fetch_failed",
        unit_id: VIDEO_ID,
      });
      // Route-level refusal detail goes to Worker logs for diagnosis.
      expect(warn).toHaveBeenCalledWith(
        "caption_fetch_failed",
        expect.objectContaining({ videoId: VIDEO_ID, error: upstream }),
      );
      warn.mockRestore();
    },
  );

  it("returns no_captions when the fetched track segments to zero sentences", async () => {
    h.fetchYoutubeCaptions.mockResolvedValue({ ...CAPTIONS_OK, events: [] });
    const res = await fetchVideoCaptions(VIDEO_ID);
    expect(res).toEqual({ ok: false, error: "no_captions" });
  });

  it("returns rate_limited when the limiter rejects", async () => {
    h.limiterCheck.mockResolvedValue({
      success: false,
      limit: 20,
      remaining: 0,
      resetTime: Date.now() + 3_600_000,
      backend: "memory",
    });
    const res = await fetchVideoCaptions(VIDEO_ID);
    expect(res).toEqual({ ok: false, error: "rate_limited" });
    expect(h.fetchYoutubeCaptions).not.toHaveBeenCalled();
  });

  it("segments an asr track into word-timed sentences", async () => {
    h.fetchYoutubeCaptions.mockResolvedValue({
      ...CAPTIONS_OK,
      track: { languageCode: "en", kind: "asr" as const },
      events: ASR_EVENTS,
    });
    const res = await fetchVideoCaptions(VIDEO_ID);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.origin).toBe("youtube_asr");
    expect(res.trackKind).toBe("asr");
    expect(res.sentences[0].text).toBe("Never gonna give you up.");
    expect(res.sentences[0].words).toHaveLength(5);
  });

  it("degrades to guest when auth/env resolution fails — fetch still runs", async () => {
    // Preview deploys don't carry worker secrets: createClient throws
    // ("Invalid URL string"). The caption chain is env-independent and must
    // still answer; persist/telemetry skip because supabase never existed.
    h.createClientImpl.mockRejectedValue(new Error("Invalid URL string."));
    const res = await fetchVideoCaptions(VIDEO_ID);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.saved).toBe(false);
    expect(res.sentences.length).toBeGreaterThan(0);
    expect(h.from).not.toHaveBeenCalled();
  });

  it("logs caption_fetch_succeeded to pilot_events on success", async () => {
    const res = await fetchVideoCaptions(VIDEO_ID);
    expect(res.ok).toBe(true);
    expect(callsFor("pilot_events", "insert")[0]?.args[0]).toMatchObject({
      event_name: "caption_fetch_succeeded",
      source: "youtube",
      unit_id: VIDEO_ID,
    });
  });
});

// ─── saveLearnerTranscript ───────────────────────────────────────────────────

describe("saveLearnerTranscript", () => {
  it("treats auth/env failure as unauthorized — nothing to persist through", async () => {
    h.createClientImpl.mockRejectedValue(new Error("env missing"));
    const res = await saveLearnerTranscript(VIDEO_ID, SRT);
    expect(res).toEqual({ ok: false, error: "unauthorized" });
  });

  it("rejects guests as unauthorized and writes nothing", async () => {
    const res = await saveLearnerTranscript(VIDEO_ID, SRT);
    expect(res).toEqual({ ok: false, error: "unauthorized" });
    expect(h.from).not.toHaveBeenCalled();
  });

  it("rejects an invalid videoId", async () => {
    asLoggedIn();
    const res = await saveLearnerTranscript(BAD_VIDEO_ID, SRT);
    expect(res).toEqual({ ok: false, error: "invalid_url" });
    expect(h.from).not.toHaveBeenCalled();
  });

  it("persists a valid SRT upload as learner_upload and reports saved", async () => {
    asLoggedIn();
    stubWritableDb();

    const res = await saveLearnerTranscript(VIDEO_ID, SRT);
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.origin).toBe("learner_upload");
    expect(res.trackKind).toBe("learner");
    expect(res.saved).toBe(true);
    expect(res.sentences.length).toBeGreaterThan(0);
    expect(res.sentences.map((s) => s.text).join(" ")).toContain("Hello world");

    const trUpserts = callsFor("content_transcripts", "upsert");
    expect(trUpserts).toHaveLength(1);
    expect(trUpserts[0].args[0]).toMatchObject({
      source_id: SOURCE_ID,
      user_id: USER.id,
      origin: "learner_upload",
    });
    expect(callsFor("pilot_events", "insert")[0]?.args[0]).toMatchObject({
      event_name: "caption_fetch_fallback",
      unit_id: VIDEO_ID,
    });
  });

  it("accepts plain pasted text as plain_text", async () => {
    asLoggedIn();
    stubWritableDb();

    const res = await saveLearnerTranscript(
      VIDEO_ID,
      "Just a sentence. And another one.",
    );
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.origin).toBe("plain_text");
    expect(res.sentences).toHaveLength(2);
  });

  it("rejects malformed subtitle text as invalid_file", async () => {
    asLoggedIn();
    const res = await saveLearnerTranscript(VIDEO_ID, BACKWARDS_SRT);
    expect(res).toEqual({ ok: false, error: "invalid_file" });
  });

  it("rejects input over the 1 MB cap as invalid_file", async () => {
    asLoggedIn();
    const res = await saveLearnerTranscript(VIDEO_ID, "x".repeat(1_000_001));
    expect(res).toEqual({ ok: false, error: "invalid_file" });
  });
});

// ─── saveWatchPosition ───────────────────────────────────────────────────────

describe("saveWatchPosition", () => {
  it("resolves without touching the DB for guests", async () => {
    await expect(saveWatchPosition(VIDEO_ID, 5_000)).resolves.toBeUndefined();
    expect(h.from).not.toHaveBeenCalled();
  });

  it("resolves without touching the DB for an invalid videoId", async () => {
    asLoggedIn();
    await expect(
      saveWatchPosition(BAD_VIDEO_ID, 5_000),
    ).resolves.toBeUndefined();
    expect(h.from).not.toHaveBeenCalled();
  });

  it("resolves without touching the DB for a negative position", async () => {
    asLoggedIn();
    await expect(saveWatchPosition(VIDEO_ID, -1)).resolves.toBeUndefined();
    expect(h.from).not.toHaveBeenCalled();
  });

  it("updates content_sources.last_position_ms for a logged-in learner", async () => {
    asLoggedIn();

    await expect(saveWatchPosition(VIDEO_ID, 5_000)).resolves.toBeUndefined();

    const updates = callsFor("content_sources", "update");
    expect(updates).toHaveLength(1);
    expect(updates[0].args[0]).toMatchObject({ last_position_ms: 5_000 });

    const eqArgs = callsFor("content_sources", "eq").map((c) => c.args);
    expect(eqArgs).toContainEqual(["user_id", USER.id]);
    expect(eqArgs).toContainEqual(["kind", "youtube"]);
    expect(eqArgs).toContainEqual(["external_id", VIDEO_ID]);
  });
});

describe("caption cache and provenance", () => {
  it("serves a guest from shared cache with no upstream or cache write", async () => {
    h.tableHandlers.set("shared_transcripts", () => ({
      data: {
        origin: "youtube_manual",
        language: "en",
        sentences: STORED_SENTENCES,
        segmentation_version: 1,
        title: "Shared title",
      },
      error: null,
    }));
    const result = await fetchVideoCaptions(VIDEO_ID);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.sentences).toEqual(STORED_SENTENCES);
    expect(result.saved).toBe(false);
    expect(h.fetchYoutubeCaptions).not.toHaveBeenCalled();
    expect(h.rpcService).not.toHaveBeenCalled();
  });
  it("stores only successful server acquisitions in the shared cache", async () => {
    await fetchVideoCaptions(VIDEO_ID);
    expect(h.rpcService).toHaveBeenCalledWith(
      "upsert_shared_transcript",
      expect.objectContaining({
        p_video_id: VIDEO_ID,
        p_origin: "youtube_manual",
        p_sentences: expect.any(String),
        p_imported_via: "server",
      }),
    );
  });
  it("shares plausible signed-in extension imports with provenance marking", async () => {
    asLoggedIn();
    stubWritableDb();
    const result = await importYoutubeCaptions(VIDEO_ID, {
      videoId: VIDEO_ID,
      tracks: [
        { languageCode: "en", kind: "manual", events: MANUAL_EVENTS_LONG },
      ],
    });
    expect(result.ok).toBe(true);
    expect(callsFor("content_transcripts", "upsert")).toHaveLength(1);
    expect(h.rpcService).toHaveBeenCalledWith(
      "upsert_shared_transcript",
      expect.objectContaining({
        p_video_id: VIDEO_ID,
        p_origin: "youtube_manual",
        p_imported_via: "extension",
      }),
    );
  });
  it("keeps implausible extension imports private to the learner", async () => {
    asLoggedIn();
    stubWritableDb();
    const result = await importYoutubeCaptions(VIDEO_ID, {
      videoId: VIDEO_ID,
      tracks: [{ languageCode: "en", kind: "manual", events: MANUAL_EVENTS }],
    });
    expect(result.ok).toBe(true);
    expect(callsFor("content_transcripts", "upsert")).toHaveLength(1);
    expect(h.rpcService).not.toHaveBeenCalled();
  });
  it("does not share learner-pasted content or upstream refusals", async () => {
    asLoggedIn();
    stubWritableDb();
    await saveLearnerTranscript(VIDEO_ID, SRT);
    h.fetchYoutubeCaptions.mockResolvedValue({ ok: false, error: "blocked" });
    await fetchVideoCaptions(VIDEO_ID);
    expect(h.rpcService).not.toHaveBeenCalled();
  });
});
