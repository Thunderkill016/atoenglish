import type { Metadata } from "next";
import PlacementTestClient from "./PlacementTestClient";

export const metadata: Metadata = {
  title: "Placement Test | AtoEnglish",
  description:
    "Bài test xếp loại CEFR chuẩn — 40 câu Grammar, Vocabulary, Reading. Xác định trình độ A1/A2/B1/B2 chính xác.",
  robots: { index: false },
};

export default function PlacementTestPage() {
  return (
    <>
      <PlacementTestClient />
    </>
  );
}
