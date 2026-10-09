/**
 * DB-backed tier-1 dictionary lookup over `dictionary_entries`
 * (Kaikki/viwiktionary rows loaded by scripts/dict-import-kaikki.ts).
 *
 * This is the wide-coverage sibling of `lookupGloss`: the curated
 * VOCABULARY_ENTRIES map stays the first choice (hand-checked learner
 * glosses), and this lookup answers the long tail it misses.
 *
 * Resolution order — the rules propose, the dictionary disposes:
 *   1. exact `word` match;
 *   2. conservative inflection candidates from gloss.ts;
 *   3. one `form_of` hop — e.g. `children` carries form_of→`child`, so the
 *      parent's senses are returned and `lemma` records the hop.
 *
 * Misses return `null`; callers must keep honest "chưa có nghĩa" behaviour.
 */
import { inflectionCandidates } from "@/lib/read/gloss";

export interface DictionarySense {
  glosses: string[];
  examples?: { text: string; translation?: string }[];
  form_of?: string[];
}

export interface DictionaryRow {
  word: string;
  pos: string;
  senses: DictionarySense[];
  ipa: string | null;
  audio_url: string | null;
}

export interface DictionaryEntry {
  /** Headword of the matched row. */
  word: string;
  /** Parent headword when resolved through form_of or an inflection rule. */
  lemma?: string;
  meaning_vn: string;
  phonetic?: string;
  part_of_speech?: string;
  example_en?: string;
  example_vn?: string;
  audio_url?: string;
  senses: { pos: string; glosses: string[] }[];
}

/**
 * Minimal query surface both the Supabase/Neon server client and test fakes
 * satisfy — same structural-typing pattern as TranscriptStore. PostgREST
 * builders are thenables, not Promises.
 */
export interface DictionaryStore {
  from(table: "dictionary_entries"): {
    select(columns: string): {
      in(column: "word", values: string[]): PromiseLike<{ data: unknown }>;
    };
  };
}

const SELECT_COLUMNS = "word, pos, senses, ipa, audio_url";

async function fetchRows(
  store: DictionaryStore,
  words: string[],
): Promise<DictionaryRow[]> {
  if (words.length === 0) return [];
  const { data } = await store
    .from("dictionary_entries")
    .select(SELECT_COLUMNS)
    .in("word", words);
  return Array.isArray(data) ? (data as DictionaryRow[]) : [];
}

function collectFormOf(row: DictionaryRow): string[] {
  const parents = new Set<string>();
  for (const sense of row.senses)
    for (const parent of sense.form_of ?? []) parents.add(parent);
  return [...parents];
}

function toEntry(rows: DictionaryRow[], hitWord: string): DictionaryEntry | null {
  const usable = rows.filter((r) =>
    r.senses.some((s) => s.glosses.length > 0 || (s.form_of ?? []).length > 0),
  );
  if (usable.length === 0) return null;
  const senses = usable.map((r) => ({
    pos: r.pos,
    glosses: r.senses.flatMap((s) => s.glosses),
  }));
  const glosses = senses.flatMap((s) => s.glosses);
  const first = usable[0];
  const example = usable
    .flatMap((r) => r.senses)
    .flatMap((s) => s.examples ?? [])
    .find((ex) => ex.text);
  return {
    word: hitWord,
    meaning_vn: glosses.slice(0, 4).join("; "),
    senses,
    ...(first.ipa ? { phonetic: first.ipa } : {}),
    part_of_speech: usable.map((r) => r.pos).join(", "),
    ...(first.audio_url ? { audio_url: first.audio_url } : {}),
    ...(example
      ? {
          example_en: example.text,
          ...(example.translation ? { example_vn: example.translation } : {}),
        }
      : {}),
  };
}

export async function lookupDictionary(
  normalizedWord: string,
  store: DictionaryStore,
): Promise<DictionaryEntry | null> {
  const candidates = [
    normalizedWord,
    ...inflectionCandidates(normalizedWord),
  ];
  const rows = await fetchRows(store, candidates);
  if (rows.length === 0) return null;

  // Candidate order encodes preference: exact surface form first.
  const hit = candidates
    .map((w) => rows.filter((r) => r.word === w))
    .find((rs) => rs.length > 0);
  if (!hit) return null;

  let lemma =
    hit[0].word === normalizedWord ? undefined : hit[0].word;
  let entry = toEntry(hit, hit[0].word);

  // form_of hop: an inflected headword whose senses point elsewhere
  // (e.g. `children` → `child`) should surface the parent's meanings.
  const parents = collectFormOf(hit[0]).filter((w) => w !== normalizedWord);
  if (parents.length > 0) {
    const parentWithGloss = (await fetchRows(store, parents)).filter((r) =>
      r.senses.some((s) => s.glosses.length > 0),
    );
    if (parentWithGloss.length > 0) {
      lemma = lemma ?? parentWithGloss[0].word;
      const hitHasGlosses = hit[0].senses.some((s) => s.glosses.length > 0);
      entry = toEntry(
        hitHasGlosses ? [...hit, ...parentWithGloss] : parentWithGloss,
        hit[0].word,
      );
    }
  }

  return entry ? { ...entry, ...(lemma ? { lemma } : {}) } : null;
}
