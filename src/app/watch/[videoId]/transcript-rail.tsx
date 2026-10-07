"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Play, Search, X } from "lucide-react";
import {
  tokenizeText,
  phraseFromTokens,
  type ReadToken,
} from "@/lib/read/tokenize";
import { cn, normalizeSearchText } from "@/lib/utils";
import { sentenceGlosses } from "@/lib/read/gloss";
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

// Search is a word/phrase query, bounded like the existing dictionary intake.
const MAX_SEARCH_QUERY_LENGTH = 120;

function captionSearchText(text: string) {
  return normalizeSearchText(text.replace(/[’‘]/g, "'").replace(/\s+/g, " "));
}

function matchingSentences(
  sentences: Sentence[],
  translations: Record<number, string>,
  mode: SubtitleMode,
  revealed: Set<number>,
  query: string,
) {
  const key = captionSearchText(query);
  if (!key) return [];
  return sentences.filter((sentence) => {
    const english =
      showsEnglish(mode) && captionSearchText(sentence.text).includes(key);
    // Finding hidden Vietnamese would reveal answers in the touch-to-reveal mode.
    const vietnamese =
      showsVietnamese(mode) &&
      (mode !== "reveal" || revealed.has(sentence.i)) &&
      captionSearchText(translations[sentence.i] ?? "").includes(key);
    return english || vietnamese;
  });
}

function revealSentence(
  container: HTMLDivElement | null,
  sentenceI: number,
  { allowPageScroll }: { allowPageScroll: boolean },
) {
  if (!container) return;
  const row = container.querySelector<HTMLElement>(
    '[data-sentence="' + sentenceI + '"]',
  );
  if (!row) return;
  if (container.scrollHeight <= container.clientHeight) {
    // Only an explicit search action may move a read-mode/mobile document.
    if (allowPageScroll) row.scrollIntoView({ block: "nearest" });
    return;
  }
  const bounds = container.getBoundingClientRect();
  const line = row.getBoundingClientRect();
  if (line.top < bounds.top) container.scrollTop += line.top - bounds.top;
  else if (line.bottom > bounds.bottom)
    container.scrollTop += line.bottom - bounds.bottom;
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const searchId = useId();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [matchId, setMatchId] = useState<number | null>(null);
  const [phraseMode, setPhraseMode] = useState(false);
  const [phraseStart, setPhraseStart] = useState<PhraseStart | null>(null);
  const [phraseError, setPhraseError] = useState<string | null>(null);
  // Lines the learner chose to reveal in `reveal` mode (per transcript).
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());
  const [revealedFor, setRevealedFor] = useState(sentences);
  if (revealedFor !== sentences) {
    setRevealedFor(sentences);
    setRevealed(new Set());
    setQuery("");
    setMatchId(null);
    setSearchOpen(false);
    setFollowing(true);
    setPhraseMode(false);
    setPhraseStart(null);
    setPhraseError(null);
  }
  const activeGlosses = useMemo(() => {
    const sentence = sentences.find((s) => s.i === activeIndex);
    return sentence && !sentence.noise ? sentenceGlosses(sentence.text) : [];
  }, [sentences, activeIndex]);
  const mixedSources =
    sentences.some((s) => s.vi) &&
    sentences.some((s) => !s.vi && translations[s.i]);

  const matches = useMemo(
    () =>
      matchingSentences(sentences, translations, subtitleMode, revealed, query),
    [sentences, translations, subtitleMode, revealed, query],
  );
  const matchIds = new Set(matches.map((sentence) => sentence.i));
  // Keep the chosen sentence stable if translations add earlier matches later.
  const matchPosition = Math.max(
    0,
    matches.findIndex((sentence) => sentence.i === matchId),
  );
  const currentMatch = query.trim() ? matches[matchPosition]?.i : undefined;
  const hasTimedSentences = sentences.some(
    (sentence) => sentence.start_ms != null,
  );
  const chooseMatch = (position: number) => {
    if (!matches.length) return;
    const sentence = matches[(position + matches.length) % matches.length];
    setMatchId(sentence.i);
    setFollowing(false);
    revealSentence(containerRef.current, sentence.i, { allowPageScroll: true });
    searchInputRef.current?.focus({ preventScroll: true });
  };
  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
    setMatchId(null);
    searchButtonRef.current?.focus();
  };
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);
  useEffect(() => {
    if (!following || prose || activeIndex < 0) return;
    // Playback may move the transcript rail, never the document/video stage.
    revealSentence(containerRef.current, activeIndex, {
      allowPageScroll: false,
    });
  }, [activeIndex, following, prose, translations, subtitleMode]);

  if (sentences.length === 0) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#232327] px-3 py-1.5">
        {!prose && hasTimedSentences && (
          <button
            type="button"
            aria-pressed={following}
            onClick={() => {
              if (!following) {
                setQuery("");
                setMatchId(null);
                setSearchOpen(false);
                // Search closes first; then an explicit return may scroll the mobile page.
                requestAnimationFrame(() =>
                  revealSentence(containerRef.current, activeIndex, {
                    allowPageScroll: true,
                  }),
                );
              }
              setFollowing((value) => !value);
            }}
            className="min-h-11 min-w-0 flex-1 rounded-lg px-2 text-left text-xs text-[#f5b50a] hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#f5b50a]"
          >
            {following ? "Đang theo câu phát · Tắt" : "Theo câu đang phát"}
          </button>
        )}
        {onLookup && showsEnglish(subtitleMode) && (
          <button
            type="button"
            aria-pressed={phraseMode}
            onClick={() => {
              setPhraseMode((value) => !value);
              setPhraseStart(null);
              setPhraseError(null);
            }}
            className="min-h-11 shrink-0 rounded-lg px-2 text-xs text-[#f5b50a] hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#f5b50a]"
          >
            Chọn cụm
          </button>
        )}
        <button
          ref={searchButtonRef}
          type="button"
          aria-label="Tìm trong phụ đề"
          aria-expanded={searchOpen}
          aria-controls={searchId}
          title="Tìm câu trong phụ đề"
          onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
          className="ml-auto inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-[#9d9da6] hover:bg-white/5 aria-expanded:text-[#f5b50a] focus-visible:outline-2 focus-visible:outline-[#f5b50a]"
        >
          <Search aria-hidden className="size-4" />
        </button>
        {phraseMode && showsEnglish(subtitleMode) && (
          <p role="status" className="w-full pb-1 text-xs text-[#9d9da6]">
            {phraseStart
              ? "Chọn từ cuối trong cùng câu; chọn câu khác để bắt đầu lại."
              : "Chọn từ đầu rồi từ cuối trong cùng một câu."}
          </p>
        )}
        {phraseError && (
          <p role="alert" className="w-full pb-1 text-xs text-[#f5b50a]">
            {phraseError}
          </p>
        )}
      </div>
      {searchOpen && (
        <div
          id={searchId}
          className="shrink-0 space-y-1 border-b border-[#232327] px-3 py-2"
        >
          <div className="flex items-center gap-1">
            <input
              ref={searchInputRef}
              type="search"
              aria-label="Tìm câu trong phụ đề"
              aria-describedby={searchId + "-status"}
              placeholder="Tìm từ hoặc cụm trong câu…"
              maxLength={MAX_SEARCH_QUERY_LENGTH}
              value={query}
              onChange={(event) => {
                const value = event.target.value;
                setQuery(value);
                setMatchId(null);
                if (value.trim()) setFollowing(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  event.stopPropagation();
                  closeSearch();
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  // Enter locates the first match, then cycles; Shift+Enter moves back.
                  chooseMatch(
                    event.shiftKey
                      ? matchPosition - 1
                      : matchId == null
                        ? matchPosition
                        : matchPosition + 1,
                  );
                }
              }}
              className="min-h-11 min-w-0 flex-1 rounded-lg border border-[#34343a] bg-[#19191c] px-3 text-sm text-[#e8e8ea] outline-none placeholder:text-[#9d9da6] focus-visible:border-[#f5b50a]"
            />
            <button
              type="button"
              aria-label="Câu phù hợp trước"
              disabled={!matches.length}
              onClick={() => chooseMatch(matchPosition - 1)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[#c5c5ce] hover:bg-white/5 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-[#f5b50a]"
            >
              <ChevronUp aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Câu phù hợp tiếp"
              disabled={!matches.length}
              onClick={() => chooseMatch(matchPosition + 1)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[#c5c5ce] hover:bg-white/5 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-[#f5b50a]"
            >
              <ChevronDown aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Đóng tìm phụ đề"
              onClick={closeSearch}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[#9d9da6] hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#f5b50a]"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
          <p
            id={searchId + "-status"}
            role="status"
            className="text-xs leading-relaxed text-[#9d9da6]"
          >
            {!query.trim()
              ? "Tìm trong ngôn ngữ đang hiển thị · Enter để đến câu."
              : matches.length
                ? matchPosition +
                  1 +
                  " / " +
                  matches.length +
                  " câu phù hợp · bấm mốc thời gian để nghe."
                : "Không tìm thấy trong phụ đề đang hiển thị."}
          </p>
        </div>
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
              data-search-match={matchIds.has(s.i) || undefined}
              data-search-current={s.i === currentMatch || undefined}
              aria-current={active ? "true" : undefined}
              className={cn(
                "group mb-2 space-y-2 rounded-xl px-3 py-3 text-left transition-colors",
                active ? "bg-[#f5b50a]/10 text-[#e8e8ea]" : "text-[#9d9da6]",
                s.i === currentMatch && "ring-1 ring-inset ring-[#f5b50a]/50",
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
              {active &&
                showsEnglish(subtitleMode) &&
                activeGlosses.length > 0 && (
                  <div
                    data-testid="automatic-vocabulary"
                    className="border-t border-[#f5b50a]/15 pt-2"
                  >
                    <p className="mb-1 text-[11px] text-[#9d9da6]">
                      Từ trong câu · nghĩa từ điển
                    </p>
                    <dl className="space-y-1 text-sm leading-relaxed">
                      {activeGlosses.map((entry) => (
                        <div
                          key={entry.word}
                          className="[overflow-wrap:anywhere]"
                        >
                          <dt className="inline font-medium text-[#e8e8ea]">
                            {entry.surface}
                          </dt>{" "}
                          <dd className="inline text-[#c5c5ce]">
                            · {entry.meaning_vn}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
