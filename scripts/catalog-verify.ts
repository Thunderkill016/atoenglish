#!/usr/bin/env node
/**
 * Catalog verification (SPEC §10): every curated video must resolve + have a
 * fetchable English caption track through the app's own fetch chain.
 *
 * Usage: npx tsx scripts/catalog-verify.ts
 *        (Node ≥22.6; uses the real fetchYoutubeCaptions from src/lib/video)
 *
 * Read-only: calls YouTube oEmbed + the same caption endpoints /watch uses.
 * Prints a table + writes scripts/catalog-verify.report.json.
 */
import { writeFileSync } from "node:fs";
import { fetchYoutubeCaptions } from "../src/lib/video/captions";
import { CATALOG_VIDEOS } from "../src/content/catalog/videos";

const candidates = process.argv.slice(2); // extra ids may be passed explicitly
const ids = candidates.length ? candidates : CATALOG_VIDEOS.map((v) => v.id);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rows = [];

for (const id of ids) {
  let oembed = null;
  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
    );
    if (r.ok) oembed = await r.json();
  } catch {}
  const cap = await fetchYoutubeCaptions(id, {
    delay: (ms) => sleep(Math.min(ms, 50)), // faster retries for the sweep
  });
  rows.push({
    id,
    exists: Boolean(oembed),
    title: oembed?.title ?? null,
    channel: oembed?.author_name ?? null,
    capOk: cap.ok,
    kind: cap.ok ? cap.track.kind : null,
    lang: cap.ok ? cap.track.languageCode : null,
    vi: cap.ok ? Boolean(cap.viEvents?.length) : null,
    durationMs: cap.ok ? (cap.video?.durationMs ?? null) : null,
    source: cap.ok ? cap.source : null,
    error: cap.ok ? null : cap.error,
    detail: cap.ok ? null : cap.detail,
  });
  console.log(
    `${cap.ok ? "OK " : "FAIL"} ${id}  ${cap.ok ? `${cap.track.kind}/${cap.track.languageCode}${cap.viEvents?.length ? "+vi" : ""} ${Math.round((cap.video?.durationMs ?? 0) / 1000)}s` : cap.error + (cap.detail ? ` (${cap.detail})` : "")}  ${oembed?.title?.slice(0, 55) ?? "no-oembed"}`,
  );
  await sleep(400); // be polite — per-owner constraint: no bulk crawling feel
}

const fail = rows.filter((r) => !r.capOk || !r.exists);
console.log(`\n${rows.length - fail.length}/${rows.length} verified`);
if (fail.length) console.log("failures:", fail.map((f) => f.id).join(", "));
writeFileSync(
  new URL("./catalog-verify.report.json", import.meta.url),
  JSON.stringify({ at: new Date().toISOString(), rows }, null, 2),
);
process.exit(fail.length ? 1 : 0);
