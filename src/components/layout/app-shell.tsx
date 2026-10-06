import type { ReactNode } from "react";

import { BottomNav } from "@/components/layout/bottom-nav";
import { Masthead } from "@/components/layout/masthead";

/**
 * "Bàn học" shell — shared app chrome for the `(main)` route group:
 * a top masthead (serif wordmark + text nav) on all sizes, fixed BottomNav
 * on mobile, and a centred content column. Primary actions live inside
 * each page's content.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Masthead />
      {/* pb-24 clears the fixed bottom nav (incl. safe-area) on mobile. */}
      <main
        id="main-content"
        className="mx-auto w-full max-w-[1320px] flex-1 px-4 pb-24 pt-6 md:pb-12 md:pt-10"
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
