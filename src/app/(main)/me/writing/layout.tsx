import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luyện Viết với AI | AtoEnglish",
  description:
    "Viết câu tiếng Anh và nhận phản hồi chi tiết từ AI. Cải thiện ngữ pháp, từ vựng và phong cách viết mỗi ngày.",
};

export default function WritingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
