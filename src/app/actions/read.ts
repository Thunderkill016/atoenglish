"use server";

import { headers } from "next/headers";

import { createRateLimiter } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";
import type { LearnerKnownWordRow } from "@/types/learning-tables";

/**
 * Reading-surface word-state boundary.
 *
 * `learner_known_words` rows are self-reported knowledge — NOT assessed
 * evidence. They never feed `learning_attempts`, evidence certification or
 * review derivation (spec-008 contract invariant 2).
 *
 * Anonymous callers always get `signedIn: false` / a refusal — there is no
 * half-personalised local state presented as durable.
 */

export type WordStatus = "learning" | "known";

export type ReadWordStatesResult =
  | { readonly signedIn: false }
  | { readonly signedIn: true; readonly states: Record<string, WordStatus> };

export type ReadWriteResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: "rate-limited" | "invalid" | "unauthenticated" | "storage";
    };

export type ReadWordCounts =
  | { readonly signedIn: false }
  | { readonly signedIn: true; readonly known: number; readonly learning: number };

type WordsTableClient = {
  from(table: "learner_known_words"): {
    select(columns: string): {
      in(column: string, values: readonly string[]): PromiseLike<{
        data: readonly { word: string; status: WordStatus }[] | null;
        error: { message: string } | null;
      }>;
      eq(
        column: string,
        value: unknown,
      ): PromiseLike<{ data: readonly { status: WordStatus }[] | null; error: { message: string } | null }>;
    };
    upsert(
      row: { user_id: string; word: string; status: WordStatus },
      options: { onConflict: string },
    ): PromiseLike<{ error: { message: string } | null }>;
    delete(): {
      eq(
        column: string,
        value: unknown,
      ): {
        eq(
          column: string,
          value: unknown,
        ): PromiseLike<{ error: { message: string } | null }>;
      };
    };
  };
};

const readLimiter = createRateLimiter(240, 60 * 1000, "read-word-state");

const WORD_RE = /^[a-z]+(?:'[a-z]+)*$/;
const WORD_MAX_LEN = 60;

/** Normalize and validate a client-supplied word; null = invalid input. */
function normalizeInput(word: unknown): string | null {
  if (typeof word !== "string") return null;
  const normalized = word.trim().toLowerCase();
  if (normalized.length === 0 || normalized.length > WORD_MAX_LEN) return null;
  if (!WORD_RE.test(normalized)) return null;
  return normalized;
}

async function limitedRate(): Promise<boolean> {
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
  return (await readLimiter.check(ip)).success;
}

export async function getReadWordStates(
  words: readonly string[],
): Promise<ReadWordStatesResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { signedIn: false };

  const normalized = [...new Set(words.map(normalizeInput).filter((w): w is string => w !== null))];
  if (normalized.length === 0) return { signedIn: true, states: {} };
  const bounded = normalized.slice(0, 2000);

  const { data, error } = await (supabase as unknown as WordsTableClient)
    .from("learner_known_words")
    .select("word, status")
    .in("word", bounded);
  if (error || !data) return { signedIn: true, states: {} };

  const states: Record<string, WordStatus> = {};
  for (const row of data) states[row.word] = row.status;
  return { signedIn: true, states };
}

export async function setReadWordStatus(
  word: string,
  status: WordStatus,
): Promise<ReadWriteResult> {
  if (!(await limitedRate())) return { ok: false, reason: "rate-limited" };
  const normalized = normalizeInput(word);
  if (!normalized || (status !== "learning" && status !== "known")) {
    return { ok: false, reason: "invalid" };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "unauthenticated" };

  const { error } = await (supabase as unknown as WordsTableClient)
    .from("learner_known_words")
    .upsert(
      { user_id: user.id, word: normalized, status },
      { onConflict: "user_id,word" },
    );
  return error ? { ok: false, reason: "storage" } : { ok: true };
}

/** Back to implicit "unknown" — deletes the self-marked row. */
export async function clearReadWordStatus(word: string): Promise<ReadWriteResult> {
  if (!(await limitedRate())) return { ok: false, reason: "rate-limited" };
  const normalized = normalizeInput(word);
  if (!normalized) return { ok: false, reason: "invalid" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "unauthenticated" };

  const { error } = await (supabase as unknown as WordsTableClient)
    .from("learner_known_words")
    .delete()
    .eq("user_id", user.id)
    .eq("word", normalized);
  return error ? { ok: false, reason: "storage" } : { ok: true };
}

export async function getReadWordCounts(): Promise<ReadWordCounts> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { signedIn: false };

  const { data, error } = await (supabase as unknown as WordsTableClient)
    .from("learner_known_words")
    .select("status")
    .eq("user_id", user.id);
  if (error || !data) return { signedIn: true, known: 0, learning: 0 };

  let known = 0;
  let learning = 0;
  for (const row of data as readonly LearnerKnownWordRow[]) {
    if (row.status === "known") known += 1;
    else learning += 1;
  }
  return { signedIn: true, known, learning };
}
