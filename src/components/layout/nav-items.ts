import { BookOpen, Compass, Library, RefreshCw, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Shared main-nav entries for the masthead text nav and mobile `BottomNav`.
 * Routes beyond /discover land in later slices — the nav shape is fixed now
 * so the shell never changes again.
 */
export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { href: "/discover", label: "Khám phá", icon: Compass },
  { href: "/read", label: "Đọc", icon: BookOpen },
  { href: "/review", label: "Ôn", icon: RefreshCw },
  { href: "/library", label: "Thư viện", icon: Library },
  { href: "/me", label: "Tôi", icon: User },
];

/** Exact match or a nested route under the item (e.g. /library/words). */
export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
