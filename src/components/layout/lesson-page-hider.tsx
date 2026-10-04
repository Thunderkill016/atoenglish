"use client";
import { usePathname } from "next/navigation";

import { isSessionPath } from "@/lib/constants/navigation";

export function LessonPageHider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Hide header/bottom-nav for the whole session-runner boundary
  // (unit lessons, trial checkpoint, placement attempt).
  if (isSessionPath(pathname)) return null;
  return <>{children}</>;
}
