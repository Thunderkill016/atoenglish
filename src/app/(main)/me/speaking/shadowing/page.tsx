import type { Metadata } from "next";
import { SecondaryPageShell } from "@/components/design-system";
import { ShadowingPractice } from "../shadowing-practice";

export const metadata: Metadata = {
  title: "Shadowing Practice | Luyện nói — AtoEnglish",
  description: "Luyện nói đuổi theo audio bản xứ để xây phản xạ phát âm và ngữ điệu.",
  robots: { index: false },
};

export default function ShadowingPage() {
  return (
    <SecondaryPageShell
      title="Shadowing Practice"
      subtitle="Nói đuổi theo audio bản xứ"
    >
      <ShadowingPractice />
    </SecondaryPageShell>
  );
}
