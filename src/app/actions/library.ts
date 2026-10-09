"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

// ─── C5: /library — watched videos + saved items ─────────────────────────────
// One loader per tab group: videos come from content_sources (watch position
// resumes them), saved items from study_cards joined to their newest context
// and owning source for the /watch?t= deep link. Delete/update actions are
// owner-scoped twice — the user_id filter AND the RLS policy — and a source
// delete cascades only that source's card_contexts rows, so cards survive
// when other contexts still anchor them (spec §172).

export interface LibraryVideo {
  source_id: number;
  external_id: string;
  title: string | null;
  channel: string | null;
  last_position_ms: number;
  updated_at: string;
  saved_count: number;
}

export interface LibraryItem {
  card_id: number;
  kind: "word" | "phrase" | "sentence";
  display: string;
  meaning_vi: string | null;
  state: number;
  due: string | null;
  context: {
    sentence_text: string;
    start_ms: number | null;
    video_id: string | null;
    source_title: string | null;
    source_id: number | null;
  } | null;
}

export type LibraryResult =
  | {
      ok: true;
      videos: LibraryVideo[];
      words: LibraryItem[];
      sentences: LibraryItem[];
    }
  | { ok: false; error: "unauthorized" | "load_failed" };

interface SourceRow {
  id: number;
  kind: string;
  external_id: string;
  title: string | null;
  channel: string | null;
  last_position_ms: number;
  updated_at: string;
}

interface CardRow {
  id: number;
  kind: "word" | "phrase" | "sentence";
  display: string;
  meaning_vi: string | null;
  state: number;
  due: string | null;
}

interface ContextRow {
  card_id: number;
  source_id: number | null;
  sentence_text: string;
  start_ms: number | null;
  created_at: string;
}

export async function getLibrary(): Promise<LibraryResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const { data: sourceRows, error: sourceError } = await supabase
    .from("content_sources")
    .select("id,kind,external_id,title,channel,last_position_ms,updated_at")
    .eq("user_id", user.id)
    .eq("kind", "youtube")
    .order("updated_at", { ascending: false });
  if (sourceError || !sourceRows) return { ok: false, error: "load_failed" };
  const sources = sourceRows as unknown as SourceRow[];
  const sourceById = new Map(sources.map((s) => [s.id, s]));

  const { data: cardRows, error: cardError } = await supabase
    .from("study_cards")
    .select("id,kind,display,meaning_vi,state,due")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  if (cardError || !cardRows) return { ok: false, error: "load_failed" };
  const cards = cardRows as unknown as CardRow[];

  const cardIds = cards.map((c) => c.id);
  const { data: contextRows } = cardIds.length
    ? await supabase
        .from("card_contexts")
        .select("card_id,source_id,sentence_text,start_ms,created_at")
        .in("card_id", cardIds)
        .order("created_at", { ascending: false })
    : { data: [] };
  const contexts = (contextRows ?? []) as unknown as ContextRow[];
  const contextByCard = new Map<number, ContextRow>();
  for (const context of contexts) {
    if (!contextByCard.has(context.card_id))
      contextByCard.set(context.card_id, context);
  }

  // Saved-item count per video = distinct cards anchored to that source.
  const savedBySource = new Map<number, Set<number>>();
  for (const context of contexts) {
    if (context.source_id == null) continue;
    const set = savedBySource.get(context.source_id) ?? new Set<number>();
    set.add(context.card_id);
    savedBySource.set(context.source_id, set);
  }

  const videos: LibraryVideo[] = sources.map((s) => ({
    source_id: s.id,
    external_id: s.external_id,
    title: s.title,
    channel: s.channel,
    last_position_ms: s.last_position_ms,
    updated_at: s.updated_at,
    saved_count: savedBySource.get(s.id)?.size ?? 0,
  }));

  const toItem = (card: CardRow): LibraryItem => {
    const context = contextByCard.get(card.id) ?? null;
    const source = context?.source_id
      ? sourceById.get(context.source_id)
      : undefined;
    return {
      card_id: card.id,
      kind: card.kind,
      display: card.display,
      meaning_vi: card.meaning_vi,
      state: card.state,
      due: card.due,
      context: context
        ? {
            sentence_text: context.sentence_text,
            start_ms: context.start_ms,
            video_id: source?.kind === "youtube" ? source.external_id : null,
            source_title: source?.title ?? null,
            source_id: context.source_id,
          }
        : null,
    };
  };

  return {
    ok: true,
    videos,
    words: cards.filter((c) => c.kind !== "sentence").map(toItem),
    sentences: cards.filter((c) => c.kind === "sentence").map(toItem),
  };
}

// ─── edits ──────────────────────────────────────────────────────────────────

const meaningSchema = z.object({
  card_id: z.number().int().positive(),
  meaning_vi: z.string().trim().min(1).max(2000),
});

export type EditResult =
  | { ok: true }
  | { ok: false; error: "invalid_input" | "unauthorized" | "save_failed" };

/** Learner-edited meaning — origin flips to 'learner' so the provenance stays honest. */
export async function updateCardMeaning(raw: unknown): Promise<EditResult> {
  const parsed = meaningSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const { error } = await supabase
    .from("study_cards")
    .update({
      meaning_vi: parsed.data.meaning_vi,
      meaning_origin: "learner",
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.card_id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: "save_failed" };
  return { ok: true };
}

const idSchema = z.number().int().positive();

/** Delete one card; its contexts cascade (FK on delete cascade). */
export async function deleteStudyCard(raw: unknown): Promise<EditResult> {
  const parsed = idSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const { error } = await supabase
    .from("study_cards")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: "save_failed" };
  return { ok: true };
}

/**
 * Delete a source (video/text): cascades the source's transcript, its
 * card_contexts rows and watch position — spec §172 keeps the cards as long
 * as another context still anchors them.
 */
export async function deleteLibrarySource(raw: unknown): Promise<EditResult> {
  const parsed = idSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const { error } = await supabase
    .from("content_sources")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: "save_failed" };
  return { ok: true };
}
