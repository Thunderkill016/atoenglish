import type { Metadata } from "next";
import { Suspense } from "react";
import HardWordsClient from "./HardWordsClient";

export const metadata: Metadata = {
  title: "Từ Khó Nhất | AtoEnglish",
  description:
    "Xem 20 từ vựng bạn quên nhiều nhất và luyện tập để cải thiện trí nhớ.",
  robots: { index: false },
};

export default function HardWordsPage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="mx-auto max-w-2xl px-4 py-8 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-zinc-100 dark:bg-white/4 border border-zinc-200/60 dark:border-white/8 animate-pulse"
              />
            ))}
          </div>
        }
      >
        <HardWordsClient />
      </Suspense>
    </>
  );
}
