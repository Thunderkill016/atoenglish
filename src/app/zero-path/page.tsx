import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LargeTitle, Screen } from "@/components/design-system";
import { ZeroPathSession } from "@/features/zero-path/ZeroPathSession";
import { zeroPathLessonEnvelope } from "@/lib/nep/zero-path-pilot.v1";

export const metadata: Metadata = {
  title: "Buổi học đầu tiên | AtoEnglish",
  description: "Pilot zero-path: một buổi học Nếp với bằng chứng học tập minh bạch.",
};

export default function ZeroPathPage() {
  const lesson = zeroPathLessonEnvelope();
  if (!lesson) notFound();

  return (
    <Screen narrow>
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-3 inline-block transition-colors"
      >
        ← Trang chủ
      </Link>

      <LargeTitle subtitle={lesson.mission}>Buổi học đầu tiên</LargeTitle>

      <p className="mb-6 text-sm text-stone-600">
        Mục tiêu: {lesson.learnerCanDo}
      </p>

      <ZeroPathSession lesson={lesson} />
    </Screen>
  );
}
