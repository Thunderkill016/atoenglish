import type { Metadata } from "next";
import { SecondaryPageShell } from "@/components/design-system";
import { JournalMode } from "../journal-mode";

export const metadata: Metadata = {
  title: "Daily Journal | Luyện nói — AtoEnglish",
  description: "Nhật ký nói tự do — luyện fluency và ý tưởng bằng tiếng Anh mỗi ngày.",
  robots: { index: false },
};

export default function JournalPage() {
  return (
    <SecondaryPageShell
      title="Daily Journal"
      subtitle="Nhật ký nói tự do"
    >
      <JournalMode />
    </SecondaryPageShell>
  );
}
