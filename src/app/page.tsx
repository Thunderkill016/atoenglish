import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Sparkles, Sprout } from "lucide-react";

import { Spotlight } from "@/components/ui/spotlight";
import { SITE_URL } from "@/lib/site";
import NavbarAuth from "@/components/landing/NavbarAuth";
import { MobileMenuButton, MobileMenu } from "@/components/landing/MobileMenu";
import HeroCTA from "@/components/landing/HeroCTA";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import ScienceSection from "@/components/landing/ScienceSection";

// Lazy load heavy client components below the fold
const ProductPreview = dynamic(
  () => import("@/components/landing/ProductPreview"),
  {
    loading: () => (
      <div className="w-full max-w-4xl mx-auto mt-12 sm:mt-16 h-[400px] rounded-[2rem] border border-border/60 bg-card/50 animate-pulse" />
    ),
  },
);

const FaqSection = dynamic(() => import("@/components/landing/FaqSection"));

const TestimonialsSection = dynamic(
  () => import("@/components/landing/TestimonialsSection"),
);

const FinalCtaSection = dynamic(
  () => import("@/components/landing/FinalCtaSection"),
);

export const metadata: Metadata = {
  title: "AtoEnglish — Học tiếng Anh để nói được, không chỉ để biết",
  description:
    "Hành trình luyện nói 28 ngày cho người Việt mất gốc: mỗi ngày 10–15 phút để luyện giới thiệu bản thân và công việc bằng tiếng Anh.",
  openGraph: {
    title: "AtoEnglish — Học tiếng Anh để nói được",
    description:
      "Hành trình luyện nói 28 ngày, mỗi ngày 10–15 phút, dành cho người Việt bắt đầu từ mất gốc.",
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
      "Phương pháp khoa học giúp bạn tự tin giao tiếp thực tế từ con số 0.",
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: `${SITE_URL}`,
  },
};

export default function LandingPage() {
  const stats = [
    { value: "28 ngày", label: "Một mục tiêu nói thực tế" },
    { value: "10–15 phút", label: "Mỗi ngày" },
    { value: "A0", label: "Bắt đầu từ mất gốc" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}`,
        name: "AtoEnglish",
        description:
          "Hành trình luyện nói 28 ngày cho người Việt mất gốc, mỗi ngày 10–15 phút",
        inLanguage: "vi",
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/learn?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "EducationalOrganization",
        "@id": `${SITE_URL}/#organization`,
        name: "AtoEnglish",
        url: `${SITE_URL}`,
        logo: `${SITE_URL}/icon-512.png`,
        description:
          "Luyện nhiệm vụ nói công việc đầu tiên trong hành trình 28 ngày",
        sameAs: [],
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "Người mất gốc hoặc mới bắt đầu từ con số 0 có học được không?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Có. Hành trình đầu tiên bắt đầu từ A0 và tập trung vào một nhiệm vụ thực tế: giới thiệu bản thân, công việc và biết xin người đối diện nhắc lại hoặc nói chậm hơn.",
            },
          },
          {
            "@type": "Question",
            name: "Mỗi ngày tôi cần học bao lâu?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Mục tiêu là 10–15 phút mỗi ngày trong 28 ngày. Mỗi buổi tập trung vào một bước nhỏ: nghe mẫu, luyện cụm từ, nói có hướng dẫn và ôn lại nội dung cần nhớ.",
            },
          },
          {
            "@type": "Question",
            name: "AtoEnglish khác gì so với Duolingo hay Babbel?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "AtoEnglish tập trung vào giao tiếp thực tế cho người Việt — không gamification hời hợt. Bạn học theo phương pháp khoa học PPP kết hợp FSRS, thực hành nói Shadowing thực sự và roleplay tình huống. Nội dung được thiết kế sát nhu cầu của người học Việt Nam.",
            },
          },
          {
            "@type": "Question",
            name: "Tôi có phải cài đặt ứng dụng vào điện thoại không?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Không cần. AtoEnglish là một nền tảng Web-App hiện đại, chạy trực tiếp trên trình duyệt web của bạn. Giao diện được tối ưu hóa mượt mà cho cả điện thoại di động, máy tính bảng lẫn máy tính cá nhân. Chỉ cần mở trình duyệt, đăng nhập nhanh bằng Google là học được ngay.",
            },
          },
          {
            "@type": "Question",
            name: "Tôi có thể học thử trước khi tham gia chương trình 28 ngày không?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Có. Bạn có thể học thử bài đầu tiên trước khi quyết định tham gia. Điều kiện, lịch học và chi phí của chương trình 28 ngày sẽ được thông báo rõ trước khi mở tuyển.",
            },
          },
          {
            "@type": "Question",
            name: "Thuật toán Ôn tập ngắt quãng (FSRS) là gì?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "FSRS (Free Spaced Repetition Scheduler) là thuật toán khoa học ghi nhớ tiên tiến bậc nhất hiện nay. FSRS đo lường mức độ ghi nhớ của bạn và tự động lên lịch nhắc nhở ôn tập vào đúng thời điểm vàng ngay trước khi bạn chuẩn bị quên. Nhờ đó, bạn ghi nhớ từ vựng lâu hơn đáng kể so với cách học vẹt truyền thống.",
            },
          },
          {
            "@type": "Question",
            name: "Dữ liệu và tiến độ học của tôi có được bảo mật không?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Hoàn toàn bảo mật. AtoEnglish sử dụng Neon Postgres với Row Level Security (RLS) — dữ liệu của bạn chỉ có thể được truy cập bởi chính bạn. Đăng nhập qua Google OAuth 2.0 được mã hóa an toàn. Chúng tôi không bán hay chia sẻ dữ liệu cá nhân với bên thứ ba.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-foreground font-sans selection:bg-primary/10 selection:text-primary overflow-x-hidden antialiased">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ===== Navigation Bar ===== */}
      <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-md border-b border-border/40 transition-colors duration-300">
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-primary/10 group-hover:scale-105 transition-transform duration-200">
              <Sprout className="size-4.5" />
            </span>
            <div className="flex flex-col leading-none text-left">
              <span className="text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-200">
                AtoEnglish
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Grow every day
              </span>
            </div>
          </Link>

          {/* Middle links - desktop only */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Cách học
            </a>
            <a
              href="#science"
              className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Phương pháp
            </a>
            <a
              href="#faq"
              className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Hỏi đáp
            </a>
          </div>

          <div className="flex items-center gap-2">
            <NavbarAuth />
            {/* Hamburger button - mobile only */}
            <MobileMenuButton />
          </div>
        </div>

        {/* Mobile drawer menu */}
        <MobileMenu />
      </nav>

      <main id="main-content">
        {/* ===== Hero Section ===== */}
        <section className="relative px-5 sm:px-8 pt-20 pb-16 sm:pt-32 sm:pb-24 lg:pt-36 lg:pb-28 overflow-hidden">
          {/* Spotlight light beam — hidden on mobile to save GPU paint cost */}
          <div className="hidden sm:block">
            <Spotlight
              className="-top-40 left-0 md:left-60 md:-top-20"
              fill="rgb(16 185 129 / 0.15)"
            />
          </div>

          {/* Mesh gradient backdrops — hidden on mobile to save GPU */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="hidden sm:block absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/8 blur-[120px]" />
            <div className="hidden sm:block absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/8 blur-[150px]" />
            <div className="hidden md:block absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px]" />
          </div>

          <div className="relative max-w-4xl mx-auto flex flex-col items-center text-center">
            <div className="space-y-6 sm:space-y-8">
              {/* Badge */}
              <div className="animate-fade-in-up">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 backdrop-blur-sm border border-primary/20 px-4 py-1.5 rounded-full uppercase tracking-[0.12em] shadow-sm">
                  <Sparkles className="size-3 text-primary animate-pulse" />
                  Thử nghiệm hành trình nói 28 ngày
                </span>
              </div>

              {/* Headline */}
              <h1 className="animate-fade-in-up animation-delay-75 flex flex-col items-center gap-y-2 sm:gap-y-3 text-xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground max-w-4xl mx-auto px-4">
                <span className="block lg:whitespace-nowrap">
                  Học tiếng Anh để{" "}
                  <span className="bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent">
                    nói được
                  </span>
                </span>
                <span className="block lg:whitespace-nowrap">
                  không chỉ để biết.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="animate-fade-in-up animation-delay-150 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
                Giới thiệu bản thân và công việc bằng tiếng Anh.
                <br className="hidden sm:block" />
                Mỗi ngày 10–15 phút: nghe mẫu, luyện cụm từ và nói có hướng dẫn.
              </p>

              <HeroCTA />
            </div>
          </div>

          {/* Product Preview Mockup */}
          <ProductPreview />

          {/* Stats bar */}
          <div className="animate-fade-in-up animation-delay-300 relative max-w-3xl mx-auto mt-16 sm:mt-24">
            <div className="p-6 sm:p-8 rounded-2xl bg-card/50 backdrop-blur-md border border-border/50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center flex-1 w-full pt-4 sm:pt-0 sm:px-6 first:pt-0"
                >
                  <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-xs sm:text-xs text-muted-foreground font-semibold mt-1.5 uppercase tracking-wider text-center">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
            {/* Footnote */}
            <p className="text-xs text-muted-foreground mt-5 text-center font-normal tracking-wide">
              * AtoEnglish đang thử nghiệm hành trình đầu tiên. Đây là mục tiêu
              học tập, không phải cam kết kết quả cho mọi người.
            </p>
          </div>
        </section>

        <div className="[content-visibility:auto] [contain-intrinsic-size:auto_600px]">
          <ProblemSection />
        </div>
        <div className="[content-visibility:auto] [contain-intrinsic-size:auto_800px]">
          <HowItWorksSection />
        </div>
        <div className="[content-visibility:auto] [contain-intrinsic-size:auto_600px]">
          <BenefitsSection />
        </div>
        <div className="[content-visibility:auto] [contain-intrinsic-size:auto_700px]">
          <ScienceSection />
        </div>

        {/* Below-fold lazy sections — browser can defer rendering */}
        <div className="[content-visibility:auto] [contain-intrinsic-size:auto_800px]">
          <TestimonialsSection />
          <FaqSection />
          <FinalCtaSection />
        </div>
      </main>

      {/* ===== Footer ===== */}
      <footer className="border-t border-border/40 py-10 sm:py-12 px-5 sm:px-8 bg-card/20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
              <Sprout className="size-4.5" />
            </span>
            <div className="flex flex-col leading-none text-left">
              <span className="text-sm font-bold tracking-tight text-foreground">
                AtoEnglish
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Grow every day
              </span>
            </div>
          </div>

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
