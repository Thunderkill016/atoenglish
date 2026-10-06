"use client";

import { useEffect, useRef } from "react";

import { YoutubeLinkInput } from "@/components/youtube-link-input";

/**
 * Floating search row at the top of /discover (REDESIGN §5.1): the shared
 * paste-link input is the primary action; the "Ctrl K" chip is a visual
 * hint only — Ctrl/Cmd+K anywhere on the page focuses the input.
 */
export function DiscoverSearch() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <YoutubeLinkInput
      large
      inputRef={inputRef}
      trailing={
        <kbd
          aria-hidden
          className="pointer-events-none hidden items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium leading-none text-muted-foreground sm:inline-flex"
        >
          Ctrl K
        </kbd>
      }
    />
  );
}
