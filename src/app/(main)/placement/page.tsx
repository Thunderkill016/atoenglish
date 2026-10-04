import type { Metadata } from "next";
import PlacementTestClient from "./PlacementTestClient";

export const metadata: Metadata = {
  title: "Placement Test | AtoEnglish",
  description:
    "Bài ước tính đầu vào theo khung CEFR — 40 câu Grammar, Vocabulary, Reading. Gợi ý điểm bắt đầu A0–B2.",
  robots: { index: false },
};

export default function PlacementTestPage() {
  return (
    <>
      <PlacementTestClient />
    </>
  );
}
