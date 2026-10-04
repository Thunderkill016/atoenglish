import type { Metadata } from "next";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Layers,
  RefreshCcw,
} from "lucide-react";

import {
  ListSection,
  PrimaryRow,
  SecondaryPageShell,
} from "@/components/design-system";
import { getReviewQueueData } from "@/lib/review/due-queue";

export const metadata: Metadata = {
  title: "Ôn Tập | AtoEnglish",
  description:
    "Hàng đợi ôn tập hôm nay: thẻ từ vựng, bài học đến hạn và kiểm tra chuyển tiếp.",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/**
 * Unified review queue — one honest list of everything due today:
 * SRS cards, lesson reviews derived from attempt history, and delayed
 * transfer probes. Guests see the structure plus a sign-in nudge since
 * scheduling needs an identity to attach history to.
 */
export default async function ReviewPage() {
  const queue = await getReviewQueueData();
  const totalDue =
    queue.srsDueCount + queue.lessonReviews.length + queue.transfers.length;

  if (!queue.signedIn) {
    return (
      <SecondaryPageShell
        title="Ôn tập"
        subtitle="Lịch ôn tập cần tài khoản để ghi nhận lịch sử học"
      >
        <div className="space-y-2 pb-16">
          <PrimaryRow
            href="/login?mode=login&next=%2Freview"
            label="Đăng nhập để ôn tập"
            description="Đồng bộ thẻ đến hạn, bài học và kiểm tra chuyển tiếp"
            icon={Layers}
          />
          <PrimaryRow
            href="/learn/unit-a0-1"
            label="Học thử bài đầu tiên"
            description="Không cần tài khoản"
            icon={BookOpen}
          />
        </div>
      </SecondaryPageShell>
    );
  }

  return (
    <SecondaryPageShell
      title="Ôn tập"
      subtitle={
        totalDue > 0
          ? `${totalDue} việc đến hạn hôm nay`
          : "Hôm nay không có gì đến hạn"
      }
    >
      <div className="space-y-5 pb-16">
        {totalDue === 0 ? (
          <ListSection title="Đã xong">
            <PrimaryRow
              href="/learn"
              label="Học bài mới"
              description="Không có mục ôn tập nào đến hạn — tiếp tục lộ trình"
              icon={CheckCircle}
            />
          </ListSection>
        ) : null}

        {queue.srsDueCount > 0 ? (
          <ListSection title="Từ vựng">
            <PrimaryRow
              href="/review/cards"
              label={`${queue.srsDueCount} thẻ đến hạn`}
              description="Ôn từ vựng theo lịch FSRS"
              icon={Layers}
            />
          </ListSection>
        ) : null}

        {queue.lessonReviews.length > 0 ? (
          <ListSection title={`Bài học · ${queue.lessonReviews.length} buổi đến hạn`}>
            {queue.lessonReviews.map((review) => (
              <PrimaryRow
                key={review.lessonId}
                href={review.href}
                label={review.title}
                description="Ôn lại bài đã học — ghi nhận độ bền trí nhớ"
                icon={BookOpen}
              />
            ))}
          </ListSection>
        ) : null}

        {queue.transfers.length > 0 ? (
          <ListSection title={`Kiểm tra chuyển tiếp · ${queue.transfers.length}`}>
            {queue.transfers.map((transfer) => (
              <PrimaryRow
                key={transfer.id}
                href={transfer.href}
                label={transfer.label}
                description={transfer.description}
                icon={RefreshCcw}
              />
            ))}
          </ListSection>
        ) : null}

        <ListSection title="Khác">
          <PrimaryRow
            href="/review/hard"
            label="Từ khó nhất"
            description="Ôn các thẻ hay quên (leech)"
            icon={AlertTriangle}
          />
        </ListSection>
      </div>
    </SecondaryPageShell>
  );
}
