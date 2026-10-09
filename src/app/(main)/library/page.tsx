import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getLibrary } from "@/app/actions/library";
import { LibraryClient } from "./library-client";

export const metadata: Metadata = {
  title: "Thư viện",
  description:
    "Video đã xem, từ/cụm và câu đã lưu — mở lại đúng đoạn, sửa nghĩa, xoá dữ liệu của bạn.",
};

/**
 * `/library` — the learner's saved-content surface (SPEC 005 §3): tabs for
 * watched videos, words/phrases and sentences, with deep links back to the
 * exact source segment. Guests hit the sign-in gate before any data loads.
 */
export default async function LibraryPage() {
  const library = await getLibrary();
  if (!library.ok) {
    if (library.error === "unauthorized") redirect("/login?next=/library");
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Thư viện</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Chưa tải được thư viện. Thử tải lại trang.
        </p>
      </div>
    );
  }
  return (
    <LibraryClient
      videos={library.videos}
      words={library.words}
      sentences={library.sentences}
    />
  );
}
