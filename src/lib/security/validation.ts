import { z } from "zod";

/**
 * Schema for login requests
 */
export const LoginSchema = z.object({
  email: z.string().email("Email không hợp lệ").trim().toLowerCase(),
  password: z.string().min(6, "Mật khẩu phải chứa ít nhất 6 ký tự"),
});

/**
 * Schema for registration requests
 */
export const SignUpSchema = z.object({
  email: z.string().email("Email không hợp lệ").trim().toLowerCase(),
  password: z.string().min(6, "Mật khẩu phải chứa ít nhất 6 ký tự"),
});

/**
 * Schema for creating or saving a card
 */
export const SaveCardSchema = z.object({
  word: z
    .string()
    .min(1, "Từ vựng không được để trống")
    .max(100, "Từ vựng quá dài")
    .trim(),
  phonetic: z.string().nullable().optional(),
  meaning_vn: z.string().min(1, "Nghĩa tiếng Việt không được để trống").trim(),
  example_en: z.string().nullable().optional(),
  topic: z.string().max(50).nullable().optional(),
  level: z.enum(["A0", "A1", "A2", "B1", "B2", "C1"]).optional(),
});

/**
 * Schema for reviewing a card
 */
export const ReviewCardSchema = z.object({
  cardId: z.string().min(1, "ID thẻ không hợp lệ"),
  rating: z.enum(["Again", "Hard", "Good", "Easy"]),
  retentionRate: z.number().min(0.5).max(0.99).optional(),
});

/**
 * Schema for completing a unit
 */
const UNIT_ID_PATTERN = /^unit-(a0-\d+|\d+)$/;

export const CompleteUnitSchema = z.object({
  unitId: z
    .string()
    .min(1, "ID bài học không được để trống")
    .regex(UNIT_ID_PATTERN, "ID bài học không hợp lệ"),
  starCount: z.number().int().min(1).max(3).default(3),
});

/**
 * Schema for saving a speaking session
 */
export const SpeakingSessionSchema = z.object({
  practiceType: z.enum(["shadowing", "roleplay", "journal"]),
  duration: z.number().nonnegative("Thời lượng không được âm"),
  // P0-2: Max 2000 chars to prevent prompt injection and unbounded Gemini API cost
  transcript: z.string().max(2000, "Nội dung không được vượt quá 2000 ký tự").nullable().optional(),
  accuracyScore: z
    .number()
    .min(0, "Điểm chính xác không được nhỏ hơn 0")
    .max(100, "Điểm chính xác tối đa là 100")
    .nullable()
    .optional(),
  scenarioId: z.string().max(60).nullable().optional(),
});

/**
 * Schema for bulk-seeding unit vocabulary into FSRS after lesson completion.
 * Max 30 items per call to prevent abuse.
 */
export const SeedVocabSchema = z.object({
  vocab: z
    .array(
      z.object({
        word: z.string().min(1).max(100).trim(),
        phonetic: z.string().max(100).nullable().optional(),
        meaning_vn: z.string().min(1).max(300).trim(),
        example_en: z.string().max(500).nullable().optional(),
      })
    )
    .min(1, "Cần ít nhất 1 từ vựng")
    .max(30, "Tối đa 30 từ vựng mỗi lần"),
  topic: z.string().max(60).trim().default("General"),
  level: z.enum(["A0", "A1", "A2", "B1", "B2", "C1"]).default("A1"),
});

/**
 * Schema for scheduling wrong words for early FSRS review.
 * Sends rated "Again" to bring them back to the front of the queue.
 */
export const WrongWordsSchema = z.object({
  words: z
    .array(z.string().min(1).max(100).trim())
    .min(1)
    .max(30),
});

/**
 * Schema for recording flashcard reviews session
 */
export const RecordFlashcardSessionSchema = z.object({
  cardsReviewed: z.number().int().positive("Số thẻ ôn tập phải lớn hơn 0"),
});
/**
 * P0-3: Production environment validation.
 * Call assertProductionEnv() at module init in any file that creates rate limiters.
 * Throws at startup if critical env vars are missing in production.
 */
export const ProductionEnvSchema = z.object({
  UPSTASH_REDIS_REST_URL: z.string().url("UPSTASH_REDIS_REST_URL must be a valid URL"),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(10, "UPSTASH_REDIS_REST_TOKEN is required"),
  NEON_AUTH_BASE_URL: z.string().url("NEON_AUTH_BASE_URL must be a valid URL"),
  NEON_DATA_API_URL: z.string().url("NEON_DATA_API_URL must be a valid URL"),
  NEON_AUTH_COOKIE_SECRET: z.string().min(32, "NEON_AUTH_COOKIE_SECRET is required (min 32 chars)"),
});

/**
 * Validates critical production env vars.
 * Safe to call at module level — only throws in production.
 * In development, missing Upstash vars are expected (in-memory fallback is used).
 */
export function assertProductionEnv(): void {
  if (process.env.NODE_ENV !== "production") return;
  const result = ProductionEnvSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map(i => i.path.join(".")).join(", ");
    throw new Error(
      `[AtoEnglish] Missing required production environment variables: ${missing}. ` +
      `Rate limiting will be BYPASSED. Fix immediately.`
    );
  }
}
