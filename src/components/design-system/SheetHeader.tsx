import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThinProgress } from "./ThinProgress";

interface SheetHeaderProps {
  backHref?: string;
  backLabel?: string;
  eyebrow?: string;
  title: string;
  progress?: number;
  progressLabel?: string;
  trailing?: React.ReactNode;
  className?: string;
}

/** Sub-flow header for lessons and feature sheets (V2) */
export function SheetHeader({
  backHref = "/learn",
  backLabel = "Quay lại",
  eyebrow,
  title,
  progress,
  progressLabel,
  trailing,
  className,
}: SheetHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/60 bg-[var(--minimal-canvas)]/95 backdrop-blur-md",
        "dark:bg-[var(--minimal-canvas-dark)]/95",
        className
      )}
    >
      <div className="max-w-[var(--minimal-content-max)] mx-auto px-4 py-3 space-y-2">
        <div className="flex items-center gap-2.5">
          <Link
            href={backHref}
            aria-label={backLabel}
            className="shrink-0 flex size-9 items-center justify-center rounded-[var(--minimal-radius)] border border-border/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <div className="flex-1 min-w-0">
            {eyebrow && (
              <p className="text-[var(--minimal-caption-size)] font-semibold uppercase tracking-wide text-muted-foreground truncate">
                {eyebrow}
              </p>
            )}
            <p className="text-[var(--minimal-body-size)] font-semibold text-foreground truncate">
              {title}
            </p>
          </div>
          {trailing}
        </div>
        {progress !== undefined && (
          <ThinProgress value={progress} label={progressLabel} />
        )}
      </div>
    </header>
  );
}