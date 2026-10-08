import { describe, expect, it } from "vitest";
import { SEGMENTATION_VERSION } from "./segment";
import { resolveTranscript, type TranscriptStore } from "./transcript-resolver";

const VIDEO = "abcdefghijk";
const SENTENCES = [{ i: 0, start_ms: 0, end_ms: 1000, text: "Hello" }];

/** Chainable eq() fake: each eq() narrows the row set by column=value. */
function fakeStore(rows: {
  content_sources?: Record<string, unknown>[];
  content_transcripts?: Record<string, unknown>[];
  shared_transcripts?: Record<string, unknown>[];
}): TranscriptStore {
  return {
    from(table: string) {
      let data = (rows[table as keyof typeof rows] ?? []) as Record<
        string,
        unknown
      >[];
      const node = {
        eq(column: string, value: unknown) {
          data = data.filter((r) => r[column] === value);
          return node;
        },
        async maybeSingle() {
          return { data: data[0] ?? null };
        },
      };
      return { select: () => node };
    },
  } as unknown as TranscriptStore;
}

const SOURCE = {
  id: "src1",
  user_id: "u1",
  kind: "youtube",
  external_id: VIDEO,
  title: "T",
  channel: "C",
  duration_ms: 60000,
  last_position_ms: 42000,
};

const ACCOUNT_ROW = {
  source_id: "src1",
  origin: "youtube_manual",
  language: "en",
  sentences: SENTENCES,
  segmentation_version: SEGMENTATION_VERSION,
};

const LIBRARY_ROW = {
  video_id: VIDEO,
  origin: "youtube_asr",
  language: "en",
  sentences: SENTENCES,
  segmentation_version: SEGMENTATION_VERSION,
  title: "Shared",
  channel: "Ch",
  duration_ms: 60000,
};

describe("resolveTranscript", () => {
  it("returns the account copy for its owner", async () => {
    const store = fakeStore({
      content_sources: [SOURCE],
      content_transcripts: [ACCOUNT_ROW],
      shared_transcripts: [LIBRARY_ROW],
    });
    const r = await resolveTranscript(store, VIDEO, "u1");
    expect(r.status).toBe("found");
    if (r.status === "found") {
      expect(r.scope).toBe("account");
      expect(r.transcript.saved).toBe(true);
      expect(r.transcript.trackKind).toBe("manual");
      expect(r.transcript.title).toBe("T");
      expect(r.savedPositionMs).toBe(42000);
    }
  });

  it("falls through to the library when the account source has no transcript", async () => {
    const store = fakeStore({
      content_sources: [SOURCE],
      // source row exists but its transcript row is missing/empty.
      content_transcripts: [],
      shared_transcripts: [LIBRARY_ROW],
    });
    const r = await resolveTranscript(store, VIDEO, "u1");
    expect(r.status).toBe("found");
    if (r.status === "found") {
      expect(r.scope).toBe("library");
      // Position survives the fallthrough — the source row still exists.
      expect(r.savedPositionMs).toBe(42000);
    }
  });

  it("falls through to the library row when the account has none", async () => {
    const store = fakeStore({ shared_transcripts: [LIBRARY_ROW] });
    const r = await resolveTranscript(store, VIDEO, "u1");
    expect(r.status).toBe("found");
    if (r.status === "found") {
      expect(r.scope).toBe("library");
      expect(r.transcript.saved).toBe(false);
      expect(r.transcript.trackKind).toBe("asr");
    }
  });

  it("serves the library to guests (no account lookup)", async () => {
    const store = fakeStore({
      // This private row belongs to u1 — a guest must never reach it.
      content_sources: [SOURCE],
      content_transcripts: [ACCOUNT_ROW],
      shared_transcripts: [LIBRARY_ROW],
    });
    const r = await resolveTranscript(store, VIDEO, null);
    expect(r.status).toBe("found");
    if (r.status === "found") {
      expect(r.scope).toBe("library");
      expect(r.transcript.title).toBe("Shared");
    }
  });

  it("a private account transcript is invisible to another user", async () => {
    const store = fakeStore({
      content_sources: [SOURCE],
      content_transcripts: [ACCOUNT_ROW],
    });
    const r = await resolveTranscript(store, VIDEO, "other-user");
    expect(r.status).toBe("not_available");
  });

  it("reports not_available when nothing exists", async () => {
    const r = await resolveTranscript(fakeStore({}), VIDEO, "u1");
    expect(r).toEqual({ status: "not_available", savedPositionMs: null });
  });

  it("returns position even with no transcript anywhere", async () => {
    const store = fakeStore({ content_sources: [SOURCE] });
    const r = await resolveTranscript(store, VIDEO, "u1");
    expect(r).toEqual({ status: "not_available", savedPositionMs: 42000 });
  });

  it("ignores empty sentence arrays", async () => {
    const store = fakeStore({
      shared_transcripts: [{ ...LIBRARY_ROW, sentences: [] }],
    });
    const r = await resolveTranscript(store, VIDEO, null);
    expect(r.status).toBe("not_available");
  });

  it("marks YouTube rows segmented under older rules as stale", async () => {
    const store = fakeStore({
      content_sources: [SOURCE],
      content_transcripts: [
        { ...ACCOUNT_ROW, segmentation_version: SEGMENTATION_VERSION - 1 },
      ],
    });
    const r = await resolveTranscript(store, VIDEO, "u1");
    expect(r.status).toBe("found");
    if (r.status === "found") expect(r.transcript.stale).toBe(true);
  });

  it("does not flag current-version or learner-authored rows", async () => {
    const fresh = await resolveTranscript(
      fakeStore({
        content_sources: [SOURCE],
        content_transcripts: [ACCOUNT_ROW],
      }),
      VIDEO,
      "u1",
    );
    expect(fresh.status === "found" && fresh.transcript.stale).toBeFalsy();
    // Learner uploads carry no upstream — an old version is not refetchable.
    const learner = await resolveTranscript(
      fakeStore({
        content_sources: [SOURCE],
        content_transcripts: [
          { ...ACCOUNT_ROW, origin: "learner_upload", segmentation_version: 1 },
        ],
      }),
      VIDEO,
      "u1",
    );
    expect(learner.status === "found" && learner.transcript.stale).toBeFalsy();
  });
});
