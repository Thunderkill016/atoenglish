import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * T5 — right rail on /discover (≥xl, ~320px per REDESIGN §4.3); on mobile it
 * stacks below the main column. The rail is sticky on desktop so widgets stay
 * visible while the feed scrolls. Widgets render only when their data exists.
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
        "flex w-full flex-col gap-4 xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:w-[320px] xl:shrink-0 xl:self-start xl:overflow-y-auto",
        className,
      )}
    >
      {children}
    </aside>
  );
}

export function WidgetCard({
  title,
  action,
  children,
}: {
  title: string;
  /** Optional top-right affordance — e.g. a "Xem thêm" link. */
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
