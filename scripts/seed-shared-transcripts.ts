/**
 * Seed the shared_transcripts cache for catalog videos.
 *
 * Run:  npx tsx scripts/seed-shared-transcripts.ts [--force] [--delay-ms N]
 *
 * Each video runs the same pipeline as the app's fetch action
 * (fetchYoutubeCaptions → segment → align human VI) and upserts the result
 * into public.shared_transcripts via DATABASE_URL (owner — same write path
 * as upsert_shared_transcript). Existing rows are skipped unless --force.
 *
 * YouTube throttles timedtext per IP: a "blocked" result is reported, not
 * fatal — rerun later to fill the gaps. --delay-ms spaces requests out.
 */
import { neon } from "@neondatabase/serverless";
import { fetchYoutubeCaptions } from "../src/lib/video/captions";
import {
  SEGMENTATION_VERSION,
  segmentTranscript,
} from "../src/lib/video/segment";
import { alignHumanTranslation } from "../src/lib/video/align-translation";
import { CATALOG_VIDEOS } from "../src/content/catalog/videos";

const DELAY_MS = Number(
  process.argv.find((a) => a.startsWith("--delay-ms="))?.split("=")[1] ?? 4000,
);
const FORCE = process.argv.includes("--force");

const sql = neon(process.env.DATABASE_URL!);

async function alreadyCached(videoId: string) {
  const rows =
    await sql`select video_id from public.shared_transcripts where video_id = ${videoId}`;
  return rows.length > 0;
}

async function upsert(
  videoId: string,
  t: {
    origin: string;
    language: string;
    sentences: unknown;
    title?: string;
    channel?: string;
    durationMs?: number;
  },
) {
  await sql`
    insert into public.shared_transcripts
      (video_id, origin, language, segmentation_version, sentences, title, channel, duration_ms)
    values (
      ${videoId}, ${t.origin}, ${t.language}, ${SEGMENTATION_VERSION},
      ${JSON.stringify(t.sentences)}::jsonb, ${t.title ?? null},
      ${t.channel ?? null}, ${t.durationMs ?? null}
    )
    on conflict (video_id) do update set
      origin = excluded.origin,
      language = excluded.language,
      segmentation_version = excluded.segmentation_version,
      sentences = excluded.sentences,
      title = excluded.title,
      channel = excluded.channel,
      duration_ms = excluded.duration_ms,
      fetched_at = now()`;
}

let ok = 0;
const failed: string[] = [];
for (const video of CATALOG_VIDEOS) {
  if (!FORCE && (await alreadyCached(video.id))) {
    console.log(`skip ${video.id} (cached)`);
    continue;
  }
  try {
    const r = await fetchYoutubeCaptions(video.id);
    if (!r.ok) {
      failed.push(`${video.id}:${r.error}`);
      console.log(`fail ${video.id} — ${r.error}`);
    } else {
      const sentences = segmentTranscript({
        kind: r.track.kind === "asr" ? "asr" : "cues",
        events: r.events,
      });
      if (!sentences.length) {
        failed.push(`${video.id}:empty`);
        console.log(`fail ${video.id} — empty`);
      } else {
        const aligned = r.viEvents
          ? alignHumanTranslation(sentences, r.viEvents, r.events)
          : sentences;
        await upsert(video.id, {
          origin: r.track.kind === "asr" ? "youtube_asr" : "youtube_manual",
          language: r.track.languageCode,
          sentences: aligned,
          title: r.video.title,
          channel: r.video.channel,
          durationMs: Number.isFinite(r.video.durationMs)
            ? r.video.durationMs
            : undefined,
        });
        ok++;
        console.log(
          `ok   ${video.id} — ${aligned.length} câu (${r.track.kind})`,
        );
      }
    }
  } catch (e) {
    failed.push(`${video.id}:throw`);
    console.log(`fail ${video.id} —`, e);
  }
  await new Promise((res) => setTimeout(res, DELAY_MS));
}
console.log(`\ndone: ${ok} seeded, ${failed.length} failed`);
if (failed.length) console.log("failed:", failed.join(", "));
