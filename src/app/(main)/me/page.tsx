import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import MeClient from "./MeClient";

export const metadata: Metadata = {
  title: "Tôi | AtoEnglish",
  description: "Tiến độ, luyện tập và cài đặt — một danh sách gọn.",
  robots: { index: false },
};

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Học viên";

  return (
    <>
      <MeClient userName={userName} />
    </>
  );
}
