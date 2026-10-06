"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Light/dark toggle for the app shell (next-themes, storageKey "ato-ui-white",
 * ThemeProvider mounted in the root layout). Lives at the right edge of the
 * masthead.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  // Avoid hydration mismatch: the server render assumes the light default;
  // the real theme is only known once mounted. useSyncExternalStore is the
  // lint-clean way to detect "we are on the client now" — no effect needed.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isDark = mounted && resolvedTheme === "dark";
  const label = isDark
    ? "Chuyển sang giao diện sáng"
    : "Chuyển sang giao diện tối";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        className,
      )}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
