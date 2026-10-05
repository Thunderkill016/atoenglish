"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  createRateLimiter,
  getClientIpFromHeaders,
} from "@/lib/security/rate-limit";
import { GEMINI_MODEL, geminiGenerateUrl } from "@/lib/ai/gemini";
import { z } from "zod";

const writingLimiter = createRateLimiter(15, 60_000, "writing");

const improveSchema = z.object({
  text: z.string().min(5, "Câu quá ngắn").max(500, "Tối đa 500 ký tự"),
  level: z.enum(["A1", "A2", "B1", "B2"]),
});

export interface WritingFeedback {
  corrected: string; // Corrected version of the sentence(s)
  errors: {
    original: string; // Exact erroneous phrase
    correction: string; // Fixed version
    explanation_vn: string; // Vietnamese explanation
    type: "grammar" | "vocabulary" | "spelling" | "word_order";
  }[];
  improved: string; // A more natural / advanced rephrasing
  score: number; // 0–100 accuracy score
  encouragement_vn: string; // Short Vietnamese motivational comment
}

/**
 * analyzeWriting — sends learner text to Gemini Flash for grammar/style feedback.
 * Targets A0-B1 Vietnamese learners; all explanations in Vietnamese.
 * Rate-limited: 15 req/min per IP.
 */
export async function analyzeWriting(formData: {
  text: string;
  level: "A1" | "A2" | "B1" | "B2";
}) {
  try {
    // Rate limit
    const reqHeaders = await headers();
    const ip = getClientIpFromHeaders(reqHeaders);
    const rateCheck = await writingLimiter.check(ip);
    if (!rateCheck.success) {
      return {
        success: false as const,
        error: "Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.",
      };
    }

    // Auth
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false as const, error: "Bạn cần đăng nhập." };
    }

    // Validate input
    const parsed = improveSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false as const,
        error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
      };
    }
    const { text, level } = parsed.data;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Honest degradation: no fabricated score presented as AI feedback.
      return {
        success: false as const,
        error: "Tính năng phản hồi AI chưa được cấu hình trên máy chủ.",
      };
    }

    const prompt = `You are an expert English writing tutor for Vietnamese learners at ${level} level.

Student's text:
"${text}"

Analyze this text and respond STRICTLY in valid JSON with this exact structure:
{
  "corrected": "corrected version of the full text (fix grammar/spelling/word order errors only — keep vocabulary simple for ${level})",
  "errors": [
    {
      "original": "exact erroneous phrase from student text",
      "correction": "corrected phrase",
      "explanation_vn": "explanation in Vietnamese — short, clear, pedagogically useful for Vietnamese speakers",
      "type": "grammar | vocabulary | spelling | word_order"
    }
  ],
  "improved": "a more natural, fluent rephrasing at slightly higher than ${level} level — keep it learnable",
  "score": 0-100 (accuracy percentage — how correct the grammar/spelling is),
  "encouragement_vn": "1 short encouraging sentence in Vietnamese — focus on what they did well"
}

Rules:
- errors array must list EVERY distinct error found (empty array if none)
- All explanation_vn and encouragement_vn MUST be in Vietnamese
- corrected and improved MUST be in English
- Score 90-100 = no/minor errors, 70-89 = small errors, 50-69 = several errors, below 50 = major errors
- Keep the improved version comprehensible for ${level} learners`;

    const response = await fetch(geminiGenerateUrl(GEMINI_MODEL, apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });

    if (!response.ok) {
      return { success: false as const, error: "Lỗi kết nối Gemini API." };
    }

    const resData = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const raw = resData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) {
      return { success: false as const, error: "Gemini trả về kết quả rỗng." };
    }

    const feedback = JSON.parse(raw.trim()) as WritingFeedback;
    return { success: true as const, feedback };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false as const, error: `Lỗi hệ thống: ${msg}` };
  }
}

// ─── Save writing sentence ─────────────────────────────────────────────────────

const saveLimiter = createRateLimiter(30, 60_000, "writing-save");

const saveSchema = z.object({
  sentence_en: z.string().min(1).max(500),
  meaning_vn: z.string().min(1).max(500),
  level: z.enum(["A1", "A2", "B1", "B2"]),
});

/**
 * saveWritingSentence — saves a corrected sentence to user_sentences.
 * sentence_en = AI corrected version, meaning_vn = original learner text.
 * tags includes ['writing-practice', level] for filtering later.
 */
export async function saveWritingSentence(params: {
  sentence_en: string; // corrected English sentence
  meaning_vn: string; // original learner text (saved as "meaning" for reference)
  level: "A1" | "A2" | "B1" | "B2";
}) {
  try {
    const reqHeaders = await headers();
    const ip = getClientIpFromHeaders(reqHeaders);
    const rateCheck = await saveLimiter.check(ip);
    if (!rateCheck.success) {
      return { success: false as const, error: "Quá nhiều yêu cầu." };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false as const, error: "Bạn cần đăng nhập." };
    }

    const parsed = saveSchema.safeParse(params);
    if (!parsed.success) {
      return { success: false as const, error: "Dữ liệu không hợp lệ." };
    }
    const { sentence_en, meaning_vn, level } = parsed.data;

    const { data, error } = await supabase
      .from("user_sentences")
      .insert({
        user_id: user.id,
        sentence_en,
        meaning_vn,
        tags: ["writing-practice", level],
      })
      .select("id")
      .single();

    if (error) {
      return { success: false as const, error: error.message };
    }

    return { success: true as const, id: data.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false as const, error: `Lỗi hệ thống: ${msg}` };
  }
}

// ─── Get saved sentences ───────────────────────────────────────────────────────

export interface SavedSentence {
  id: string;
  sentence_en: string;
  meaning_vn: string;
  tags: string[];
  created_at: string;
}

/**
 * getUserSentences — fetches the user's saved writing-practice sentences.
 * Read-only, auth-gated. Ordered newest first, capped at 50.
 */
export async function getUserSentences(tag?: string): Promise<{
  success: boolean;
  sentences?: SavedSentence[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user)
      return { success: false, error: "Bạn cần đăng nhập." };

    let query = supabase
      .from("user_sentences")
      .select("id, sentence_en, meaning_vn, tags, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (tag) {
      query = query.contains("tags", [tag]);
    }

    const { data, error } = await query;
    if (error) return { success: false, error: error.message };

    return { success: true, sentences: (data ?? []) as SavedSentence[] };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Lỗi hệ thống: ${msg}` };
  }
}

// ─── Delete saved sentence ─────────────────────────────────────────────────────

const deleteLimiter = createRateLimiter(20, 60_000, "writing-delete");

/**
 * deleteUserSentence — soft-deletes a saved sentence by ID.
 * RLS ensures users can only delete their own rows.
 */
export async function deleteUserSentence(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const reqHeaders = await headers();
    const ip = getClientIpFromHeaders(reqHeaders);
    const rateCheck = await deleteLimiter.check(ip);
    if (!rateCheck.success)
      return { success: false, error: "Quá nhiều yêu cầu." };

    if (!id || typeof id !== "string")
      return { success: false, error: "ID không hợp lệ." };

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user)
      return { success: false, error: "Bạn cần đăng nhập." };

    const { error } = await supabase
      .from("user_sentences")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // RLS double-check

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Lỗi hệ thống: ${msg}` };
  }
}
