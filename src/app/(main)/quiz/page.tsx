import { Suspense } from "react";
import type { Metadata } from "next";
import VocabQuizClient from "./VocabQuizClient";

export const metadata: Metadata = {
  title: "Quiz Từ Vựng | AtoEnglish",
  description:
    "Kiểm tra từ vựng tiếng Anh theo unit với bài quiz trắc nghiệm. Chọn nghĩa đúng và xem kết quả ngay.",
  robots: { index: false },
};

export default function QuizPage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <VocabQuizClient />
      </Suspense>
    </>
  );
}
