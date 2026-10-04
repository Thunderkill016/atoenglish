import type { Metadata } from "next";
import { SecondaryPageShell } from "@/components/design-system";
import PhonemeChecker from "../phoneme-checker";

export const metadata: Metadata = {
  title: "Phoneme Coach | Luyện nói — AtoEnglish",
  description:
    "Luyện câu mẫu có hướng dẫn — so sánh transcript nhận diện với câu mục tiêu.",
  robots: { index: false },
};

export default function PhonemePage() {
  return (
    <SecondaryPageShell
      title="Phoneme Coach"
      subtitle="Tự luyện — chưa chấm phát âm tự động"
    >
      <PhonemeChecker />
    </SecondaryPageShell>
  );
}
