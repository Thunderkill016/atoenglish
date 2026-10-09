import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildPlaybackTimeline } from "@/lib/video/transcript-resource";
import type { Sentence } from "@/lib/video/types";
import type { PlayerClock } from "@/lib/video/use-youtube-player";
import { REPEAT_GAP_MS, SentencePlayer } from "./use-sentence-player";

const source: Sentence[] = [
  { i: 10, text: "First sentence.", start_ms: 0, end_ms: 1000 },
  { i: 40, text: "Next sentence.", start_ms: 1000, end_ms: 2000 },
  { i: 90, text: "Last sentence.", start_ms: 3000, end_ms: 4000 },
];
function fixture(sentences = source, sampleMs = 1) {
  let anchor = Date.now();
  let position = 0;
  let state: PlayerClock["state"] = "paused";
  let rate = 1;
  let durationMs = 4000;
  const readClock = (): PlayerClock => ({
    nowMs:
      position +
      (state === "playing"
        ? Math.floor(((Date.now() - anchor) * rate) / sampleMs) * sampleMs
        : 0),
    durationMs,
    rate,
    state,
    playing: state === "playing",
  });
  const transport = {
    readClock,
    play: vi.fn(() => {
      position = readClock().nowMs;
      anchor = Date.now();
      state = "playing";
    }),
    pause: vi.fn(() => {
      position = readClock().nowMs;
      anchor = Date.now();
      state = "paused";
    }),
    seekToMs: vi.fn((ms: number) => {
      position = ms;
      anchor = Date.now();
    }),
    onDeliberateSeek: vi.fn(),
  };
  const engine = new SentencePlayer(
    buildPlaybackTimeline(sentences),
    transport,
  );
  return {
    engine,
    transport,
    state: (next: PlayerClock["state"]) => {
      position = readClock().nowMs;
      anchor = Date.now();
      state = next;
      engine.observe(readClock());
    },
    rate: (next: number) => {
      position = readClock().nowMs;
      anchor = Date.now();
      rate = next;
      engine.observe(readClock());
    },
    nativeSeek: (ms: number) => {
      position = ms;
      anchor = Date.now();
      engine.observe(readClock());
    },
    duration: (ms: number) => {
      durationMs = ms;
    },
  };
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
});
afterEach(() => vi.useRealTimers());

describe("canonical sentence playback", () => {
  it("tests the locked cue even when a coarse clock has crossed into the next contiguous cue", () => {
    const { engine, transport } = fixture(source, 600);
    engine.setRepeat("three");
    vi.advanceTimersByTime(1300);
    expect(engine.getSnapshot()).toMatchObject({
      activeSegmentId: "seg-10",
      phase: "gap",
      completed: 1,
    });
    expect(transport.pause).toHaveBeenCalledOnce();
    engine.dispose();
  });
  it("counts the first turn, gives each replay a 400ms break, and holds after exactly three", () => {
    const { engine, transport } = fixture();
    engine.setRepeat("three");
    vi.advanceTimersByTime(1000);
    expect(engine.getSnapshot()).toMatchObject({
      phase: "gap",
      completed: 1,
      saveRevision: 0,
    });
    vi.advanceTimersByTime(REPEAT_GAP_MS - 1);
    expect(transport.seekToMs).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(transport.seekToMs).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(1000 + REPEAT_GAP_MS + 1000);
    expect(engine.getSnapshot()).toMatchObject({
      phase: "held",
      completed: 3,
      activeSegmentId: "seg-10",
      saveRevision: 1,
    });
    vi.advanceTimersByTime(10_000);
    expect(transport.play).toHaveBeenCalledTimes(3);
    expect(transport.onDeliberateSeek).toHaveBeenCalledTimes(1); // No URL/write on an internal gap.
    engine.dispose();
  });
  it("continuous repeat takes precedence over auto pause and retargeting resets the counter", () => {
    const { engine, transport } = fixture();
    engine.setAutoPause(true);
    engine.setRepeat("continuous");
    vi.advanceTimersByTime(1000 + REPEAT_GAP_MS);
    engine.next();
    expect(engine.getSnapshot()).toMatchObject({
      activeSegmentId: "seg-40",
      completed: 0,
      phase: "segment",
    });
    vi.advanceTimersByTime(1000);
    expect(engine.getSnapshot()).toMatchObject({
      completed: 1,
      phase: "gap",
      saveRevision: 0,
    });
    engine.selectSegment("seg-90");
    expect(transport.seekToMs).toHaveBeenLastCalledWith(3000);
    expect(engine.getSnapshot().completed).toBe(0);
    engine.dispose();
  });
  it("auto pause holds the heard cue; Play continues at the next normalized cue", () => {
    const { engine, transport } = fixture();
    engine.setAutoPause(true);
    engine.play();
    vi.advanceTimersByTime(1000);
    expect(engine.getSnapshot()).toMatchObject({
      phase: "held",
      activeSegmentId: "seg-10",
    });
    engine.play();
    expect(transport.seekToMs).toHaveBeenLastCalledWith(1000);
    expect(engine.getSnapshot().activeSegmentId).toBe("seg-40");
    engine.dispose();
  });
  it("replay in once mode plays only the one cue", () => {
    const { engine } = fixture();
    engine.replay();
    vi.advanceTimersByTime(1000);
    expect(engine.getSnapshot()).toMatchObject({
      phase: "held",
      completed: 1,
      repeatMode: "once",
    });
    engine.dispose();
  });
  it("manual/dictionary pause cancels the queued replay and never resumes on its own", () => {
    const { engine, transport } = fixture();
    engine.setRepeat("continuous");
    vi.advanceTimersByTime(1000);
    engine.pause();
    vi.advanceTimersByTime(5000);
    expect(transport.play).toHaveBeenCalledOnce();
    expect(engine.getSnapshot()).toMatchObject({
      phase: "paused",
      completed: 1,
      saveRevision: 1,
    });
    engine.play();
    vi.advanceTimersByTime(1000);
    expect(engine.getSnapshot().completed).toBe(2); // The old boundary was not counted twice.
    engine.dispose();
  });
  it("scrubbing exits repeat and preserves playing/paused state; backward seeking updates the cursor", () => {
    const { engine, transport } = fixture();
    engine.setRepeat("continuous");
    engine.seek(3200);
    expect(engine.getSnapshot()).toMatchObject({
      repeatMode: "once",
      activeSegmentId: "seg-90",
    });
    expect(transport.readClock().playing).toBe(true);
    engine.pause();
    engine.seek(400);
    expect(transport.readClock().playing).toBe(false);
    expect(engine.getSnapshot().activeSegmentId).toBe("seg-10");
    vi.advanceTimersByTime(5000);
    expect(transport.play).toHaveBeenCalledOnce();
    engine.dispose();
  });
  it("does not count buffering as a turn and recalculates the deadline on a confirmed rate change", () => {
    const f = fixture();
    f.engine.setRepeat("three");
    vi.advanceTimersByTime(400);
    f.state("buffering");
    vi.advanceTimersByTime(3000);
    expect(f.engine.getSnapshot().completed).toBe(0);
    f.state("playing");
    f.rate(0.5);
    vi.advanceTimersByTime(1000);
    expect(f.engine.getSnapshot().completed).toBe(0);
    vi.advanceTimersByTime(200);
    expect(f.engine.getSnapshot()).toMatchObject({
      phase: "gap",
      completed: 1,
    });
    f.engine.dispose();
  });
  it("cancels all timers on disposal/transcript replacement", () => {
    const old = fixture();
    old.engine.setRepeat("continuous");
    vi.advanceTimersByTime(1000);
    old.engine.dispose();
    const fresh = fixture([source[2]]);
    vi.advanceTimersByTime(5000);
    expect(old.transport.play).toHaveBeenCalledOnce();
    expect(fresh.engine.getSnapshot().repeatMode).toBe("once");
    fresh.engine.dispose();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("clamps a last cue at the actual video end and native end still completes its turn", () => {
    const f = fixture();
    f.duration(3500);
    f.engine.selectSegment("seg-90");
    f.engine.replay();
    vi.advanceTimersByTime(500);
    f.state("ended");
    expect(f.engine.getSnapshot()).toMatchObject({
      phase: "held",
      completed: 1,
    });
    f.engine.play();
    expect(f.transport.seekToMs).toHaveBeenLastCalledWith(3000); // No fake next cue.
    f.engine.dispose();
  });
  it("normalizes overlap, skips invalid cues, and navigates non-contiguous original IDs", () => {
    const f = fixture([
      { ...source[0], end_ms: 1500 },
      source[1],
      { i: 50, text: "Read only.", start_ms: NaN, end_ms: 2500 },
      source[2],
    ]);
    f.engine.previous();
    expect(f.transport.seekToMs).toHaveBeenLastCalledWith(0);
    f.engine.setRepeat("three");
    vi.advanceTimersByTime(1000);
    expect(f.engine.getSnapshot().phase).toBe("gap");
    f.engine.next();
    expect(f.engine.getSnapshot().activeSegmentId).toBe("seg-40");
    f.engine.next();
    expect(f.engine.getSnapshot().activeSegmentId).toBe("seg-90");
    f.engine.next();
    expect(f.transport.seekToMs).toHaveBeenLastCalledWith(3000);
    f.engine.selectSegment("seg-50");
    expect(f.engine.getSnapshot().activeSegmentId).toBe("seg-90");
    f.engine.dispose();
  });
  it("native pause saves once, native Play resumes, and native scrubbing cancels a bounded target", () => {
    const f = fixture();
    f.engine.setRepeat("continuous");
    vi.advanceTimersByTime(200);
    f.state("paused");
    expect(f.engine.getSnapshot().saveRevision).toBe(1);
    f.state("paused");
    expect(f.engine.getSnapshot().saveRevision).toBe(1);
    f.state("playing");
    expect(f.engine.getSnapshot().phase).toBe("segment");
    f.nativeSeek(3200);
    expect(f.engine.getSnapshot()).toMatchObject({
      repeatMode: "once",
      activeSegmentId: "seg-90",
    });
    f.engine.dispose();
  });
});
