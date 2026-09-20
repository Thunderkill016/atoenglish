import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "Cài đặt — AtoEnglish",
  description: "Tùy chỉnh trải nghiệm học tập, ôn tập và giao diện AtoEnglish.",
  robots: { index: false },
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main id="main-content">
      <SettingsClient userEmail={user?.email ?? ""} />
    </main>
  );
}
