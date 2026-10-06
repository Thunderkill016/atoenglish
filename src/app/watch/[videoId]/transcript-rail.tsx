"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Sentence } from "@/lib/video/types";

export function formatTimestamp(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface TranscriptRailProps {
  sentences: Sentence[];
  activeIndex: number;
  nowMs: number;
  onSeek: (ms: number) => void;
  /** Read mode renders sentences as flowing prose lines. */
  prose?: boolean;
}

/**
 * Scrollable bilingual-ready transcript column (REDESIGN §5.2 T1).
 * Active line highlights gold and auto-scrolls into view.
 */
export function TranscriptRail({
  sentences,
  activeIndex,
  nowMs,
  onSeek,
  prose = false,
}: TranscriptRailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrolled = useRef(-1);

  useEffect(() => {
    if (activeIndex < 0 || activeIndex === lastScrolled.current) return;
    const container = containerRef.current;
    if (!container) return;
    const el = container.querySelector<HTMLElement>(
      `[data-sentence="${activeIndex}"]`,
    );
    if (!el) return;
    lastScrolled.current = activeIndex;
    container.scrollTo({
      top: el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2,
      behavior: "smooth",
    });
  }, [activeIndex]);

  if (sentences.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "min-h-0 overflow-y-auto",
        prose ? "px-2" : "h-full pr-1",
      )}
      data-testid="transcript-rail"
    >
      {sentences.map((s) => {
        const active = s.i === activeIndex;
        const activeWordIdx =
          active && s.words
            ? s.words.reduce(
                (acc, w, i) => (w.start_ms <= nowMs ? i : acc),
                -1,
              )
            : -1;
        return (
          <button
            key={s.i}
            type="button"
            data-sentence={s.i}
            onClick={() => s.start_ms != null && onSeek(s.start_ms)}
            className={cn(
              "group flex w-full gap-3 rounded-lg px-3 py-2 text-left transition-colors",
              active
                ? "bg-[#f5b50a]/10 text-[#e8e8ea]"
                : "text-[#9d9da6] hover:bg-white/5 hover:text-[#c9c9d1]",
              s.noise && "opacity-50",
              prose && "py-1.5",
            )}
          >
            {!prose && (
              <span className="mt-0.5 w-10 shrink-0 font-mono text-xs tabular-nums text-[#6d6d78] group-hover:text-[#8d8d99]">
                {s.start_ms != null ? formatTimestamp(s.start_ms) : "—"}
              </span>
            )}
            <span
              className={cn(
                "flex-1 leading-relaxed",
                prose ? "text-[15px]" : "text-sm",
                active && "text-[#f5b50a]",
              )}
            >
              {s.words
                ? s.words.map((w, i) => (
                    <span
                      key={i}
                      className={cn(
                        i === activeWordIdx &&
                          "rounded bg-[#f5b50a]/25 px-0.5",
                      )}
                    >
                      {w.w}
                      {i < s.words!.length - 1 ? " " : ""}
                    </span>
                  ))
                : s.text}
            </span>
          </button>
        );
      })}
    </div>
  );
}
