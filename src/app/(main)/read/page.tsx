import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { LargeTitle, Screen } from "@/components/design-system";
import { STARTER_TEXTS } from "@/lib/read/starter-texts";

import { ReaderClient } from "./ReaderClient";

export const metadata: Metadata = {
  title: "Đọc | AtoEnglish",
  description: "Đọc tiếng Anh với trạng thái từng từ — bạn biết từ nào, chưa biết từ nào.",
};

export default async function ReadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <Screen narrow>
      <LargeTitle subtitle="Chạm vào một từ để xem nghĩa và đánh dấu mức độ quen thuộc.">
        Đọc
      </LargeTitle>
      <ReaderClient signedIn={user !== null} starterTexts={STARTER_TEXTS} />
    </Screen>
  );
}
