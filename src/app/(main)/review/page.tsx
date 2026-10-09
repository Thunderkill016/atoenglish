import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getReviewQueue } from "@/app/actions/review";
import { ReviewSession } from "./review-session";

export const metadata: Metadata = {
  title: "Ôn tập",
  description:
    "Ôn lại từ, cụm và câu đã lưu từ video — lịch nhắc theo FSRS, mỗi lượt ôn ghi lại kết quả.",
};

/**
 * `/review` — the FSRS practice surface (SPEC 005 §8). The queue is built
 * server-side so guests hit the sign-in gate before any learner data loads.
 */
export default async function ReviewPage() {
  const queue = await getReviewQueue();
  if (!queue.ok) {
    if (queue.error === "unauthorized") redirect("/login?next=/review");
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Ôn tập</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Chưa tải được hàng đợi ôn tập. Thử tải lại trang.
        </p>
      </div>
    );
  }
  return <ReviewSession items={queue.items} />;
}
