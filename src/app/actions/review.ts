"use server";

import { z } from "zod";

import {
  autoRating,
  isGradedMode,
  pickPracticeMode,
  PRACTICE_MODES,
  ratingLabel,
  type PracticeMode,
} from "@/lib/srs/practice";
import { reviewStudyCard, type StudyCardSchedule } from "@/lib/srs/fsrs";
import { createClient } from "@/lib/supabase/server";

// ─── C3: review queue + practice attempts ─────────────────────────────────────
// getReviewQueue returns due study cards with their newest context (the cue
// sentence) and the owning source for the /watch?t= deep link. New cards
// (due IS NULL) are due by definition; overdue cards rank ahead of them —
// retention first, then fresh material, Anki-style.
//
// recordPracticeAttempt appends one practice_attempts row per rep. Graded
// modes (recall/sentence_meaning self-rated; listen_fill/sentence_dictation
// auto-graded from evidence) also reschedule the card through FSRS;
// speak_repeat/write_reuse only log. Attempt inserts run BEFORE the card
// update: a failed update leaves an honest log and a retry recomputes from
// the same card state, while the reverse order would let a retry double-apply
// FSRS to an already-advanced schedule.

/** Session batch size — a fetch bound, not a product limit. */
const REVIEW_BATCH_SIZE = 50;

const cardScheduleCols =
  "id,kind,key,display,meaning_vi,meaning_origin,state,stability,difficulty,elapsed_days,scheduled_days,learning_steps,reps,lapses,due,last_review";

interface CardRow extends StudyCardSchedule {
  id: number;
  kind: "word" | "phrase" | "sentence";
  key: string;
  display: string;
  meaning_vi: string | null;
  meaning_origin: string | null;
}

interface ContextRow {
  card_id: number;
  source_id: number | null;
  sentence_index: number;
  token_start: number | null;
  token_count: number | null;
  sentence_text: string;
  sentence_vi: string | null;
  start_ms: number | null;
  end_ms: number | null;
  created_at: string;
}

interface SourceRow {
  id: number;
  kind: string;
  external_id: string;
  title: string | null;
}

export interface ReviewQueueItem {
  card_id: number;
  kind: "word" | "phrase" | "sentence";
  key: string;
  display: string;
  meaning_vi: string | null;
  meaning_origin: string | null;
  state: number;
  mode: PracticeMode;
  context: {
    sentence_text: string;
    sentence_vi: string | null;
    token_start: number | null;
    token_count: number | null;
    start_ms: number | null;
    end_ms: number | null;
    video_id: string | null;
    source_title: string | null;
  } | null;
}

export type ReviewQueueResult =
  | { ok: true; items: ReviewQueueItem[]; total_due: number }
  | { ok: false; error: "unauthorized" | "load_failed" };

export async function getReviewQueue(): Promise<ReviewQueueResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const { data: cards, error } = await supabase
    .from("study_cards")
    .select(cardScheduleCols)
    .eq("user_id", user.id)
    .or(`due.is.null,due.lte.${new Date().toISOString()}`)
    .order("due", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true })
    .limit(REVIEW_BATCH_SIZE);
  if (error || !cards) return { ok: false, error: "load_failed" };
  const rows = cards as unknown as CardRow[];
  if (!rows.length) return { ok: true, items: [], total_due: 0 };

  // Latest context per card supplies the cue sentence and the deep link.
  const cardIds = rows.map((card) => card.id);
  const { data: contexts } = await supabase
    .from("card_contexts")
    .select(
      "card_id,source_id,sentence_index,token_start,token_count,sentence_text,sentence_vi,start_ms,end_ms,created_at",
    )
    .in("card_id", cardIds)
    .order("created_at", { ascending: false });
  const contextByCard = new Map<number, ContextRow>();
  for (const context of (contexts ?? []) as unknown as ContextRow[]) {
    if (!contextByCard.has(context.card_id))
      contextByCard.set(context.card_id, context);
  }

  const sourceIds = [
    ...new Set(
      [...contextByCard.values()]
        .map((context) => context.source_id)
        .filter((id): id is number => id != null),
    ),
  ];
  const { data: sources } = sourceIds.length
    ? await supabase
        .from("content_sources")
        .select("id,kind,external_id,title")
        .in("id", sourceIds)
    : { data: [] };
  const sourceById = new Map<number, SourceRow>(
    ((sources ?? []) as unknown as SourceRow[]).map((s) => [s.id, s]),
  );

  const items: ReviewQueueItem[] = rows.map((card) => {
    const context = contextByCard.get(card.id) ?? null;
    const source = context?.source_id
      ? sourceById.get(context.source_id)
      : undefined;
    const videoId =
      source?.kind === "youtube" && context?.start_ms != null
        ? source.external_id
        : null;
    return {
      card_id: card.id,
      kind: card.kind,
      key: card.key,
      display: card.display,
      meaning_vi: card.meaning_vi,
      meaning_origin: card.meaning_origin,
      state: card.state,
      // Audio modes land with the review segment player; until then every
      // state takes the self-rated base mode (spec §8 keeps them valid).
      mode: pickPracticeMode(card.kind, card.state, false),
      context: context
        ? {
            sentence_text: context.sentence_text,
            sentence_vi: context.sentence_vi,
            token_start: context.token_start,
            token_count: context.token_count,
            start_ms: context.start_ms,
            end_ms: context.end_ms,
            video_id: videoId,
            source_title: source?.title ?? null,
          }
        : null,
    };
  });
  return { ok: true, items, total_due: items.length };
}

const attemptSchema = z
  .object({
    card_id: z.number().int().positive(),
    mode: z.enum(PRACTICE_MODES),
    rating: z.number().int().min(1).max(4).optional(),
    correct: z.boolean().optional(),
    word_accuracy: z.number().min(0).max(1).optional(),
    hints_used: z.number().int().nonnegative().optional(),
    plays: z.number().int().nonnegative().optional(),
    similarity: z.number().min(0).max(1).optional(),
    learner_text: z.string().trim().max(2000).optional(),
    source_id: z.number().int().positive().optional(),
    sentence_index: z.number().int().nonnegative().optional(),
  })
  .strict()
  .superRefine((input, ctx) => {
    // Graded modes must carry their evidence; the server derives or consumes
    // the rating so the client can never self-declare a schedule.
    if (input.mode === "recall" || input.mode === "sentence_meaning") {
      if (input.rating == null)
        ctx.addIssue({ code: "custom", message: "rating required" });
    } else if (input.mode === "listen_fill") {
      if (input.correct == null)
        ctx.addIssue({ code: "custom", message: "correct required" });
    } else if (input.mode === "sentence_dictation") {
      if (input.word_accuracy == null)
        ctx.addIssue({ code: "custom", message: "word_accuracy required" });
    }
  });

export type RecordAttemptResult =
  | { ok: true; attempt_id: number; due: string | null; state: number }
  | {
      ok: false;
      error: "invalid_input" | "unauthorized" | "not_found" | "save_failed";
    };

export async function recordPracticeAttempt(
  raw: unknown,
): Promise<RecordAttemptResult> {
  const parsed = attemptSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const input = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const { data: cardRow } = await supabase
    .from("study_cards")
    .select(cardScheduleCols)
    .eq("id", input.card_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!cardRow) return { ok: false, error: "not_found" };
  const card = cardRow as unknown as CardRow;

  // The rating comes from evidence, never verbatim: self-rated modes consume
  // the learner's 1–4 choice, auto-graded modes derive it server-side, and
  // speak_repeat/write_reuse keep it null — a client-supplied rating on a
  // non-graded mode is dropped so the log never claims a grade FSRS didn't
  // apply.
  let rating: "Again" | "Hard" | "Good" | "Easy" | null = null;
  if (input.mode === "recall" || input.mode === "sentence_meaning") {
    rating = ratingLabel(input.rating ?? -1);
    if (!rating) return { ok: false, error: "invalid_input" };
  } else if (input.mode === "listen_fill" || input.mode === "sentence_dictation") {
    rating = autoRating(input.mode, input);
    if (!rating) return { ok: false, error: "invalid_input" };
  }
  const ratingValue = rating
    ? { Again: 1, Hard: 2, Good: 3, Easy: 4 }[rating]
    : null;

  const before: StudyCardSchedule = {
    state: card.state,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    due: card.due,
    last_review: card.last_review,
  };
  const graded = isGradedMode(input.mode) && rating != null;
  const outcome = graded ? reviewStudyCard(before, rating!) : null;

  const { data: attempt, error: attemptError } = await supabase
    .from("practice_attempts")
    .insert({
      user_id: user.id,
      card_id: card.id,
      source_id: input.source_id ?? null,
      sentence_index: input.sentence_index ?? null,
      mode: input.mode,
      rating: ratingValue,
      correct: input.correct ?? null,
      word_accuracy: input.word_accuracy ?? null,
      hints_used: input.hints_used ?? 0,
      plays: input.plays ?? 0,
      similarity: input.similarity ?? null,
      learner_text: input.learner_text ?? null,
      // The interval that elapsed before this rep — the ≥7-day evidence bar
      // in spec §9 keys off this number.
      interval_days_before: outcome
        ? Math.max(0, Math.round(outcome.reviewLog.elapsed_days))
        : null,
      fsrs_before: outcome ? before : null,
      fsrs_after: outcome ? outcome.patch : null,
    })
    .select("id")
    .single();
  if (attemptError || !attempt) return { ok: false, error: "save_failed" };

  if (outcome) {
    const { error: updateError } = await supabase
      .from("study_cards")
      .update({ ...outcome.patch, updated_at: new Date().toISOString() })
      .eq("id", card.id)
      .eq("user_id", user.id);
    if (updateError) return { ok: false, error: "save_failed" };
  }

  return {
    ok: true,
    attempt_id: (attempt as { id: number }).id,
    due: outcome ? outcome.patch.due : card.due,
    state: outcome ? outcome.patch.state : card.state,
  };
}
