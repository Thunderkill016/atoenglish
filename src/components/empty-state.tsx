import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** T10 — compact empty state with a single clear CTA. */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  body?: string;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-8 text-center",
        className,
      )}
    >
      {Icon && <Icon className="h-6 w-6 text-muted-foreground" />}
      <p className="text-sm font-semibold">{title}</p>
      {body && <p className="text-sm text-muted-foreground">{body}</p>}
      {action && (
        <Link
          href={action.href}
          className={cn(buttonVariants({ size: "sm" }), "mt-1")}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
