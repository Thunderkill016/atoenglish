"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createRateLimiter } from "@/lib/security/rate-limit";
import { geminiGenerateUrl } from "@/lib/ai/gemini";
import { z } from "zod";

const grammarNoteLimiter = createRateLimiter(10, 60_000, "grammar-notes");

const grammarNoteSchema = z.object({
  question: z.string().min(5).max(400),
  answer: z.string().min(1).max(200),
  wrong_answer: z.string().min(1).max(200),
  cefr_level: z.enum(["A0", "A1", "A2", "B1", "B2"]),
});

export interface GrammarNoteResult {
  explanation_vn: string; // 1-3 sentence Vietnamese grammar note for wrong answer
  rule_vn: string; // Short rule summary in Vietnamese
  example_correct: string; // Correct example sentence
  example_wrong: string; // Wrong example (the mistake pattern)
}

/**
 * S4-2: generateGrammarNote — calls Gemini to auto-generate a Vietnamese
 * grammar explanation for a quiz question when the learner answers incorrectly.
 *
 * Targets Vietnamese EFL learners A0-B2.
 * Rate-limited: 10 req/min per IP (Gemini API cost control).
 */
export async function generateGrammarNote(params: {
  question: string;
  answer: string;
  wrong_answer: string;
  cefr_level: "A0" | "A1" | "A2" | "B1" | "B2";
}) {
  try {
    const reqHeaders = await headers();
    const ip =
      reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";
    const rateCheck = await grammarNoteLimiter.check(ip);
    if (!rateCheck.success) {
      return {
        success: false as const,
        error: "Quá nhiều yêu cầu. Thử lại sau 1 phút.",
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false as const, error: "Bạn cần đăng nhập." };
    }

    const parsed = grammarNoteSchema.safeParse(params);
    if (!parsed.success) {
      return { success: false as const, error: "Dữ liệu không hợp lệ." };
    }
    const { question, answer, wrong_answer, cefr_level } = parsed.data;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback: static note based on level
      return {
        success: true as const,
        result: {
          explanation_vn: `Đáp án đúng là "${answer}". Hãy ôn lại quy tắc ngữ pháp liên quan!`,
          rule_vn: "Xem lại phần ngữ pháp của bài học.",
          example_correct: answer,
          example_wrong: wrong_answer,
        } satisfies GrammarNoteResult,
      };
    }

    const prompt = `You are an expert English teacher for Vietnamese learners at CEFR level ${cefr_level}.

A student answered a quiz question WRONG. Explain WHY their answer is wrong and what the correct rule is.

Quiz question: "${question}"
Student's wrong answer: "${wrong_answer}"
Correct answer: "${answer}"

Write a JSON response with these exact keys:
{
  "explanation_vn": "1-2 sentence explanation in Vietnamese of WHY the wrong answer is incorrect and why the correct answer is right. Be specific about the grammar rule. Max 120 characters.",
  "rule_vn": "A short grammar rule summary in Vietnamese. Max 80 characters.",
  "example_correct": "One correct example sentence using the correct form.",
  "example_wrong": "The same sentence but with the student's mistake (to contrast)."
}

Requirements:
- explanation_vn MUST be in Vietnamese
- Keep explanation_vn concise (1-2 sentences, under 120 chars)
- Focus on the specific grammar point, not general advice
- Appropriate for ${cefr_level} learners`;

    const res = await fetch(geminiGenerateUrl("gemini-2.0-flash", apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
          maxOutputTokens: 400,
        },
      }),
    });

    if (!res.ok) {
      return {
        success: false as const,
        error: "Không thể kết nối AI. Thử lại sau.",
      };
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const result = JSON.parse(text) as GrammarNoteResult;

    return { success: true as const, result };
  } catch {
    return { success: false as const, error: "Lỗi không xác định." };
  }
}
