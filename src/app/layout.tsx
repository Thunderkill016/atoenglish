import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { MotionProvider } from "@/components/providers/motion-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { SITE_URL } from "@/lib/site";

import "./globals.css";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jakarta",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AtoEnglish — Luyện IELTS từ nền tảng",
    template: "%s | AtoEnglish",
  },
  description:
    "Lộ trình IELTS 0→9.0 cho người Việt: nền tảng tiếng Anh trước, format đề sau — mỗi giai đoạn đo được theo band descriptors chính thức.",
  keywords: [
    "luyện IELTS",
    "IELTS cho người mất gốc",
    "học IELTS từ đầu",
    "học tiếng Anh",
    "FSRS",
    "spaced repetition",
    "CEFR",
    "band descriptors",
    "AtoEnglish",
  ],
  authors: [{ name: "AtoEnglish Team" }],
  creator: "AtoEnglish",
  publisher: "AtoEnglish",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: SITE_URL,
    siteName: "AtoEnglish",
    title: "AtoEnglish — Luyện IELTS từ nền tảng, cho người Việt",
    description:
      "Lộ trình IELTS 0→9.0: nền tảng trước, format đề sau — tiến bộ đo bằng bằng chứng, không bằng lời hứa.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "AtoEnglish — Luyện IELTS từ nền tảng",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AtoEnglish — Luyện IELTS từ nền tảng",
    description:
      "4 giai đoạn từ A0 đến band mục tiêu — mỗi bước đo được, không hứa ảo.",
    creator: "@atoenglish",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dataApiUrl = process.env.NEXT_PUBLIC_NEON_DATA_API_URL;
  const dataApiOrigin = dataApiUrl ? new URL(dataApiUrl).origin : null;

  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={cn("font-sans", sansFont.variable)}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {dataApiOrigin && (
          <>
            <link rel="preconnect" href={dataApiOrigin} />
            <link rel="dns-prefetch" href={dataApiOrigin} />
          </>
        )}
      </head>
      <body className="min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-white focus:font-bold focus:text-sm focus:shadow-lg"
        >
          Chuyển đến nội dung chính
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="ato-ui-white"
          disableTransitionOnChange
        >
          <MotionProvider>
            {children}
            <Toaster richColors position="top-center" closeButton />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
