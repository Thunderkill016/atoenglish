import { BookOpen, House, Library, RefreshCw, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Shared main-nav entries for the masthead text nav and mobile `BottomNav`.
 * Routes beyond /discover land in later slices and remain non-navigable
 * until their product surface exists.
 */
export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Planned surfaces remain visible but cannot navigate to missing routes. */
  available?: boolean;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { href: "/discover", label: "Khám phá", icon: House },
  { href: "/read", label: "Đọc", icon: BookOpen, available: false },
  { href: "/review", label: "Ôn", icon: RefreshCw, available: false },
  { href: "/library", label: "Thư viện", icon: Library, available: false },
  { href: "/me", label: "Tôi", icon: User },
];

/** Exact match or a nested route under the item (e.g. /library/words). */
export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
