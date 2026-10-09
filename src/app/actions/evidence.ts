"use server";

import { createClient } from "@/lib/supabase/server";

// ─── Evidence view (SPEC §9) ──────────────────────────────────────────────────
// Four tiers, each with an explicit denominator — never a proficiency claim:
//   1. Gặp            — saved items + watched videos (exposure only)
//   2. Có hỗ trợ       — recall/sentence_meaning Good|Easy on due cards, and
//                       dictation passes that needed hints
//   3. Độc lập         — listen_fill correct, dictation ≥90% without hints,
//                       write_reuse submitted
//   4. Nhớ xa          — Good|Easy on reps whose prior interval was ≥7 days
// "Level 5" (real-world reuse) is unmeasurable in-product — absent on purpose.

/** Attempt-row cap for the aggregate — a fetch bound, not a product limit. */
const EVIDENCE_ATTEMPT_LIMIT = 5000;
const DELAYED_INTERVAL_DAYS = 7;

interface AttemptRow {
  mode: string;
  rating: number | null;
  correct: boolean | null;
  word_accuracy: number | null;
  hints_used: number;
  interval_days_before: number | null;
  fsrs_before: { due?: string | null } | null;
  created_at: string;
}

interface Ratio {
  numerator: number;
  denominator: number;
}

export interface EvidenceData {
  exposure: { saved_items: number; videos_watched: number };
  supported: { due_rated: Ratio; dictation_with_hints: Ratio };
  independent: {
    listen_fill: Ratio;
    dictation_clean: Ratio;
    write_reuse: Ratio;
  };
  delayed: { good_easy_after_7d: Ratio };
}

export type EvidenceResult =
  | { ok: true; data: EvidenceData }
  | { ok: false; error: "unauthorized" | "load_failed" };

export async function getEvidence(): Promise<EvidenceResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const { count: savedCount, error: savedError } = await supabase
    .from("study_cards")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  const { count: videoCount, error: videoError } = await supabase
    .from("content_sources")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("kind", "youtube")
    .gt("last_position_ms", 0);
  const { data: attemptRows, error: attemptError } = await supabase
    .from("practice_attempts")
    .select(
      "mode,rating,correct,word_accuracy,hints_used,interval_days_before,fsrs_before,created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(EVIDENCE_ATTEMPT_LIMIT);
  if (savedError || videoError || attemptError || !attemptRows)
    return { ok: false, error: "load_failed" };

  const attempts = attemptRows as unknown as AttemptRow[];

  // ── Tier 2: with support ──
  // A self-rated attempt counts as "due" when the card was actually due: its
  // fsrs_before.due is null (new) or at/before the attempt's timestamp.
  const dueRated = attempts.filter(
    (a) =>
      (a.mode === "recall" || a.mode === "sentence_meaning") &&
      a.fsrs_before != null &&
      (a.fsrs_before.due == null ||
        new Date(a.fsrs_before.due).getTime() <=
          new Date(a.created_at).getTime()),
  );
  const dictationAttempts = attempts.filter(
    (a) => a.mode === "sentence_dictation",
  );

  // ── Tier 3: independent ──
  const listenFillAttempts = attempts.filter((a) => a.mode === "listen_fill");
  const writeReuseAttempts = attempts.filter((a) => a.mode === "write_reuse");

  // ── Tier 4: delayed recall — reps separated by ≥7 days of real time ──
  const delayedAttempts = attempts.filter(
    (a) =>
      a.interval_days_before != null &&
      a.interval_days_before >= DELAYED_INTERVAL_DAYS,
  );

  return {
    ok: true,
    data: {
      exposure: {
        saved_items: savedCount ?? 0,
        videos_watched: videoCount ?? 0,
      },
      supported: {
        due_rated: {
          numerator: dueRated.filter((a) => (a.rating ?? 0) >= 3).length,
          denominator: dueRated.length,
        },
        dictation_with_hints: {
          numerator: dictationAttempts.filter(
            (a) => (a.word_accuracy ?? 0) >= 0.9 && (a.hints_used ?? 0) > 0,
          ).length,
          denominator: dictationAttempts.length,
        },
      },
      independent: {
        listen_fill: {
          numerator: listenFillAttempts.filter((a) => a.correct === true)
            .length,
          denominator: listenFillAttempts.length,
        },
        dictation_clean: {
          numerator: dictationAttempts.filter(
            (a) => (a.word_accuracy ?? 0) >= 0.9 && (a.hints_used ?? 0) === 0,
          ).length,
          denominator: dictationAttempts.length,
        },
        write_reuse: {
          // Submission itself is the independent-use evidence.
          numerator: writeReuseAttempts.length,
          denominator: writeReuseAttempts.length,
        },
      },
      delayed: {
        good_easy_after_7d: {
          numerator: delayedAttempts.filter((a) => (a.rating ?? 0) >= 3).length,
          denominator: delayedAttempts.length,
        },
      },
    },
  };
}
