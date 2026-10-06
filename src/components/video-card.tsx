import Link from "next/link";
import type { ReactNode } from "react";
import { Captions, Play } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/format";

/** A position past this share of the video counts as finished (YouTube's ~95%). */
const WATCHED_PCT = 95;
/** Below this, a stray touch doesn't earn a resume slot (YouTube's ~1% floor). */
const RESUME_MIN_PCT = 5;

const LEVEL_TONE = {
  easy: "text-state-known",
  medium: "text-state-learning",
  hard: "text-state-due",
} as const;

export type VideoCardLevel = keyof typeof LEVEL_TONE;

/**
 * T6 feed card — chromeless Trancy/YouTube anatomy: only the 16:9 thumb is
 * rounded; title sits on the page background; meta renders as discrete pills
 * (relative-age / topic / colored level / captions). Resume progress shows a
 * bottom bar; ≥95% watched collapses to a "Đã xem" state.
 */
export function VideoCard({
  videoId,
  title,
  channel,
  topicLabel,
  levelLabel,
  level,
  captionLabel,
  durationMs,
  positionMs,
  ageLabel,
  href,
  className,
}: {
  videoId: string;
  title: string;
  channel?: string | null;
  topicLabel?: string | null;
  levelLabel?: string | null;
  level?: VideoCardLevel | null;
  /** Caption-quality badge, e.g. "Phụ đề tay + tiếng Việt". */
  captionLabel?: string | null;
  durationMs?: number | null;
  /** Resume position — bar + ?t= deep link; ≥95% becomes "Đã xem". */
  positionMs?: number | null;
  ageLabel?: string | null;
  href?: string;
  className?: string;
}) {
  const progressPct =
    positionMs && durationMs && durationMs > 0
      ? Math.min(100, Math.round((positionMs / durationMs) * 100))
      : null;
  const watched = progressPct != null && progressPct >= WATCHED_PCT;
  const resumable =
    !watched &&
    positionMs != null &&
    positionMs > 0 &&
    (progressPct == null || progressPct >= RESUME_MIN_PCT);
  const remainingMs =
    resumable && durationMs != null && durationMs > positionMs!
      ? durationMs - positionMs!
      : null;
  const target =
    href ?? `/watch/${videoId}${resumable ? `?t=${positionMs}` : ""}`;

  const meta: ReactNode[] = [];
  if (channel) meta.push(channel);
  if (topicLabel) meta.push(topicLabel);
  if (ageLabel) meta.push(ageLabel);

  return (
    <Link href={target} className={cn("group block", className)}>
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
          <Play className="h-8 w-8 text-white opacity-0 transition group-hover:opacity-100" />
        </span>
        {durationMs != null && durationMs > 0 && (
          <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white">
            {formatTimestamp(durationMs)}
          </span>
        )}
        {resumable && progressPct != null && (
          <span className="absolute inset-x-0 bottom-0 h-1 bg-black/40">
            <span
              className="block h-full bg-primary"
              style={{ width: `${progressPct}%` }}
            />
          </span>
        )}
        {channel && (
          <span
            aria-hidden
            className="absolute bottom-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground ring-2 ring-black/40"
          >
            {channel.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="px-0.5 pt-2.5">
        <p className="line-clamp-2 text-sm font-medium leading-snug">
          {title}
        </p>
        {(watched || resumable) && (
          <p
            className={cn(
              "mt-1 text-xs font-medium",
              watched ? "text-state-known" : "text-primary",
            )}
          >
            {watched
              ? "Đã xem"
              : `Xem tiếp ${formatTimestamp(positionMs!)}${
                  remainingMs != null
                    ? ` · còn ~${Math.ceil(remainingMs / 60_000)}′`
                    : ""
                }`}
          </p>
        )}
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
          {meta.map((m, i) => (
            <span key={i} className="contents">
              {i > 0 && <span aria-hidden>·</span>}
              <span>{m}</span>
            </span>
          ))}
          {levelLabel && (
            <>
              <span aria-hidden>·</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  level && LEVEL_TONE[level],
                )}
              >
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-current"
                />
                {levelLabel}
              </span>
            </>
          )}
          <span
            title={captionLabel ?? "Có phụ đề"}
            className="inline-flex items-center"
          >
            <Captions className="h-3.5 w-3.5" />
            <span className="sr-only">{captionLabel ?? "Có phụ đề"}</span>
          </span>
        </p>
      </div>
    </Link>
  );
}
