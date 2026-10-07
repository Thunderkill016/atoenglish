"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
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
  Settings2,
  Timer,
} from "lucide-react";

import {
  DictionaryPanel,
  DictionaryContent,
} from "@/components/dictionary-panel";
import { CATALOG_VIDEOS } from "@/content/catalog/videos";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Sentence } from "@/lib/video/types";
import {
  fetchVideoCaptions,
  importYoutubeCaptions,
  saveLearnerTranscript,
  saveWatchPosition,
  type CaptionActionError,
  type CaptionActionResult,
  type LoadedTranscript,
} from "@/app/actions/captions";
import {
  CAPTIONS_ACK_TYPE,
  CAPTIONS_MESSAGE_TYPE,
  YOUTUBE_ORIGIN,
  CAPTIONS_REQUEST_TYPE,
  payloadToTranscript,
  validateCaptionsPayload,
  type CaptionsPayload,
} from "@/lib/video/extension-bridge";
import { EmptyTranscript } from "./empty-transcript";
import {
  TranscriptRail,
  SentenceText,
  formatTimestamp,
} from "./transcript-rail";
import { useYouTubePlayer } from "./use-youtube-player";
import { useTranslations } from "./use-translations";
import { SEGMENTATION_VERSION } from "@/lib/video/segment";
import {
  showsEnglish,
  showsVietnamese,
  type SubtitleMode,
  type ServerTranslationEngine,
} from "@/lib/video/translation";

const ERROR_MESSAGES: Record<CaptionActionError, string> = {
  invalid_url: "Link video không hợp lệ.",
  no_captions: "Chưa lấy được phụ đề tiếng Anh cho video này.",
  blocked:
    "YouTube đang chặn yêu cầu từ máy chủ. Hãy dán hoặc tải phụ đề thủ công.",
  rate_limited: "Bạn đã lấy phụ đề quá nhiều lần. Thử lại sau.",
  unauthorized: "Đăng nhập để lưu phụ đề.",
  invalid_file: "Không đọc được phụ đề này.",
  error: "Có lỗi khi lấy phụ đề. Thử lại hoặc dán phụ đề.",
};

const SPEEDS = [1, 0.75, 0.5] as const;
const POSITION_SAVE_INTERVAL_MS = 15_000;
// Tenth-second steps make the native slider useful for fine keyboard seeking.
const SEEK_STEP_MS = 100;
// YouTube tab load + in-page caption collection typically lands in seconds;
// 45s covers slow connections without locking the fallback UI forever.
const EXTENSION_WAIT_MS = 45_000;

type Phase = "idle" | "fetching" | "ready" | "error";
type ViewMode = "theater" | "read";

interface WatchClientProps {
  videoId: string;
  loggedIn: boolean;
  translationScope?: string;
  serverTranslation?: ServerTranslationEngine | null;
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
  translationScope = "guest",
  serverTranslation = null,
  initial,
  initialPositionMs,
}: WatchClientProps) {
  const catalogVideo = CATALOG_VIDEOS.find((video) => video.id === videoId);
  const [transcript, setTranscript] = useState<LoadedTranscript | null>(
    initial,
  );
  const [phase, setPhase] = useState<Phase>(initial ? "ready" : "fetching");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("theater");
  const [loopSentence, setLoopSentence] = useState(false);
  const [autoPause, setAutoPause] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  // Owner's automatic-learning default: both languages appear without revealing each cue.
  // The optional reveal mode still supports an English-first practice session.
  const [subtitleMode, setSubtitleMode] = useState<SubtitleMode>("bilingual");
  // Sentence whose caption-strip Vietnamese the learner revealed (reveal mode).
  const [captionRevealed, setCaptionRevealed] = useState<number | null>(null);
  // Read mode on phones: transport cluster collapses behind this toggle.
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);

  // Marker for the mobile shell (mission 007): the native bridge relays
  // collected captions only while this stays false — a settled transcript
  // (cache hit or learner paste) must never be overwritten by a late
  // collector result.
  useEffect(() => {
    (
      window as unknown as { __atoTranscriptReady?: boolean }
    ).__atoTranscriptReady = Boolean(transcript);
  }, [transcript]);

  const controls = useYouTubePlayer(videoId, initialPositionMs);
  const {
    nowMs,
    playing,
    ready,
    durationMs,
    rate,
    containerRef,
    loadError,
    play,
    pause,
    seekToMs,
    setRate,
  } = controls;
  // The hook returns a fresh object literal every render; memoize the
  // imperative surface so effects below don't re-subscribe every poll tick.
  const player = useMemo(
    () => ({ play, pause, seekToMs, setRate }),
    [play, pause, seekToMs, setRate],
  );

  const sentences = useMemo(() => transcript?.sentences ?? [], [transcript]);
  const timedSentences = useMemo(
    () => sentences.filter((s) => s.start_ms != null),
    [sentences],
  );
  const activeIndex = activeSentenceIndex(sentences, nowMs);
  const activeSentence =
    activeIndex >= 0 ? sentences.find((s) => s.i === activeIndex) : undefined;

  const translation = useTranslations(
    sentences,
    translationScope,
    transcript?.segmentationVersion ?? SEGMENTATION_VERSION,
    subtitleMode,
    activeIndex,
    transcript?.language ?? "en",
    serverTranslation,
    transcript?.title ?? catalogVideo?.title,
    { automatic: true },
  );
  const showEnglish = showsEnglish(subtitleMode);
  const showVietnamese = showsVietnamese(subtitleMode);
  // Every practisable line already has the channel's own Vietnamese.
  const allHuman =
    sentences.length > 0 && sentences.every((s) => s.noise || s.vi);
  const captionVi = activeSentence
    ? translation.lines[activeSentence.i]
    : undefined;
  const captionBlurred =
    subtitleMode === "reveal" &&
    Boolean(captionVi) &&
    captionRevealed !== activeSentence?.i;

  // ── Sentence-boundary behaviours (loop / auto-pause) ──────────────────────
  const handledBoundary = useRef(-1);
  useEffect(() => {
    if (!activeSentence?.end_ms || !playing) return;
    if (nowMs < activeSentence.end_ms) {
      // Back inside the sentence — re-arm so the loop can fire on the next
      // boundary crossing. The guard only suppresses repeat fires while the
      // clock stays past the same end (double-seek jitter protection).
      handledBoundary.current = -1;
      return;
    }
    if (handledBoundary.current === activeIndex) return;
    handledBoundary.current = activeIndex;
    if (loopSentence && activeSentence.start_ms != null) {
      player.seekToMs(activeSentence.start_ms);
    } else if (autoPause) {
      player.pause();
    }
  }, [
    nowMs,
    activeSentence,
    activeIndex,
    loopSentence,
    autoPause,
    playing,
    player,
  ]);

  // Every deliberate seek makes the URL shareable: ?t=ms lands on the same
  // sentence for whoever opens it (the Vertex search→timestamp pattern).
  const seekWithDeepLink = useCallback(
    (ms: number) => {
      handledBoundary.current = -1;
      player.seekToMs(ms);
      player.play();
      const url = new URL(window.location.href);
      url.searchParams.set("t", String(Math.floor(ms)));
      window.history.replaceState(null, "", url);
    },
    [player],
  );

  const seekToSentence = useCallback(
    (index: number) => {
      const s = timedSentences[index];
      if (s?.start_ms == null) return;
      seekWithDeepLink(s.start_ms);
    },
    [timedSentences, seekWithDeepLink],
  );

  const timedIdxOfActive = timedSentences.findIndex((s) => s.i === activeIndex);
  const goPrev = useCallback(() => {
    const idx = timedIdxOfActive > 0 ? timedIdxOfActive - 1 : 0;
    seekToSentence(idx);
  }, [timedIdxOfActive, seekToSentence]);
  const goNext = useCallback(() => {
    const idx = Math.min(timedIdxOfActive + 1, timedSentences.length - 1);
    seekToSentence(idx);
  }, [timedIdxOfActive, timedSentences.length, seekToSentence]);
  const replayCurrent = useCallback(() => {
    if (timedIdxOfActive >= 0) seekToSentence(timedIdxOfActive);
  }, [timedIdxOfActive, seekToSentence]);

  // ── Fetch / fallback flows ────────────────────────────────────────────────
  const requestVersion = useRef(0);
  const openingRequest = useRef<Promise<CaptionActionResult> | null>(null);
  useEffect(() => {
    if (initial) return;
    let disposed = false;
    const version = requestVersion.current;
    // One intake per mounted video, even under React StrictMode. Only visited
    // pages fetch captions; library prefetch and server rendering never do.
    openingRequest.current ??= fetchVideoCaptions(videoId);
    void openingRequest.current
      .then((result) => {
        if (disposed || version !== requestVersion.current) return;
        if (result.ok) {
          setTranscript(result);
          setPhase("ready");
          setErrorMessage(null);
        } else {
          setErrorMessage(ERROR_MESSAGES[result.error]);
          setPhase("error");
        }
      })
      .catch(() => {
        if (disposed || version !== requestVersion.current) return;
        setErrorMessage(ERROR_MESSAGES.error);
        setPhase("error");
      });
    return () => {
      disposed = true;
    };
  }, [videoId, initial]);
  const handleFetchYoutube = useCallback(async () => {
    const version = ++requestVersion.current;
    setPhase("fetching");
    setErrorMessage(null);
    try {
      const result = await fetchVideoCaptions(videoId);
      if (version !== requestVersion.current) return;
      if (!result.ok) {
        setErrorMessage(ERROR_MESSAGES[result.error]);
        setPhase("error");
        return;
      }
      setTranscript(result);
      setPhase("ready");
    } catch {
      if (version !== requestVersion.current) return;
      setErrorMessage(ERROR_MESSAGES.error);
      setPhase("error");
    }
  }, [videoId]);

  const handleParsed = useCallback(
    async (parsed: LoadedTranscript, raw: string) => {
      const version = ++requestVersion.current;
      setTranscript(parsed);
      setPhase("ready");
      setErrorMessage(null);
      if (loggedIn) {
        const saved = await saveLearnerTranscript(videoId, raw);
        if (saved.ok && version === requestVersion.current)
          setTranscript(saved);
      }
    },
    [videoId, loggedIn],
  );

  // Extension acquisition uses the native YouTube session, which can still
  // refuse captions. Automatic iframe messages and explicit tab imports share
  // the validated parse path; late automatic results never replace user input.
  const extensionWaitRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nativeRequestVersion = useRef<number | null>(null);
  const nativeFrame = useRef<Window | null>(null);
  useEffect(() => {
    if (initial || transcript || !ready) return;
    const frame = containerRef.current?.querySelector("iframe");
    if (!frame?.contentWindow) return;
    // StrictMode replays effects: re-arm the listener version after cleanup,
    // while still sending only one collection request to this iframe.
    nativeRequestVersion.current = requestVersion.current;
    if (nativeFrame.current === frame.contentWindow) return;
    nativeFrame.current = frame.contentWindow;
    frame.contentWindow.postMessage(
      { type: CAPTIONS_REQUEST_TYPE, videoId },
      YOUTUBE_ORIGIN,
    );
  }, [initial, transcript, ready, videoId, containerRef]);
  useEffect(
    () => () => {
      if (extensionWaitRef.current) clearTimeout(extensionWaitRef.current);
      nativeRequestVersion.current = null;
    },
    [],
  );
  // The extension's app-side content script marks documentElement before the
  // page hydrates; a no-subscribe external store reads that DOM flag without
  // an SSR/client mismatch or a setState-in-effect lint hit.
  const hasExtension = useSyncExternalStore(
    () => () => {},
    () => Boolean(document.documentElement.dataset.atoenglishExt),
    () => false,
  );

  const handleExtensionPayload = useCallback(
    async (
      payload: CaptionsPayload,
      source: MessageEventSource | null,
      origin: string,
    ) => {
      const version = ++requestVersion.current;
      nativeRequestVersion.current = null;
      if (extensionWaitRef.current) {
        clearTimeout(extensionWaitRef.current);
        extensionWaitRef.current = null;
      }
      const ack = () => {
        (source as Window | null)?.postMessage(
          { type: CAPTIONS_ACK_TYPE },
          origin,
        );
      };
      setErrorMessage(null);
      if (loggedIn) {
        let result: CaptionActionResult;
        try {
          result = await importYoutubeCaptions(videoId, payload);
        } catch {
          // This is the server-action boundary: a rejected import must leave
          // an actionable state rather than an unhandled message promise.
          if (version === requestVersion.current) {
            setErrorMessage(ERROR_MESSAGES.error);
            setPhase("error");
          }
          ack();
          return;
        }
        if (version !== requestVersion.current) {
          ack();
          return;
        }
        if (!result.ok) {
          setErrorMessage(ERROR_MESSAGES[result.error]);
          setPhase("error");
          ack();
          return;
        }
        setTranscript(result);
      } else {
        const parsed = payloadToTranscript(payload);
        if (!parsed) {
          setErrorMessage(ERROR_MESSAGES.no_captions);
          setPhase("error");
          ack();
          return;
        }
        setTranscript({
          sentences: parsed.sentences,
          origin: parsed.trackKind === "asr" ? "youtube_asr" : "youtube_manual",
          language: parsed.language,
          segmentationVersion: SEGMENTATION_VERSION,
          trackKind: parsed.trackKind,
          title: parsed.title,
          channel: parsed.channel,
          durationMs: parsed.durationMs,
          saved: false,
        });
      }
      setPhase("ready");
      ack();
    },
    [videoId, loggedIn],
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // The payload arrives either straight from a youtube.com document or
      // relayed through the extension's app-side content script (same-origin).
      if (event.origin !== YOUTUBE_ORIGIN && event.origin !== location.origin)
        return;
      const raw = event.data as { type?: unknown } | null;
      if (!raw || raw.type !== CAPTIONS_MESSAGE_TYPE) return;
      const payload = validateCaptionsPayload(raw);
      if (!payload || payload.videoId !== videoId) return;
      if (event.origin === YOUTUBE_ORIGIN) {
        if (
          event.source !== nativeFrame.current ||
          nativeRequestVersion.current === null ||
          nativeRequestVersion.current !== requestVersion.current ||
          transcript
        )
          return;
      } else if (event.source !== window) return;
      void handleExtensionPayload(payload, event.source, event.origin);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [videoId, handleExtensionPayload, transcript]);

  const handleExtensionFetch = useCallback(() => {
    ++requestVersion.current;
    setPhase("fetching");
    setErrorMessage(null);
    // The isolated extension relay uses chrome.storage because YouTube's
    // COOP can sever window.opener. The #atoenglish-import hash tells the extension's YouTube collector that
    // this tab exists to hand captions back; it self-closes once stored.
    window.open(
      `https://www.youtube.com/watch?v=${videoId}#atoenglish-import`,
      "_blank",
    );
    if (extensionWaitRef.current) clearTimeout(extensionWaitRef.current);
    // The tab has to load YouTube and collect tracks — give up politely
    // instead of leaving the buttons spinner-locked forever.
    extensionWaitRef.current = setTimeout(() => {
      extensionWaitRef.current = null;
      setErrorMessage(
        "Chưa nhận được phụ đề từ YouTube. Kiểm tra extension AtoEnglish đã bật trên youtube.com chưa rồi thử lại.",
      );
      setPhase("error");
    }, EXTENSION_WAIT_MS);
  }, [videoId]);

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
      if (document.querySelector("dialog[open]")) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      // Preserve native Space/Enter activation on buttons and links.
      if (e.key === " " && target?.closest("button, a")) return;
      if (!ready && e.key !== "?") return;
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
          if (timedSentences.length > 0) setLoopSentence((v) => !v);
          break;
        case "r":
          if (timedSentences.length > 0) setAutoPause((v) => !v);
          break;
        case "q":
          replayCurrent();
          break;
        case "v":
          if (activeIndex >= 0) setCaptionRevealed(activeIndex);
          break;
        case "?":
          setShowKeys((v) => !v);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    ready,
    playing,
    player,
    goPrev,
    goNext,
    replayCurrent,
    timedSentences.length,
    activeIndex,
  ]);

  const cycleSpeed = () => {
    const idx = SPEEDS.indexOf(rate as (typeof SPEEDS)[number]);
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

  const controlBtn = cn(
    buttonVariants({ variant: "control", size: "icon-xl" }),
    // Native <button disabled> cannot fire clicks anyway; keep pointer events
    // so the title tooltip still explains why a transport key is disabled.
    "disabled:pointer-events-auto disabled:opacity-40",
  );
  const hasTimedSentences = timedSentences.length > 0;

  return (
    <DictionaryPanel onOpen={player.pause}>
      <DictionaryContent>
        {(openLookup) => {
          const lookupWord = (
            term: string,
            sentence: Sentence,
            trigger: HTMLButtonElement,
          ) =>
            openLookup({
              term,
              context: sentence.text,
              returnFocus: trigger,
              source: {
                title:
                  transcript?.title ??
                  catalogVideo?.title ??
                  `Video ${videoId}`,
                sentence: sentence.text,
                timestamp:
                  sentence.start_ms == null
                    ? null
                    : formatTimestamp(sentence.start_ms),
                replay:
                  sentence.start_ms == null
                    ? undefined
                    : () => seekWithDeepLink(sentence.start_ms!),
              },
            });
          return (
            <div
              id="main-content"
              className={cn(
                "dark flex min-h-dvh flex-col bg-background text-foreground",
                viewMode === "theater" && "lg:h-dvh lg:overflow-hidden",
              )}
            >
              <header className="flex shrink-0 items-center gap-3 border-b border-border px-3 py-3 sm:px-5">
                <Link
                  href="/discover"
                  aria-label="Quay lại khám phá"
                  title="Khám phá"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div className="min-w-0 flex-1">
                  <h1
                    className="truncate text-sm font-medium"
                    title={transcript?.title ?? catalogVideo?.title}
                  >
                    {transcript?.title ??
                      catalogVideo?.title ??
                      `Video ${videoId}`}
                  </h1>
                  {(transcript?.channel ?? catalogVideo?.channel) && (
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {transcript?.channel ?? catalogVideo?.channel}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setViewMode((m) => (m === "theater" ? "read" : "theater"))
                  }
                  aria-pressed={viewMode === "read"}
                  className={cn(
                    "flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-border px-3 text-xs text-muted-foreground hover:text-foreground",
                    viewMode === "read" && "border-primary/40 text-primary",
                  )}
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {viewMode === "theater" ? "Chế độ đọc" : "Chế độ rạp"}
                  </span>
                  <span className="sr-only sm:hidden">
                    {viewMode === "theater" ? "Chế độ đọc" : "Chế độ rạp"}
                  </span>
                </button>
              </header>

              {/* Keep the same player DOM when switching modes: no restart or lost time. */}
              <div
                className={cn(
                  "flex min-h-0 flex-1 flex-col gap-4 p-3 sm:p-4",
                  viewMode === "theater" && "lg:flex-row",
                )}
              >
                <section
                  aria-label="Trình phát video"
                  data-testid="player-stage"
                  className={cn(
                    "flex min-h-0 min-w-0 flex-col rounded-2xl border border-border bg-card p-2 sm:p-4",
                    viewMode === "theater"
                      ? "lg:flex-1"
                      : "mx-auto w-full max-w-3xl",
                  )}
                >
                  <div
                    className={cn(
                      "flex flex-col",
                      viewMode === "theater" &&
                        "lg:grid lg:min-h-0 lg:flex-1 lg:grid-rows-[minmax(0,1fr)_auto]",
                    )}
                  >
                    {/* Caption text owns its natural height. The video fits the remaining
                        desktop row; mobile keeps YouTube's 200px minimum viewport. */}
                    <div
                      className={cn(
                        "flex min-h-0 items-center justify-center",
                        viewMode === "theater" &&
                          "lg:items-end lg:[container-type:size]",
                      )}
                    >
                      <div
                        data-testid="video-frame"
                        className={cn(
                          "relative aspect-video min-h-[200px] w-full overflow-hidden rounded-xl bg-black",
                          viewMode === "theater" &&
                            "lg:min-h-0 lg:max-w-[calc(100cqh*16/9)]",
                        )}
                      >
                        <div
                          ref={containerRef}
                          className="absolute inset-0 h-full w-full [&>iframe]:block [&>iframe]:h-full [&>iframe]:w-full"
                        />
                        {!ready && (
                          <div
                            className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted-foreground"
                            role="status"
                          >
                            {loadError
                              ? "Không tải được trình phát YouTube. Tải lại trang để thử lại."
                              : "Đang tải trình phát…"}
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      data-testid="active-caption"
                      className="flex min-h-32 w-full shrink-0 items-center justify-center px-2 py-4 text-center text-base font-medium leading-normal text-primary sm:px-4 sm:text-lg"
                    >
                      {/* A 60ch measure is a reading-layout choice, not a timed-caption
                          character limit. Keep the entire source and translation visible. */}
                      <div className="w-full max-w-[60ch] space-y-2 [overflow-wrap:anywhere]">
                        <p lang="en" className="text-balance">
                          {activeSentence && showEnglish ? (
                            <SentenceText
                              sentence={activeSentence}
                              nowMs={nowMs}
                              active
                              onLookup={lookupWord}
                            />
                          ) : transcript &&
                            !activeSentence &&
                            subtitleMode !== "hidden" ? (
                            "Chọn một câu để nghe lại."
                          ) : (
                            ""
                          )}
                        </p>
                        {activeSentence &&
                          showVietnamese &&
                          (captionBlurred ? (
                            <button
                              type="button"
                              data-testid="reveal-caption"
                              onClick={() =>
                                setCaptionRevealed(activeSentence.i)
                              }
                              aria-label="Hiện nghĩa tiếng Việt (V)"
                              className="mx-auto block rounded-md focus-visible:outline-2 focus-visible:outline-ring"
                            >
                              <span
                                aria-hidden
                                className="block select-none text-balance text-[15px] font-normal leading-normal text-foreground/75 blur-[5px] sm:text-base"
                              >
                                {captionVi}
                              </span>
                            </button>
                          ) : (
                            <p
                              lang="vi"
                              className="text-balance text-[15px] font-normal leading-normal text-foreground/75 sm:text-base"
                            >
                              {captionVi ?? "Chưa có bản dịch cho câu này."}
                            </p>
                          ))}
                      </div>
                    </div>
                  </div>

                  {viewMode === "read" && (
                    <button
                      type="button"
                      aria-expanded={mobileControlsOpen}
                      onClick={() => setMobileControlsOpen((v) => !v)}
                      className="flex min-h-10 w-fit items-center gap-2 rounded-full border border-border px-3 text-xs text-muted-foreground hover:text-foreground sm:hidden"
                    >
                      <Settings2 aria-hidden className="h-4 w-4" />
                      Điều khiển
                    </button>
                  )}
                  <div
                    className={cn(
                      "shrink-0 border-t border-border pt-2",
                      viewMode === "read" &&
                        !mobileControlsOpen &&
                        "max-sm:hidden",
                    )}
                  >
                    <input
                      type="range"
                      aria-label="Vị trí phát video"
                      min={0}
                      max={durationMs}
                      step={SEEK_STEP_MS}
                      value={Math.min(nowMs, durationMs)}
                      disabled={!ready || durationMs <= 0}
                      aria-valuetext={`${formatTimestamp(nowMs)} / ${formatTimestamp(durationMs)}`}
                      onChange={(e) => {
                        handledBoundary.current = -1;
                        player.seekToMs(Number(e.target.value));
                      }}
                      className="h-6 w-full cursor-pointer accent-primary disabled:cursor-default"
                    />
                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        type="button"
                        className={controlBtn}
                        onClick={goPrev}
                        disabled={!ready || timedIdxOfActive <= 0}
                        title="Câu trước (A)"
                        aria-label="Câu trước (A)"
                      >
                        <ChevronFirst className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        className={buttonVariants({
                          variant: "default",
                          size: "icon-xl",
                        })}
                        disabled={!ready}
                        onClick={() =>
                          playing ? player.pause() : player.play()
                        }
                        title="Phát / dừng (Space)"
                        aria-label={playing ? "Dừng video" : "Phát video"}
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
                          !ready ||
                          !hasTimedSentences ||
                          timedIdxOfActive >= timedSentences.length - 1
                        }
                        title="Câu sau (D)"
                        aria-label="Câu sau (D)"
                      >
                        <ChevronLast className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        className={controlBtn}
                        disabled={!ready || !hasTimedSentences}
                        onClick={() => setLoopSentence((v) => !v)}
                        aria-pressed={loopSentence}
                        title="Lặp câu hiện tại (S)"
                        aria-label="Lặp câu hiện tại (S)"
                      >
                        <Repeat className="h-4.5 w-4.5" />
                      </button>
                      <button
                        type="button"
                        className={controlBtn}
                        disabled={!ready || !hasTimedSentences}
                        onClick={() => setAutoPause((v) => !v)}
                        aria-pressed={autoPause}
                        title="Tự dừng sau mỗi câu (R)"
                        aria-label="Tự dừng sau mỗi câu (R)"
                      >
                        <Timer className="h-4.5 w-4.5" />
                      </button>
                      <button
                        type="button"
                        className={cn(
                          controlBtn,
                          "gap-1 px-2 font-mono text-xs",
                        )}
                        disabled={!ready}
                        onClick={cycleSpeed}
                        title="Tốc độ phát"
                        aria-label={`Tốc độ phát ${rate}×`}
                      >
                        <FastForward className="h-4 w-4" />
                        {rate}×
                      </button>
                      <span className="ml-auto whitespace-nowrap px-2 font-mono text-xs tabular-nums text-muted-foreground">
                        {formatTimestamp(nowMs)}
                        {durationMs > 0 && ` / ${formatTimestamp(durationMs)}`}
                      </span>
                      <button
                        type="button"
                        className={controlBtn}
                        onClick={() => setShowKeys((v) => !v)}
                        aria-expanded={showKeys}
                        title="Phím tắt (?)"
                        aria-label="Phím tắt (?)"
                      >
                        <Keyboard className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                  {showKeys && (
                    <div className="mt-2 shrink-0 rounded-lg border border-border bg-elevated p-3 text-xs leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Phím tắt:
                      </span>{" "}
                      Space phát/dừng · A câu trước · D câu sau · S lặp câu · R
                      tự dừng sau câu · Q nghe lại câu · V hiện nghĩa câu · ?
                      bảng này
                      <p className="mt-1.5">
                        Phím tắt không hoạt động khi đang nhập văn bản hoặc con
                        trỏ nằm trong trình phát video.
                      </p>
                    </div>
                  )}
                </section>

                <section
                  aria-label="Phụ đề video"
                  className={cn(
                    "flex min-h-0 min-w-0 flex-col rounded-2xl border border-border bg-card",
                    viewMode === "theater"
                      ? "lg:w-[34%] lg:max-w-[380px] lg:shrink-0"
                      : "mx-auto w-full max-w-3xl",
                  )}
                >
                  <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-4 py-3">
                    <h2 className="text-sm font-semibold">Phụ đề</h2>
                    {transcript && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {sentences.length} câu
                      </span>
                    )}
                    {trackLabel && (
                      <span className="ml-auto text-[11px] text-muted-foreground">
                        {trackLabel}
                      </span>
                    )}
                    {transcript && !transcript.saved && !loggedIn && (
                      <Link
                        href={`/login?next=${encodeURIComponent(`/watch/${videoId}`)}`}
                        className="w-full text-xs text-primary hover:underline"
                      >
                        Đăng nhập để lưu
                      </Link>
                    )}
                  </div>
                  {phase === "ready" && transcript ? (
                    <>
                      {transcript.origin === "plain_text" && (
                        <p className="shrink-0 px-4 py-3 text-xs text-muted-foreground">
                          Văn bản không đồng bộ — chỉ để đọc.
                        </p>
                      )}
                      <div className="shrink-0 space-y-2 border-b border-border px-4 py-3">
                        <label className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          Hiển thị phụ đề
                          <select
                            aria-label="Hiển thị phụ đề"
                            value={subtitleMode}
                            onChange={(event) =>
                              setSubtitleMode(
                                event.target.value as SubtitleMode,
                              )
                            }
                            className="min-h-11 rounded-lg border border-border bg-elevated px-2 text-foreground"
                          >
                            <option value="reveal">Anh · Việt khi chạm</option>
                            <option value="bilingual">Anh + Việt</option>
                            <option value="en">Tiếng Anh</option>
                            <option value="vi">Tiếng Việt</option>
                            <option value="hidden">Ẩn phụ đề</option>
                          </select>
                        </label>
                        {showVietnamese && (
                          <>
                            {/^en(?:-|$)/i.test(transcript.language) ? (
                              <>
                                {translation.humanCount > 0 && (
                                  <p
                                    role="status"
                                    className="text-xs text-muted-foreground"
                                  >
                                    Phụ đề tiếng Việt của kênh ·{" "}
                                    {translation.humanCount}/{sentences.length}{" "}
                                    câu
                                  </p>
                                )}
                                {!allHuman &&
                                  !translation.deviceReady &&
                                  translation.provider === "device" &&
                                  (translation.availability ===
                                  "unavailable" ? (
                                    <p className="text-xs text-muted-foreground">
                                      Trình duyệt này chưa hỗ trợ dịch miễn phí
                                      trên thiết bị. Dùng Chrome trên máy tính
                                      để bật dịch Anh–Việt.
                                    </p>
                                  ) : (
                                    <p
                                      role="status"
                                      className="text-xs text-muted-foreground"
                                    >
                                      {translation.downloading
                                        ? `Đang chuẩn bị dịch miễn phí${translation.progress == null ? "…" : ` · ${translation.progress}%`}`
                                        : translation.needsActivation
                                          ? "Phát video hoặc chạm trang để trình duyệt tải bộ dịch lần đầu."
                                          : "Đang chuẩn bị dịch miễn phí…"}
                                    </p>
                                  ))}
                                {(translation.deviceReady ||
                                  translation.provider === "server") && (
                                  <p
                                    role="status"
                                    className="text-xs text-muted-foreground"
                                  >
                                    {translation.provider === "device" ||
                                    translation.provider === "shell"
                                      ? "Dịch máy trên thiết bị"
                                      : `Dịch AI · ${serverTranslation?.label ?? "máy chủ"}`}{" "}
                                    · {Object.keys(translation.lines).length}/
                                    {sentences.length} câu
                                    {translation.busy ? " · đang dịch…" : ""}
                                  </p>
                                )}
                                {!allHuman &&
                                  serverTranslation &&
                                  loggedIn &&
                                  translation.provider !== "server" && (
                                    <button
                                      type="button"
                                      onClick={translation.useServer}
                                      className="min-h-11 text-xs text-primary"
                                    >
                                      Dùng {serverTranslation.label}
                                    </button>
                                  )}
                                {(translation.error ||
                                  translation.setupError) && (
                                  <div>
                                    <p
                                      role="alert"
                                      className="text-xs text-primary"
                                    >
                                      {translation.error ??
                                        translation.setupError}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={
                                        translation.setupError
                                          ? () =>
                                              void translation.enableDevice()
                                          : translation.retry
                                      }
                                      className="min-h-11 text-xs text-primary"
                                    >
                                      Thử dịch lại
                                    </button>
                                  </div>
                                )}
                                {translation.finished &&
                                  Object.keys(translation.lines).length <
                                    sentences.length && (
                                    <button
                                      type="button"
                                      onClick={translation.retry}
                                      className="min-h-11 text-xs text-primary"
                                    >
                                      Dịch lại câu còn thiếu
                                    </button>
                                  )}
                                {translation.cacheNotice && (
                                  <p className="text-xs text-muted-foreground">
                                    {translation.cacheNotice}
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                Hiện hỗ trợ dịch phụ đề tiếng Anh sang tiếng
                                Việt.
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      <TranscriptRail
                        sentences={sentences}
                        translations={translation.lines}
                        subtitleMode={subtitleMode}
                        activeIndex={activeIndex}
                        nowMs={nowMs}
                        onSeek={seekWithDeepLink}
                        prose={viewMode === "read"}
                        onLookup={lookupWord}
                      />
                    </>
                  ) : (
                    <div
                      className={cn(
                        "min-h-0",
                        viewMode === "theater" && "lg:overflow-y-auto",
                      )}
                    >
                      <EmptyTranscript
                        busy={phase === "fetching"}
                        errorMessage={phase === "error" ? errorMessage : null}
                        loggedIn={loggedIn}
                        extensionReady={hasExtension}
                        onFetchYoutube={handleFetchYoutube}
                        onExtensionFetch={handleExtensionFetch}
                        onParsed={handleParsed}
                      />
                    </div>
                  )}
                </section>
              </div>
            </div>
          );
        }}
      </DictionaryContent>
    </DictionaryPanel>
  );
}
