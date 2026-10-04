import type { Metadata } from "next";
import { SecondaryPageShell } from "@/components/design-system";
import { AIRoleplay } from "../ai-roleplay";

export const metadata: Metadata = {
  title: "AI Roleplay | Luyện nói — AtoEnglish",
  description: "Hội thoại nhập vai với AI để luyện giao tiếp tình huống thực tế.",
  robots: { index: false },
};

export default function RoleplayPage() {
  return (
    <SecondaryPageShell
      title="AI Roleplay"
      subtitle="Hội thoại nhập vai với AI"
    >
      <AIRoleplay />
    </SecondaryPageShell>
  );
}
