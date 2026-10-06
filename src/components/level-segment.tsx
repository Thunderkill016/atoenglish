"use client";

import { cn } from "@/lib/utils";

export interface LevelSegmentOption {
  value: string;
  label: string;
}

/**
 * T7 — segmented control for `/discover` level filter (REDESIGN §5.1),
 * sibling to FilterChips: joined segments in a rounded container with the
 * active segment highlighted. `value === null` selects "Tất cả".
 */
export function LevelSegment({
  options,
  value,
  onChange,
  allLabel,
  className,
}: {
  options: LevelSegmentOption[];
  value: string | null;
  onChange: (v: string | null) => void;
  allLabel: string;
  className?: string;
}) {
  const segmentClass = (active: boolean) =>
    cn(
      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground",
    );

  return (
    <div
      role="group"
      aria-label={allLabel}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5",
        className,
      )}
    >
      <button
        type="button"
        aria-pressed={value === null}
        onClick={() => onChange(null)}
        className={segmentClass(value === null)}
      >
        {allLabel}
      </button>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(value === opt.value ? null : opt.value)}
          className={segmentClass(value === opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
