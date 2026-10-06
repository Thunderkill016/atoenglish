"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MAIN_NAV_ITEMS, isNavActive } from "@/components/layout/nav-items";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

/**
 * "Bàn học" shell — top masthead replaces the icon rail (research round 3):
 * serif wordmark left, text nav with underline-active state, theme toggle
 * right. Nav links hide below md — mobile uses `BottomNav` instead. Not
 * sticky: the page scrolls under nothing.
 */
export function Masthead() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 w-full max-w-[1320px] items-center gap-6 px-4">
        <Link
          href="/"
          aria-label="AtoEnglish — về trang chủ"
          className="font-serif text-xl font-semibold tracking-tight"
        >
          AtoEnglish
        </Link>

        <nav
          aria-label="Điều hướng chính"
          className="hidden items-center gap-5 md:flex"
        >
          {MAIN_NAV_ITEMS.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "border-b-2 py-1 text-sm font-medium transition-colors",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
