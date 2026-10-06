import type { Metadata } from "next";
import Link from "next/link";

import { SITE_URL } from "@/lib/site";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    absolute: "AtoEnglish — Học tiếng Anh qua video bạn tự chọn",
  },
  description:
    "Xem video YouTube với phụ đề song ngữ, tra từ trong ngữ cảnh, lưu và ôn lại — miễn phí, cho người Việt tự học.",
  openGraph: {
    title: "AtoEnglish — Học tiếng Anh qua video",
    description:
      "Biến video YouTube bạn thích thành bài học: phụ đề song ngữ từng câu, tra từ tức thì, ôn tập thông minh.",
    url: `${SITE_URL}`,
    siteName: "AtoEnglish",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "AtoEnglish — Học tiếng Anh qua video",
      },
    ],
  },
};

const STEPS = [
  {
    title: "Chọn video bạn thích",
    body: "Dán link YouTube hoặc chọn từ thư viện. Phụ đề song ngữ theo từng câu, không phải từng dòng lộn xộn.",
  },
  {
    title: "Tra từ ngay trong câu",
    body: "Bấm vào từ bất kỳ để xem nghĩa theo ngữ cảnh. Lưu từ hoặc cả câu kèm đúng đoạn video gốc.",
  },
  {
    title: "Luyện lại trên chính video đó",
    body: "Nghe chép chính tả, nói theo, ôn lại bằng lặp lại ngắt quãng — đến hẹn đúng lúc bạn sắp quên.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-5">
        <span className="text-lg font-extrabold tracking-tight">
          AtoEnglish
        </span>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/discover"
            className="text-muted-foreground hover:text-foreground"
          >
            Khám phá
          </Link>
          <Link href="/login" className={cn(buttonVariants({ size: "sm" }))}>
            Đăng nhập
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-16">
        <section className="max-w-2xl space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Học tiếng Anh qua video{" "}
            <span className="text-primary">bạn tự chọn</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Không giáo trình ép buộc. Xem video YouTube với phụ đề song ngữ, tra
            từ trong ngữ cảnh, lưu lại và ôn tập — miễn phí, cho người Việt tự
            học.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/discover"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Bắt đầu xem
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Đăng nhập
            </Link>
          </div>
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="rounded-xl border bg-card p-5 space-y-2"
            >
              <p className="text-sm font-semibold text-primary">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="font-semibold">{step.title}</h2>
              <p className="text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-6 text-sm text-muted-foreground">
        <span>© 2026 AtoEnglish</span>
        <nav className="flex gap-4">
          <Link href="/privacy" className="hover:text-foreground">
            Bảo mật
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Điều khoản
          </Link>
        </nav>
      </footer>
    </div>
  );
}
