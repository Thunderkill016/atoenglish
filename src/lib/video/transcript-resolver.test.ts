import { describe, expect, it } from "vitest";
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
};

const ACCOUNT_ROW = {
  source_id: "src1",
  origin: "youtube_manual",
  language: "en",
  sentences: SENTENCES,
  segmentation_version: 3,
};

const LIBRARY_ROW = {
  video_id: VIDEO,
  origin: "youtube_asr",
  language: "en",
  sentences: SENTENCES,
  segmentation_version: 3,
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
    expect(r).toEqual({ status: "not_available" });
  });

  it("ignores empty sentence arrays", async () => {
    const store = fakeStore({
      shared_transcripts: [{ ...LIBRARY_ROW, sentences: [] }],
    });
    const r = await resolveTranscript(store, VIDEO, null);
    expect(r.status).toBe("not_available");
  });
});
