"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { reviewCardFSRS } from "@/lib/srs/fsrs";
import { Card } from "@/types/database";
import { headers } from "next/headers";
import {
  createRateLimiter,
  getClientIpFromHeaders,
} from "@/lib/security/rate-limit";
import {
  SaveCardSchema,
  ReviewCardSchema,
  SeedVocabSchema,
  WrongWordsSchema,
} from "@/lib/security/validation";
import { lemmaKey } from "@/lib/vocab/lemma";

const saveCardLimiter = createRateLimiter(60, 60 * 1000, "save-card");
const reviewCardLimiter = createRateLimiter(60, 60 * 1000, "review-card");
const seedVocabLimiter = createRateLimiter(20, 60 * 1000, "seed-vocab");
const wrongWordsLimiter = createRateLimiter(30, 60 * 1000, "wrong-words");

interface SaveCardParams {
  word: string;
  phonetic?: string | null;
  meaning_vn: string;
  example_en?: string | null;
  topic?: string | null;
  level?: "A0" | "A1" | "A2" | "B1" | "B2" | "C1";
}

type FsrsReviewResult = ReturnType<typeof reviewCardFSRS>;

/**
 * Persist card state + review log in one PostgreSQL transaction.
 * apply_fsrs_card_review resolves the caller via public.auth_uid(), so it
 * must run on the user-scoped Data API client where the JWT is present —
 * a service (JWT-less) connection always raises 'Unauthenticated'.
 */
async function persistFsrsReview(
  supabase: CardsClient,
  cardId: string,
  result: FsrsReviewResult,
): Promise<{ success: true } | { success: false; error: string }> {
  const { error } = await supabase.rpc("apply_fsrs_card_review", {
    p_card_id: cardId,
    p_state: result.state,
    p_difficulty: result.difficulty,
    p_stability: result.stability,
    p_elapsed_days: result.elapsed_days,
    p_scheduled_days: result.scheduled_days,
    p_lapses: result.lapses,
    p_learning_steps: result.learning_steps,
    p_last_review: result.last_review,
    p_next_review: result.next_review,
    p_repetitions: result.repetitions,
    p_log_rating: result.reviewLog.rating,
    p_log_state: result.reviewLog.state,
    p_log_due: result.reviewLog.due,
    p_log_stability: result.reviewLog.stability,
    p_log_difficulty: result.reviewLog.difficulty,
    p_log_elapsed_days: result.reviewLog.elapsed_days,
    p_log_scheduled_days: result.reviewLog.scheduled_days,
    p_log_review: result.reviewLog.review,
  });

  return error ? { success: false, error: error.message } : { success: true };
}

type CardsClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Canonical lemma → stored surface word for one user's deck. SRS identity is
 * lemma-level: "goes" and "go" are the same card, so dedupe/scheduling never
 * keys on the raw inflection.
 */
async function fetchUserLemmaMap(
  supabase: CardsClient,
  userId: string,
): Promise<Map<string, string>> {
  const { data } = await supabase
    .from("cards")
    .select("word")
    .eq("user_id", userId)
    .limit(10000);
  const map = new Map<string, string>();
  for (const row of data ?? []) {
    const key = lemmaKey(row.word);
    if (key && !map.has(key)) map.set(key, row.word);
  }
  return map;
}

/** Server Action lưu một từ vựng mới vào bảng cards (SRS) của người dùng. */
export async function saveCardToSRS(params: SaveCardParams) {
  try {
    const reqHeaders = await headers();
    const ip = getClientIpFromHeaders(reqHeaders);
    const rateLimitCheck = await saveCardLimiter.check(ip);
    if (!rateLimitCheck.success) {
      return {
        success: false,
        error: "Yêu cầu quá thường xuyên. Vui lòng thử lại sau.",
      };
    }

    const validated = SaveCardSchema.safeParse(params);
    if (!validated.success) {
      return {
        success: false,
        error: `Dữ liệu không hợp lệ: ${validated.error.issues.map((e) => e.message).join(", ")}`,
      };
    }
    const cleanParams = validated.data;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để lưu từ vựng vào hệ thống SRS.",
      };
    }

    const formattedWord = cleanParams.word.toLowerCase().trim();
    const lemma = lemmaKey(formattedWord);
    const lemmaMap = await fetchUserLemmaMap(supabase, user.id);
    const existingWord = lemma ? lemmaMap.get(lemma) : undefined;

    if (existingWord) {
      return {
        success: true,
        message: `Từ "${existingWord}" đã được lưu trong tủ thẻ của bạn trước đây.`,
        existed: true,
      };
    }

    const now = new Date().toISOString();
    const { error: insertError } = await supabase.from("cards").insert({
      user_id: user.id,
      word: formattedWord,
      phonetic: cleanParams.phonetic || null,
      meaning_vn: cleanParams.meaning_vn,
      example_en: cleanParams.example_en || null,
      topic: cleanParams.topic || "General",
      level: cleanParams.level || "A1",
      interval: 0,
      repetitions: 0,
      due_date: now,
      state: 0,
      difficulty: 0.0,
      stability: 0.0,
      last_review: null,
      next_review: now,
    });

    if (insertError)
      return {
        success: false,
        error: `Lỗi khi lưu thẻ mới: ${insertError.message}`,
      };

    revalidatePath("/learn");
    revalidatePath("/review");
    revalidatePath("/learn");
    return {
      success: true,
      message: `Lưu từ "${params.word}" vào hộp thẻ SRS thành công!`,
      existed: false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Lỗi hệ thống: ${errorMessage}` };
  }
}

/** Lấy tất cả thẻ đến hạn; review cards luôn ưu tiên trước new cards. */
export async function getDueCards(maxNewCards?: number) {
  const MAX_NEW_PER_DAY = maxNewCards ?? 15;
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để lấy các thẻ ôn tập đến hạn.",
      };
    }

    const now = new Date().toISOString();
    const [reviewRes, newRes] = await Promise.all([
      supabase
        .from("cards")
        .select("*")
        .eq("user_id", user.id)
        .gte("state", 1)
        .lte("due_date", now)
        .order("due_date", { ascending: true }),
      supabase
        .from("cards")
        .select("*")
        .eq("user_id", user.id)
        .eq("state", 0)
        .lte("due_date", now)
        .order("due_date", { ascending: true })
        .limit(MAX_NEW_PER_DAY),
    ]);

    if (reviewRes.error) {
      return {
        success: false,
        error: `Lỗi truy vấn thẻ đến hạn: ${reviewRes.error.message}`,
      };
    }
    if (newRes.error) {
      return {
        success: false,
        error: `Lỗi truy vấn thẻ mới: ${newRes.error.message}`,
      };
    }

    return {
      success: true,
      cards: [...(reviewRes.data ?? []), ...(newRes.data ?? [])],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Lỗi hệ thống khi lấy thẻ: ${errorMessage}`,
    };
  }
}

/** Chỉ lấy cards đã từng học và đang đến hạn cho SRS warm-up. */
export async function getDueWarmupCards(limit: number = 5) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, cards: [] };

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("cards")
      .select("id, word, phonetic, meaning_vn, example_en")
      .eq("user_id", user.id)
      .gte("state", 1)
      .lte("due_date", now)
      .order("due_date", { ascending: true })
      .limit(limit);

    if (error) return { success: false, cards: [] };
    return { success: true, cards: data || [] };
  } catch {
    return { success: false, cards: [] };
  }
}

/** Chấm card bằng FSRS và persist đủ state/history atomically. */
export async function reviewCard(
  cardId: string,
  rating: "Again" | "Hard" | "Good" | "Easy",
  retentionRate?: number,
) {
  try {
    const reqHeaders = await headers();
    const ip = getClientIpFromHeaders(reqHeaders);
    const rateLimitCheck = await reviewCardLimiter.check(ip);
    if (!rateLimitCheck.success) {
      return {
        success: false,
        error: "Yêu cầu quá thường xuyên. Vui lòng thử lại sau.",
      };
    }

    const validated = ReviewCardSchema.safeParse({
      cardId,
      rating,
      retentionRate,
    });
    if (!validated.success) {
      return {
        success: false,
        error: `Dữ liệu không hợp lệ: ${validated.error.issues.map((e) => e.message).join(", ")}`,
      };
    }
    const cleanParams = validated.data;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để thực hiện đánh giá thẻ.",
      };
    }

    // select(*) is deliberate: after the migration it includes the complete persisted FSRS state.
    const { data: card, error: fetchError } = await supabase
      .from("cards")
      .select("*")
      .eq("id", cleanParams.cardId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !card) {
      return {
        success: false,
        error: `Không thể tìm thấy thẻ: ${fetchError?.message || "Thẻ không thuộc về user này"}`,
      };
    }

    const fsrsUpdates = reviewCardFSRS(
      card as unknown as Card,
      cleanParams.rating,
      cleanParams.retentionRate,
    );
    const persisted = await persistFsrsReview(
      supabase,
      cleanParams.cardId,
      fsrsUpdates,
    );
    if (!persisted.success) {
      return {
        success: false,
        error: `Không thể lưu review FSRS: ${persisted.error}`,
      };
    }

    revalidatePath("/learn");
    revalidatePath("/review");
    return {
      success: true,
      message: `Đã đánh giá "${cleanParams.rating}". Lên lịch ôn tiếp theo sau ${fsrsUpdates.interval} ngày.`,
      next_interval: fsrsUpdates.interval,
      next_due_date: fsrsUpdates.next_review,
      debug: fsrsUpdates.debug,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Lỗi hệ thống khi đánh giá thẻ: ${errorMessage}`,
    };
  }
}

/** Lấy TẤT CẢ thẻ của user (Cram Mode - không lọc theo due_date). */
export async function getAllCards(topic?: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user)
      return { success: false, error: "Bạn cần đăng nhập.", cards: [] };

    let query = supabase
      .from("cards")
      .select("*")
      .eq("user_id", user.id)
      .order("word", { ascending: true });

    if (topic) query = query.eq("topic", topic);

    const { data: cards, error } = await query;
    if (error) return { success: false, error: error.message, cards: [] };
    return { success: true, cards: cards || [] };
  } catch (err) {
    return { success: false, error: String(err), cards: [] };
  }
}

/** Lấy danh sách topics của user từ bảng cards. */
export async function getCardTopics() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, topics: [] };

    const { data, error } = await supabase
      .from("cards")
      .select("topic")
      .eq("user_id", user.id);

    if (error) return { success: false, topics: [] };
    const topics = Array.from(
      new Set((data || []).map((c) => c.topic).filter((t): t is string => !!t)),
    );
    return { success: true, topics };
  } catch {
    return { success: false, topics: [] };
  }
}

/** Tự động thêm vocab unit vào FSRS sau khi hoàn thành bài. */
export async function seedUnitVocabToSRS(params: {
  vocab: Array<{
    word: string;
    phonetic?: string | null;
    meaning_vn: string;
    example_en?: string | null;
  }>;
  topic: string;
  level?: "A0" | "A1" | "A2" | "B1" | "B2" | "C1";
}) {
  try {
    const reqHeaders = await headers();
    const ip = getClientIpFromHeaders(reqHeaders);
    const rateLimitCheck = await seedVocabLimiter.check(ip);
    if (!rateLimitCheck.success) return { success: false, added: 0 };

    const validated = SeedVocabSchema.safeParse(params);
    if (!validated.success) return { success: false, added: 0 };
    const { vocab, topic, level } = validated.data;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, added: 0 };

    const now = new Date().toISOString();
    const lemmaMap = await fetchUserLemmaMap(supabase, user.id);
    const seenLemmas = new Set<string>();
    const rows = vocab
      .map((v) => ({
        user_id: user.id,
        word: v.word.toLowerCase().trim(),
        phonetic: v.phonetic ?? null,
        meaning_vn: v.meaning_vn,
        example_en: v.example_en ?? null,
        topic,
        level: level ?? "A1",
        interval: 0,
        repetitions: 0,
        due_date: now,
        state: 0,
        difficulty: 0.0,
        stability: 0.0,
        last_review: null,
        next_review: now,
      }))
      .filter((row) => {
        const key = lemmaKey(row.word);
        if (!key || seenLemmas.has(key) || lemmaMap.has(key)) return false;
        seenLemmas.add(key);
        return true;
      });

    if (rows.length === 0) {
      revalidatePath("/review");
      revalidatePath("/learn");
      return { success: true, added: 0 };
    }

    const { error } = await supabase
      .from("cards")
      .upsert(rows, { onConflict: "user_id,word", ignoreDuplicates: true });

    if (error) return { success: false, added: 0 };
    revalidatePath("/review");
    revalidatePath("/learn");
    return { success: true, added: rows.length };
  } catch {
    return { success: false, added: 0 };
  }
}

/**
 * Quiz/scramble/translate failures become real FSRS Again reviews.
 * Each card update + log is atomic and preserves lapse/learning-step history.
 */
export async function scheduleWrongWordsForReview(words: string[]) {
  try {
    if (!words.length) return { success: true, updated: 0 };

    const reqHeaders = await headers();
    const ip = getClientIpFromHeaders(reqHeaders);
    const rateLimitCheck = await wrongWordsLimiter.check(ip);
    if (!rateLimitCheck.success) return { success: false, updated: 0 };

    const validated = WrongWordsSchema.safeParse({ words });
    if (!validated.success) return { success: false, updated: 0 };
    const wantedLemmas = new Set(
      validated.data.words
        .map((w) => lemmaKey(w.toLowerCase().trim()))
        .filter((key): key is string => key !== null),
    );
    if (wantedLemmas.size === 0) return { success: true, updated: 0 };

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, updated: 0 };

    const { data: allCards, error: fetchErr } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", user.id)
      .limit(10000);

    if (fetchErr || !allCards?.length) return { success: true, updated: 0 };
    const cards = allCards.filter((card) => {
      const key = lemmaKey(card.word);
      return key !== null && wantedLemmas.has(key);
    });
    if (!cards.length) return { success: true, updated: 0 };

    const results = await Promise.all(
      cards.map(async (card) => {
        const fsrsResult = reviewCardFSRS(card as unknown as Card, "Again");
        return persistFsrsReview(supabase, card.id, fsrsResult);
      }),
    );

    const updated = results.filter((result) => result.success).length;
    if (updated !== results.length) return { success: false, updated };

    revalidatePath("/review");
    return { success: true, updated };
  } catch {
    return { success: false, updated: 0 };
  }
}

/** Lấy top N từ khó nhất dựa trên số lần Again trong append-only review logs. */
export async function getHardWords(limit: number = 20): Promise<{
  success: boolean;
  words?: Array<{
    id: string;
    word: string;
    phonetic: string | null;
    meaning_vn: string;
    level: string;
    example_en: string | null;
    again_count: number;
    total_reviews: number;
    mastery_pct: number;
  }>;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Unauthenticated" };

    const { data: againLogs, error: logErr } = await supabase
      .from("card_review_logs")
      .select("card_id")
      .eq("user_id", user.id)
      .eq("rating", 1);

    if (logErr) return { success: false, error: logErr.message };
    if (!againLogs || againLogs.length === 0)
      return { success: true, words: [] };

    const againMap = new Map<string, number>();
    for (const log of againLogs) {
      againMap.set(log.card_id, (againMap.get(log.card_id) ?? 0) + 1);
    }

    const topIds = [...againMap.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => id);

    const { data: cards, error: cardErr } = await supabase
      .from("cards")
      .select("id, word, phonetic, meaning_vn, level, example_en, repetitions")
      .eq("user_id", user.id)
      .in("id", topIds);

    if (cardErr) return { success: false, error: cardErr.message };
    if (!cards || cards.length === 0) return { success: true, words: [] };

    const hardWords = topIds
      .map((id) => {
        const card = cards.find((c) => c.id === id);
        if (!card) return null;
        const again_count = againMap.get(id) ?? 0;
        const total_reviews = Math.max(card.repetitions ?? 1, again_count);
        const mastery_pct = Math.round(
          Math.max(0, (1 - again_count / total_reviews) * 100),
        );
        return {
          id: card.id,
          word: card.word,
          phonetic: card.phonetic ?? null,
          meaning_vn: card.meaning_vn,
          level: card.level ?? "A1",
          example_en: card.example_en ?? null,
          again_count,
          total_reviews,
          mastery_pct,
        };
      })
      .filter((word): word is NonNullable<typeof word> => word !== null);

    return { success: true, words: hardWords };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
