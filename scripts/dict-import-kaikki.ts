/**
 * Kaikki/viwiktionary -> public.dictionary_entries import pipeline (A2).
 *
 * Input: wiktextract raw dump `vi-extract.jsonl` (one JSON object per line),
 * downloaded from https://kaikki.org/dictionary/downloads/vi/vi-extract.jsonl.gz
 * Source data license: CC BY-SA 4.0 + GFDL (Vietnamese Wiktionary). The raw
 * dump is never committed; the transformed rows keep source='viwiktionary'.
 *
 * Usage:
 *   node scripts/dict-import-kaikki.ts --input vi-extract.jsonl          # stats only
 *   node scripts/dict-import-kaikki.ts --input vi-extract.jsonl --out entries.jsonl
 *   DATABASE_URL=... node scripts/dict-import-kaikki.ts --input vi-extract.jsonl --write
 */
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

export interface KaikkiSense {
  glosses?: string[];
  examples?: { text?: string; translation?: string }[];
  form_of?: { word?: string }[];
}

export interface KaikkiRaw {
  word?: string;
  pos?: string;
  lang_code?: string;
  senses?: KaikkiSense[];
  sounds?: { ipa?: string; mp3_url?: string; tags?: string[] }[];
}

export interface DictionaryEntry {
  word: string;
  pos: string;
  senses: {
    glosses: string[];
    examples?: { text: string; translation?: string }[];
    form_of?: string[];
  }[];
  ipa?: string;
  audio_url?: string;
  source: "viwiktionary";
}

/** Strip residual wikitext/HTML from extracted glosses (~0.1% are dirty). */
export function cleanGloss(raw: string): string {
  let out = raw;
  // Iteratively remove innermost {{templates}} — templates can nest.
  while (/\{\{[^{}]*\}\}/.test(out)) out = out.replace(/\{\{[^{}]*\}\}/g, " ");
  out = out
    .replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, "$1") // [[target|label]] -> label
    .replace(/\[\[([^\]]*)\]\]/g, "$1") // [[link]] -> link
    .replace(/<[^>]+>/g, " ") // HTML tags
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/''+/g, "'") // wikitext bold/italic marks
    .replace(/\s+/g, " ")
    .trim();
  return out;
}

const MAX_GLOSS_LEN = 400;
const MAX_EXAMPLE_LEN = 400;

export function transformKaikkiEntry(raw: KaikkiRaw): DictionaryEntry | null {
  if (raw.lang_code !== "en" || !raw.word || !raw.pos) return null;
  const word = raw.word.toLowerCase();
  const pos = raw.pos.toLowerCase();
  // dictionary_entries bounds: word 120, pos 30, ipa 100 chars.
  if (word.length > 120 || !word.trim() || pos.length > 30) return null;

  const senses = (raw.senses ?? [])
    .map((sense) => {
      const glosses = (sense.glosses ?? [])
        .map(cleanGloss)
        .filter((g) => g.length > 0 && g.length <= MAX_GLOSS_LEN);
      const examples = (sense.examples ?? [])
        .map((ex) => ({
          text: cleanGloss(ex.text ?? ""),
          ...(ex.translation ? { translation: cleanGloss(ex.translation) } : {}),
        }))
        .filter((ex) => ex.text.length > 0 && ex.text.length <= MAX_EXAMPLE_LEN);
      const formOf = (sense.form_of ?? [])
        .map((f) => f.word?.toLowerCase())
        .filter((w): w is string => Boolean(w));
      if (glosses.length === 0 && formOf.length === 0) return null;
      return {
        glosses,
        ...(examples.length ? { examples } : {}),
        ...(formOf.length ? { form_of: formOf } : {}),
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);
  if (senses.length === 0) return null;

  const sounds = raw.sounds ?? [];
  const rawIpa =
    sounds.find((s) => s.ipa && s.tags?.some((t) => /^(us|uk|rp)$/i.test(t)))?.ipa ??
    sounds.find((s) => s.ipa)?.ipa;
  // ipa column caps at 100 chars; a handful of joke/constructed words exceed it.
  const preferredIpa = rawIpa && rawIpa.length <= 100 ? rawIpa : undefined;
  const audioUrl = sounds.find((s) => s.mp3_url?.startsWith("https://"))?.mp3_url;

  return {
    word,
    pos,
    senses,
    ...(preferredIpa ? { ipa: preferredIpa } : {}),
    ...(audioUrl ? { audio_url: audioUrl } : {}),
    source: "viwiktionary",
  };
}

const WRITE_BATCH = 200;

/**
 * Wiktionary emits one raw entry per etymology section, so the same
 * (word, pos) can appear twice — e.g. "record" noun under Etymology 1 and 2.
 * ON CONFLICT cannot touch a row twice in one batch, so merge duplicates:
 * concatenate senses (deduped per gloss), keep the first ipa/audio found.
 */
export function dedupeEntries(entries: DictionaryEntry[]): DictionaryEntry[] {
  const byKey = new Map<string, DictionaryEntry>();
  for (const entry of entries) {
    const key = `${entry.word}${entry.pos}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, entry);
      continue;
    }
    const seenGlosses = new Set(
      existing.senses.flatMap((s) => s.glosses),
    );
    for (const sense of entry.senses) {
      const freshGlosses = sense.glosses.filter((g) => !seenGlosses.has(g));
      if (!freshGlosses.length && !sense.form_of?.length) continue;
      // senses jsonb is capped at 256KB; a few hyper-polysemous headwords
      // would exceed it after merging every etymology section.
      if (JSON.stringify(existing.senses).length > 200_000) break;
      freshGlosses.forEach((g) => seenGlosses.add(g));
      existing.senses.push({ ...sense, glosses: freshGlosses });
    }
    existing.ipa ??= entry.ipa;
    existing.audio_url ??= entry.audio_url;
  }
  return [...byKey.values()];
}

async function writeToDb(entries: DictionaryEntry[], url: string): Promise<number> {
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(url);
  let written = 0;
  for (let i = 0; i < entries.length; i += WRITE_BATCH) {
    const batch = entries.slice(i, i + WRITE_BATCH);
    await sql.query(
      `insert into public.dictionary_entries (word, pos, senses, ipa, audio_url, source)
       select x.word, x.pos, x.senses, x.ipa, x.audio_url, x.source
       from jsonb_to_recordset($1::jsonb)
         as x(word text, pos text, senses jsonb, ipa text, audio_url text, source text)
       on conflict (word, pos) do update set
         senses = excluded.senses,
         ipa = excluded.ipa,
         audio_url = excluded.audio_url,
         source = excluded.source,
         updated_at = now()`,
      [JSON.stringify(batch)],
    );
    written += batch.length;
  }
  return written;
}

async function main() {
  const args = process.argv.slice(2);
  const inputIdx = args.indexOf("--input");
  const outIdx = args.indexOf("--out");
  const write = args.includes("--write");
  if (inputIdx === -1 || !args[inputIdx + 1]) {
    console.error("usage: --input <vi-extract.jsonl> [--out entries.jsonl] [--write]");
    process.exit(1);
  }
  const outPath = outIdx === -1 ? null : args[outIdx + 1];
  if (write && !process.env.DATABASE_URL) {
    console.error("--write requires DATABASE_URL");
    process.exit(1);
  }

  const rl = createInterface({ input: createReadStream(args[inputIdx + 1]) });
  const kept: DictionaryEntry[] = [];
  let lines = 0, enSeen = 0, dropped = 0;
  for await (const line of rl) {
    lines++;
    let raw: KaikkiRaw;
    try {
      raw = JSON.parse(line);
    } catch {
      continue;
    }
    if (raw.lang_code !== "en") continue;
    enSeen++;
    const entry = transformKaikkiEntry(raw);
    if (!entry) {
      dropped++;
      continue;
    }
    kept.push(entry);
  }
  const merged = dedupeEntries(kept);

  const glosses = merged.reduce((n, e) => n + e.senses.reduce((m, s) => m + s.glosses.length, 0), 0);
  console.log(
    `lines=${lines} en_entries=${enSeen} kept=${merged.length} dup_merged=${kept.length - merged.length} dropped=${dropped} total_glosses=${glosses}`,
  );
  console.log(
    `with_ipa=${merged.filter((e) => e.ipa).length} with_audio=${merged.filter((e) => e.audio_url).length}`,
  );

  if (outPath) {
    const { writeFileSync } = await import("node:fs");
    writeFileSync(outPath, merged.map((e) => JSON.stringify(e)).join("\n") + "\n");
    console.log(`wrote ${outPath}`);
  }
  if (write) {
    const n = await writeToDb(merged, process.env.DATABASE_URL as string);
    console.log(`inserted/updated ${n} rows`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
