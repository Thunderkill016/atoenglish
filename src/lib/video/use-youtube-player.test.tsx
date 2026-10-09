import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useYouTubePlayer } from "./use-youtube-player";
import type { YTPlayer } from "@/lib/video/youtube-player.d";

type Config = ConstructorParameters<NonNullable<Window["YT"]>["Player"]>[1];
let adapter: ReturnType<typeof useYouTubePlayer>;
let native: NativePlayer;
let root: Root;
let container: HTMLDivElement;
class NativePlayer implements YTPlayer {
  state = 2;
  time = 0;
  rate = 1;
  seekTo = vi.fn((seconds: number) => {
    this.time = seconds;
  });
  playVideo = vi.fn(() => this.changeState(1));
  pauseVideo = vi.fn(() => this.changeState(2));
  setPlaybackRate = vi.fn(); // Deliberately does not accept an unconfirmed rate.
  destroy = vi.fn();
  constructor(
    _element: HTMLElement | string,
    readonly config: Config,
  ) {
    native = this;
    queueMicrotask(() => config.events?.onReady?.({ target: this }));
  }
  changeState(state: number) {
    this.state = state;
    this.config.events?.onStateChange?.({ target: this, data: state });
  }
  confirmRate(rate: number) {
    this.rate = rate;
    this.config.events?.onPlaybackRateChange?.({ target: this, data: rate });
  }
  getCurrentTime = () => this.time;
  getDuration = () => 60;
  getPlayerState = () => this.state;
  getPlaybackRate = () => this.rate;
  getAvailablePlaybackRates = () => [0.5, 0.75, 1, 1.25];
}
function Harness({
  mode = "watch",
  position = 3000,
}: {
  mode?: string;
  position?: number;
}) {
  const { containerRef, ...value } = useYouTubePlayer("abcdefghijk", position);
  useEffect(() => {
    adapter = { ...value, containerRef };
  });
  return <div ref={containerRef} data-mode={mode} />;
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  window.YT = {
    Player: NativePlayer,
    PlayerState: { ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 },
  };
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  delete window.YT;
  vi.unstubAllGlobals();
});
it("uses the YouTube-confirmed rate rather than an optimistic requested value", async () => {
  await act(async () => root.render(<Harness />));
  expect(adapter.availableRates).toEqual([0.5, 0.75, 1, 1.25]);
  await act(async () => adapter.setRate(1.25));
  expect(native.setPlaybackRate).toHaveBeenCalledWith(1.25);
  expect(adapter.rate).toBe(1);
  await act(async () => native.confirmRate(0.75));
  expect(adapter.rate).toBe(0.75);
});
it("reads the native clock/state, restores the supplied position and keeps the player across mode changes", async () => {
  await act(async () => root.render(<Harness />));
  const first = native;
  expect(first.seekTo).toHaveBeenCalledWith(3, true);
  await act(async () => {
    native.time = 7.5;
    native.changeState(3);
  });
  expect(adapter.readClock()).toMatchObject({
    state: "buffering",
    playing: false,
    nowMs: 7500,
  });
  await act(async () => root.render(<Harness mode="read" />));
  expect(native).toBe(first);
  expect(first.destroy).not.toHaveBeenCalled();
  await act(async () => native.changeState(1));
  expect(adapter.readClock()).toMatchObject({
    state: "playing",
    playing: true,
    nowMs: 7500,
  });
});

it("does not call methods on the partial YouTube object before onReady", async () => {
  let config: Config;
  const partial = { destroy: vi.fn() };
  window.YT!.Player = class {
    constructor(_element: HTMLElement | string, options: Config) {
      config = options;
      return partial;
    }
  } as unknown as NonNullable<Window["YT"]>["Player"];
  await act(async () => root.render(<Harness />));
  expect(adapter.ready).toBe(false);
  expect(adapter.readClock()).toMatchObject({ nowMs: 0, state: "unstarted" });
  expect(() => {
    adapter.play();
    adapter.pause();
    adapter.seekToMs(8000);
    adapter.setRate(0.75);
  }).not.toThrow();
  const complete = new NativePlayer("fixture", config!);
  Object.assign(partial, complete);
  await act(async () => {
    config!.events?.onReady?.({ target: partial as unknown as YTPlayer });
  });
  expect(adapter.ready).toBe(true);
  expect(adapter.readClock().state).toBe("paused");
});
