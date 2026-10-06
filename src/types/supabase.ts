export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      _neon_migrations: {
        Row: {
          filename: string;
          applied_at: string;
        };
        Insert: {
          filename: string;
          applied_at?: string;
        };
        Update: {
          filename?: string;
          applied_at?: string;
        };
        Relationships: [];
      };
      achievements: {
        Row: {
          id: string;
          title_vn: string;
          title_en: string;
          description_vn: string;
          emoji: string;
          category: string;
          xp_reward: number;
          threshold: number | null;
          created_at: string;
        };
        Insert: {
          id: string;
          title_vn: string;
          title_en: string;
          description_vn: string;
          emoji?: string;
          category: string;
          xp_reward?: number;
          threshold?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title_vn?: string;
          title_en?: string;
          description_vn?: string;
          emoji?: string;
          category?: string;
          xp_reward?: number;
          threshold?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      card_review_logs: {
        Row: {
          id: string;
          user_id: string;
          card_id: string;
          rating: number;
          state: number;
          due: string;
          stability: number;
          difficulty: number;
          elapsed_days: number;
          scheduled_days: number;
          review: string;
          created_at: string;
          last_elapsed_days: number;
          learning_steps: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          card_id: string;
          rating: number;
          state: number;
          due: string;
          stability?: number;
          difficulty?: number;
          elapsed_days?: number;
          scheduled_days?: number;
          review?: string;
          created_at?: string;
          last_elapsed_days?: number;
          learning_steps?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          card_id?: string;
          rating?: number;
          state?: number;
          due?: string;
          stability?: number;
          difficulty?: number;
          elapsed_days?: number;
          scheduled_days?: number;
          review?: string;
          created_at?: string;
          last_elapsed_days?: number;
          learning_steps?: number;
        };
        Relationships: [
          {
            foreignKeyName: "card_review_logs_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "card_review_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      cards: {
        Row: {
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
        Insert: {
          id?: string;
          user_id: string;
          word: string;
          phonetic?: string | null;
          meaning_vn: string;
          example_en?: string | null;
          topic?: string | null;
          level?: string;
          interval?: number;
          due_date?: string;
          repetitions?: number;
          created_at?: string;
          updated_at?: string;
          state?: number;
          difficulty?: number;
          stability?: number;
          last_review?: string | null;
          next_review?: string | null;
          elapsed_days?: number;
          scheduled_days?: number;
          lapses?: number;
          learning_steps?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          word?: string;
          phonetic?: string | null;
          meaning_vn?: string;
          example_en?: string | null;
          topic?: string | null;
          level?: string;
          interval?: number;
          due_date?: string;
          repetitions?: number;
          created_at?: string;
          updated_at?: string;
          state?: number;
          difficulty?: number;
          stability?: number;
          last_review?: string | null;
          next_review?: string | null;
          elapsed_days?: number;
          scheduled_days?: number;
          lapses?: number;
          learning_steps?: number;
        };
        Relationships: [
          {
            foreignKeyName: "cards_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      challenge_results: {
        Row: {
          id: string;
          user_id: string;
          score: number;
          total: number;
          xp_earned: number;
          challenge_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          score: number;
          total: number;
          xp_earned: number;
          challenge_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          score?: number;
          total?: number;
          xp_earned?: number;
          challenge_date?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "challenge_results_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      content_sources: {
        Row: {
          id: number;
          user_id: string;
          kind: string;
          external_id: string;
          title: string | null;
          channel: string | null;
          duration_ms: number | null;
          last_position_ms: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          kind: string;
          external_id: string;
          title?: string | null;
          channel?: string | null;
          duration_ms?: number | null;
          last_position_ms?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          kind?: string;
          external_id?: string;
          title?: string | null;
          channel?: string | null;
          duration_ms?: number | null;
          last_position_ms?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "content_sources_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      content_transcripts: {
        Row: {
          id: number;
          source_id: number;
          user_id: string;
          origin: string;
          language: string;
          segmentation_version: number;
          sentences: Json;
          created_at: string;
        };
        Insert: {
          id?: number;
          source_id: number;
          user_id: string;
          origin: string;
          language: string;
          segmentation_version: number;
          sentences: Json;
          created_at?: string;
        };
        Update: {
          id?: number;
          source_id?: number;
          user_id?: string;
          origin?: string;
          language?: string;
          segmentation_version?: number;
          sentences?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "content_transcripts_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "content_sources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "content_transcripts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      league_memberships: {
        Row: {
          user_id: string;
          league_id: string;
          xp_this_week: number;
          joined_at: string;
        };
        Insert: {
          user_id: string;
          league_id: string;
          xp_this_week?: number;
          joined_at?: string;
        };
        Update: {
          user_id?: string;
          league_id?: string;
          xp_this_week?: number;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "league_memberships_league_id_fkey";
            columns: ["league_id"];
            isOneToOne: false;
            referencedRelation: "leagues";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "league_memberships_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      leagues: {
        Row: {
          id: string;
          week_start: string;
          tier: Database["public"]["Enums"]["league_tier"];
          created_at: string;
        };
        Insert: {
          id?: string;
          week_start: string;
          tier: Database["public"]["Enums"]["league_tier"];
          created_at?: string;
        };
        Update: {
          id?: string;
          week_start?: string;
          tier?: Database["public"]["Enums"]["league_tier"];
          created_at?: string;
        };
        Relationships: [];
      };
      learner_known_words: {
        Row: {
          id: number;
          user_id: string;
          word: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          word: string;
          status: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          word?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learner_known_words_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      learner_skill_states: {
        Row: {
          user_id: string;
          target_id: string;
          recognition: number;
          retrieval: number;
          listening: number;
          production: number;
          repair: number;
          transfer: number;
          retention: number;
          evidence_count: number;
          last_evidence_at: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          target_id: string;
          recognition?: number;
          retrieval?: number;
          listening?: number;
          production?: number;
          repair?: number;
          transfer?: number;
          retention?: number;
          evidence_count?: number;
          last_evidence_at?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          target_id?: string;
          recognition?: number;
          retrieval?: number;
          listening?: number;
          production?: number;
          repair?: number;
          transfer?: number;
          retention?: number;
          evidence_count?: number;
          last_evidence_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learner_skill_states_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      learning_attempts: {
        Row: {
          id: string;
          user_id: string;
          knowledge_item_id: string | null;
          capability_id: string | null;
          session_id: string | null;
          exercise_type: string;
          response_modality: string;
          prompt_id: string | null;
          context_id: string | null;
          response_text: string | null;
          correct: boolean | null;
          latency_ms: number | null;
          hint_count: number;
          reveal_used: boolean;
          support_level: number;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          knowledge_item_id?: string | null;
          capability_id?: string | null;
          session_id?: string | null;
          exercise_type: string;
          response_modality: string;
          prompt_id?: string | null;
          context_id?: string | null;
          response_text?: string | null;
          correct?: boolean | null;
          latency_ms?: number | null;
          hint_count?: number;
          reveal_used?: boolean;
          support_level?: number;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          knowledge_item_id?: string | null;
          capability_id?: string | null;
          session_id?: string | null;
          exercise_type?: string;
          response_modality?: string;
          prompt_id?: string | null;
          context_id?: string | null;
          response_text?: string | null;
          correct?: boolean | null;
          latency_ms?: number | null;
          hint_count?: number;
          reveal_used?: boolean;
          support_level?: number;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learning_attempts_user_id_fkey1";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      learning_attempts_legacy_202607: {
        Row: {
          id: number;
          user_id: string;
          session_id: string;
          lesson_id: string;
          activity_id: string;
          modality: string;
          status: string;
          score: number | null;
          error_tags: string[];
          evaluator: string;
          evaluator_version: string;
          latency_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          session_id: string;
          lesson_id: string;
          activity_id: string;
          modality: string;
          status: string;
          score?: number | null;
          error_tags?: string[];
          evaluator: string;
          evaluator_version: string;
          latency_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          session_id?: string;
          lesson_id?: string;
          activity_id?: string;
          modality?: string;
          status?: string;
          score?: number | null;
          error_tags?: string[];
          evaluator?: string;
          evaluator_version?: string;
          latency_ms?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learning_attempts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      learning_evidence_events: {
        Row: {
          id: string;
          user_id: string;
          attempt_id: string;
          evidence_type: string;
          target_id: string;
          success: boolean;
          confidence: number;
          support_level: number;
          context_id: string | null;
          evaluator: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          attempt_id: string;
          evidence_type: string;
          target_id: string;
          success: boolean;
          confidence?: number;
          support_level?: number;
          context_id?: string | null;
          evaluator?: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          attempt_id?: string;
          evidence_type?: string;
          target_id?: string;
          success?: boolean;
          confidence?: number;
          support_level?: number;
          context_id?: string | null;
          evaluator?: string;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learning_evidence_events_attempt_id_fkey";
            columns: ["attempt_id"];
            isOneToOne: false;
            referencedRelation: "learning_attempts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "learning_evidence_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_history: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed_at: string;
          score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          completed_at?: string;
          score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          completed_at?: string;
          score?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_logs: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          url: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          url?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          body?: string;
          url?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      pilot_events: {
        Row: {
          id: number;
          event_name: string;
          occurred_at: string;
          user_id: string | null;
          anonymous_id: string;
          source: string | null;
          unit_id: string | null;
          day_number: number | null;
          score: number | null;
          star_count: number | null;
          passed: boolean | null;
        };
        Insert: {
          id?: number;
          event_name: string;
          occurred_at?: string;
          user_id?: string | null;
          anonymous_id: string;
          source?: string | null;
          unit_id?: string | null;
          day_number?: number | null;
          score?: number | null;
          star_count?: number | null;
          passed?: boolean | null;
        };
        Update: {
          id?: number;
          event_name?: string;
          occurred_at?: string;
          user_id?: string | null;
          anonymous_id?: string;
          source?: string | null;
          unit_id?: string | null;
          day_number?: number | null;
          score?: number | null;
          star_count?: number | null;
          passed?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "pilot_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      project_memories: {
        Row: {
          id: number;
          content: string;
          embedding: string | null;
          category: string | null;
          metadata: Json | null;
          project: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          content: string;
          embedding?: string | null;
          category?: string | null;
          metadata?: Json | null;
          project?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: number;
          content?: string;
          embedding?: string | null;
          category?: string | null;
          metadata?: Json | null;
          project?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          keys: Json;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          keys: Json;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          keys?: Json;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_results: {
        Row: {
          id: string;
          user_id: string;
          unit_id: string;
          score: number;
          total: number;
          pct: number;
          xp_earned: number;
          quiz_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          unit_id: string;
          score: number;
          total: number;
          pct: number;
          xp_earned: number;
          quiz_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          unit_id?: string;
          score?: number;
          total?: number;
          pct?: number;
          xp_earned?: number;
          quiz_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_results_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      speaking_sessions: {
        Row: {
          id: string;
          user_id: string;
          practice_type: string;
          duration: number;
          transcript: string | null;
          accuracy_score: number | null;
          scenario_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          practice_type: string;
          duration: number;
          transcript?: string | null;
          accuracy_score?: number | null;
          scenario_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          practice_type?: string;
          duration?: number;
          transcript?: string | null;
          accuracy_score?: number | null;
          scenario_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "speaking_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      unit_content: {
        Row: {
          unit_id: string;
          content: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          unit_id: string;
          content: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          unit_id?: string;
          content?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_achievements: {
        Row: {
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
          notified: boolean;
        };
        Insert: {
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
          notified?: boolean;
        };
        Update: {
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
          notified?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey";
            columns: ["achievement_id"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      user_flashcard_progress: {
        Row: {
          user_id: string;
          cards_reviewed_today: number;
          last_session_date: string | null;
          total_cards_reviewed: number;
          total_sessions: number;
          streak_days: number;
          best_streak: number;
          last_session_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          cards_reviewed_today?: number;
          last_session_date?: string | null;
          total_cards_reviewed?: number;
          total_sessions?: number;
          streak_days?: number;
          best_streak?: number;
          last_session_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          cards_reviewed_today?: number;
          last_session_date?: string | null;
          total_cards_reviewed?: number;
          total_sessions?: number;
          streak_days?: number;
          best_streak?: number;
          last_session_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_flashcard_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      user_lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          unit_id: string;
          completed_at: string;
          xp_earned: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          unit_id: string;
          completed_at?: string;
          xp_earned?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          unit_id?: string;
          completed_at?: string;
          xp_earned?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      user_onboarding_profile: {
        Row: {
          user_id: string;
          goal: string;
          obstacle: string;
          daily_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          goal: string;
          obstacle: string;
          daily_minutes: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          goal?: string;
          obstacle?: string;
          daily_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_onboarding_profile_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      user_progress: {
        Row: {
          user_id: string;
          current_level: string;
          streak: number;
          total_xp: number;
          created_at: string;
          updated_at: string;
          daily_xp_goal: number;
          last_active_date: string | null;
          streak_freeze_count: number;
          best_streak: number;
          notification_hour: number | null;
          email_notifications: boolean | null;
          starting_unit_index: number;
          placement_completed_at: string | null;
        };
        Insert: {
          user_id: string;
          current_level?: string;
          streak?: number;
          total_xp?: number;
          created_at?: string;
          updated_at?: string;
          daily_xp_goal?: number;
          last_active_date?: string | null;
          streak_freeze_count?: number;
          best_streak?: number;
          notification_hour?: number | null;
          email_notifications?: boolean | null;
          starting_unit_index?: number;
          placement_completed_at?: string | null;
        };
        Update: {
          user_id?: string;
          current_level?: string;
          streak?: number;
          total_xp?: number;
          created_at?: string;
          updated_at?: string;
          daily_xp_goal?: number;
          last_active_date?: string | null;
          streak_freeze_count?: number;
          best_streak?: number;
          notification_hour?: number | null;
          email_notifications?: boolean | null;
          starting_unit_index?: number;
          placement_completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      user_sentences: {
        Row: {
          id: string;
          user_id: string;
          sentence_en: string;
          meaning_vn: string;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          sentence_en: string;
          meaning_vn: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          sentence_en?: string;
          meaning_vn?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_sentences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_id_fkey";
            columns: ["id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      zero_path_session_submissions: {
        Row: {
          id: number;
          session_id: string;
          seq: number;
          action_id: string;
          idempotency_key: string;
          outcome_kind: string;
          outcome: Json;
          created_at: string;
        };
        Insert: {
          id?: number;
          session_id: string;
          seq: number;
          action_id: string;
          idempotency_key: string;
          outcome_kind: string;
          outcome: Json;
          created_at?: string;
        };
        Update: {
          id?: number;
          session_id?: string;
          seq?: number;
          action_id?: string;
          idempotency_key?: string;
          outcome_kind?: string;
          outcome?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "zero_path_session_submissions_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "zero_path_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      zero_path_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          lesson_id: string;
          lesson_version: number;
          mode: string;
          status: string;
          created_at: string;
          updated_at: string;
          expires_at: string;
          access_secret_hash: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          lesson_id: string;
          lesson_version: number;
          mode: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
          expires_at: string;
          access_secret_hash?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          lesson_id?: string;
          lesson_version?: number;
          mode?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
          expires_at?: string;
          access_secret_hash?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "zero_path_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      apply_fsrs_card_review: {
        Args: {
          p_card_id: string;
          p_state: number;
          p_difficulty: number;
          p_stability: number;
          p_elapsed_days: number;
          p_scheduled_days: number;
          p_lapses: number;
          p_learning_steps: number;
          p_last_review: string;
          p_next_review: string;
          p_repetitions: number;
          p_log_rating: number;
          p_log_state: number;
          p_log_due: string;
          p_log_stability: number;
          p_log_difficulty: number;
          p_log_elapsed_days: number;
          p_log_scheduled_days: number;
          p_log_review: string;
        };
        Returns: undefined;
      };
      apply_placement_result: {
        Args: {
          p_level: string;
          p_starting_unit_index: number;
          p_seed_xp?: number;
          p_today?: string;
        };
        Returns: undefined;
      };
      armor: {
        Args: {};
        Returns: string;
      };
      array_to_halfvec: {
        Args: {};
        Returns: string;
      };
      array_to_sparsevec: {
        Args: {};
        Returns: string;
      };
      array_to_vector: {
        Args: {};
        Returns: string;
      };
      assign_league_for_user: {
        Args: { p_user_id: string };
        Returns: string;
      };
      auth_role: {
        Args: {};
        Returns: string;
      };
      auth_uid: {
        Args: {};
        Returns: string;
      };
      award_user_xp: {
        Args: {
          p_user_id: string;
          p_xp_amount: number;
          p_today: string;
          p_yesterday: string;
        };
        Returns: {
          total_xp: number;
          streak: number;
          last_active_date: string;
        }[];
      };
      binary_quantize: {
        Args: {};
        Returns: string;
      };
      bump_league_xp: {
        Args: { p_user_id: string; p_xp_delta: number };
        Returns: undefined;
      };
      check_cefr_progression: {
        Args: {};
        Returns: string;
      };
      claim_unit_checkpoint_transaction: {
        Args: { p_user_id: string; p_unit_id: string; p_answers: Json };
        Returns: Json;
      };
      complete_unit_transaction: {
        Args: {
          p_user_id: string;
          p_unit_id: string;
          p_xp_earned: number;
          p_stars: number;
          p_today: string;
        };
        Returns: Json;
      };
      cosine_distance: {
        Args: {};
        Returns: number;
      };
      crypt: {
        Args: {};
        Returns: string;
      };
      dearmor: {
        Args: {};
        Returns: string;
      };
      decrypt: {
        Args: {};
        Returns: string;
      };
      decrypt_iv: {
        Args: {};
        Returns: string;
      };
      digest: {
        Args: {};
        Returns: string;
      };
      encrypt: {
        Args: {};
        Returns: string;
      };
      encrypt_iv: {
        Args: {};
        Returns: string;
      };
      fips_mode: {
        Args: {};
        Returns: boolean;
      };
      gen_random_bytes: {
        Args: {};
        Returns: string;
      };
      gen_random_uuid: {
        Args: {};
        Returns: string;
      };
      gen_salt: {
        Args: {};
        Returns: string;
      };
      get_learner_evidence_coverage: {
        Args: {};
        Returns: {
          target_id: string;
          evidence_type: string;
          evidence_count: number;
        }[];
      };
      grant_streak_freeze: {
        Args: { p_user_id: string; p_count?: number };
        Returns: undefined;
      };
      halfvec: {
        Args: {};
        Returns: string;
      };
      halfvec_accum: {
        Args: {};
        Returns: number[];
      };
      halfvec_add: {
        Args: {};
        Returns: string;
      };
      halfvec_avg: {
        Args: {};
        Returns: string;
      };
      halfvec_cmp: {
        Args: {};
        Returns: number;
      };
      halfvec_combine: {
        Args: {};
        Returns: number[];
      };
      halfvec_concat: {
        Args: {};
        Returns: string;
      };
      halfvec_eq: {
        Args: {};
        Returns: boolean;
      };
      halfvec_ge: {
        Args: {};
        Returns: boolean;
      };
      halfvec_gt: {
        Args: {};
        Returns: boolean;
      };
      halfvec_in: {
        Args: {};
        Returns: string;
      };
      halfvec_l2_squared_distance: {
        Args: {};
        Returns: number;
      };
      halfvec_le: {
        Args: {};
        Returns: boolean;
      };
      halfvec_lt: {
        Args: {};
        Returns: boolean;
      };
      halfvec_mul: {
        Args: {};
        Returns: string;
      };
      halfvec_ne: {
        Args: {};
        Returns: boolean;
      };
      halfvec_negative_inner_product: {
        Args: {};
        Returns: number;
      };
      halfvec_out: {
        Args: {};
        Returns: string;
      };
      halfvec_recv: {
        Args: {};
        Returns: string;
      };
      halfvec_send: {
        Args: {};
        Returns: string;
      };
      halfvec_spherical_distance: {
        Args: {};
        Returns: number;
      };
      halfvec_sub: {
        Args: {};
        Returns: string;
      };
      halfvec_to_float4: {
        Args: {};
        Returns: number[];
      };
      halfvec_to_sparsevec: {
        Args: {};
        Returns: string;
      };
      halfvec_to_vector: {
        Args: {};
        Returns: string;
      };
      halfvec_typmod_in: {
        Args: {};
        Returns: number;
      };
      hamming_distance: {
        Args: {};
        Returns: number;
      };
      handle_new_user: {
        Args: {};
        Returns: string;
      };
      hmac: {
        Args: {};
        Returns: string;
      };
      hnsw_bit_support: {
        Args: {};
        Returns: string;
      };
      hnsw_halfvec_support: {
        Args: {};
        Returns: string;
      };
      hnsw_sparsevec_support: {
        Args: {};
        Returns: string;
      };
      hnswhandler: {
        Args: {};
        Returns: string;
      };
      inner_product: {
        Args: {};
        Returns: number;
      };
      ivfflat_bit_support: {
        Args: {};
        Returns: string;
      };
      ivfflat_halfvec_support: {
        Args: {};
        Returns: string;
      };
      ivfflathandler: {
        Args: {};
        Returns: string;
      };
      jaccard_distance: {
        Args: {};
        Returns: number;
      };
      l1_distance: {
        Args: {};
        Returns: number;
      };
      l2_distance: {
        Args: {};
        Returns: number;
      };
      l2_norm: {
        Args: {};
        Returns: number;
      };
      l2_normalize: {
        Args: {};
        Returns: string;
      };
      match_memories: {
        Args: {
          query_embedding: string;
          match_threshold?: number;
          match_count?: number;
          filter_project?: string;
          filter_category?: string;
        };
        Returns: {
          id: number;
          content: string;
          category: string;
          metadata: Json;
          project: string;
          created_at: string;
          similarity: number;
        }[];
      };
      next_cefr_level: {
        Args: { level: string };
        Returns: string;
      };
      pgp_armor_headers: {
        Args: { OUT: string };
        Returns: string[];
      };
      pgp_key_id: {
        Args: {};
        Returns: string;
      };
      pgp_pub_decrypt: {
        Args: {};
        Returns: string;
      };
      pgp_pub_decrypt_bytea: {
        Args: {};
        Returns: string;
      };
      pgp_pub_encrypt: {
        Args: {};
        Returns: string;
      };
      pgp_pub_encrypt_bytea: {
        Args: {};
        Returns: string;
      };
      pgp_sym_decrypt: {
        Args: {};
        Returns: string;
      };
      pgp_sym_decrypt_bytea: {
        Args: {};
        Returns: string;
      };
      pgp_sym_encrypt: {
        Args: {};
        Returns: string;
      };
      pgp_sym_encrypt_bytea: {
        Args: {};
        Returns: string;
      };
      prune_old_notifications: {
        Args: {};
        Returns: string;
      };
      record_learning_attempt: {
        Args: {
          p_knowledge_item_id: string;
          p_capability_id: string;
          p_session_id: string;
          p_exercise_type: string;
          p_response_modality: string;
          p_prompt_id: string;
          p_context_id: string;
          p_response_text: string;
          p_correct: boolean;
          p_latency_ms: number;
          p_hint_count: number;
          p_reveal_used: boolean;
          p_support_level: number;
          p_metadata: Json;
          p_evidence_type: string;
          p_evidence_target_id: string;
          p_evidence_success: boolean;
          p_evidence_confidence: number;
          p_evidence_context_id: string;
          p_evaluator: string;
          p_evidence_metadata: Json;
        };
        Returns: string;
      };
      record_learning_attempt_trusted: {
        Args: {
          p_user_id: string;
          p_knowledge_item_id: string;
          p_capability_id: string;
          p_session_id: string;
          p_exercise_type: string;
          p_response_modality: string;
          p_prompt_id: string;
          p_context_id: string;
          p_response_text: string;
          p_correct: boolean;
          p_latency_ms: number;
          p_hint_count: number;
          p_reveal_used: boolean;
          p_support_level: number;
          p_metadata: Json;
          p_evidence_type: string;
          p_evidence_target_id: string;
          p_evidence_success: boolean;
          p_evidence_confidence: number;
          p_evidence_context_id: string;
          p_evaluator: string;
          p_evidence_metadata: Json;
        };
        Returns: string;
      };
      reset_unit_progress: {
        Args: { p_unit_id: string };
        Returns: undefined;
      };
      set_updated_at: {
        Args: {};
        Returns: string;
      };
      sparsevec: {
        Args: {};
        Returns: string;
      };
      sparsevec_cmp: {
        Args: {};
        Returns: number;
      };
      sparsevec_eq: {
        Args: {};
        Returns: boolean;
      };
      sparsevec_ge: {
        Args: {};
        Returns: boolean;
      };
      sparsevec_gt: {
        Args: {};
        Returns: boolean;
      };
      sparsevec_in: {
        Args: {};
        Returns: string;
      };
      sparsevec_l2_squared_distance: {
        Args: {};
        Returns: number;
      };
      sparsevec_le: {
        Args: {};
        Returns: boolean;
      };
      sparsevec_lt: {
        Args: {};
        Returns: boolean;
      };
      sparsevec_ne: {
        Args: {};
        Returns: boolean;
      };
      sparsevec_negative_inner_product: {
        Args: {};
        Returns: number;
      };
      sparsevec_out: {
        Args: {};
        Returns: string;
      };
      sparsevec_recv: {
        Args: {};
        Returns: string;
      };
      sparsevec_send: {
        Args: {};
        Returns: string;
      };
      sparsevec_to_halfvec: {
        Args: {};
        Returns: string;
      };
      sparsevec_to_vector: {
        Args: {};
        Returns: string;
      };
      sparsevec_typmod_in: {
        Args: {};
        Returns: number;
      };
      subvector: {
        Args: {};
        Returns: string;
      };
      units_required_for_level: {
        Args: { level: string };
        Returns: number;
      };
      update_ufp_updated_at: {
        Args: {};
        Returns: string;
      };
      update_unit_content_updated_at: {
        Args: {};
        Returns: string;
      };
      use_streak_freeze: {
        Args: { p_user_id: string };
        Returns: Json;
      };
      vector: {
        Args: {};
        Returns: string;
      };
      vector_accum: {
        Args: {};
        Returns: number[];
      };
      vector_add: {
        Args: {};
        Returns: string;
      };
      vector_avg: {
        Args: {};
        Returns: string;
      };
      vector_cmp: {
        Args: {};
        Returns: number;
      };
      vector_combine: {
        Args: {};
        Returns: number[];
      };
      vector_concat: {
        Args: {};
        Returns: string;
      };
      vector_dims: {
        Args: {};
        Returns: number;
      };
      vector_eq: {
        Args: {};
        Returns: boolean;
      };
      vector_ge: {
        Args: {};
        Returns: boolean;
      };
      vector_gt: {
        Args: {};
        Returns: boolean;
      };
      vector_in: {
        Args: {};
        Returns: string;
      };
      vector_l2_squared_distance: {
        Args: {};
        Returns: number;
      };
      vector_le: {
        Args: {};
        Returns: boolean;
      };
      vector_lt: {
        Args: {};
        Returns: boolean;
      };
      vector_mul: {
        Args: {};
        Returns: string;
      };
      vector_ne: {
        Args: {};
        Returns: boolean;
      };
      vector_negative_inner_product: {
        Args: {};
        Returns: number;
      };
      vector_norm: {
        Args: {};
        Returns: number;
      };
      vector_out: {
        Args: {};
        Returns: string;
      };
      vector_recv: {
        Args: {};
        Returns: string;
      };
      vector_send: {
        Args: {};
        Returns: string;
      };
      vector_spherical_distance: {
        Args: {};
        Returns: number;
      };
      vector_sub: {
        Args: {};
        Returns: string;
      };
      vector_to_float4: {
        Args: {};
        Returns: number[];
      };
      vector_to_halfvec: {
        Args: {};
        Returns: string;
      };
      vector_to_sparsevec: {
        Args: {};
        Returns: string;
      };
      vector_typmod_in: {
        Args: {};
        Returns: number;
      };
      zero_path_append_submission: {
        Args: {
          p_session_id: string;
          p_access_secret: string;
          p_seq: number;
          p_action_id: string;
          p_idempotency_key: string;
          p_outcome_kind: string;
          p_outcome: Json;
        };
        Returns: boolean;
      };
      zero_path_get_session: {
        Args: { p_session_id: string; p_access_secret: string };
        Returns: {
          id: string;
          user_id: string;
          lesson_id: string;
          lesson_version: number;
          mode: string;
          status: string;
          created_at: string;
          updated_at: string;
          expires_at: string;
        }[];
      };
      zero_path_list_own_open_sessions: {
        Args: {};
        Returns: {
          id: string;
          user_id: string;
          lesson_id: string;
          lesson_version: number;
          mode: string;
          status: string;
          created_at: string;
          updated_at: string;
          expires_at: string;
        }[];
      };
      zero_path_list_submissions: {
        Args: { p_session_id: string; p_access_secret: string };
        Returns: Database["public"]["Tables"]["zero_path_session_submissions"]["Row"][];
      };
      zero_path_open_session: {
        Args: { p_lesson_id: string; p_lesson_version: number; p_mode: string };
        Returns: {
          session_id: string;
          access_secret: string;
        }[];
      };
      zero_path_session_accessible: {
        Args: { p_session_id: string; p_access_secret: string };
        Returns: boolean;
      };
    };
    Enums: {
      cefr_level: "A1" | "A2" | "B1" | "B2" | "C1";
      league_tier: "bronze" | "silver" | "gold" | "emerald" | "diamond";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      cefr_level: ["A1", "A2", "B1", "B2", "C1"],
      league_tier: ["bronze", "silver", "gold", "emerald", "diamond"],
    },
  },
} as const;
