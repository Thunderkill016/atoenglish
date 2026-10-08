import type { ReactNode } from "react";
import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Home widgets share the document's scroll with the feed and stack below it
 * on mobile. Do not constrain height or add a nested vertical scroll region.
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
      aria-label="Tổng quan học tập"
      className={cn(
        "flex w-full flex-col gap-5 rounded-xl bg-background p-4",
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
  info,
  children,
  className,
}: {
  title: string;
  info?: string;
  /** Optional top-right affordance — e.g. a "Xem thêm" link. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl bg-card p-4", className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-medium">{title}</h2>
          {info && (
            <span title={info} className="text-muted-foreground">
              <Info aria-label={info} role="img" className="size-3.5" />
            </span>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
