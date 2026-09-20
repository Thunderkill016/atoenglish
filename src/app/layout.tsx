import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

import "./globals.css";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
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
  metadataBase: new URL("https://atoenglish.vercel.app"),
  title: {
    default: "AtoEnglish — Học tiếng Anh để nói được",
    template: "%s | AtoEnglish",
  },
  description:
    "Luyện tiếng Anh thực dụng cho người Việt với các bài học tập trung vào khả năng sử dụng tiếng Anh trong tình huống thực tế.",
  keywords: [
    "học tiếng Anh",
    "luyện nói tiếng Anh",
    "FSRS",
    "spaced repetition",
    "CEFR",
    "tiếng Anh cho người mất gốc",
    "tiếng Anh giao tiếp",
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
    url: "https://atoenglish.vercel.app",
    siteName: "AtoEnglish",
    title: "AtoEnglish — Học tiếng Anh để nói được, không chỉ để biết",
    description:
      "Luyện tiếng Anh thực dụng cho người Việt, tập trung vào khả năng sử dụng tiếng Anh trong tình huống thực tế.",
    images: [
      {
        url: "https://atoenglish.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "AtoEnglish — Học tiếng Anh để nói được",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AtoEnglish — Học tiếng Anh để nói được",
    description:
      "Luyện tiếng Anh thực dụng cho người Việt, tập trung vào khả năng sử dụng trong tình huống thực tế.",
    creator: "@atoenglish",
    images: ["https://atoenglish.vercel.app/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : null;

  return (
    <html lang="vi" suppressHydrationWarning className={cn("font-sans", sansFont.variable)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {supabaseOrigin && (
          <>
            <link rel="preconnect" href={supabaseOrigin} />
            <link rel="dns-prefetch" href={supabaseOrigin} />
          </>
        )}
      </head>
      <body className="min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-emerald-600 focus:text-white focus:font-bold focus:text-sm focus:shadow-lg"
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
          {children}
          <Toaster richColors position="top-center" closeButton />
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
