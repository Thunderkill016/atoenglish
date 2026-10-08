import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

/**
 * Routes inside the app shell (icon rail / bottom nav). `/`, `/login`,
 * `/watch` and the api/auth routes stay outside — flat and untouched.
 */
export default function MainLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
