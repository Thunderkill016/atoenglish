import {
  BookOpen,
  Layers,
  Map,
  TrendingUp,
  Mic,
  PenLine,
  User,
  Settings,
  BookMarked,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

/** In-dashboard section anchors (sticky hub nav on /dashboard) */
export type DashboardSection = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export const dashboardSections: DashboardSection[] = [
  { id: "dash-today", label: "Hôm nay", icon: BookOpen },
  { id: "dash-practice", label: "Luyện tập", icon: Layers },
  { id: "dash-progress", label: "Tiến độ", icon: TrendingUp },
];

/**
 * Session-runner boundaries where the shell hides all chrome (focus mode).
 * Covers unit lessons, the trial checkpoint and placement attempts.
 */
const SESSION_PATH_RE = /^(\/learn\/unit|\/checkpoint|\/placement)/;

export function isSessionPath(pathname: string): boolean {
  return SESSION_PATH_RE.test(pathname);
}

// ─── Tier 1 — 4-tab shell (redesign IA: HỌC / ÔN / LỘ TRÌNH / TÔI) ─────────
export const bottomNavItems: NavItem[] = [
  {
    title: "Học",
    href: "/learn",
    icon: BookOpen,
    description: "Hôm nay & danh sách bài học",
  },
  {
    title: "Ôn",
    href: "/review",
    icon: Layers,
    description: "Hàng ôn tập đến hạn",
  },
  {
    title: "Lộ trình",
    href: "/roadmap",
    icon: Map,
    description: "Lộ trình trình độ",
  },
  {
    title: "Tôi",
    href: "/me",
    icon: User,
    description: "Tiến độ, luyện tập & cài đặt",
  },
];

// ─── Tier 2 — Desktop Primary Nav — matches 4-tab shell ─────────────────────
export const desktopPrimaryNav: NavItem[] = bottomNavItems;

/** Secondary surfaces under TÔI — used by the command palette. */
export const desktopMoreItems: NavItem[] = [
  {
    title: "Bài tập nói",
    href: "/me/speaking",
    icon: Mic,
    description: "Shadowing & AI Roleplay",
  },
  {
    title: "Viết",
    href: "/me/writing",
    icon: PenLine,
    description: "Viết & cải thiện",
  },
  {
    title: "Ngữ pháp",
    href: "/me/grammar",
    icon: BookMarked,
    description: "Chủ đề grammar",
  },
  {
    title: "Phát âm IPA",
    href: "/me/pronunciation",
    icon: Mic,
    description: "44 âm IPA",
  },
  {
    title: "Quiz từ vựng",
    href: "/quiz",
    icon: HelpCircle,
    description: "Luyện quiz",
  },
  {
    title: "Tiến độ",
    href: "/me/progress",
    icon: TrendingUp,
    description: "Báo cáo học tập",
  },
  {
    title: "Cài đặt",
    href: "/me/settings",
    icon: Settings,
    description: "Tài khoản",
  },
];

/** Secondary shortcuts at bottom of dashboard (explore, not daily loop) */
export function getDashboardExploreActions(unitRoute: string): NavItem[] {
  return [
    {
      title: "Học 10 phút",
      href: unitRoute,
      icon: BookOpen,
      description: "Tiếp tục bài đang học",
    },
    {
      title: "Viết & Cải thiện",
      href: "/me/writing",
      icon: PenLine,
      description: "AI writing feedback",
    },
    {
      title: "Phát âm IPA",
      href: "/me/pronunciation",
      icon: Mic,
      description: "IPA drills",
    },
  ];
}
