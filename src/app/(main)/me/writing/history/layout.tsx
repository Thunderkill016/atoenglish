import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lịch Sử Bài Viết | AtoEnglish",
  description:
    "Xem lại các câu đã luyện viết và phân tích lỗi sai để cải thiện kỹ năng tiếng Anh mỗi ngày.",
};

export default function WritingHistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
