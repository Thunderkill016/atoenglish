import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";

import { SITE_URL } from "@/lib/site";
import NavbarAuth from "@/components/landing/NavbarAuth";
import { MobileMenuButton, MobileMenu } from "@/components/landing/MobileMenu";
import HeroCTA from "@/components/landing/HeroCTA";
import VoiceDemo from "@/components/landing/VoiceDemo";
import { Hand } from "@/components/landing/notebook";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import ScienceSection from "@/components/landing/ScienceSection";

// Lazy load heavy client components below the fold
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

/** Real curriculum units shown as the scrolling strip (DESIGN.md: unit-chip). */
const UNITS = [
  ["A0", "Bảng chữ cái & âm cơ bản"],
  ["A0", "Số đếm & hỏi giá"],
  ["A0", "Chào hỏi & xã giao"],
  ["A0", "Thông tin cá nhân"],
  ["A0", "Cụm từ sinh tồn"],
  ["A1", "Greetings & self-intro"],
  ["A1", "Family & friends"],
  ["A1", "Daily routines"],
  ["A1", "Food & ordering"],
  ["A1", "Places & directions"],
] as const;

export default function LandingPage() {
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
    <div className="nb-margin min-h-screen bg-nb-paper font-sans text-nb-ink antialiased overflow-x-clip selection:bg-nb-primary-tint selection:text-nb-ink">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ===== Navigation — ruled paper, dashed binding edge ===== */}
      <nav className="sticky top-0 z-50 w-full border-b-[1.5px] border-dashed border-nb-hairline bg-nb-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-[60px] max-w-[1020px] items-center justify-between px-5 sm:px-7">
          <Link href="/" className="group flex items-baseline gap-1">
            <span className="font-hand text-[30px] font-bold leading-none text-nb-ink transition-colors group-hover:text-nb-primary">
              Ato<span className="text-nb-annotation">E</span>nglish
            </span>
          </Link>

          {/* Middle links - desktop only */}
          <div className="hidden items-center gap-7 md:flex">
            <a
              href="#how-it-works"
              className="text-sm font-semibold text-nb-muted transition-colors hover:text-nb-ink"
            >
              Cách học
            </a>
            <a
              href="#science"
              className="text-sm font-semibold text-nb-muted transition-colors hover:text-nb-ink"
            >
              Phương pháp
            </a>
            <a
              href="#faq"
              className="text-sm font-semibold text-nb-muted transition-colors hover:text-nb-ink"
            >
              Hỏi đáp
            </a>
          </div>

          <div className="flex items-center gap-2">
            <NavbarAuth />
            <MobileMenuButton />
          </div>
        </div>

        <MobileMenu />
      </nav>

      <main id="main-content">
        {/* ===== Hero — ruled page, copy left + real lesson demo right ===== */}
        <section className="nb-ruled px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20">
          <div className="mx-auto grid max-w-[1020px] items-center gap-12 lg:grid-cols-2 lg:gap-14">
            <div>
              <Hand>✎ hành trình nói 28 ngày — đang thử nghiệm</Hand>
              <h1 className="mt-3 text-[38px] font-extrabold leading-[1.07] tracking-[-0.025em] text-nb-ink sm:text-[48px] lg:text-[54px]">
                Học tiếng Anh để <span className="nb-mark">nói được</span>,
                <br />
                không chỉ để biết.
              </h1>
              <p className="mt-5 max-w-[440px] text-[17px] leading-relaxed text-nb-muted sm:text-lg">
                Sổ luyện nói cho người Việt mất gốc: mỗi ngày 10–15 phút, một
                cuộc hội thoại thật — không cần tài khoản để thử.
              </p>
              <HeroCTA />
            </div>
            <div>
              <VoiceDemo />
            </div>
          </div>
        </section>

        {/* ===== Curriculum strip — real can-do units, marquee ===== */}
        <div className="overflow-hidden border-y-[1.5px] border-dashed border-nb-hairline bg-nb-paper-deep py-4">
          <div className="flex w-max gap-2.5 animate-nb-marquee motion-reduce:animate-none">
            {[...UNITS, ...UNITS].map(([level, title], i) => (
              <span
                key={i}
                className="whitespace-nowrap rounded-full border-[1.5px] border-nb-hairline bg-nb-surface px-4 py-2 text-[13px] font-semibold text-nb-muted"
              >
                <b className="font-extrabold text-nb-primary">{level}</b>
                {" · "}
                {title}
              </span>
            ))}
          </div>
        </div>

        <ProblemSection />
        <HowItWorksSection />
        <BenefitsSection />
        <ScienceSection />

        {/* Below-fold lazy sections */}
        <TestimonialsSection />
        <FaqSection />
        <FinalCtaSection />

        {/* Honest footnote — handwriting, says the quiet part out loud */}
        <p className="mx-auto max-w-[1020px] px-5 pb-4 pt-14 text-center font-hand text-[19px] text-nb-muted sm:px-8">
          * mục tiêu học tập, không phải cam kết kết quả cho mọi người — tụi
          mình nói thật.
        </p>
      </main>

      {/* ===== Footer — notebook edge ===== */}
      <footer className="mt-12 border-t-[1.5px] border-dashed border-nb-hairline py-8">
        <div className="mx-auto flex max-w-[1020px] flex-col items-center justify-between gap-4 px-5 text-[13px] text-nb-muted sm:flex-row sm:px-7">
          <span className="font-hand text-[24px] font-bold text-nb-ink">
            Ato<span className="text-nb-annotation">E</span>nglish
          </span>
          <span>© {new Date().getFullYear()} AtoEnglish</span>
          <span className="flex items-center gap-5">
            <Link href="/privacy" className="transition-colors hover:text-nb-ink">
              Bảo mật
            </Link>
            <Link href="/terms" className="transition-colors hover:text-nb-ink">
              Điều khoản
            </Link>
            <Link
              href="mailto:support@atoenglish.com"
              className="transition-colors hover:text-nb-ink"
            >
              Hỗ trợ
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
