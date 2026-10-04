import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import MissionLessonTemplate from "@/components/learn/MissionLessonTemplate";
import { ZeroPathSession } from "@/features/zero-path/ZeroPathSession";
import {
  getZeroPathResumeState,
  listZeroPathOpenSessions,
} from "@/app/actions/zero-path";
import {
  isMissionLesson,
  legacyUnitEntry,
  legacyUnitSlugs,
} from "@/lib/lessons/legacy-unit-registry";
import { legacyContractLessonId } from "@/lib/nep/legacy-unit-contract.v1";
import { zeroPathLessonEnvelope } from "@/lib/nep/zero-path-pilot.v1";
import { UNITS } from "@/lib/constants/units";
import { createClient } from "@/lib/supabase/server";

export function generateStaticParams() {
  return legacyUnitSlugs().map((slug) => ({ unitSlug: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ unitSlug: string }>;
}): Promise<Metadata> {
  const { unitSlug } = await params;
  const entry = legacyUnitEntry(unitSlug);
  const meta = UNITS.find((unit) => unit.id === unitSlug);
  if (!entry || !meta) return { title: "Bài học không tìm thấy" };

  return {
    title: entry.data.title,
    description: entry.data.description,
    robots: { index: false },
  };
}

export default async function UnitPage({
  params,
  searchParams,
}: {
  params: Promise<{ unitSlug: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { unitSlug } = await params;
  const { mode: requestedMode } = await searchParams;
  const entry = legacyUnitEntry(unitSlug);
  if (!entry) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && unitSlug !== "unit-a0-1") {
    redirect(
      `/login?mode=login&next=${encodeURIComponent(`/learn/${unitSlug}`)}`,
    );
  }

  const nextRoute = !user
    ? "/login?mode=login&next=%2Fcheckpoint%2Ftrial"
    : entry.next;

  if (isMissionLesson(entry.data)) {
    return <MissionLessonTemplate lesson={entry.data} nextRoute={nextRoute} />;
  }

  // Legacy UnitData lessons run inside the canonical session runtime through
  // the compile adapter — the browser sees only a learner-safe envelope; all
  // evaluation and evidence minting stay server-side.
  const envelope = zeroPathLessonEnvelope(legacyContractLessonId(unitSlug));
  if (!envelope) notFound();

  // Review mode is a server-bound flag: the session's persisted mode decides
  // whether attempts mint retention evidence — the client param only picks
  // which kind of session to start or resume.
  const mode = requestedMode === "review" ? "review" : "learn";

  // Continue an open durable session for this lesson when one exists — a
  // learner who leaves mid-unit resumes at the first unanswered action.
  let resume: {
    sessionId: string;
    completedActionIds: readonly string[];
  } | null = null;
  if (user) {
    const openSessions = await listZeroPathOpenSessions();
    const existing = openSessions.find(
      (session) =>
        session.lesson_id === envelope.lessonId && session.mode === mode,
    );
    if (existing) {
      const state = await getZeroPathResumeState(existing.id);
      if (state.status === "ok") {
        resume = {
          sessionId: existing.id,
          completedActionIds: state.completedActionIds,
        };
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <ZeroPathSession
        lesson={envelope}
        mode={mode}
        resume={resume}
        completion={{ unitSlug, nextHref: nextRoute }}
      />
    </div>
  );
}
