"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import {
  buildPlaybackTimeline,
  segmentAtTime,
  type PlaybackTimeline,
  type TranscriptSegment,
} from "@/lib/video/transcript-resource";
import type { Sentence } from "@/lib/video/types";
import type { PlayerClock, PlayerControls } from "@/lib/video/use-youtube-player";

export type RepeatMode = "once" | "three" | "continuous";
type PlaybackPhase = "watch" | "segment" | "gap" | "held" | "paused";
export const REPEAT_GAP_MS = 400; // Owner-selected listening break between complete turns.
const CLOCK_CHECK_MS = 200; // Same baseline cadence as the YouTube adapter.
const FRAME_CHECK_MS = 16; // One foreground animation frame near a boundary.
const NATIVE_SEEK_JUMP_MS = 1000; // Larger than a normal 200ms sample at supported rates.
const KEYBOARD_SEEK_MS = 5000;

export interface SentencePlayerState {
  activeSegmentId: string | null;
  repeatMode: RepeatMode;
  autoPause: boolean;
  phase: PlaybackPhase;
  completed: number;
  /** Explicit pauses/completed finite sessions, never the internal 400ms gaps. */
  saveRevision: number;
}
interface Transport {
  readClock: () => PlayerClock;
  play: () => void;
  pause: () => void;
  seekToMs: (ms: number) => void;
  onDeliberateSeek: (ms: number) => void;
}
interface Session {
  target: TranscriptSegment;
  limit: number;
  completed: number;
  entered: boolean;
}

/** One cursor for every learning surface; the locked target is a boundary guard. */
export class SentencePlayer {
  private state: SentencePlayerState = {
    activeSegmentId: null,
    repeatMode: "once",
    autoPause: false,
    phase: "watch",
    completed: 0,
    saveRevision: 0,
  };
  private listeners = new Set<() => void>();
  private session: Session | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private generation = 0;
  private live = true;
  private lastClock: PlayerClock | null = null;
  private observedAt = 0;
  private resumeFromStart = false;

  constructor(
    readonly timeline: PlaybackTimeline,
    private transport: Transport,
    readonly videoId = "",
  ) {
    this.state = {
      ...this.state,
      activeSegmentId: segmentAtTime(
        timeline.segments,
        transport.readClock().nowMs,
      ),
    };
  }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  activate = () => {
    this.live = true;
  };
  dispose = () => {
    this.live = false;
    this.cancelTimer();
    this.session = null;
  };
  private publish(patch: Partial<SentencePlayerState>) {
    if (
      !Object.entries(patch).some(
        ([key, value]) =>
          this.state[key as keyof SentencePlayerState] !== value,
      )
    )
      return;
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener());
  }
  private cancelTimer() {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.generation += 1;
  }
  private target(id = this.state.activeSegmentId) {
    return this.timeline.segments.find((s) => s.id === id);
  }
  private limit() {
    return this.state.repeatMode === "continuous"
      ? Infinity
      : this.state.repeatMode === "three"
        ? 3
        : 1;
  }
  private arm(target: TranscriptSegment, entered: boolean) {
    this.cancelTimer();
    this.session = { target, limit: this.limit(), completed: 0, entered };
    this.publish({
      activeSegmentId: target.id,
      phase: "segment",
      completed: 0,
    });
  }
  private seekTarget(target: TranscriptSegment, bounded: boolean) {
    this.cancelTimer();
    this.session = null;
    this.resumeFromStart = false;
    this.lastClock = null;
    if (bounded || this.state.repeatMode !== "once" || this.state.autoPause)
      this.arm(target, false);
    else
      this.publish({
        activeSegmentId: target.id,
        phase: "watch",
        completed: 0,
      });
    this.transport.seekToMs(target.startMs);
    this.transport.onDeliberateSeek(target.startMs);
    this.transport.play();
    this.observe(this.transport.readClock());
  }
  selectSegment = (id: string) => {
    const target = this.target(id);
    if (target) this.seekTarget(target, false);
  };
  previous = () => {
    const index = this.timeline.segments.findIndex(
      (s) => s.id === this.state.activeSegmentId,
    );
    const target = this.timeline.segments[Math.max(0, index - 1)];
    if (target) this.seekTarget(target, false);
  };
  next = () => {
    const index = this.timeline.segments.findIndex(
      (s) => s.id === this.state.activeSegmentId,
    );
    const target =
      this.timeline.segments[
        Math.min(index + 1, this.timeline.segments.length - 1)
      ];
    if (target) this.seekTarget(target, false);
  };
  replay = () => {
    const target = this.target();
    if (target) this.seekTarget(target, true);
  };
  seek = (ms: number) => {
    if (!Number.isFinite(ms)) return;
    const duration = this.transport.readClock().durationMs;
    const position = Math.max(0, duration > 0 ? Math.min(ms, duration) : ms);
    this.cancelTimer();
    this.session = null;
    this.lastClock = null;
    this.publish({
      repeatMode: "once",
      phase: "watch",
      completed: 0,
      activeSegmentId: segmentAtTime(this.timeline.segments, position),
    });
    this.transport.seekToMs(position);
    this.transport.onDeliberateSeek(position);
  };
  seekBy = (direction: -1 | 1) =>
    this.seek(this.transport.readClock().nowMs + direction * KEYBOARD_SEEK_MS);
  pause = () => {
    this.resumeFromStart = this.state.phase === "gap";
    this.cancelTimer();
    this.publish({
      phase: "paused",
      saveRevision: this.state.saveRevision + 1,
    });
    this.transport.pause();
  };
  play = () => {
    if (this.state.phase === "held") {
      const index = this.timeline.segments.findIndex(
        (s) => s.id === this.state.activeSegmentId,
      );
      const next = this.timeline.segments[index + 1];
      if (next) this.seekTarget(next, false);
      return;
    }
    if (this.state.phase === "gap") {
      this.pause();
      return;
    }
    const target = this.target();
    if (this.resumeFromStart && this.session) {
      this.session.entered = false;
      this.lastClock = null;
      this.transport.seekToMs(this.session.target.startMs);
    }
    this.resumeFromStart = false;
    if (
      !this.session &&
      target &&
      (this.state.autoPause || this.state.repeatMode !== "once")
    )
      this.arm(target, true);
    this.publish({ phase: this.session ? "segment" : "watch" });
    this.transport.play();
    this.observe(this.transport.readClock());
  };
  setRepeat = (mode: RepeatMode) => {
    this.cancelTimer();
    this.session = null;
    this.publish({ repeatMode: mode, phase: "watch", completed: 0 });
    if (mode !== "once") {
      const target = this.target();
      if (target) this.seekTarget(target, true);
    } else if (this.state.autoPause) {
      const target = this.target();
      if (target) this.arm(target, true);
    }
  };
  setAutoPause = (enabled: boolean) => {
    this.publish({ autoPause: enabled });
    if (this.state.repeatMode !== "once") return;
    this.cancelTimer();
    this.session = null;
    const target = this.target();
    if (enabled && target) this.arm(target, true);
    else this.publish({ phase: "watch" });
    this.observe(this.transport.readClock());
  };
  observe = (clock: PlayerClock) => {
    if (!this.live) return;
    const previous = this.lastClock;
    const elapsed = Date.now() - this.observedAt;
    this.lastClock = clock;
    this.observedAt = Date.now();
    const nativePlay = clock.playing && previous && !previous.playing;
    const discontinuity =
      previous &&
      Math.abs(
        clock.nowMs -
          previous.nowMs -
          (previous.playing ? elapsed * previous.rate : 0),
      ) > NATIVE_SEEK_JUMP_MS;
    if (this.state.phase === "gap") {
      // An explicit native Play during a break cancels the scheduled replay.
      if (nativePlay) this.pause();
      return;
    }
    if (this.state.phase === "held" || this.state.phase === "paused") {
      if (discontinuity) {
        this.cancelTimer();
        this.session = null;
        this.resumeFromStart = false;
        this.publish({
          repeatMode: "once",
          phase: clock.playing ? "watch" : "paused",
          completed: 0,
          activeSegmentId: segmentAtTime(this.timeline.segments, clock.nowMs),
        });
      } else {
        if (nativePlay) this.play();
        return;
      }
    }
    if (previous?.playing && clock.state === "paused") {
      this.cancelTimer();
      this.publish({
        phase: "paused",
        saveRevision: this.state.saveRevision + 1,
      });
      return;
    }
    const session = this.session;
    // The iframe's own scrubber has no seek event. Detect discontinuities,
    // but never mistake an ordinary sample crossing a boundary for a seek.
    if (session?.entered && discontinuity) {
      this.cancelTimer();
      this.session = null;
      this.publish({ repeatMode: "once", phase: "watch", completed: 0 });
    }
    if (!this.session) {
      this.publish({
        activeSegmentId: segmentAtTime(this.timeline.segments, clock.nowMs),
      });
      const target = this.target();
      if (
        clock.playing &&
        this.state.autoPause &&
        target &&
        clock.nowMs < target.endMs
      )
        this.arm(target, true);
    }
    const current = this.session;
    if (!current) return;
    if (
      !current.entered &&
      clock.nowMs >= current.target.startMs &&
      clock.nowMs < current.target.endMs
    )
      current.entered = true;
    if (!clock.playing && clock.state !== "ended") {
      this.cancelTimer();
      return;
    }
    const effectiveEnd =
      clock.durationMs > 0
        ? Math.min(current.target.endMs, clock.durationMs)
        : current.target.endMs;
    if (current.entered && clock.nowMs >= effectiveEnd) {
      this.complete(current);
      return;
    }
    this.cancelTimer();
    const generation = this.generation;
    const delay = current.entered
      ? Math.max(
          FRAME_CHECK_MS,
          Math.min(CLOCK_CHECK_MS, (effectiveEnd - clock.nowMs) / clock.rate),
        )
      : CLOCK_CHECK_MS;
    this.timer = setTimeout(() => {
      if (this.live && generation === this.generation)
        this.observe(this.transport.readClock());
    }, delay);
  };
  private complete(session: Session) {
    this.cancelTimer();
    session.completed += 1;
    this.transport.pause();
    const more = session.completed < session.limit;
    this.publish({
      activeSegmentId: session.target.id,
      completed: session.completed,
      phase: more ? "gap" : "held",
      ...(!more ? { saveRevision: this.state.saveRevision + 1 } : {}),
    });
    if (!more) return;
    const generation = this.generation;
    this.timer = setTimeout(() => {
      if (!this.live || generation !== this.generation) return;
      session.entered = false;
      this.lastClock = null;
      this.publish({ phase: "segment" });
      this.transport.seekToMs(session.target.startMs);
      this.transport.play();
      this.observe(this.transport.readClock());
    }, REPEAT_GAP_MS);
  }
}

export function useSentencePlayer(
  videoId: string,
  sentences: Sentence[],
  player: PlayerControls,
) {
  const timeline = useMemo(() => buildPlaybackTimeline(sentences), [sentences]);
  const { play, pause, seekToMs, readClock } = player;
  const controller = useMemo(
    () =>
      new SentencePlayer(
        timeline,
        {
          play,
          pause,
          seekToMs,
          readClock,
          onDeliberateSeek: (ms) => {
            const url = new URL(window.location.href);
            url.searchParams.set("t", String(Math.floor(ms)));
            window.history.replaceState(null, "", url);
          },
        },
        videoId,
      ),
    [timeline, play, pause, seekToMs, readClock, videoId],
  );
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  useEffect(() => {
    controller.activate();
    return controller.dispose;
  }, [controller]);
  useEffect(() => {
    controller.observe(readClock());
  }, [
    controller,
    readClock,
    player.nowMs,
    player.playing,
    player.rate,
    player.state,
  ]);
  const activeSentence = state.activeSegmentId
    ? timeline.sentenceById.get(state.activeSegmentId)
    : undefined;
  return { controller, state, timeline, activeSentence };
}
