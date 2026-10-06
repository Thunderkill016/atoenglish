import Link from "next/link";
import { Captions, Check, Play } from "lucide-react";

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

  const pill = "rounded-full bg-muted px-2 py-0.5 text-[11px] leading-tight";

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
      </div>

      <div className="flex gap-3 px-0.5 pt-2.5">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[15px] font-medium leading-snug">
            {title}
          </p>
          {channel && (
            <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
              {channel}
            </p>
          )}
          <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-muted-foreground">
            {watched && (
              <span className={cn(pill, "inline-flex items-center gap-1")}>
                <Check className="h-3 w-3 text-state-known" />
                Đã xem
              </span>
            )}
            {resumable && (
              <span className={pill}>
                Xem tiếp {formatTimestamp(positionMs!)}
                {remainingMs != null &&
                  ` · còn ~${Math.ceil(remainingMs / 60_000)}′`}
              </span>
            )}
            {ageLabel && <span className={pill}>{ageLabel}</span>}
            {topicLabel && <span className={pill}>{topicLabel}</span>}
            {levelLabel && (
              <span className={cn(pill, level && LEVEL_TONE[level])}>
                {levelLabel}
              </span>
            )}
            <span
              className={cn(pill, "inline-flex items-center gap-1")}
              title={captionLabel ?? "Có phụ đề"}
            >
              <Captions className="h-3 w-3 shrink-0" />
              {captionLabel && <span>{captionLabel}</span>}
            </span>
          </p>
        </div>
        {channel && (
          <span
            aria-hidden
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary"
          >
            {channel.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </Link>
  );
}
