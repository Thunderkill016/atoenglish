import type { Metadata } from "next";
import FlashcardsClient from "./FlashcardsClient";

export const metadata: Metadata = {
  title: "Ôn Tập | AtoEnglish",
  description:
    "Ôn tập từ vựng thông minh với thuật toán FSRS. Học đúng lúc, nhớ lâu hơn.",
  robots: { index: false },
};

export default function FlashcardsPage() {
  return <FlashcardsClient />;
}
