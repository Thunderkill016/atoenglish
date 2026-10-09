"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { YOUTUBE_VIDEO_ID_RE } from "@/lib/video/youtube-url";

// ─── C2: idempotent save for word / phrase / sentence ─────────────────────────
// One card per (learner, kind, normalized key); each save appends the exact
// encounter to card_contexts (dedupe unique, so re-saving the same cue is a
// no-op, never an error). Meaning columns are never overwritten by an absent
// value: a re-save without a meaning keeps the stored one.

const contextSchema = z
  .object({
    // Callers pass either a YouTube video_id (the action upserts the
    // content_sources row) or an existing source_id owned by the learner.
    video_id: z.string().regex(YOUTUBE_VIDEO_ID_RE).optional(),
    source_id: z.number().int().positive().optional(),
    // Optional metadata for the upsert when video_id is first seen.
    title: z.string().trim().max(300).optional(),
    channel: z.string().trim().max(200).optional(),
    duration_ms: z.number().int().nonnegative().optional(),
    sentence_index: z.number().int().nonnegative(),
    token_start: z.number().int().nonnegative().optional(),
    token_count: z.number().int().positive().optional(),
    sentence_text: z.string().trim().min(1).max(2000),
    sentence_vi: z.string().trim().max(2000).optional(),
    start_ms: z.number().int().nonnegative().optional(),
    end_ms: z.number().int().nonnegative().optional(),
    origin: z.enum(["watch_lookup", "read_lookup", "manual", "import"]),
  })
  .strict();

const inputSchema = z
  .object({
    kind: z.enum(["word", "phrase", "sentence"]),
    key: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .transform((s) => s.toLowerCase()),
    display: z.string().trim().min(1).max(300),
    meaning_vi: z.string().trim().min(1).max(2000).optional(),
    meaning_origin: z
      .enum(["dictionary", "ai", "youtube_vi", "learner"])
      .optional(),
    context: contextSchema,
  })
  .strict();

export type SaveStudyItemResult =
  | {
      ok: true;
      card_id: number;
      card_created: boolean;
      context_created: boolean;
    }
  | {
      ok: false;
      error:
        | "invalid_input"
        | "unauthorized"
        | "invalid_context"
        | "save_failed";
    };

export async function saveStudyItem(
  raw: unknown,
): Promise<SaveStudyItemResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const input = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  // Resolve the source row the context anchors to. A caller-supplied
  // source_id must belong to this learner — RLS would hide foreign rows and
  // produce a confusing "not found" anyway, so check explicitly for a clear
  // error instead of a silent null anchor.
  let sourceId: number | null = null;
  if (input.context.video_id) {
    const { data: source, error } = await supabase
      .from("content_sources")
      .upsert(
        {
          user_id: user.id,
          kind: "youtube",
          external_id: input.context.video_id,
          title: input.context.title ?? null,
          channel: input.context.channel ?? null,
          duration_ms: input.context.duration_ms ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,kind,external_id" },
      )
      .select("id")
      .single();
    if (error || !source) return { ok: false, error: "save_failed" };
    sourceId = (source as { id: number }).id;
  } else if (input.context.source_id !== undefined) {
    const { data: owned } = await supabase
      .from("content_sources")
      .select("id")
      .eq("id", input.context.source_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!owned) return { ok: false, error: "invalid_context" };
    sourceId = input.context.source_id;
  }

  // Card: select-then-insert/update so an absent meaning never clobbers a
  // stored one. The unique (user_id, kind, key) constraint keeps concurrent
  // saves collapsing to one card.
  const { data: existing } = await supabase
    .from("study_cards")
    .select("id")
    .eq("user_id", user.id)
    .eq("kind", input.kind)
    .eq("key", input.key)
    .maybeSingle();

  let cardId: number;
  let cardCreated = false;
  if (existing) {
    cardId = (existing as { id: number }).id;
    const patch: Record<string, unknown> = {
      display: input.display,
      updated_at: new Date().toISOString(),
    };
    if (input.meaning_vi) patch.meaning_vi = input.meaning_vi;
    if (input.meaning_origin) patch.meaning_origin = input.meaning_origin;
    const { error } = await supabase
      .from("study_cards")
      .update(patch)
      .eq("id", cardId)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: "save_failed" };
  } else {
    const { data: inserted, error } = await supabase
      .from("study_cards")
      .insert({
        user_id: user.id,
        kind: input.kind,
        key: input.key,
        display: input.display,
        meaning_vi: input.meaning_vi ?? null,
        meaning_origin: input.meaning_origin ?? null,
      })
      .select("id")
      .single();
    if (error && (error as { code?: string }).code === "23505") {
      // Concurrent first-save won the insert — adopt the existing card.
      const { data: raced } = await supabase
        .from("study_cards")
        .select("id")
        .eq("user_id", user.id)
        .eq("kind", input.kind)
        .eq("key", input.key)
        .maybeSingle();
      if (!raced) return { ok: false, error: "save_failed" };
      cardId = (raced as { id: number }).id;
    } else if (error || !inserted) {
      return { ok: false, error: "save_failed" };
    } else {
      cardId = (inserted as { id: number }).id;
      cardCreated = true;
    }
  }

  const { data: context, error: contextError } = await supabase
    .from("card_contexts")
    .insert({
      user_id: user.id,
      card_id: cardId,
      source_id: sourceId,
      sentence_index: input.context.sentence_index,
      token_start: input.context.token_start ?? null,
      token_count: input.context.token_count ?? null,
      sentence_text: input.context.sentence_text,
      sentence_vi: input.context.sentence_vi ?? null,
      start_ms: input.context.start_ms ?? null,
      end_ms: input.context.end_ms ?? null,
      context_origin: input.context.origin,
    })
    .select("id")
    .single();

  // The dedupe unique constraint reports 23505 through PostgREST — a repeat
  // save is idempotent, not an error.
  const contextDuplicate =
    contextError &&
    (contextError as { code?: string }).code === "23505";
  if (contextError && !contextDuplicate)
    return { ok: false, error: "save_failed" };

  return {
    ok: true,
    card_id: cardId,
    card_created: cardCreated,
    context_created: !contextDuplicate,
  };
}
