import { CircleAlert, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { MinimalButton } from "./MinimalButton";

interface ErrorStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

/** Full-block error state with optional retry — the error counterpart of EmptyState. */
export function ErrorState({
  icon: Icon = CircleAlert,
  title = "Có lỗi xảy ra",
  description = "Không tải được nội dung. Vui lòng thử lại.",
  retryLabel = "Thử lại",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center text-center py-10 px-4 space-y-4",
        className,
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <Icon className="size-7" strokeWidth={1.75} />
      </span>
      <div className="space-y-1.5 max-w-sm">
        <p className="text-[var(--minimal-headline-size)] font-bold text-foreground">
          {title}
        </p>
        <p className="text-[var(--minimal-body-size)] text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      {onRetry && (
        <MinimalButton onClick={onRetry} variant="secondary">
          {retryLabel}
        </MinimalButton>
      )}
    </div>
  );
}
