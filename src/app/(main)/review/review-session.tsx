"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { BookOpenCheck, ChevronRight, PlayCircle } from "lucide-react";

import { recordPracticeAttempt } from "@/app/actions/review";
import type { ReviewQueueItem } from "@/app/actions/review";
import { blankTargetInSentence } from "@/lib/srs/practice";
import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Review session (SPEC 005 §8): one card at a time — cue on the front, answer
 * + self-rating on the back. This slice ships the self-rated modes only
 * (`recall` for word/phrase, `sentence_meaning` for sentences); the
 * listen_fill/dictation interleave lands with the review segment player.
 * Every rep posts one practice_attempts row; graded modes also move FSRS.
 */

const RATINGS = [
  { value: 1, label: "Quên", hint: "không nhớ" },
  { value: 2, label: "Khó", hint: "nhớ một phần" },
  { value: 3, label: "Nhớ", hint: "nhớ được" },
  { value: 4, label: "Dễ", hint: "nhớ ngay" },
] as const;

const KIND_LABEL: Record<ReviewQueueItem["kind"], string> = {
  word: "Từ",
  phrase: "Cụm từ",
  sentence: "Câu",
};

function CueSentence({ item }: { item: ReviewQueueItem }) {
  const text = item.context?.sentence_text;
  if (!text) return null;
  // recall blank: hide the saved word/phrase inside its own sentence.
  if (item.kind !== "sentence") {
    const blank = blankTargetInSentence(text, item.display);
    if (blank) {
      return (
        <p lang="en" className="text-lg leading-relaxed [overflow-wrap:anywhere]">
          {blank.before}
          <span
            aria-label={`Chỗ trống cho “${item.display}”`}
            className="mx-1 inline-block min-w-16 rounded border-b-2 border-primary px-1 text-primary"
          >
            {" ".repeat(Math.max(2, Math.min(item.display.length, 24)))}
          </span>
          {blank.after}
        </p>
      );
    }
  }
  return (
    <p lang="en" className="text-lg leading-relaxed [overflow-wrap:anywhere]">
      {text}
    </p>
  );
}

export function ReviewSession({ items }: { items: ReviewQueueItem[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  const item = items[index];
  const finished = index >= items.length;

  const rate = useCallback(
    (rating: number) => {
      if (!item || pending) return;
      startTransition(async () => {
        const result = await recordPracticeAttempt({
          card_id: item.card_id,
          mode: item.mode,
          rating,
        });
        if (!result.ok) {
          setFailed(true);
          return;
        }
        setDone((n) => n + 1);
        setIndex((i) => i + 1);
        setFlipped(false);
      });
    },
    [item, pending],
  );

  const deepLink = useMemo(() => {
    if (!item?.context?.video_id || item.context.start_ms == null) return null;
    return `/watch/${item.context.video_id}?t=${item.context.start_ms}`;
  }, [item]);

  if (!items.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          icon={BookOpenCheck}
          title="Chưa có thẻ nào đến hạn"
          body="Lưu từ hoặc câu từ video đang xem — chúng sẽ xuất hiện ở đây để ôn lại."
          action={{ label: "Khám phá video", href: "/discover" }}
        />
      </div>
    );
  }

  if (finished) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-16 text-center">
        <BookOpenCheck className="h-10 w-10 text-primary" aria-hidden />
        <h1 className="text-xl font-bold">Hết hàng đợi</h1>
        <p className="text-sm text-muted-foreground">
          Bạn đã ôn {done} thẻ trong phiên này. Lịch ôn tiếp theo được FSRS sắp
          lại theo kết quả từng thẻ.
        </p>
        <Link href="/discover" className={cn(buttonVariants(), "mt-2")}>
          Xem video tiếp
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    );
  }

  const modeLabel =
    item.mode === "sentence_meaning" ? "Nhớ lại câu" : "Nhớ lại từ";

  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-xl flex-col px-4 py-8">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {index + 1} / {items.length} · {KIND_LABEL[item.kind]} · {modeLabel}
        </span>
        {deepLink && (
          <Link
            href={deepLink}
            className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 hover:bg-muted"
          >
            <PlayCircle className="h-4 w-4" aria-hidden />
            Xem đoạn gốc
          </Link>
        )}
      </div>

      <div className="mt-6 flex-1 rounded-2xl border border-border bg-card p-6">
        {/* Cue side */}
        {item.context && <CueSentence item={item} />}
        {!item.context && (
          <p lang="en" className="text-lg font-medium">
            {item.display}
          </p>
        )}

        {item.mode === "sentence_meaning" && item.context?.sentence_vi && (
          <p
            lang="vi"
            className="mt-3 text-sm leading-relaxed text-muted-foreground"
          >
            {item.context.sentence_vi}
          </p>
        )}
        {item.kind !== "sentence" && item.meaning_vi && (
          <p
            lang="vi"
            className="mt-3 text-sm leading-relaxed text-muted-foreground"
          >
            {item.meaning_vi}
          </p>
        )}

        {/* Answer side */}
        {flipped && (
          <div className="mt-6 border-t border-border pt-4" data-testid="answer">
            <p className="text-lg font-semibold text-primary" lang="en">
              {item.display}
            </p>
            {item.context && item.kind === "sentence" && (
              <p
                lang="en"
                className="mt-2 leading-relaxed [overflow-wrap:anywhere]"
              >
                {item.context.sentence_text}
              </p>
            )}
            {item.meaning_vi && item.kind === "sentence" && (
              <p lang="vi" className="mt-2 text-sm text-muted-foreground">
                {item.meaning_vi}
              </p>
            )}
          </div>
        )}
      </div>

      {failed && (
        <p role="alert" className="mt-3 text-center text-sm text-destructive">
          Chưa ghi được lượt ôn. Thử lại.
        </p>
      )}

      <div className="mt-6">
        {!flipped ? (
          <button
            type="button"
            onClick={() => setFlipped(true)}
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            Lật thẻ
          </button>
        ) : (
          <div
            className="grid grid-cols-4 gap-2"
            role="group"
            aria-label="Tự chấm mức nhớ"
          >
            {RATINGS.map((r) => (
              <button
                key={r.value}
                type="button"
                data-rating={r.value}
                disabled={pending}
                onClick={() => rate(r.value)}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "flex-col gap-0.5",
                )}
              >
                <span>{r.label}</span>
                <span className="text-[10px] font-normal text-muted-foreground">
                  {r.hint}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
