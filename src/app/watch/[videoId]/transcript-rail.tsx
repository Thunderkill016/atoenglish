"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  defaultRangeExtractor,
  useVirtualizer,
  useWindowVirtualizer,
  type Range,
  type VirtualItem,
} from "@tanstack/react-virtual";
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
  /** Queued/in-flight machine translation — pending cues say so, not "none". */
  translationPending?: boolean;
  subtitleMode?: SubtitleMode;
  activeIndex: number;
  nowMs: number;
  onSeek: (ms: number) => void;
  onSelectSentence?: (id: number) => void;
  playableIds?: ReadonlySet<number>;
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
export const TRANSCRIPT_VIRTUAL_THRESHOLD = 200;
const VIRTUAL_OVERSCAN = 8; // Owner-selected buffer on either side of the viewport.
const ESTIMATED_ROW_HEIGHT = 200; // Bilingual text + timestamp; measured after mounting.
const DESKTOP_QUERY = "(min-width: 1024px)"; // The existing lg rail breakpoint.
function subscribeDesktop(listener: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}
const isDesktop = () => window.matchMedia(DESKTOP_QUERY).matches;
const serverDesktop = () => false;
function playable(sentence: Sentence) {
  return (
    sentence.start_ms != null &&
    sentence.end_ms != null &&
    Number.isFinite(sentence.start_ms) &&
    Number.isFinite(sentence.end_ms) &&
    sentence.start_ms >= 0 &&
    sentence.end_ms > sentence.start_ms
  );
}

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
              className={cn(highlighted && "rounded bg-primary/25")}
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
              "inline max-w-full rounded p-0 align-baseline text-inherit [overflow-wrap:anywhere] hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-ring",
              highlighted && "bg-primary/25",
              phraseStart?.sentenceI === sentence.i &&
                phraseStart.tokenIndex === index &&
                "bg-primary/25 underline",
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
  translationPending = false,
  subtitleMode = "en",
  activeIndex,
  nowMs,
  onSeek,
  onSelectSentence,
  playableIds,
  prose = false,
  onLookup,
}: TranscriptRailProps) {
  "use no memo"; // TanStack Virtual exposes a mutable instance; do not compiler-cache its rows.
  const containerRef = useRef<HTMLDivElement>(null);
  const desktop = useSyncExternalStore(
    subscribeDesktop,
    isDesktop,
    serverDesktop,
  );
  const virtual = !prose && sentences.length > TRANSCRIPT_VIRTUAL_THRESHOLD;
  const [scrollMargin, setScrollMargin] = useState(0);
  const marginRef = useRef<number | null>(null);
  const pageNavigationAllowed = useRef(true);
  const [focusedId, setFocusedId] = useState<number | null>(null);
  const [lookupId, setLookupId] = useState<number | null>(null);
  const indexById = useMemo(
    () => new Map(sentences.map((s, index) => [s.i, index])),
    [sentences],
  );
  const rangeExtractor = useCallback(
    (range: Range) => {
      const indices = new Set(defaultRangeExtractor(range));
      // A dictionary restores the original word button, even if its cue is offscreen.
      for (const id of [focusedId, lookupId]) {
        const index = id == null ? undefined : indexById.get(id);
        if (index != null) indices.add(index);
      }
      return [...indices].sort((a, b) => a - b);
    },
    [focusedId, lookupId, indexById],
  );
  const options = {
    count: sentences.length,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    getItemKey: (index: number) => `seg-${sentences[index].i}`,
    overscan: VIRTUAL_OVERSCAN,
    rangeExtractor,
    gap: 8, // The existing mb-2 reading gap; measured row height excludes margin.
  };
  const railVirtualizer = useVirtualizer({
    ...options,
    getScrollElement: () => containerRef.current,
    enabled: virtual && desktop,
  });
  const pageVirtualizer = useWindowVirtualizer({
    ...options,
    scrollMargin,
    enabled: virtual && !desktop,
    // The site's html has smooth scrolling. Each dynamic measurement would
    // restart that animation, so a distant search never reaches its cue.
    scrollToFn: (offset, { adjustments }, instance) => {
      // A pending measured search may reconcile after the learner scrolls.
      // Ignore those absolute writes until another explicit navigation command;
      // relative resize compensation still preserves the manual reading anchor.
      if (adjustments == null && !pageNavigationAllowed.current) return;
      instance.scrollElement?.scrollTo({
        // Native/manual scrolling or the caption-stage compensation can move
        // the DOM before TanStack receives its scroll event. Resize adjustments
        // are relative to that actual position, not a stale cached offset.
        top:
          adjustments == null
            ? offset
            : (instance.scrollElement?.scrollY ?? offset) + adjustments,
        behavior: "instant",
      });
    },
  });
  const virtualizer = desktop ? railVirtualizer : pageVirtualizer;
  useEffect(() => {
    if (!virtual || desktop) return;
    const element = containerRef.current;
    if (!element) return;
    const update = () => {
      const margin = element.getBoundingClientRect().top + window.scrollY;
      const previous = marginRef.current;
      // A late Focus Sentence translation also changes the stage height above
      // the mobile document. Preserve the reader's position inside the rail.
      if (previous != null && window.scrollY >= previous && margin !== previous)
        window.scrollTo({
          top: window.scrollY + margin - previous,
          behavior: "instant",
        });
      marginRef.current = margin;
      setScrollMargin(margin);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    // Stage/caption height can change without resizing the transcript itself.
    if (element.parentElement?.parentElement)
      observer.observe(element.parentElement.parentElement);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [virtual, desktop]);
  const locateSentence = (id: number, explicit: boolean) => {
    if (!desktop && !explicit) return; // Playback never scrolls the mobile document.
    if (!desktop) pageNavigationAllowed.current = true;
    const index = indexById.get(id);
    if (virtual && index != null)
      virtualizer.scrollToIndex(index, { align: "auto" });
    else
      revealSentence(containerRef.current, id, { allowPageScroll: explicit });
  };
  const lookup: TranscriptRailProps["onLookup"] = onLookup
    ? (term, sentence, trigger) => {
        setLookupId(sentence.i);
        onLookup(term, sentence, trigger);
      }
    : undefined;
  const [following, setFollowing] = useState(true);
  useEffect(() => {
    if (!virtual || desktop) return;
    const stopNavigation = () => {
      pageNavigationAllowed.current = false;
      setFollowing(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest(
          "input, textarea, select, [contenteditable], [role=slider]",
        )
      )
        return;
      if (
        ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(
          event.key,
        )
      )
        stopNavigation();
    };
    window.addEventListener("wheel", stopNavigation, { passive: true });
    window.addEventListener("touchmove", stopNavigation, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", stopNavigation);
      window.removeEventListener("touchmove", stopNavigation);
      window.removeEventListener("keydown", onKey);
    };
  }, [virtual, desktop]);
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
    setFocusedId(null);
    setLookupId(null);
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
  useLayoutEffect(() => {
    const anchorIndex =
      currentMatch == null ? undefined : indexById.get(currentMatch);
    // A manually chosen row can sit near the bottom of the viewport. Resize
    // compensation must protect that row, not just the first visible row.
    virtualizer.shouldAdjustScrollPositionOnItemSizeChange =
      !following && anchorIndex != null
        ? (item: VirtualItem) => item.index < anchorIndex
        : undefined;
    return () => {
      virtualizer.shouldAdjustScrollPositionOnItemSizeChange = undefined;
    };
  }, [virtualizer, currentMatch, indexById, following]);
  const hasTimedSentences = sentences.some((sentence) =>
    playableIds ? playableIds.has(sentence.i) : playable(sentence),
  );
  const chooseMatch = (position: number) => {
    if (!matches.length) return;
    const sentence = matches[(position + matches.length) % matches.length];
    setMatchId(sentence.i);
    setFollowing(false);
    locateSentence(sentence.i, true);
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
    if (virtual) {
      const index = indexById.get(activeIndex);
      if (desktop && index != null)
        virtualizer.scrollToIndex(index, { align: "auto" });
    } else
      revealSentence(containerRef.current, activeIndex, {
        allowPageScroll: false,
      });
  }, [
    activeIndex,
    following,
    prose,
    translations,
    subtitleMode,
    virtual,
    virtualizer,
    desktop,
    indexById,
  ]);

  const renderSentence = (s: Sentence, offset: number, item?: VirtualItem) => {
    const active = s.i === activeIndex;
    return (
      <div
        key={`seg-${s.i}`}
        ref={item ? virtualizer.measureElement : undefined}
        data-index={offset}
        style={
          item
            ? {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${item.start - (desktop ? 0 : scrollMargin)}px)`,
              }
            : prose
              ? {
                  // Keep full source DOM for copy/Ctrl+F while the browser
                  // skips layout/paint of thousands of offscreen paragraphs.
                  contentVisibility: "auto",
                  containIntrinsicSize: `auto ${ESTIMATED_ROW_HEIGHT}px`,
                }
              : undefined
        }
        data-sentence={s.i}
        data-search-match={matchIds.has(s.i) || undefined}
        data-search-current={s.i === currentMatch || undefined}
        aria-current={active ? "true" : undefined}
        className={cn(
          "group space-y-2 rounded-xl px-3 py-3 text-left transition-colors",
          !item && "mb-2",
          active ? "bg-primary/10 text-foreground" : "text-muted-foreground",
          s.i === currentMatch && "ring-1 ring-inset ring-primary/50",
          s.noise && "opacity-50",
          prose && "mb-4 py-3",
        )}
      >
        {(playableIds ? playableIds.has(s.i) : playable(s)) ? (
          <button
            type="button"
            onClick={() =>
              onSelectSentence ? onSelectSentence(s.i) : onSeek(s.start_ms!)
            }
            aria-label={`Nghe câu ${formatTimestamp(s.start_ms!)}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground/5 px-3 text-xs tabular-nums text-muted-foreground hover:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Play aria-hidden className="h-3.5 w-3.5" />
            {prose ? "Nghe lại" : formatTimestamp(s.start_ms!)}
          </button>
        ) : (
          !prose && (
            <span className="text-[11px] text-muted-foreground">Văn bản</span>
          )
        )}
        {showsEnglish(subtitleMode) && (
          <p
            lang="en"
            className={cn(
              "text-base leading-[1.65] [overflow-wrap:anywhere]",
              prose && "sm:text-lg",
              active && "text-primary",
            )}
          >
            {s.noise && <span className="sr-only">Âm thanh nền: </span>}
            <SentenceText
              sentence={s}
              nowMs={nowMs}
              active={active}
              onLookup={lookup}
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
              onClick={() => setRevealed((prev) => new Set(prev).add(s.i))}
              aria-label="Hiện nghĩa tiếng Việt của câu này"
              className="block w-full rounded-md text-left focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span
                aria-hidden
                className="block select-none text-[15px] leading-[1.65] text-foreground/75 blur-[5px] [overflow-wrap:anywhere]"
              >
                {translations[s.i]}
              </span>
            </button>
          ) : (
            <p
              lang="vi"
              data-testid="translated-sentence"
              className={cn(
                "text-[15px] leading-[1.65] text-foreground/75 [overflow-wrap:anywhere]",
                prose && "sm:text-base",
              )}
            >
              {translations[s.i] ??
                (translationPending
                  ? "Đang dịch…"
                  : "Chưa có bản dịch cho câu này.")}
              {mixedSources && translations[s.i] && !s.vi && (
                <span className="ml-2 text-[11px] text-muted-foreground">
                  · dịch máy
                </span>
              )}
            </p>
          ))}
        {active && showsEnglish(subtitleMode) && activeGlosses.length > 0 && (
          <div
            data-testid="automatic-vocabulary"
            className="border-t border-primary/15 pt-2"
          >
            <p className="mb-1 text-[11px] text-muted-foreground">
              Từ trong câu · nghĩa từ điển
            </p>
            <dl className="space-y-1 text-sm leading-relaxed">
              {activeGlosses.map((entry) => (
                <div key={entry.word} className="[overflow-wrap:anywhere]">
                  <dt className="inline font-medium text-foreground">
                    {entry.surface}
                  </dt>{" "}
                  <dd className="inline text-foreground/75">
                    · {entry.meaning_vn}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    );
  };

  if (sentences.length === 0) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-3 py-1.5">
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
                requestAnimationFrame(() => locateSentence(activeIndex, true));
              }
              setFollowing((value) => !value);
            }}
            className="min-h-11 min-w-0 flex-1 rounded-lg px-2 text-left text-xs text-primary hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-ring"
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
            className="min-h-11 shrink-0 rounded-lg px-2 text-xs text-primary hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-ring"
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
          className="ml-auto inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/5 aria-expanded:text-primary focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Search aria-hidden className="size-4" />
        </button>
        {phraseMode && showsEnglish(subtitleMode) && (
          <p
            role="status"
            className="w-full pb-1 text-xs text-muted-foreground"
          >
            {phraseStart
              ? "Chọn từ cuối trong cùng câu; chọn câu khác để bắt đầu lại."
              : "Chọn từ đầu rồi từ cuối trong cùng một câu."}
          </p>
        )}
        {phraseError && (
          <p role="alert" className="w-full pb-1 text-xs text-primary">
            {phraseError}
          </p>
        )}
      </div>
      {searchOpen && (
        <div
          id={searchId}
          className="shrink-0 space-y-1 border-b border-border px-3 py-2"
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
              className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-elevated px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring"
            />
            <button
              type="button"
              aria-label="Câu phù hợp trước"
              disabled={!matches.length}
              onClick={() => chooseMatch(matchPosition - 1)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-foreground/75 hover:bg-foreground/5 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <ChevronUp aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Câu phù hợp tiếp"
              disabled={!matches.length}
              onClick={() => chooseMatch(matchPosition + 1)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-foreground/75 hover:bg-foreground/5 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <ChevronDown aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Đóng tìm phụ đề"
              onClick={closeSearch}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
          <p
            id={searchId + "-status"}
            role="status"
            className="text-xs leading-relaxed text-muted-foreground"
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
        onFocusCapture={(event) => {
          const row = (event.target as HTMLElement).closest<HTMLElement>(
            "[data-sentence]",
          );
          if (row) setFocusedId(Number(row.dataset.sentence));
        }}
        onBlurCapture={(event) => {
          if (
            !(event.relatedTarget instanceof Node) ||
            !event.currentTarget.contains(event.relatedTarget)
          )
            setFocusedId(null);
        }}
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
        style={virtual ? { overflowAnchor: "none" } : undefined}
        data-testid="transcript-rail"
      >
        {virtual ? (
          <div
            data-testid="virtual-transcript"
            style={{
              height: virtualizer.getTotalSize(),
              position: "relative",
              width: "100%",
            }}
          >
            {virtualizer
              .getVirtualItems()
              .map((item) =>
                renderSentence(sentences[item.index], item.index, item),
              )}
          </div>
        ) : (
          sentences.map((sentence, offset) => renderSentence(sentence, offset))
        )}
      </div>
    </div>
  );
}
