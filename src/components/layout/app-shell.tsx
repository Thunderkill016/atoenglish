import type { ReactNode } from "react";

import { BottomNav } from "@/components/layout/bottom-nav";
import { IconRail } from "@/components/layout/icon-rail";

/**
 * T-shell — shared app chrome for the `(main)` route group (REDESIGN §4.3):
 * fixed 56px IconRail on desktop, fixed BottomNav on mobile, and a centred
 * content column capped at ~1280px. There is deliberately no top header —
 * primary actions live inside each page's content.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <IconRail />
      {/* md:pl-14 clears the fixed 56px rail; pb-24 clears the fixed bottom
          nav (incl. safe-area) on mobile. */}
      <div className="flex min-h-dvh flex-col md:pl-14">
        <main
          id="main-content"
          className="mx-auto w-full max-w-[1600px] flex-1 px-4 pb-24 pt-5 md:pb-10"
        >
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
