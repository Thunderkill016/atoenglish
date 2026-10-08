import type { createClient } from "@/lib/supabase/server";

type Db = Awaited<ReturnType<typeof createClient>>;

const encoder = new TextEncoder();

/** hex sha-256 of the cue's source text — the staleness guard key. */
export async function translationTextHash(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", encoder.encode(text));
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface CacheRow {
  line_i: number;
  text_hash: string;
  vi: string;
}

/**
 * Read-through into subtitle_translations (owner-scoped via RLS). Only rows
 * whose stored hash still matches the current source text are returned —
 * a changed cue retranslates instead of silently reusing stale output.
 */
export async function readTranslationCache(
  db: Db,
  videoId: string,
  profile: string,
  lines: { i: number; text: string }[],
): Promise<Map<number, string>> {
  const hashes = new Map<number, string>();
  await Promise.all(
    lines.map(async (line) =>
      hashes.set(line.i, await translationTextHash(line.text)),
    ),
  );
  const { data, error } = await db
    .from("subtitle_translations")
    .select("line_i, text_hash, vi")
    .eq("video_id", videoId)
    .eq("profile", profile)
    .in(
      "line_i",
      lines.map((l) => l.i),
    );
  const hits = new Map<number, string>();
  if (error || !Array.isArray(data)) return hits; // Cache loss never blocks translation.
  for (const row of data as CacheRow[])
    if (hashes.get(row.line_i) === row.text_hash) hits.set(row.line_i, row.vi);
  return hits;
}

/** Write-through: upsert fresh translations; null/empty outputs never persist. */
export async function writeTranslationCache(
  db: Db,
  userId: string,
  videoId: string,
  profile: string,
  source: { i: number; text: string }[],
  outputs: { i: number; vi: string | null }[],
): Promise<void> {
  const text = new Map(source.map((l) => [l.i, l.text]));
  const rows = [];
  for (const out of outputs) {
    const src = text.get(out.i);
    if (!out.vi || !src) continue;
    rows.push({
      user_id: userId,
      video_id: videoId,
      profile,
      line_i: out.i,
      text_hash: await translationTextHash(src),
      vi: out.vi,
      updated_at: new Date().toISOString(),
    });
  }
  if (!rows.length) return;
  // Upsert keeps the latest engine output per key; a profile change is a new key.
  await db.from("subtitle_translations").upsert(rows);
}
