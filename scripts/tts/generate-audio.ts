/**
 * Pre-generate Aura-2 (Workers AI) speech for every fixed English string in
 * the lesson corpus and upload to the AUDIO_KV namespace. /api/audio serves
 * those keys; the client falls back to browser TTS for anything missing.
 *
 * Usage:
 *   npx tsx scripts/tts/generate-audio.ts --dry-run   # corpus stats only
 *   npx tsx scripts/tts/generate-audio.ts             # generate + upload
 *   npx tsx scripts/tts/generate-audio.ts --limit 20  # partial run
 *
 * Auth: CLOUDFLARE_API_TOKEN, else the cf CLI OAuth token in
 * ~/.config/cloudflare/config/default.json (run `npx cf auth whoami` first
 * so cf refreshes it if expired).
 */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  audioKeyForText,
  AUDIO_KEY_PREFIX,
  MAX_TTS_TEXT_CHARS,
} from "@/lib/ai/audio-key";
import {
  legacyUnitEntry,
  legacyUnitSlugs,
} from "@/lib/lessons/legacy-unit-registry";
import { looksEnglish } from "@/lib/speech";

const ACCOUNT_ID =
  process.env.CLOUDFLARE_ACCOUNT_ID ?? "6b09234492f82347abfe983b158626b2";
const KV_NAMESPACE_ID = "113dff2180e249c589f2f3c949abb178";
const MODEL = "@cf/deepgram/aura-2-en";
const SPEAKER = "luna";

// Field names that are never voiced model text — Vietnamese copy, metadata,
// routes and enums. Anything else that looksEnglish() accepts is voiced.
const SKIP_KEYS = new Set([
  "id",
  "unitId",
  "schemaVersion",
  "title",
  "badgeName",
  "badgeEmoji",
  "speaker",
  "level",
  "route",
  "next",
  "tags",
  "emoji",
  "phonetic",
  "image_url",
  "audio",
  "shadowingVideoId",
  "type",
  "lemmaKey",
  "meaning",
  "meaning_vn",
  "translation",
  "desc",
  "description",
  "culturalNote",
  "context",
  "l1Note",
  "l1_interference_vn",
  "explanation_vn",
  "prompt_vn",
  "focus",
  "situation",
  "learningOutcomes",
]);

// Strings that pass looksEnglish but aren't speakable learner text —
// quoted labels ('Point'), meta examples ('word' = :), asset paths
// (/audio/x.mp3), notation (+ V-ing), mixed glosses.
const NON_SPEECH = /^['"“‘/]| = | vs |\btrong\b|\bhay\b|\.mp3$|^[-+]\s|^-\w+ /;

function collectTexts(value: unknown, key: string | null, out: Set<string>) {
  if (typeof value === "string") {
    const v = value.trim();
    if (
      key !== null &&
      !SKIP_KEYS.has(key) &&
      v.length <= MAX_TTS_TEXT_CHARS &&
      looksEnglish(v) &&
      !NON_SPEECH.test(v)
    ) {
      out.add(v);
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectTexts(item, key, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) collectTexts(v, k, out);
  }
}

/**
 * Corpus ordered by learner priority: A0 + early A1 units first — the near-A0
 * beginners this product targets — so a daily free-tier neuron budget fills
 * the highest-value audio first across reruns (existing keys are skipped).
 */
function corpus(): Set<string> {
  const priority = (slug: string) => {
    if (slug.startsWith("unit-a0-")) return 0;
    const n = Number(slug.replace("unit-", ""));
    if (n <= 12) return 1;
    if (n <= 18) return 2;
    return 3;
  };
  const texts = new Set<string>();
  for (const slug of [...legacyUnitSlugs()].sort(
    (a, b) => priority(a) - priority(b) || a.localeCompare(b),
  )) {
    const entry = legacyUnitEntry(slug);
    if (entry) collectTexts(entry.data, null, texts);
  }
  texts.delete("");
  return texts;
}

function cfToken(): string {
  if (process.env.CLOUDFLARE_API_TOKEN) return process.env.CLOUDFLARE_API_TOKEN;
  const cfg = join(homedir(), ".config/cloudflare/config/default.json");
  const token = (
    JSON.parse(readFileSync(cfg, "utf8")) as { oauth_token?: string }
  ).oauth_token;
  if (!token)
    throw new Error(`No oauth_token in ${cfg} — run: npx cf auth login`);
  return token;
}

async function existingKeys(token: string): Promise<Set<string>> {
  const keys = new Set<string>();
  let cursor: string | undefined;
  do {
    const url = new URL(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/keys`,
    );
    url.searchParams.set("prefix", `${AUDIO_KEY_PREFIX}/`);
    url.searchParams.set("limit", "1000");
    if (cursor) url.searchParams.set("cursor", cursor);
    const res = await fetch(url, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (!res.ok)
      throw new Error(`KV list failed: ${res.status} ${await res.text()}`);
    const json = (await res.json()) as {
      result: Array<{ name: string }>;
      result_info?: { cursor?: string };
    };
    for (const k of json.result) keys.add(k.name);
    cursor = json.result_info?.cursor || undefined;
  } while (cursor);
  return keys;
}

async function synthesize(token: string, text: string): Promise<ArrayBuffer> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${MODEL}`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ text, speaker: SPEAKER, encoding: "mp3" }),
    },
  );
  if (!res.ok) throw new Error(`aura-2 ${res.status}: ${await res.text()}`);
  return res.arrayBuffer();
}

async function upload(token: string, key: string, body: ArrayBuffer) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`,
    {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/octet-stream",
      },
      body,
    },
  );
  if (!res.ok)
    throw new Error(`KV put ${key}: ${res.status} ${await res.text()}`);
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const limitIdx = process.argv.indexOf("--limit");
  const limit = limitIdx >= 0 ? Number(process.argv[limitIdx + 1]) : Infinity;

  const texts = [...corpus()].sort();
  const totalChars = texts.reduce((n, t) => n + t.length, 0);
  console.log(
    `corpus: ${texts.length} strings, ${totalChars} chars, ` +
      `~$${((totalChars / 1000) * 0.03).toFixed(2)} Aura-2 list price`,
  );
  if (args.has("--dry-run")) {
    console.log(texts.slice(0, 30).join("\n"));
    return;
  }

  const token = cfToken();
  const existing = await existingKeys(token);
  const pending = texts.slice(0, limit);
  let generated = 0;
  let failed = 0;
  let next = 0;

  const WORKERS = 4;
  async function worker() {
    while (next < pending.length) {
      const text = pending[next++];
      const key = await audioKeyForText(text);
      if (existing.has(key)) continue;
      try {
        const audio = await synthesize(token, text);
        await upload(token, key, audio);
        generated += 1;
        if (generated % 50 === 0) console.log(`${generated} generated...`);
      } catch (err) {
        // Daily free-tier neurons exhausted → further calls all 429; stop
        // fast instead of burning minutes on guaranteed failures.
        if (err instanceof Error && err.message.includes("429")) {
          console.error(
            "aura-2 quota exhausted (429) — stopping; rerun tomorrow or upgrade to Workers Paid",
          );
          next = pending.length;
          return;
        }
        failed += 1;
        console.error(`FAIL ${key} ${JSON.stringify(text.slice(0, 60))}:`, err);
      }
    }
  }
  await Promise.all(Array.from({ length: WORKERS }, () => worker()));
  console.log(
    `done: ${generated} generated, ${existing.size + generated} total in KV, ` +
      `${failed} failed, ${texts.length - pending.length} not attempted`,
  );
  if (failed > 0) process.exitCode = 1;
}

await main();
