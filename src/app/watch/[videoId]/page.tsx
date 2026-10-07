import { serverTranslationConfig } from "@/lib/video/local-translation";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { YOUTUBE_VIDEO_ID_RE } from "@/lib/video/youtube-url";
import type { Sentence, TranscriptOrigin } from "@/lib/video/types";
import type { LoadedTranscript } from "@/app/actions/captions";
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

  let initial: LoadedTranscript | null = null;
  let savedPositionMs: number | null = null;

  if (user) {
    const { data: source } = await supabase
      .from("content_sources")
      .select("id, title, channel, duration_ms, last_position_ms")
      .eq("user_id", user.id)
      .eq("kind", "youtube")
      .eq("external_id", videoId)
      .maybeSingle();
    if (source) {
      savedPositionMs = source.last_position_ms || null;
      const { data: transcript } = await supabase
        .from("content_transcripts")
        .select("origin, language, sentences, segmentation_version")
        .eq("source_id", source.id)
        .maybeSingle();
      const sentences = transcript?.sentences as unknown as
        | Sentence[]
        | undefined;
      if (transcript && Array.isArray(sentences) && sentences.length > 0) {
        initial = {
          sentences,
          origin: transcript.origin as TranscriptOrigin,
          language: transcript.language,
          segmentationVersion: transcript.segmentation_version,
          trackKind:
            transcript.origin === "youtube_asr"
              ? "asr"
              : transcript.origin === "youtube_manual"
                ? "manual"
                : "learner",
          title: source.title ?? undefined,
          channel: source.channel ?? undefined,
          durationMs: source.duration_ms ?? undefined,
          saved: true,
        };
      }
    }
  }

  // ?t=ms (deep link from library/review later) wins over the stored position.
  const deepLinkMs = t && /^\d+$/.test(t) ? Number(t) : null;
  const initialPositionMs = deepLinkMs ?? savedPositionMs;

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
