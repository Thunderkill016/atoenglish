"use client";

import { useState } from "react";
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
}: {
  large?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  const router = useRouter();
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
        <div className="relative flex-1">
          <Search
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
              large ? "h-5 w-5" : "h-4 w-4",
            )}
          />
          <input
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
            className={cn(
              "w-full rounded-lg border border-input bg-card pr-3 outline-none focus:border-primary",
              large ? "py-3.5 pl-11 text-base" : "py-2.5 pl-9 text-sm",
            )}
          />
        </div>
        <button
          type="button"
          onClick={open}
          className={cn(
            "rounded-lg bg-primary font-semibold text-primary-foreground hover:opacity-90",
            large ? "px-6 py-3.5 text-base" : "px-4 py-2.5 text-sm",
          )}
        >
          Xem
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
