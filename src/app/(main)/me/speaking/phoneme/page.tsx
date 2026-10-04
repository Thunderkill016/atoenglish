import type { Metadata } from "next";
import { SecondaryPageShell } from "@/components/design-system";
import PhonemeChecker from "../phoneme-checker";

export const metadata: Metadata = {
  title: "Phoneme Coach | Luyện nói — AtoEnglish",
  description: "AI phân tích phát âm từng âm vị — sửa lỗi phát âm chi tiết.",
  robots: { index: false },
};

export default function PhonemePage() {
  return (
    <SecondaryPageShell
      title="Phoneme Coach"
      subtitle="AI phân tích phát âm"
    >
      <PhonemeChecker />
    </SecondaryPageShell>
  );
}
