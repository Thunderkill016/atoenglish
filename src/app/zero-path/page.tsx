import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getZeroPathReviewIndex } from "@/app/actions/zero-path";
import { LargeTitle, Screen } from "@/components/design-system";
import { ZeroPathSession } from "@/features/zero-path/ZeroPathSession";
import {
  ZERO_PATH_PILOT_LESSON_ID,
  zeroPathLessonEnvelope,
  zeroPathLessonIndex,
} from "@/lib/nep/zero-path-pilot.v1";

export const metadata: Metadata = {
  title: "Buổi học | AtoEnglish",
  description: "Pilot zero-path: một buổi học Nếp với bằng chứng học tập minh bạch.",
};

export default async function ZeroPathPage({
  searchParams,
}: {
  searchParams: Promise<{ lesson?: string; mode?: string }>;
}) {
  const { lesson: requestedLesson, mode: requestedMode } = await searchParams;
  const lessonId = requestedLesson ?? ZERO_PATH_PILOT_LESSON_ID;
  const mode = requestedMode === "review" ? "review" : "learn";
  const lesson = zeroPathLessonEnvelope(lessonId);
  if (!lesson) notFound();

  const index = zeroPathLessonIndex();
  const reviewIndex = await getZeroPathReviewIndex();
  const stateByLesson = new Map(
    reviewIndex.signedIn ? reviewIndex.states.map((state) => [state.lessonId, state]) : [],
  );

  return (
    <Screen narrow>
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-3 inline-block transition-colors"
      >
        ← Trang chủ
      </Link>

      {index.length > 1 ? (
        <nav aria-label="Chọn buổi học" className="mb-6">
          <ol className="flex flex-col gap-2">
            {index.map((entry, position) => {
              const active = entry.lessonId === lesson.lessonId;
              const state = stateByLesson.get(entry.lessonId);
              return (
                <li key={entry.lessonId}>
                  <div
                    className={
                      active
                        ? "block rounded-xl border border-foreground/20 bg-foreground/5 px-4 py-3 text-sm"
                        : "block rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-600 transition-colors hover:border-stone-400 hover:text-foreground"
                    }
                  >
                    <Link
                      href={`/zero-path?lesson=${entry.lessonId}`}
                      aria-current={active ? "page" : undefined}
                      className="font-medium"
                    >
                      Buổi {position + 1}
                      {active ? " · đang mở" : ""}
                    </Link>
                    <span className="block text-xs text-stone-500">{entry.learnerCanDo}</span>
                    {state?.due ? (
                      <Link
                        href={`/zero-path?lesson=${entry.lessonId}&mode=review`}
                        className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 underline underline-offset-2"
                      >
                        Đến hạn ôn — ôn buổi này
                      </Link>
                    ) : state?.introduced && state.nextReviewAt ? (
                      <span className="mt-1 block text-xs text-stone-400">
                        Ôn lại sau {new Date(state.nextReviewAt).toLocaleDateString("vi-VN")}
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}

      <LargeTitle subtitle={lesson.mission}>
        {mode === "review" ? "Buổi ôn tập" : "Buổi học"}
      </LargeTitle>

      <p className="mb-6 text-sm text-stone-600">
        Mục tiêu: {lesson.learnerCanDo}
      </p>

      <ZeroPathSession lesson={lesson} mode={mode} />
    </Screen>
  );
}
