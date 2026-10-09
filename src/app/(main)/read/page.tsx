import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { ReadClient } from "./read-client";

export const metadata: Metadata = {
  title: "Đọc",
  description:
    "Dán văn bản tiếng Anh — đọc theo câu, tra từ, dịch và lưu vào bộ ôn tập.",
};

/**
 * `/read` — paste-text surface (SPEC §5.4): the same
 * read → look up → translate → save loop as `/watch`, minus the player.
 * Guests can read, look up and translate; saving requires a session and is
 * gated inside the client rather than at the route.
 */
export default async function ReadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return <ReadClient loggedIn={Boolean(user)} />;
}
