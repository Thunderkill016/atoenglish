import Link from "next/link";
import { Captions, Play } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/format";

/**
 * T6 video card — 16:9 thumb + duration badge + "có phụ đề" chip +
 * 2-line title + channel/level meta (REDESIGN §4.2, §5.1).
 * Optional `progressPct` renders a resume bar (continue-watching row).
 */
export function VideoCard({
  videoId,
  title,
  channel,
  note,
  durationMs,
  positionMs,
  href,
  className,
}: {
  videoId: string;
  title: string;
  channel?: string | null;
  /** Curator note — e.g. "Phụ đề thủ công" — until the catalog schema lands. */
  note?: string | null;
  durationMs?: number | null;
  /** Resume position; shows progress bar and deep-links with ?t=. */
  positionMs?: number | null;
  href?: string;
  className?: string;
}) {
  const progressPct =
    positionMs && durationMs && durationMs > 0
      ? Math.min(100, Math.round((positionMs / durationMs) * 100))
      : positionMs && positionMs > 0
        ? null // position known but duration unknown → badge only
        : null;
  const target =
    href ??
    `/watch/${videoId}${positionMs && positionMs > 0 ? `?t=${positionMs}` : ""}`;

  return (
    <Link
      href={target}
      className={cn(
        "group block overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/50",
        className,
      )}
    >
      <div className="relative aspect-video bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
          <Play className="h-8 w-8 text-white opacity-0 transition group-hover:opacity-100" />
        </span>
        {durationMs != null && durationMs > 0 && (
          <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white">
            {formatTimestamp(durationMs)}
          </span>
        )}
        {(progressPct != null || (positionMs ?? 0) > 0) && (
          <span className="absolute inset-x-0 bottom-0 h-1 bg-black/40">
            <span
              className="block h-full bg-primary"
              style={{ width: `${progressPct ?? 0}%` }}
            />
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-[15px] font-medium leading-snug">
          {title}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          {channel && <span className="truncate">{channel}</span>}
          {channel && (note || positionMs) && <span aria-hidden>·</span>}
          {positionMs != null && positionMs > 0 ? (
            <span>Xem tiếp từ {formatTimestamp(positionMs)}</span>
          ) : note ? (
            <span>{note}</span>
          ) : null}
          <Captions
            className="ml-auto h-3.5 w-3.5 shrink-0"
            aria-label="Có phụ đề"
          />
        </p>
      </div>
    </Link>
  );
}
