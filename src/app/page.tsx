import type { Metadata } from "next";
import Link from "next/link";
import { Sprout } from "lucide-react";

import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "AtoEnglish",
  description:
    "AtoEnglish — nền tảng học tiếng Anh cho người Việt. Trang chủ đang được cập nhật.",
  alternates: {
    canonical: `${SITE_URL}`,
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-foreground font-sans selection:bg-primary/10 selection:text-primary overflow-x-hidden antialiased flex flex-col">
      <nav className="w-full border-b border-border/40">
        <div className="max-w-6xl mx-auto h-16 flex items-center px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-primary/10">
              <Sprout className="size-4.5" />
            </span>
            <span className="text-sm font-bold tracking-tight text-foreground">
              AtoEnglish
            </span>
          </Link>
        </div>
      </nav>

      <main
        id="main-content"
        className="flex flex-1 flex-col items-center justify-center px-5 py-20 text-center"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          AtoEnglish
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground">
          Trang chủ đang được cập nhật.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-bold text-white shadow-md shadow-primary/20 transition-transform hover:scale-[1.02]"
        >
          Bắt đầu học
        </Link>
      </main>

      <footer className="border-t border-border/40 py-8 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground font-normal">
            &copy; {new Date().getFullYear()} AtoEnglish. Bảo lưu mọi quyền.
          </span>
          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-normal"
            >
              Bảo mật
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-normal"
            >
              Điều khoản
            </Link>
            <Link
              href="mailto:support@atoenglish.com"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-normal"
            >
              Hỗ trợ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
