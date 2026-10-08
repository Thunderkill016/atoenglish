import { House, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Shared main-nav entries for the desktop `IconRail` and mobile `BottomNav`.
 * Only real, reachable routes appear here — surfaces that do not exist yet
 * get an entry when their page ships, not before.
 */
export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { href: "/discover", label: "Khám phá", icon: House },
  { href: "/me", label: "Tôi", icon: User },
];

/** Exact match or a nested route under the item (e.g. /library/words). */
export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
