import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Margin column on /discover (≥xl, ~280px — "Bàn học" editorial direction);
 * on mobile it stacks below the main column. Borderless "margin note"
 * widgets: micro-caps titles separated by hairlines, sticky on desktop so
 * they stay visible while the feed scrolls. Widgets render only when their
 * data exists.
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
        "flex w-full flex-col xl:sticky xl:top-10 xl:max-h-[calc(100vh-5rem)] xl:w-[280px] xl:shrink-0 xl:self-start xl:overflow-y-auto",
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
    <section className="border-t border-border py-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
