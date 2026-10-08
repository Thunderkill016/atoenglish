"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MAIN_NAV_ITEMS, isNavActive } from "@/components/layout/nav-items";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

/**
 * T-shell — desktop left icon rail, 80px, icon-only (REDESIGN §4.3).
 * Replaces the old top header: logo mark on top, main nav in the middle,
 * theme toggle pinned at the bottom. Hidden below md — mobile uses
 * `BottomNav` instead.
 */
export function IconRail() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-y-0 left-0 z-40 hidden w-20 flex-col items-center bg-background py-6 md:flex"
    >
      <Link
        href="/"
        aria-label="AtoEnglish — về trang chủ"
        title="AtoEnglish"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-extrabold text-primary-foreground transition-opacity hover:opacity-90"
      >
        A
      </Link>

      <div className="mt-8 flex flex-1 flex-col items-center gap-3">
        {MAIN_NAV_ITEMS.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          );
        })}
      </div>

      <ThemeToggle />
    </nav>
  );
}
