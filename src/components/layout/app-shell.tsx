import type { ReactNode } from "react";

import { BottomNav } from "@/components/layout/bottom-nav";
import { IconRail } from "@/components/layout/icon-rail";

/**
 * T-shell — shared app chrome for the `(main)` route group (REDESIGN §4.3):
 * fixed 80px IconRail on desktop and fixed BottomNav on mobile. The discovery
 * feed uses the available width and shares the document's scroll with its
 * sidebar. Primary actions live inside each page's content.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <IconRail />
      {/* Desktop padding clears the icon rail; mobile padding clears the bottom nav. */}
      <div className="flex min-h-dvh flex-col md:pl-20">
        <main
          id="main-content"
          className="w-full min-w-0 flex-1 px-4 pb-24 pt-4 md:px-3 md:py-3"
        >
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
