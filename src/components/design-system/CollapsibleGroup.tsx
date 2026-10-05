"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleGroupProps {
  /** Group heading, e.g. "A1 · Giao tiếp cơ bản" */
  title: string;
  /** Secondary meta line, e.g. "3/12 bài" — shown right-aligned */
  meta?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * CollapsibleGroup — accordion container for chunked row-card lists
 * (curriculum levels, quiz units, settings clusters). One group open at a
 * time is enforced by the parent, not here — each instance owns its state.
 */
export function CollapsibleGroup({
  title,
  meta,
  defaultOpen = false,
  children,
  className,
}: CollapsibleGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/60 bg-card",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex min-h-[var(--minimal-touch)] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[var(--minimal-body-size)] font-semibold text-foreground">
            {title}
          </span>
          {meta && (
            <span className="mt-0.5 block text-[var(--minimal-caption-size)] text-muted-foreground">
              {meta}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open && (
        <div id={bodyId} className="space-y-2 border-t border-border/50 p-2">
          {children}
        </div>
      )}
    </div>
  );
}
