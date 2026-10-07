"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Play } from "lucide-react";
import {
  tokenizeText,
  phraseFromTokens,
  type ReadToken,
} from "@/lib/read/tokenize";
import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/format";
import type { Sentence } from "@/lib/video/types";

import {
  showsEnglish,
  showsVietnamese,
  type SubtitleMode,
} from "@/lib/video/translation";
export { formatTimestamp };

interface TranscriptRailProps {
  sentences: Sentence[];
  translations?: Record<number, string>;
  subtitleMode?: SubtitleMode;
  activeIndex: number;
  nowMs: number;
  onSeek: (ms: number) => void;
  /** Read mode renders sentences as flowing prose lines. */
  prose?: boolean;
  onLookup?: (
    term: string,
    sentence: Sentence,
    trigger: HTMLButtonElement,
  ) => void;
}

type PhraseStart = { sentenceI: number; tokenIndex: number };
interface SentenceTextProps {
  sentence: Sentence;
  nowMs: number;
  active: boolean;
  onLookup?: TranscriptRailProps["onLookup"];
  phraseMode?: boolean;
  phraseStart?: PhraseStart | null;
  onPhraseStart?: (start: PhraseStart | null) => void;
  onPhraseError?: (message: string | null) => void;
}

/** Shared caption/rail text: timestamps seek; words look up, never seek. */
export function SentenceText({
  sentence,
  nowMs,
  active,
  onLookup,
  phraseMode = false,
  phraseStart,
  onPhraseStart,
  onPhraseError,
}: SentenceTextProps) {
  const tokens = useMemo(() => {
    if (!sentence.words?.length)
      return tokenizeText(sentence.text).map((token) => ({
        token,
        start: null as number | null,
        end: null as number | null,
      }));
    return sentence.words.flatMap((word, i) => [
      ...tokenizeText(word.w).map((token) => ({
        token,
        start: word.start_ms,
        end: word.end_ms,
      })),
      ...(i < sentence.words!.length - 1
        ? [
            {
              token: { type: "space", text: " " } as ReadToken,
              start: null,
              end: null,
            },
          ]
        : []),
    ]);
  }, [sentence.text, sentence.words]);
  const selectWord = (index: number, trigger: HTMLButtonElement) => {
    const token = tokens[index].token;
    if (token.type !== "word") return;
    if (!phraseMode) {
      onLookup?.(token.text, sentence, trigger);
      return;
    }
    onPhraseError?.(null);
    if (!phraseStart || phraseStart.sentenceI !== sentence.i) {
      onPhraseStart?.({ sentenceI: sentence.i, tokenIndex: index });
      return;
    }
    const phrase = phraseFromTokens(
      tokens.map((item) => item.token),
      phraseStart.tokenIndex,
      index,
    );
    // Match the dictionary API's bounded one-term intake; never truncate a phrase silently.
    if (!phrase || phrase.length > 120) {
      onPhraseError?.("Chọn cụm ngắn hơn (tối đa 120 ký tự).");
      return;
    }
    onPhraseStart?.(null);
    onLookup?.(phrase, sentence, trigger);
  };
  if (sentence.noise) return <span>{sentence.text}</span>;
  return (
    <span data-testid="sentence-text" className="[overflow-wrap:anywhere]">
      {tokens.map(({ token, start, end }, index) => {
        const highlighted =
          active &&
          start != null &&
          nowMs >= start &&
          (end == null || nowMs < end);
        if (token.type !== "word" || !onLookup)
          return (
            <span
              key={index}
              className={cn(highlighted && "rounded bg-[#f5b50a]/25")}
            >
              {token.text}
            </span>
          );
        return (
          <button
            key={index}
            type="button"
            aria-label={`${phraseMode ? "Chọn từ" : "Tra từ"} “${token.text}”`}
            onClick={(event) => selectWord(index, event.currentTarget)}
            className={cn(
              // Source whitespace sets word spacing; lookup highlights must not widen every word.
              "inline max-w-full rounded p-0 align-baseline text-inherit [overflow-wrap:anywhere] hover:bg-[#f5b50a]/15 focus-visible:outline-2 focus-visible:outline-[#f5b50a]",
              highlighted && "bg-[#f5b50a]/25",
              phraseStart?.sentenceI === sentence.i &&
                phraseStart.tokenIndex === index &&
                "bg-[#f5b50a]/25 underline",
            )}
          >
            {token.text}
          </button>
        );
      })}
    </span>
  );
}

/**
 * Scrollable bilingual-ready transcript column (REDESIGN §5.2 T1).
 * Active line highlights gold and auto-scrolls into view.
 */
export function TranscriptRail({
  sentences,
  translations = {},
  subtitleMode = "en",
  activeIndex,
  nowMs,
  onSeek,
  prose = false,
  onLookup,
}: TranscriptRailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [following, setFollowing] = useState(true);
  const [phraseMode, setPhraseMode] = useState(false);
  const [phraseStart, setPhraseStart] = useState<PhraseStart | null>(null);
  const [phraseError, setPhraseError] = useState<string | null>(null);
  // Lines the learner chose to reveal in `reveal` mode (per transcript).
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());
  const [revealedFor, setRevealedFor] = useState(sentences);
  if (revealedFor !== sentences) {
    setRevealedFor(sentences);
    setRevealed(new Set());
  }
  const mixedSources =
    sentences.some((s) => s.vi) &&
    sentences.some((s) => !s.vi && translations[s.i]);

  useEffect(() => {
    if (!following || prose || activeIndex < 0) return;
    const container = containerRef.current;
    if (!container || container.scrollHeight <= container.clientHeight) return;
    const el = container.querySelector<HTMLElement>(
      `[data-sentence="${activeIndex}"]`,
    );
    if (!el) return;
    // Only move this rail, never the document or the video stage.
    const railRect = container.getBoundingClientRect();
    const lineRect = el.getBoundingClientRect();
    if (lineRect.top < railRect.top) {
      container.scrollTop += lineRect.top - railRect.top;
    } else if (lineRect.bottom > railRect.bottom) {
      container.scrollTop += lineRect.bottom - railRect.bottom;
    }
  }, [activeIndex, following, prose]);

  if (sentences.length === 0) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {onLookup && showsEnglish(subtitleMode) && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#232327] px-4 py-2">
          <span className="text-xs text-[#9d9da6]">Chạm từ để tra nghĩa</span>
          <button
            type="button"
            aria-pressed={phraseMode}
            onClick={() => {
              setPhraseMode((v) => !v);
              setPhraseStart(null);
              setPhraseError(null);
            }}
            className="min-h-11 rounded-full border border-[#232327] px-3 text-xs text-[#f5b50a]"
          >
            Chọn cụm
          </button>
          {phraseMode && (
            <p role="status" className="w-full text-xs text-[#9d9da6]">
              {phraseStart
                ? "Chọn từ cuối trong cùng câu; chọn câu khác để bắt đầu lại."
                : "Chọn từ đầu rồi từ cuối trong cùng một câu."}
            </p>
          )}
          {phraseError && (
            <p role="alert" className="w-full text-xs text-[#f5b50a]">
              {phraseError}
            </p>
          )}
        </div>
      )}
      {!prose && sentences.some((s) => s.start_ms != null) && (
        <button
          type="button"
          aria-pressed={following}
          onClick={() => setFollowing((v) => !v)}
          className="min-h-11 shrink-0 border-b border-[#232327] px-4 text-left text-xs text-[#f5b50a] hover:bg-white/5"
        >
          {following ? "Đang theo câu phát · Tắt" : "Theo câu đang phát"}
        </button>
      )}
      <div
        ref={containerRef}
        onWheel={() => setFollowing(false)}
        onTouchMove={() => setFollowing(false)}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) setFollowing(false);
        }}
        onKeyDown={(e) => {
          if (
            [
              "ArrowDown",
              "ArrowUp",
              "PageDown",
              "PageUp",
              "Home",
              "End",
            ].includes(e.key)
          )
            setFollowing(false);
        }}
        className={cn(
          "min-h-0 p-2",
          prose && "mx-auto w-full max-w-[68ch] sm:p-4",
          !prose && "lg:flex-1 lg:overflow-y-auto lg:overscroll-contain",
        )}
        data-testid="transcript-rail"
      >
        {sentences.map((s) => {
          const active = s.i === activeIndex;
          return (
            <div
              key={s.i}
              data-sentence={s.i}
              aria-current={active ? "true" : undefined}
              className={cn(
                "group mb-2 space-y-2 rounded-xl px-3 py-3 text-left transition-colors",
                active ? "bg-[#f5b50a]/10 text-[#e8e8ea]" : "text-[#9d9da6]",
                s.noise && "opacity-50",
                prose && "mb-4 py-3",
              )}
            >
              {s.start_ms != null ? (
                <button
                  type="button"
                  onClick={() => onSeek(s.start_ms!)}
                  aria-label={`Nghe câu ${formatTimestamp(s.start_ms)}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/5 px-3 text-xs tabular-nums text-[#9d9da6] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#f5b50a]"
                >
                  <Play aria-hidden className="h-3.5 w-3.5" />
                  {prose ? "Nghe lại" : formatTimestamp(s.start_ms)}
                </button>
              ) : (
                !prose && (
                  <span className="text-[11px] text-[#9d9da6]">Văn bản</span>
                )
              )}
              {showsEnglish(subtitleMode) && (
                <p
                  lang="en"
                  className={cn(
                    "text-base leading-[1.65] [overflow-wrap:anywhere]",
                    prose && "sm:text-lg",
                    active && "text-[#f5b50a]",
                  )}
                >
                  {s.noise && <span className="sr-only">Âm thanh nền: </span>}
                  <SentenceText
                    sentence={s}
                    nowMs={nowMs}
                    active={active}
                    onLookup={onLookup}
                    phraseMode={phraseMode}
                    phraseStart={phraseStart}
                    onPhraseStart={setPhraseStart}
                    onPhraseError={setPhraseError}
                  />
                </p>
              )}
              {showsVietnamese(subtitleMode) &&
                (subtitleMode === "reveal" &&
                !revealed.has(s.i) &&
                translations[s.i] ? (
                  <button
                    type="button"
                    data-testid="reveal-translation"
                    onClick={() =>
                      setRevealed((prev) => new Set(prev).add(s.i))
                    }
                    aria-label="Hiện nghĩa tiếng Việt của câu này"
                    className="block w-full rounded-md text-left focus-visible:outline-2 focus-visible:outline-[#f5b50a]"
                  >
                    <span
                      aria-hidden
                      className="block select-none text-[15px] leading-[1.65] text-[#c5c5ce] blur-[5px] [overflow-wrap:anywhere]"
                    >
                      {translations[s.i]}
                    </span>
                  </button>
                ) : (
                  <p
                    lang="vi"
                    data-testid="translated-sentence"
                    className={cn(
                      "text-[15px] leading-[1.65] text-[#c5c5ce] [overflow-wrap:anywhere]",
                      prose && "sm:text-base",
                    )}
                  >
                    {translations[s.i] ?? "Chưa có bản dịch cho câu này."}
                    {mixedSources && translations[s.i] && !s.vi && (
                      <span className="ml-2 text-[11px] text-[#9d9da6]">
                        · dịch máy
                      </span>
                    )}
                  </p>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
