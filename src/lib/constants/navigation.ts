import {
  BookOpen,
  LayoutDashboard,
  Layers,
  Map,
  TrendingUp,
  Mic,
  PenLine,
  User,
  Settings,
  Play,
  Zap,
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
  { id: "dash-today", label: "Hôm nay", icon: Zap },
  { id: "dash-practice", label: "Luyện tập", icon: Layers },
  { id: "dash-progress", label: "Tiến độ", icon: TrendingUp },
];

// ─── Tier 1 — Bottom Nav (mobile) — 3-tab Hick-compliant shell (P1) ────────
// Học (home + continue) · Ôn (SRS) · Tôi (settings/profile)
export const bottomNavItems: NavItem[] = [
  {
    title: "Học",
    href: "/dashboard",
    icon: BookOpen,
    description: "Tiếp tục bài học",
  },
  {
    title: "Ôn",
    href: "/flashcards",
    icon: Layers,
    description: "Ôn tập flashcard SRS",
  },
  {
    title: "Tôi",
    href: "/me",
    icon: User,
    description: "Tiến độ, luyện tập & cài đặt",
  },
];

// ─── Tier 2 — Desktop Primary Nav — matches 3-tab shell ─────────────────────
export const desktopPrimaryNav: NavItem[] = [
  {
    title: "Học",
    href: "/dashboard",
    icon: BookOpen,
    description: "Tiếp tục bài học",
  },
  {
    title: "Ôn",
    href: "/flashcards",
    icon: Layers,
    description: "Ôn tập flashcard SRS",
  },
  {
    title: "Tôi",
    href: "/me",
    icon: User,
    description: "Tiến độ, luyện tập & cài đặt",
  },
];

/** @deprecated V2 — links live on /me hub; kept for command palette / legacy */
export const desktopMoreItems: NavItem[] = [
  {
    title: "Bài học",
    href: "/learn",
    icon: BookOpen,
    description: "Danh sách 50 unit",
  },
  {
    title: "Luyện nói",
    href: "/speaking",
    icon: Mic,
    description: "Shadowing & AI Roleplay",
  },
  {
    title: "Viết",
    href: "/writing",
    icon: PenLine,
    description: "Viết & cải thiện với AI",
  },
  {
    title: "Tiến độ",
    href: "/progress",
    icon: TrendingUp,
    description: "Theo dõi quá trình học",
  },
  {
    title: "Lộ trình",
    href: "/roadmap",
    icon: Map,
    description: "Lộ trình A0 → C1",
  },
];

// ─── Mobile slide panel (grouped drawer) ─────────────────────────────────────
export const mobilePanelGroups: NavGroup[] = [
  {
    label: "HỌC TẬP",
    items: [
      { title: "Trang chủ", href: "/dashboard", icon: LayoutDashboard, description: "Tổng quan hôm nay" },
      { title: "Bài học", href: "/learn", icon: BookOpen, description: "IPOR lessons" },
      { title: "Luyện nói", href: "/speaking", icon: Mic, description: "Shadowing & AI" },
      { title: "Viết văn", href: "/writing", icon: PenLine, description: "AI feedback" },
      { title: "Ôn tập", href: "/flashcards", icon: Layers, description: "Flashcard SRS" },
    ],
  },
  {
    label: "THEO DÕI",
    items: [
      { title: "Tiến độ", href: "/progress", icon: TrendingUp, description: "Quá trình học" },
      { title: "Lộ trình", href: "/roadmap", icon: Map, description: "A0 → C1" },
    ],
  },
  {
    label: "KHÁC",
    items: [
      { title: "Cài đặt", href: "/settings", icon: Settings, description: "Tài khoản" },
    ],
  },
];

/** Secondary shortcuts at bottom of dashboard (explore, not daily loop) */
export function getDashboardExploreActions(unitRoute: string): NavItem[] {
  return [
    {
      title: "Học 10 phút",
      href: unitRoute,
      icon: Play,
      description: "Tiếp tục bài đang học",
    },
    {
      title: "Viết & Cải thiện",
      href: "/writing",
      icon: PenLine,
      description: "AI writing feedback",
    },
    {
      title: "Phát âm IPA",
      href: "/pronunciation",
      icon: Mic,
      description: "IPA drills",
    },
  ];
}

// ─── Legacy export — backward compat for components importing mainNavItems ────
export const mainNavItems: NavItem[] = [
  ...desktopPrimaryNav,
  ...desktopMoreItems,
];