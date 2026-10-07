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

/** Empty chart keeps the reference layout without fabricating measured progress. */
export function ProgressChart() {
  // Four horizontal guides divide the 160px plotting area into equal intervals.
  const gridLines = [20, 60, 100, 140];
  return (
    <figure aria-label="Tiến độ ôn tập: chưa có dữ liệu">
      <div className="relative">
        <svg
          viewBox="0 0 292 160"
          className="w-full text-muted-foreground/30"
          aria-hidden
        >
          {gridLines.map((y) => (
            <line
              key={y}
              x1="0"
              x2="292"
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeDasharray="3 4"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
          <span className="text-sm text-muted-foreground">
            Chưa có dữ liệu tiến độ
          </span>
          <span className="text-xs text-muted-foreground">
            Dữ liệu ôn tập sẽ hiển thị ở đây
          </span>
        </div>
      </div>
      <figcaption className="mt-2 text-xs text-muted-foreground">
        Tiến độ dựa trên kết quả ôn tập.
      </figcaption>
    </figure>
  );
}
