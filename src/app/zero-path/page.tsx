import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getZeroPathResumeState,
  getZeroPathReviewIndex,
  listZeroPathOpenSessions,
} from "@/app/actions/zero-path";
import { Screen } from "@/components/design-system";
import { ZeroPathSession } from "@/features/zero-path/ZeroPathSession";
import {
  ZERO_PATH_PILOT_LESSON_ID,
  zeroPathLessonEnvelope,
  zeroPathLessonIndex,
} from "@/lib/nep/zero-path-pilot.v1";

export const metadata: Metadata = {
  title: "Buổi học | AtoEnglish",
  description:
    "Pilot zero-path: một buổi học Nếp với bằng chứng học tập minh bạch.",
};

export default async function ZeroPathPage({
  searchParams,
}: {
  searchParams: Promise<{ lesson?: string; mode?: string; session?: string }>;
}) {
  const {
    lesson: requestedLesson,
    mode: requestedMode,
    session: requestedSession,
  } = await searchParams;

  // Durable-session resume: ?session=<id> continues an open session. The
  // session row decides the lesson and mode — URL params are not trusted.
  let resume: {
    sessionId: string;
    completedActionIds: readonly string[];
  } | null = null;
  let resumeMode: "learn" | "review" | null = null;
  let resumeLessonId: string | null = null;
  if (requestedSession) {
    const state = await getZeroPathResumeState(requestedSession);
    if (state.status === "ok") {
      resume = {
        sessionId: requestedSession,
        completedActionIds: state.completedActionIds,
      };
      resumeMode = state.mode;
      resumeLessonId = state.lessonId;
    }
  }

  const lessonId =
    resumeLessonId ?? requestedLesson ?? ZERO_PATH_PILOT_LESSON_ID;
  const mode = resumeMode ?? (requestedMode === "review" ? "review" : "learn");
  const lesson = zeroPathLessonEnvelope(lessonId);
  if (!lesson) notFound();

  const index = zeroPathLessonIndex();
  const reviewIndex = await getZeroPathReviewIndex();
  const openSessions = await listZeroPathOpenSessions();
  const stateByLesson = new Map(
    reviewIndex.signedIn
      ? reviewIndex.states.map((state) => [state.lessonId, state])
      : [],
  );

  return (
    <Screen narrow>
      <main id="main-content">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground mb-3 inline-block transition-colors"
        >
          ← Trang chủ
        </Link>

        {openSessions.length > 0 ? (
          <nav aria-label="Tiếp tục buổi đang học" className="mb-6">
            <p className="mb-2 text-sm font-medium text-foreground">
              Tiếp tục buổi đang học
            </p>
            <ol className="flex flex-col gap-2">
              {openSessions.map((session) => (
                <li key={session.id}>
                  <Link
                    href={`/zero-path?session=${session.id}`}
                    className="block rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary transition-colors hover:border-primary"
                  >
                    {index.find((entry) => entry.lessonId === session.lesson_id)
                      ?.learnerCanDo ?? session.lesson_id}
                    {session.mode === "review" ? " · ôn tập" : ""}
                    <span className="block text-xs text-primary">
                      Bắt đầu{" "}
                      {new Date(session.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

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
                          : "block rounded-xl border border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground"
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
                      <span className="block text-xs text-muted-foreground">
                        {entry.learnerCanDo}
                      </span>
                      {state?.due ? (
                        <Link
                          href={`/zero-path?lesson=${entry.lessonId}&mode=review`}
                          className="mt-1 inline-block rounded-full bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning underline underline-offset-2"
                        >
                          Đến hạn ôn — ôn buổi này
                        </Link>
                      ) : state?.introduced && state.nextReviewAt ? (
                        <span className="mt-1 block text-xs text-muted-foreground">
                          Ôn lại sau{" "}
                          {new Date(state.nextReviewAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}

        <ZeroPathSession lesson={lesson} mode={mode} resume={resume} />
      </main>
    </Screen>
  );
}
