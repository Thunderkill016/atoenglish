import { serverTranslationConfig } from "@/lib/video/local-translation";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { YOUTUBE_VIDEO_ID_RE } from "@/lib/video/youtube-url";
import {
  resolveTranscript,
  type TranscriptStore,
} from "@/lib/video/transcript-resolver";
import { persistAccountTranscript } from "@/lib/video/persist-transcript";
import { WatchClient } from "./watch-client";

export const metadata: Metadata = {
  title: "Xem video",
};

interface WatchPageProps {
  params: Promise<{ videoId: string }>;
  searchParams: Promise<{ t?: string }>;
}

export default async function WatchPage({
  params,
  searchParams,
}: WatchPageProps) {
  const { videoId } = await params;
  const { t } = await searchParams;
  if (!YOUTUBE_VIDEO_ID_RE.test(videoId)) notFound();

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // TranscriptResolver: account copy first, then the shared library cache.
  // The store interface is structural; casting avoids instantiating the
  // full generated Supabase client type at this call site.
  const resolved = await resolveTranscript(
    supabase as unknown as TranscriptStore,
    videoId,
    user?.id ?? null,
  );
  const initial = resolved.status === "found" ? resolved.transcript : null;

  // Library hit for a signed-in learner: claim the account copy so resume
  // position and library ownership persist — the same backfill the fetch
  // action performs. Without it, saveWatchPosition silently matched no row.
  if (user && resolved.status === "found" && resolved.scope === "library") {
    initial!.saved = await persistAccountTranscript(
      supabase,
      user.id,
      videoId,
      initial!,
    );
  }

  // ?t=ms (deep link from library/review later) wins over the stored position.
  const deepLinkMs = t && /^\d+$/.test(t) ? Number(t) : null;
  const initialPositionMs = deepLinkMs ?? resolved.savedPositionMs;

  return (
    <WatchClient
      key={videoId}
      videoId={videoId}
      loggedIn={Boolean(user)}
      translationScope={user?.id ?? "guest"}
      serverTranslation={serverTranslationConfig()?.engine ?? null}
      initial={initial}
      initialPositionMs={initialPositionMs}
    />
  );
}
