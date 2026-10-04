import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  "aria-hidden"?: boolean;
}

/** Placeholder block for loading states — respects reduced motion via pulse utility. */
export function Skeleton({
  className,
  "aria-hidden": ariaHidden = true,
}: SkeletonProps) {
  return (
    <div
      aria-hidden={ariaHidden}
      className={cn(
        "animate-pulse rounded-[var(--minimal-radius)] bg-muted",
        className,
      )}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

/** Multi-line text placeholder; last line is shortened like real paragraphs. */
export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2.5", className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}
