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
  if (word.length > 120 || !word.trim()) return null;

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
  const preferredIpa =
    sounds.find((s) => s.ipa && s.tags?.some((t) => /^(us|uk|rp)$/i.test(t)))?.ipa ??
    sounds.find((s) => s.ipa)?.ipa;
  const audioUrl = sounds.find((s) => s.mp3_url?.startsWith("https://"))?.mp3_url;

  return {
    word,
    pos: raw.pos.toLowerCase(),
    senses,
    ...(preferredIpa ? { ipa: preferredIpa } : {}),
    ...(audioUrl ? { audio_url: audioUrl } : {}),
    source: "viwiktionary",
  };
}

const WRITE_BATCH = 200;

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

  const glosses = kept.reduce((n, e) => n + e.senses.reduce((m, s) => m + s.glosses.length, 0), 0);
  console.log(
    `lines=${lines} en_entries=${enSeen} kept=${kept.length} dropped=${dropped} total_glosses=${glosses}`,
  );
  console.log(
    `with_ipa=${kept.filter((e) => e.ipa).length} with_audio=${kept.filter((e) => e.audio_url).length}`,
  );

  if (outPath) {
    const { writeFileSync } = await import("node:fs");
    writeFileSync(outPath, kept.map((e) => JSON.stringify(e)).join("\n") + "\n");
    console.log(`wrote ${outPath}`);
  }
  if (write) {
    const n = await writeToDb(kept, process.env.DATABASE_URL as string);
    console.log(`inserted/updated ${n} rows`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
