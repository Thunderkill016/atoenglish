"use client";

import { useId, useState } from "react";
import type { ReactNode, Ref } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { parseYoutubeUrl } from "@/lib/video/youtube-url";
import { cn } from "@/lib/utils";

const INVALID_URL_MESSAGE =
  "Link không hợp lệ — hỗ trợ youtube.com, youtu.be, shorts, live, embed.";

/**
 * Shared "dán link YouTube" input — the primary action on both the landing
 * hero and /discover. Validates client-side and navigates to /watch/[id].
 */
export function YoutubeLinkInput({
  large = false,
  autoFocus = false,
  placeholder = "Dán link YouTube để học ngay…",
  inputRef,
  trailing,
}: {
  large?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  /** Access to the <input>, e.g. for a Ctrl+K focus shortcut. */
  inputRef?: Ref<HTMLInputElement>;
  /** Decorative element pinned inside the input's right edge (e.g. kbd hint). */
  trailing?: ReactNode;
}) {
  const router = useRouter();
  const errorId = useId();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const open = () => {
    const id = parseYoutubeUrl(url);
    if (!id) {
      setError(INVALID_URL_MESSAGE);
      return;
    }
    router.push(`/watch/${id}`);
  };

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
              large ? "h-5 w-5" : "h-4 w-4",
            )}
          />
          <input
            ref={inputRef}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && open()}
            autoFocus={autoFocus}
            placeholder={placeholder}
            inputMode="url"
            aria-label="Link YouTube"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "w-full rounded-full border border-input bg-card outline-none transition-colors focus:border-primary focus-visible:ring-2 focus-visible:ring-ring/30",
              large ? "py-3.5 pl-11 text-base" : "py-2.5 pl-9 text-sm",
              trailing ? "pr-3 sm:pr-16" : "pr-3",
            )}
          />
          {trailing && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {trailing}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={open}
          className={cn(
            "rounded-full bg-primary font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
            large ? "px-6 py-3.5 text-base" : "px-4 py-2.5 text-sm",
          )}
        >
          Xem
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
