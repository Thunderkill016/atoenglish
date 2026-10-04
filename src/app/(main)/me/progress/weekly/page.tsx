import type { Metadata } from "next";
import { Suspense } from "react";
import { getWeeklyReport } from "@/app/actions/weekly-summary";
import WeeklyReportClient from "./WeeklyReportClient";

export const metadata: Metadata = {
  title: "Báo Cáo Tuần | AtoEnglish",
  description:
    "Xem tổng kết học tập 7 ngày qua — bài học, thẻ từ, ngày học và so sánh với tuần trước.",
  robots: { index: false },
};

export default async function WeeklyReportPage() {
  const report = await getWeeklyReport();

  return (
    <>
      <Suspense
        fallback={
          <div className="mx-auto max-w-2xl px-4 py-8 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-zinc-100 dark:bg-white/4 border border-zinc-200/60 dark:border-white/8 animate-pulse"
              />
            ))}
          </div>
        }
      >
        <WeeklyReportClient report={report} />
      </Suspense>
    </>
  );
}
