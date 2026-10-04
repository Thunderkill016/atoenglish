import {
  BookOpen,
  Map,
  Mic,
  PenLine,
  Settings,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type MeHubItem = {
  href: string;
  label: string;
  description?: string;
  icon: LucideIcon;
};

export const meHubStudy: MeHubItem[] = [
  {
    href: "/me/progress",
    label: "Tiến độ",
    description: "Bài đã học và lịch ôn",
    icon: TrendingUp,
  },
  {
    href: "/roadmap",
    label: "Lộ trình",
    description: "Bốn giai đoạn theo CEFR",
    icon: Map,
  },
];

export const meHubPractice: MeHubItem[] = [
  {
    href: "/me/speaking",
    label: "Luyện nói",
    description: "Shadowing và nói theo mẫu",
    icon: Mic,
  },
  {
    href: "/me/writing",
    label: "Viết",
    description: "Bài viết có rubric và bằng chứng",
    icon: PenLine,
  },
];

export const meHubMore: MeHubItem[] = [
  {
    href: "/me/grammar",
    label: "Ngữ pháp",
    description: "Tra cứu chủ điểm",
    icon: BookOpen,
  },
  {
    href: "/me/pronunciation",
    label: "Phát âm IPA",
    description: "Nghe mẫu và tự luyện",
    icon: Mic,
  },
];

export const meHubAccount: MeHubItem[] = [
  {
    href: "/me/settings",
    label: "Cài đặt",
    description: "Học tập, ôn tập và giao diện",
    icon: Settings,
  },
];
