import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * T5 — right rail on /discover (desktop ≥1180px per REDESIGN §4.3).
 * Widgets render only when their data exists — no placeholder noise.
 */
export function RightRail({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "flex w-full flex-col gap-4 xl:w-[320px] xl:shrink-0",
        className,
      )}
    >
      {children}
    </aside>
  );
}

export function WidgetCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}
