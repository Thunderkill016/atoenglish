"use server";

import { headers } from "next/headers";
import { createRateLimiter } from "@/lib/security/rate-limit";
import { geminiGenerateUrl } from "@/lib/ai/gemini";

const translateLimiter = createRateLimiter(20, 60 * 1000, "translate-grade");

export interface TranslationGrade {
  correct: boolean;
  feedbackVn: string; // Vietnamese explanation
  naturalAlternative?: string; // More native-sounding phrasing (if any)
  errorType?: "grammar" | "word-choice" | "missing-word" | "word-order"; // optional classification
}

/**
 * Grades a VN→EN translation using Gemini Flash.
 * Returns: correct verdict + Vietnamese feedback + optional natural alternative.
 * Rate-limited to 20 req/min. No auth required (lesson is protected by middleware).
 */
export async function gradeTranslation(
  promptVn: string,
  referenceAnswer: string,
  userAnswer: string,
): Promise<{ success: boolean; grade?: TranslationGrade; error?: string }> {
  try {
    const reqHeaders = await headers();
    const ip =
      reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const rateCheck = await translateLimiter.check(ip);
    if (!rateCheck.success) {
      return {
        success: false,
        error: "Yêu cầu quá thường xuyên. Thử lại sau.",
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { success: false, error: "API key not configured." };

    // Trim + basic sanity check
    const userTrim = userAnswer.trim();
    if (!userTrim) return { success: false, error: "Câu trả lời trống." };

    const prompt = `You are an expert English teacher for Vietnamese learners (CEFR A1-B2).
A student translated the following Vietnamese sentence into English.

Vietnamese sentence: "${promptVn}"
Reference answer: "${referenceAnswer}"
Student's answer: "${userTrim}"

Evaluate the student's answer. Rules:
1. Small differences in punctuation, capitalization, or minor word choice that don't change meaning = CORRECT
2. Contractions vs full forms (I'm = I am) = CORRECT
3. Synonyms that convey identical meaning = CORRECT
4. Grammar errors, missing words, wrong word order, wrong tense = INCORRECT

Respond ONLY with valid JSON matching this schema:
{
  "correct": true or false,
  "feedbackVn": "1-2 sentences in Vietnamese explaining why correct/incorrect. If incorrect, point out EXACTLY what is wrong in simple terms a beginner understands.",
  "naturalAlternative": "If the student's answer is correct but unnatural, provide a more native phrasing here. Otherwise empty string.",
  "errorType": "grammar" | "word-choice" | "missing-word" | "word-order" | ""
}`;

    const response = await fetch(
      geminiGenerateUrl("gemini-1.5-flash", apiKey),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2, // Low temp for consistent grading
            maxOutputTokens: 256,
          },
        }),
      },
    );

    if (!response.ok) {
      return { success: false, error: "Gemini API lỗi." };
    }

    const resData = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { success: false, error: "Phản hồi rỗng từ AI." };

    const parsed = JSON.parse(text.trim()) as TranslationGrade;
    return { success: true, grade: parsed };
  } catch {
    return {
      success: false,
      error: "Không thể chấm điểm lúc này. Hãy thử lại.",
    };
  }
}
