// ─── Auto-generated Database type (source of truth) ────────────────────────
// Run `npm run db:types` after every migration to keep this in sync.
export type { Database } from "./supabase";

// ─── App-level named types ───────────────────────────────────────────────────
// Kept for convenience — imported directly in actions & components.

export type CEFRLevel = "A0" | "A1" | "A2" | "B1" | "B2" | "C1";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type User = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type UserProgress = {
  user_id: string;
  current_level: string;
  streak: number;
  total_xp: number;
  last_active_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Card = {
  id: string;
  user_id: string;
  word: string;
  phonetic: string | null;
  meaning_vn: string;
  example_en: string | null;
  topic: string | null;
  level: string;
  interval: number;
  due_date: string;
  repetitions: number;
  created_at: string;
  updated_at: string;
  state: number;
  difficulty: number;
  stability: number;
  last_review: string | null;
  next_review: string | null;
  elapsed_days: number;
  scheduled_days: number;
  lapses: number;
  learning_steps: number;
};

export type LessonHistory = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
  score: number | null;
  created_at: string;
};

export type UserSentence = {
  id: string;
  user_id: string;
  sentence_en: string;
  meaning_vn: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type UserLessonProgress = {
  id: string;
  user_id: string;
  unit_id: string;
  completed_at: string;
  xp_earned: number;
  created_at: string;
};

export type SpeakingSession = {
  id: string;
  user_id: string;
  practice_type: string;
  duration: number;
  transcript: string | null;
  accuracy_score: number | null;
  scenario_id: string | null;
  created_at: string;
};

export type CardInsert = Omit<Card, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};
export type CardUpdate = Partial<
  Omit<Card, "id" | "user_id" | "created_at" | "updated_at">
>;

export type UserInsert = Omit<User, "created_at" | "updated_at"> & {
  created_at?: string;
  updated_at?: string;
};
export type UserUpdate = Partial<
  Omit<User, "id" | "created_at" | "updated_at">
>;

export type UserProgressInsert = Partial<Omit<UserProgress, "user_id">> & {
  user_id: string;
};
export type UserProgressUpdate = Partial<
  Omit<UserProgress, "user_id" | "created_at" | "updated_at">
>;

export type LessonHistoryInsert = Omit<LessonHistory, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};
export type LessonHistoryUpdate = Partial<
  Omit<LessonHistory, "id" | "user_id" | "created_at">
>;

export type UserSentenceInsert = Omit<
  UserSentence,
  "id" | "created_at" | "updated_at"
> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};
export type UserSentenceUpdate = Partial<
  Omit<UserSentence, "id" | "user_id" | "created_at" | "updated_at">
>;

export type UserLessonProgressInsert = Omit<
  UserLessonProgress,
  "id" | "created_at"
> & {
  id?: string;
  created_at?: string;
};

export type SpeakingSessionInsert = Omit<
  SpeakingSession,
  "id" | "created_at"
> & {
  id?: string;
  created_at?: string;
};
