"use client";

import { cn } from "@/lib/utils";

export interface FilterChipOption {
  value: string;
  label: string;
}

/**
 * T7 — horizontal scrollable chip row for `/discover` topic filters
 * (REDESIGN §5.1). `value === null` selects the "Tất cả" chip.
 * Scrollbar is hidden; overflow scrolls horizontally on touch/drag.
 */
export function FilterChips({
  options,
  value,
  onChange,
  allLabel,
  className,
}: {
  options: FilterChipOption[];
  value: string | null;
  onChange: (v: string | null) => void;
  allLabel: string;
  className?: string;
}) {
  const chipClass = (active: boolean) =>
    cn(
      "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
    );

  return (
    <div
      role="group"
      aria-label={allLabel}
      className={cn(
        "flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <button
        type="button"
        aria-pressed={value === null}
        onClick={() => onChange(null)}
        className={chipClass(value === null)}
      >
        {allLabel}
      </button>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(value === opt.value ? null : opt.value)}
          className={chipClass(value === opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
