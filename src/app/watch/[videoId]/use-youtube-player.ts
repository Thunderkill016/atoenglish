"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { YTPlayer } from "@/lib/video/youtube-player.d";

/** How often the transcript sync polls the player clock. */
const SYNC_INTERVAL_MS = 200;
/** Give up waiting for iframe_api after this long (blocked/CSP/offline). */
const API_LOAD_TIMEOUT_MS = 10_000;

let apiLoading: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  apiLoading ??= new Promise<void>((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    const timer = setTimeout(
      () => fail("YouTube iframe_api load timed out"),
      API_LOAD_TIMEOUT_MS,
    );
    function fail(reason: string): void {
      clearTimeout(timer);
      apiLoading = null; // let a later mount retry the script
      reject(new Error(reason));
    }
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      clearTimeout(timer);
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    tag.onerror = () => fail("YouTube iframe_api script failed to load");
    document.head.appendChild(tag);
  });
  return apiLoading;
}

export interface PlayerControls {
  ready: boolean;
  playing: boolean;
  /** iframe_api failed to load or timed out — surface an error, not a spinner. */
  loadError: boolean;
  /** Current playback position in ms — updates every SYNC_INTERVAL_MS. */
  nowMs: number;
  durationMs: number;
  play: () => void;
  pause: () => void;
  seekToMs: (ms: number) => void;
  setRate: (rate: number) => void;
  rate: number;
}

/**
 * Mounts the official YouTube IFrame player (SPEC §4.1 — playback only ever
 * goes through this API) into `containerRef` and exposes a polled clock.
 */
export function useYouTubePlayer(
  videoId: string,
  startAtMs: number | null,
): { containerRef: React.RefObject<HTMLDivElement | null> } & PlayerControls {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const startAtRef = useRef(startAtMs);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [nowMs, setNowMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [rate, setRateState] = useState(1);

  useEffect(() => {
    startAtRef.current = startAtMs;
  }, [startAtMs]);

  useEffect(() => {
    let cancelled = false;
    let player: YTPlayer | null = null;
    let mountEl: HTMLDivElement | null = null;

    void loadYouTubeApi()
      .then(() => {
        if (cancelled || !containerRef.current || !window.YT) return;
        // YT.Player replaces its target element with the iframe, so mount
        // into an imperatively-created child — never the React-owned
        // container div, or destroy() leaves the ref on a detached node and
        // the next mount renders an invisible player.
        mountEl = document.createElement("div");
        containerRef.current.appendChild(mountEl);
        player = new window.YT.Player(mountEl, {
          videoId,
          // Fill the responsive frame instead of the API default 640 × 390.
          width: "100%",
          height: "100%",
          playerVars: {
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            cc_load_policy: 0, // we render our own transcript
            disablekb: 1, // our own shortcuts own the keyboard
            playsinline: 1,
          },
          events: {
            onReady: (e) => {
              if (cancelled) return;
              setReady(true);
              setDurationMs(e.target.getDuration() * 1000);
              if (startAtRef.current && startAtRef.current > 0) {
                e.target.seekTo(startAtRef.current / 1000, true);
              }
            },
            onStateChange: (e) => {
              if (cancelled || !window.YT) return;
              setPlaying(e.data === window.YT.PlayerState.PLAYING);
              setDurationMs(e.target.getDuration() * 1000);
            },
          },
        });
        playerRef.current = player;
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
      player?.destroy();
      playerRef.current = null;
      // No-op once YT.Player has replaced mountEl with the iframe; removes
      // the child if the constructor never ran or threw.
      mountEl?.remove();
    };
  }, [videoId]);

  useEffect(() => {
    const t = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      try {
        setNowMs(p.getCurrentTime() * 1000);
      } catch {
        // player not ready yet
      }
    }, SYNC_INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  const play = useCallback(() => playerRef.current?.playVideo(), []);
  const pause = useCallback(() => playerRef.current?.pauseVideo(), []);
  const seekToMs = useCallback((ms: number) => {
    playerRef.current?.seekTo(ms / 1000, true);
    setNowMs(ms);
  }, []);
  const setRate = useCallback((r: number) => {
    playerRef.current?.setPlaybackRate(r);
    setRateState(r);
  }, []);

  return {
    containerRef,
    ready,
    playing,
    loadError,
    nowMs,
    durationMs,
    play,
    pause,
    seekToMs,
    setRate,
    rate,
  };
}
