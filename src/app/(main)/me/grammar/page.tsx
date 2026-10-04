import type { Metadata } from "next";
import GrammarClient from "./GrammarClient";

export const metadata: Metadata = {
  title: "Ngữ Pháp | AtoEnglish",
  description:
    "Học ngữ pháp tiếng Anh A1–B2 với giải thích tiếng Việt, ví dụ thực tế, lỗi hay gặp và mẹo ghi nhớ dành cho người Việt.",
  robots: { index: false },
};

export default function GrammarPage() {
  return (
    <>
      <GrammarClient />
    </>
  );
}
