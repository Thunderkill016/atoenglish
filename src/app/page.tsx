import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpenCheck,
  Brain,
  Ear,
  MessageSquareText,
  RefreshCcw,
  Sprout,
  X,
} from "lucide-react";

import { SITE_URL } from "@/lib/site";
import ScrollReveal from "@/components/ui/scroll-reveal";
import HeroLessonCard from "@/components/landing/HeroLessonCard";
import SpeakingDemo from "@/components/landing/SpeakingDemo";
import LandingCtas from "@/components/landing/LandingCtas";

export const metadata: Metadata = {
  title: {
    absolute: "AtoEnglish — Học tiếng Anh để nói được, không chỉ để biết",
  },
  description:
    "Hành trình luyện nói 28 ngày cho người Việt mất gốc: mỗi ngày 10–15 phút để nói được một điều cụ thể, đo được bằng CEFR — không hứa điều không đo được.",
  openGraph: {
    title: "AtoEnglish — Học tiếng Anh để nói được",
    description:
      "28 ngày, mỗi ngày 10–15 phút, cho người Việt bắt đầu từ mất gốc. Biết trước chính xác bạn sẽ nói được gì.",
    url: `${SITE_URL}`,
    siteName: "AtoEnglish",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "AtoEnglish — Học tiếng Anh để nói được, không chỉ để biết",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AtoEnglish — Học tiếng Anh để nói được",
    description:
      "28 ngày, 10–15 phút mỗi ngày — và một kết quả nói đo được theo CEFR.",
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: `${SITE_URL}`,
  },
};

const RECEIPT_ITEMS = [
  {
    title: "Giới thiệu bản thân 30–45 giây",
    body: "Tên, nghề nghiệp, công việc hàng ngày — nói trơn tru, không đọc.",
  },
  {
    title: "Đánh vần & thông tin cá nhân",
    body: "Tên và các thông tin cá nhân cơ bản — nghe hỏi là đáp.",
  },
  {
    title: "Trả lời 5 câu hỏi quen thuộc",
    body: "Những câu người ta thật sự hỏi bạn trong lần đầu gặp.",
  },
  {
    title: "Tự sửa khi nói sai",
    body: "Nhóm cụm repair (“ý tôi là…”, “xin lỗi, nói lại…”) để không bị đơ.",
  },
] as const;

const IPOR_STEPS = [
  {
    no: "01",
    icon: Ear,
    phase: "text-phase-input",
    title: "Input — Nghe & đọc",
    body: "Nội dung vừa đủ khó, bản xứ nói thật, giải thích bằng tiếng Việt.",
  },
  {
    no: "02",
    icon: Brain,
    phase: "text-phase-processing",
    title: "Processing — Hiểu cấu trúc",
    body: "Bóc tách mẫu câu trước khi nói — không học vẹt từng câu lẻ.",
  },
  {
    no: "03",
    icon: MessageSquareText,
    phase: "text-phase-output",
    title: "Output — Nói & viết",
    body: "Nói có chấm điểm, viết có sửa — bằng chứng, không phải tự báo cáo.",
  },
  {
    no: "04",
    icon: RefreshCcw,
    phase: "text-phase-review",
    title: "Review — Ôn đúng lúc",
    body: "FSRS nhắc ôn đúng ngày bạn sắp quên — không ôn dàn trải.",
  },
] as const;

const FAQ_ITEMS = [
  {
    q: "Mất gốc hoàn toàn có học được không?",
    a: "Được — đó là đúng người AtoEnglish thiết kế cho. Bạn bắt đầu từ A0: giải thích bằng tiếng Việt, từng câu nhỏ, và bài đầu tiên không cần đăng nhập.",
  },
  {
    q: "10–15 phút mỗi ngày có đủ không?",
    a: "Đủ cho mục tiêu của chương trình — vì mục tiêu được định nghĩa trước và đo được. 28 ngày không biến bạn thành người bản xứ; nó cho bạn một kết quả cụ thể: giới thiệu bản thân trôi chảy và xử lý được những câu hỏi đầu tiên.",
  },
  {
    q: "Khác gì Duolingo hay ELSA?",
    a: "Hai điều: mọi thứ được giải thích bằng tiếng Việt từ ngày đầu, và tiến độ của bạn được đo bằng kỹ năng CEFR — không phải điểm hay chuỗi ngày.",
  },
  {
    q: "Có miễn phí không?",
    a: "Bài đầu tiên mở cho khách — học thử ngay, không cần tài khoản. Các phần học công khai khác (/learn, /review, /read) cũng mở để bạn xem trước khi quyết định.",
  },
] as const;

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AtoEnglish",
    url: SITE_URL,
    inLanguage: "vi",
  };

  return (
    <div className="min-h-screen bg-white text-foreground font-sans selection:bg-primary/10 selection:text-primary overflow-x-clip antialiased">
      <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-primary/10">
              <Sprout className="size-4.5" />
            </span>
            <span className="text-sm font-bold tracking-tight">AtoEnglish</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/learn"
              prefetch={false}
              className="hidden text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Xem bài học
            </Link>
            <Link
              href="/login"
              prefetch={false}
              className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-bold text-white shadow-sm shadow-primary/20 transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </nav>

      <main id="main-content">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.94_0.05_160/0.5),transparent_70%)]" />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <div className="text-center lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-bold tracking-wide text-primary">
                <Sprout className="size-3.5" />
                Học tiếng Anh để nói được — cho người Việt
              </p>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]">
                28 ngày, 10–15 phút mỗi ngày —{" "}
                <span className="text-primary">và một mục tiêu nói thật.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
                Không hứa nói như bản xứ. Chỉ hứa điều đo được: sau 28 ngày,
                bạn tự giới thiệu bản thân và công việc bằng tiếng Anh trong
                30–45 giây — và mỗi bước đều có bằng chứng CEFR.
              </p>
              <div className="mt-8">
                <LandingCtas source="landing_hero" />
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                {[
                  "🗓 28 ngày · một mục tiêu",
                  "⏱ 10–15 phút/ngày",
                  "🌱 Bắt đầu từ A0",
                  "🇻🇳 Giải thích bằng tiếng Việt",
                ].map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-border/60 bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>
            <div className="px-2 sm:px-8 lg:px-0">
              <HeroLessonCard />
            </div>
          </div>
        </section>

        {/* ── Receipt: what 28 days actually buys ── */}
        <section id="receipt" className="scroll-mt-20 border-t border-border/40 bg-[#f5f5f7]">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
            <ScrollReveal>
              <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Bạn nhận được gì — nói thẳng
              </p>
              <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
                28 ngày nói được gì?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
                Đây là toàn bộ cam kết — không ẩn điều kiện, không dấu sao nhỏ.
              </p>
            </ScrollReveal>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {RECEIPT_ITEMS.map((item, i) => (
                <ScrollReveal key={item.title} delayMs={i * 90}>
                  <div className="flex h-full flex-col rounded-2xl border border-border/60 bg-card p-5">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <BookOpenCheck className="size-4.5" />
                    </span>
                    <h3 className="mt-4 text-sm font-bold leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal delayMs={120}>
              <div className="mx-auto mt-6 flex max-w-3xl items-start gap-3 rounded-2xl border border-dashed border-border bg-card/60 p-5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <X className="size-4" />
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <span className="font-bold text-foreground">
                    Và điều 28 ngày không làm được:
                  </span>{" "}
                  biến bạn thành người bản xứ, giúp bạn tranh luận, hay “thông
                  tiếng Anh trong 1 tháng”. Ai hứa điều đó thì nên hỏi họ đo
                  bằng gì.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Method: IPOR ── */}
        <section className="border-t border-border/40">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
            <ScrollReveal>
              <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Phương pháp
              </p>
              <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
                Mỗi buổi học chạy một vòng lặp
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
                IPOR — Input → Processing → Output → Review. Bốn bước, mỗi bước
                để lại bằng chứng học được đo.
              </p>
            </ScrollReveal>
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {IPOR_STEPS.map((step, i) => (
                <ScrollReveal key={step.no} delayMs={i * 80}>
                  <div className="flex h-full gap-4 rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-xs font-black tracking-widest text-muted-foreground/60">
                        {step.no}
                      </span>
                      <span className="flex size-10 items-center justify-center rounded-xl bg-muted/60">
                        <step.icon className={`size-5 ${step.phase}`} />
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold">{step.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Speaking proof ── */}
        <section className="border-t border-border/40 bg-[#f5f5f7]">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2">
            <ScrollReveal>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Luyện nói có chấm
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Nói rồi được nghe lại — không phải tự đánh giá
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Bạn nghe mẫu, nhắc lại, và nhận phản hồi cụ thể: độ chính xác
                từng từ và mẹo phát âm dành riêng cho người Việt. Chấm tự động
                chưa hoàn hảo — chúng tôi ghi rõ điều đó ngay trong sản phẩm
                thay vì cho bạn một con điểm ảo.
              </p>
            </ScrollReveal>
            <ScrollReveal delayMs={120}>
              <SpeakingDemo />
            </ScrollReveal>
          </div>
        </section>

        {/* ── Honest progress ── */}
        <section className="border-t border-border/40">
          <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 sm:py-24">
            <ScrollReveal>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Chuỗi ngày chứng nhận bạn quay lại.{" "}
                <span className="text-primary">
                  CEFR chứng nhận bạn tiến bộ.
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                AtoEnglish đo tiến độ bằng kỹ năng: nghe hiểu, nói, đọc, viết —
                theo khung CEFR. Điểm số và streak có thể làm bạn vui; chỉ có
                bằng chứng kỹ năng mới chứng minh bạn học được.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="border-t border-border/40 bg-[#f5f5f7]">
          <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
            <ScrollReveal>
              <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
                Câu hỏi thường gặp
              </h2>
            </ScrollReveal>
            <div className="mt-10 flex flex-col gap-3">
              {FAQ_ITEMS.map((item, i) => (
                <ScrollReveal key={item.q} delayMs={i * 60}>
                  <details className="group rounded-2xl border border-border/60 bg-card px-5 py-4 open:border-primary/30">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-foreground [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <span
                        aria-hidden="true"
                        className="text-primary transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                  </details>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="border-t border-border/40">
          <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 sm:py-24">
            <ScrollReveal>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Sẵn sàng cho bài đầu tiên?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Không cần đăng nhập. Không cần thẻ. 10–15 phút — và bạn sẽ biết
                mình đang ở đâu.
              </p>
              <div className="mt-8">
                <LandingCtas source="landing_final_cta" />
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs font-normal text-muted-foreground">
            &copy; {new Date().getFullYear()} AtoEnglish. Bảo lưu mọi quyền.
          </span>
          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="text-xs font-normal text-muted-foreground transition-colors hover:text-foreground"
            >
              Bảo mật
            </Link>
            <Link
              href="/terms"
              className="text-xs font-normal text-muted-foreground transition-colors hover:text-foreground"
            >
              Điều khoản
            </Link>
            <Link
              href="mailto:support@atoenglish.com"
              className="text-xs font-normal text-muted-foreground transition-colors hover:text-foreground"
            >
              Hỗ trợ
            </Link>
          </div>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
