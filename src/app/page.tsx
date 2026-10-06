import type { Metadata } from "next";
import Link from "next/link";
import { Captions, MousePointerClick, Repeat } from "lucide-react";

import { SITE_URL } from "@/lib/site";
import { YoutubeLinkInput } from "@/components/youtube-link-input";
import { VideoCard } from "@/components/video-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    absolute: "AtoEnglish — Học tiếng Anh qua video bạn tự chọn",
  },
  description:
    "Biến video YouTube bất kỳ thành bài học: phụ đề từng câu chạy theo video, lặp câu, dán phụ đề của bạn — miễn phí, cho người Việt tự học.",
  openGraph: {
    title: "AtoEnglish — Học tiếng Anh qua video",
    description:
      "Biến video YouTube bạn thích thành bài học: phụ đề từng câu chạy theo video, lặp câu, ôn tập từ vựng.",
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

const FEATURES = [
  {
    icon: Captions,
    title: "Phụ đề từng câu, chạy theo video",
    body: "Transcript được ghép thành câu hoàn chỉnh — không phải dòng chữ lộn xộn. Câu đang phát tự sáng và cuộn theo.",
  },
  {
    icon: MousePointerClick,
    title: "Bấm câu để tua, lặp câu để nghe kỹ",
    body: "Bấm vào câu bất kỳ để nhảy tới. Lặp một câu vô hạn, tự dừng hết câu, phím tắt điều khiển không rời tay.",
  },
  {
    icon: Repeat,
    title: "Phụ đề của bạn cũng được",
    body: "Video chặn hoặc không có phụ đề? Dán file SRT/VTT hay văn bản thường — mọi thứ vẫn hoạt động.",
  },
];

const SAMPLE_VIDEOS = [
  {
    id: "8jPQjjsBbIc",
    title: "How to stay calm when you know you'll be stressed",
    channel: "TED",
    note: "Phụ đề thủ công + tiếng Việt",
  },
  {
    id: "UF8uR6Z6KLc",
    title: "Steve Jobs' 2005 Stanford Commencement Address",
    channel: "Stanford",
    note: "Phụ đề thủ công",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Rick Astley — Never Gonna Give You Up",
    channel: "Rick Astley",
    note: "Phụ đề tự động",
  },
];

const FAQ = [
  {
    q: "Video nào cũng học được không?",
    a: "Video YouTube nào có phụ đề tiếng Anh (thủ công hoặc tự động) đều được. Với video bị chặn hoặc không có phụ đề, bạn dán file SRT/VTT hoặc văn bản vào là học tiếp được.",
  },
  {
    q: "Có cần tài khoản không?",
    a: "Xem và luyện không cần tài khoản. Đăng nhập chỉ để lưu tiến trình xem và bộ sưu tập của bạn qua các thiết bị.",
  },
  {
    q: "Thật sự miễn phí?",
    a: "Có. Không thẻ tín dụng, không bản Pro, không giới hạn số từ lưu.",
  },
  {
    q: "Dùng trên điện thoại được không?",
    a: "Được — trang web chạy trên trình duyệt di động, không cần cài app.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5">
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

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4">
        {/* Hero — the input works: paste a link and you land in /watch. */}
        <section className="flex flex-col items-center gap-6 py-14 text-center sm:py-20">
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Học tiếng Anh qua video{" "}
            <span className="text-primary">bạn tự chọn</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Dán link YouTube — phụ đề từng câu chạy theo video, bấm câu để tua,
            lặp câu để nghe kỹ.
          </p>
          <div className="w-full max-w-xl">
            <YoutubeLinkInput large />
          </div>
          <p className="text-sm text-muted-foreground">
            Miễn phí · Không cần tài khoản để thử ·{" "}
            <Link href="/discover" className="text-primary hover:underline">
              hoặc xem video gợi ý
            </Link>
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="space-y-2 rounded-xl border bg-card p-5"
            >
              <f.icon className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">{f.title}</h2>
              <p className="text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-14">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-bold">Thử một video mẫu</h2>
            <Link
              href="/discover"
              className="text-sm text-primary hover:underline"
            >
              Xem tất cả →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {SAMPLE_VIDEOS.map((v) => (
              <VideoCard
                key={v.id}
                videoId={v.id}
                title={v.title}
                channel={v.channel}
                note={v.note}
              />
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-xl border bg-card p-6">
          <h2 className="text-lg font-bold">Đang phát triển</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Phụ đề song ngữ Anh–Việt, tra từ ngay trong câu và ôn tập từ vựng
            đang được xây — bản dùng trước ưu tiên đúng việc hơn nhiều tính
            năng.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="mb-4 text-lg font-bold">Câu hỏi thường gặp</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-xl border bg-card p-5">
                <h3 className="font-semibold">{item.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 mb-8 flex flex-col items-center gap-4 rounded-xl bg-primary/10 px-6 py-10 text-center">
          <h2 className="text-2xl font-bold">Bắt đầu với video của bạn</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Một link YouTube là đủ — không cần đăng ký.
          </p>
          <Link href="/discover" className={cn(buttonVariants({ size: "lg" }))}>
            Mở AtoEnglish
          </Link>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6 text-sm text-muted-foreground">
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
