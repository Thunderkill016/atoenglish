"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronFirst,
  ChevronLast,
  FastForward,
  Keyboard,
  Pause,
  Play,
  Repeat,
  Timer,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Sentence } from "@/lib/video/types";
import {
  fetchVideoCaptions,
  saveLearnerTranscript,
  saveWatchPosition,
  type CaptionActionError,
  type LoadedTranscript,
} from "@/app/actions/captions";
import { EmptyTranscript } from "./empty-transcript";
import { TranscriptRail, formatTimestamp } from "./transcript-rail";
import { useYouTubePlayer } from "./use-youtube-player";

const ERROR_MESSAGES: Record<CaptionActionError, string> = {
  invalid_url: "Link video không hợp lệ.",
  no_captions: "Video này không có phụ đề tiếng Anh.",
  blocked:
    "YouTube đang chặn yêu cầu từ máy chủ. Hãy dán hoặc tải phụ đề thủ công.",
  rate_limited: "Bạn đã lấy phụ đề quá nhiều lần. Thử lại sau.",
  unauthorized: "Đăng nhập để lưu phụ đề.",
  invalid_file: "Không đọc được phụ đề này.",
  error: "Có lỗi khi lấy phụ đề. Thử lại hoặc dán phụ đề.",
};

const SPEEDS = [1, 0.75, 0.5] as const;
const POSITION_SAVE_INTERVAL_MS = 15_000;

type Phase = "idle" | "fetching" | "ready" | "error";
type ViewMode = "theater" | "read";

interface WatchClientProps {
  videoId: string;
  loggedIn: boolean;
  initial: LoadedTranscript | null;
  initialPositionMs: number | null;
}

/** Index of the sentence covering `ms` (last sentence whose start ≤ ms). */
function activeSentenceIndex(sentences: Sentence[], ms: number): number {
  let idx = -1;
  for (const s of sentences) {
    if (s.start_ms != null && s.start_ms <= ms) idx = s.i;
    else if (s.start_ms != null && s.start_ms > ms) break;
  }
  return idx;
}

export function WatchClient({
  videoId,
  loggedIn,
  initial,
  initialPositionMs,
}: WatchClientProps) {
  const [transcript, setTranscript] = useState<LoadedTranscript | null>(initial);
  const [phase, setPhase] = useState<Phase>(initial ? "ready" : "idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("theater");
  const [loopSentence, setLoopSentence] = useState(false);
  const [autoPause, setAutoPause] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  const player = useYouTubePlayer(videoId, initialPositionMs);
  const { nowMs, playing, ready, durationMs, rate, containerRef } = player;

  const sentences = useMemo(
    () => transcript?.sentences ?? [],
    [transcript],
  );
  const timedSentences = useMemo(
    () => sentences.filter((s) => s.start_ms != null),
    [sentences],
  );
  const activeIndex = activeSentenceIndex(sentences, nowMs);
  const activeSentence =
    activeIndex >= 0 ? sentences.find((s) => s.i === activeIndex) : undefined;

  // ── Sentence-boundary behaviours (loop / auto-pause) ──────────────────────
  const handledBoundary = useRef(-1);
  useEffect(() => {
    if (!activeSentence?.end_ms || !playing) return;
    if (nowMs < activeSentence.end_ms) return;
    if (handledBoundary.current === activeIndex) return;
    handledBoundary.current = activeIndex;
    if (loopSentence && activeSentence.start_ms != null) {
      player.seekToMs(activeSentence.start_ms);
    } else if (autoPause) {
      player.pause();
    }
  }, [nowMs, activeSentence, activeIndex, loopSentence, autoPause, playing, player]);

  const seekToSentence = useCallback(
    (index: number) => {
      const s = timedSentences[index];
      if (!s?.start_ms) return;
      handledBoundary.current = -1;
      player.seekToMs(s.start_ms);
      player.play();
    },
    [timedSentences, player],
  );

  const timedIdxOfActive = timedSentences.findIndex(
    (s) => s.i === activeIndex,
  );
  const goPrev = useCallback(() => {
    const idx = timedIdxOfActive > 0 ? timedIdxOfActive - 1 : 0;
    seekToSentence(idx);
  }, [timedIdxOfActive, seekToSentence]);
  const goNext = useCallback(() => {
    const idx =
      timedIdxOfActive >= 0 && timedIdxOfActive < timedSentences.length - 1
        ? timedIdxOfActive + 1
        : timedSentences.length - 1;
    seekToSentence(idx);
  }, [timedIdxOfActive, timedSentences.length, seekToSentence]);
  const replayCurrent = useCallback(() => {
    if (timedIdxOfActive >= 0) seekToSentence(timedIdxOfActive);
  }, [timedIdxOfActive, seekToSentence]);

  // ── Fetch / fallback flows ────────────────────────────────────────────────
  const handleFetchYoutube = useCallback(async () => {
    setPhase("fetching");
    setErrorMessage(null);
    try {
      const result = await fetchVideoCaptions(videoId);
      if (!result.ok) {
        setErrorMessage(ERROR_MESSAGES[result.error]);
        setPhase("error");
        return;
      }
      setTranscript(result);
      setPhase("ready");
    } catch {
      setErrorMessage(ERROR_MESSAGES.error);
      setPhase("error");
    }
  }, [videoId]);

  const handleParsed = useCallback(
    async (parsed: LoadedTranscript, raw: string) => {
      setTranscript(parsed);
      setPhase("ready");
      setErrorMessage(null);
      if (loggedIn) {
        const saved = await saveLearnerTranscript(videoId, raw);
        if (saved.ok) setTranscript(saved);
      }
    },
    [videoId, loggedIn],
  );

  // ── Persist playback position (logged-in only, SPEC §4.4) ────────────────
  const positionRef = useRef(nowMs);
  useEffect(() => {
    positionRef.current = nowMs;
  }, [nowMs]);
  useEffect(() => {
    if (!loggedIn) return;
    const t = setInterval(() => {
      if (playing && positionRef.current > 0) {
        void saveWatchPosition(videoId, positionRef.current);
      }
    }, POSITION_SAVE_INTERVAL_MS);
    return () => clearInterval(t);
  }, [loggedIn, playing, videoId]);
  const wasPlaying = useRef(playing);
  useEffect(() => {
    if (wasPlaying.current && !playing && loggedIn && positionRef.current > 0) {
      void saveWatchPosition(videoId, positionRef.current);
    }
    wasPlaying.current = playing;
  }, [playing, loggedIn, videoId]);

  // ── Keyboard shortcuts (SPEC §4.4) ────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          if (playing) player.pause();
          else player.play();
          break;
        case "a":
          goPrev();
          break;
        case "d":
          goNext();
          break;
        case "s":
          setLoopSentence((v) => !v);
          break;
        case "r":
          setAutoPause((v) => !v);
          break;
        case "q":
          replayCurrent();
          break;
        case "?":
          setShowKeys((v) => !v);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing, player, goPrev, goNext, replayCurrent]);

  const cycleSpeed = () => {
    const idx = SPEEDS.indexOf(player.rate as (typeof SPEEDS)[number]);
    player.setRate(SPEEDS[(idx + 1) % SPEEDS.length]);
  };

  const trackLabel =
    transcript?.trackKind === "asr"
      ? "Phụ đề tự động"
      : transcript?.trackKind === "manual"
        ? "Phụ đề của video"
        : transcript?.trackKind === "learner"
          ? "Phụ đề của bạn"
          : null;

  const controlBtn =
    "flex h-9 w-9 items-center justify-center rounded-md text-[#9d9da6] transition hover:bg-white/10 hover:text-[#e8e8ea] disabled:opacity-40";

  return (
    <div className="flex min-h-screen flex-col bg-[#0c0c0e] text-[#e8e8ea]">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-[#232327] px-4 py-2.5">
        <Link
          href="/discover"
          className="flex items-center gap-1.5 text-sm text-[#9d9da6] transition hover:text-[#e8e8ea]"
        >
          <ArrowLeft className="h-4 w-4" />
          Khám phá
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-medium">
            {transcript?.title ?? `Video ${videoId}`}
          </h1>
          {transcript?.channel && (
            <p className="truncate text-xs text-[#6d6d78]">{transcript.channel}</p>
          )}
        </div>
        {trackLabel && (
          <span className="rounded-full border border-[#232327] px-2 py-0.5 text-[11px] text-[#9d9da6]">
            {trackLabel}
          </span>
        )}
        {transcript && !transcript.saved && loggedIn === false && (
          <Link
            href="/login"
            className="text-xs text-[#f5b50a] hover:underline"
          >
            Đăng nhập để lưu
          </Link>
        )}
        <button
          type="button"
          onClick={() => setViewMode((m) => (m === "theater" ? "read" : "theater"))}
          className={cn(
            "flex items-center gap-1.5 rounded-md border border-[#232327] px-2.5 py-1 text-xs text-[#9d9da6] transition hover:text-[#e8e8ea]",
            viewMode === "read" && "border-[#f5b50a]/40 text-[#f5b50a]",
          )}
        >
          <BookOpen className="h-3.5 w-3.5" />
          {viewMode === "theater" ? "Chế độ đọc" : "Chế độ rạp"}
        </button>
      </header>

      {/* Body — video + transcript rail (same DOM across modes; only styles change) */}
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          viewMode === "theater" ? "lg:flex-row" : "",
        )}
      >
        {/* Video column */}
        <div
          className={cn(
            "flex min-w-0 flex-col",
            viewMode === "theater"
              ? "lg:w-[62%] lg:border-r lg:border-[#232327]"
              : "sticky top-0 z-10 mx-auto w-full max-w-2xl bg-[#0c0c0e]",
          )}
        >
          <div className="relative aspect-video w-full bg-black">
            <div ref={containerRef} className="absolute inset-0 h-full w-full" />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-[#6d6d78]">
                Đang tải trình phát…
              </div>
            )}
          </div>

          {/* Caption strip under the player (REDESIGN: strip riêng, không đè video) */}
          {activeSentence && (
            <div className="border-b border-[#232327] px-4 py-2.5 text-center text-[15px] font-medium leading-snug text-[#f5b50a]">
              {activeSentence.text}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-1 px-4 py-2">
            <button
              type="button"
              className={controlBtn}
              onClick={goPrev}
              disabled={timedIdxOfActive <= 0}
              title="Câu trước (A)"
            >
              <ChevronFirst className="h-5 w-5" />
            </button>
            <button
              type="button"
              className={cn(controlBtn, "h-11 w-11 rounded-full bg-[#f5b50a] text-[#0c0c0e] hover:bg-[#ffca3a] hover:text-[#0c0c0e]")}
              onClick={() => (playing ? player.pause() : player.play())}
              title="Phát / dừng (Space)"
            >
              {playing ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 pl-0.5" />
              )}
            </button>
            <button
              type="button"
              className={controlBtn}
              onClick={goNext}
              disabled={
                timedIdxOfActive < 0 ||
                timedIdxOfActive >= timedSentences.length - 1
              }
              title="Câu sau (D)"
            >
              <ChevronLast className="h-5 w-5" />
            </button>
            <span className="mx-2 h-5 w-px bg-[#232327]" />
            <button
              type="button"
              className={cn(controlBtn, loopSentence && "bg-[#f5b50a]/15 text-[#f5b50a]")}
              onClick={() => setLoopSentence((v) => !v)}
              title="Lặp câu hiện tại (S)"
            >
              <Repeat className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              className={cn(controlBtn, autoPause && "bg-[#f5b50a]/15 text-[#f5b50a]")}
              onClick={() => setAutoPause((v) => !v)}
              title="Tự dừng sau mỗi câu (R)"
            >
              <Timer className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              className={cn(controlBtn, "w-auto px-2 font-mono text-xs")}
              onClick={cycleSpeed}
              title="Tốc độ phát"
            >
              <FastForward className="mr-1 h-4 w-4" />
              {rate}×
            </button>
            <span className="mx-2 h-5 w-px bg-[#232327]" />
            <span className="font-mono text-xs tabular-nums text-[#6d6d78]">
              {formatTimestamp(nowMs)}
              {durationMs > 0 && ` / ${formatTimestamp(durationMs)}`}
            </span>
            <button
              type="button"
              className={cn(controlBtn, "ml-auto")}
              onClick={() => setShowKeys((v) => !v)}
              title="Phím tắt (?)"
            >
              <Keyboard className="h-4.5 w-4.5" />
            </button>
          </div>

          {showKeys && (
            <div className="mx-4 mb-2 rounded-lg border border-[#232327] bg-[#151518] p-3 text-xs leading-relaxed text-[#9d9da6]">
              <span className="font-semibold text-[#e8e8ea]">Phím tắt:</span>{" "}
              Space phát/dừng · A câu trước · D câu sau · S lặp câu · R tự dừng
              sau câu · Q nghe lại câu · ? bảng này
            </div>
          )}
        </div>

        {/* Transcript rail / paste fallback */}
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            viewMode === "theater"
              ? "h-[50vh] lg:h-auto"
              : "mx-auto w-full max-w-2xl px-4 py-4",
          )}
        >
          {phase === "ready" && transcript ? (
            <>
              {transcript.trackKind === "learner" &&
                transcript.origin === "plain_text" && (
                  <p className="border-b border-[#232327] px-4 py-2 text-xs text-[#6d6d78]">
                    Văn bản không đồng bộ — chỉ để đọc.
                  </p>
                )}
              <TranscriptRail
                sentences={sentences}
                activeIndex={activeIndex}
                nowMs={nowMs}
                onSeek={(ms) => {
                  player.seekToMs(ms);
                  player.play();
                }}
                prose={viewMode === "read"}
              />
            </>
          ) : (
            <EmptyTranscript
              busy={phase === "fetching"}
              errorMessage={
                phase === "error" ? errorMessage : null
              }
              loggedIn={loggedIn}
              onFetchYoutube={handleFetchYoutube}
              onParsed={handleParsed}
            />
          )}
        </div>
      </div>
    </div>
  );
}
