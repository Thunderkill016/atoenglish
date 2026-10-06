"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { YTPlayer } from "@/lib/video/youtube-player.d";

/** How often the transcript sync polls the player clock. */
const SYNC_INTERVAL_MS = 200;

let apiLoading: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  apiLoading ??= new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    document.head.appendChild(tag);
  });
  return apiLoading;
}

export interface PlayerControls {
  ready: boolean;
  playing: boolean;
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
  const [nowMs, setNowMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [rate, setRateState] = useState(1);

  useEffect(() => {
    startAtRef.current = startAtMs;
  }, [startAtMs]);

  useEffect(() => {
    let cancelled = false;
    let player: YTPlayer | null = null;

    void loadYouTubeApi().then(() => {
      if (cancelled || !containerRef.current || !window.YT) return;
      player = new window.YT.Player(containerRef.current, {
        videoId,
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
    });

    return () => {
      cancelled = true;
      player?.destroy();
      playerRef.current = null;
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
    nowMs,
    durationMs,
    play,
    pause,
    seekToMs,
    setRate,
    rate,
  };
}
