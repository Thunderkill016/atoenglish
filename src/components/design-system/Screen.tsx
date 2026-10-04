import { cn } from "@/lib/utils";

interface ScreenProps {
  children: React.ReactNode;
  className?: string;
  /** Max content width — default 680px (optimal reading line-length) */
  narrow?: boolean;
}

/** Full-height screen container with minimal canvas background */
export function Screen({ children, className, narrow = true }: ScreenProps) {
  return (
    <div
      className={cn(
        "min-h-[calc(100dvh-4rem)] bg-[var(--minimal-canvas)]",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto w-full px-4 pb-8 pt-6 sm:px-6",
          narrow && "max-w-[var(--minimal-content-max)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
