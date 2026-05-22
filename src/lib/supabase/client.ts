/**
 * NUR Lingo — Supabase Client
 * Browser-side singleton
 */
import { createBrowserClient } from "@supabase/ssr";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_id: string | null;
          username: string | null;
          email: string | null;
          display_name: string | null;
          cefr_level: string;
          xp_total: number;
          streak_days: number;
          streak_last_date: string | null;
          preferences: Record<string, unknown>;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["users"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
      };
      lexicon_entries: {
        Row: {
          id: string;
          word: string;
          english: string[];
          synonyms: string[];
          grammar_type: string;
          difficulty: number;
          embedding_group: string | null;
          lesson_tags: string[];
          related_forms: string[];
          notes: string | null;
          frequency_rank: number | null;
        };
        Insert: Partial<Database["public"]["Tables"]["lexicon_entries"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["lexicon_entries"]["Row"]>;
      };
      exercise_attempts: {
        Row: {
          id: string;
          user_id: string;
          exercise_id: string | null;
          lesson_id: string | null;
          user_answer: string;
          expected_answer: string;
          english_original: string | null;
          is_accepted: boolean;
          score: number | null;
          validation_layer: string | null;
          ai_used: boolean;
          feedback: string | null;
          xp_awarded: number;
          response_time_ms: number | null;
          session_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["exercise_attempts"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["exercise_attempts"]["Row"]>;
      };
      user_lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          status: "not_started" | "in_progress" | "completed";
          score: number;
          xp_earned: number;
          attempts: number;
          best_score: number;
          last_attempt_at: string | null;
          completed_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["user_lesson_progress"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["user_lesson_progress"]["Row"]>;
      };
    };
  };
};

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowser() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return browserClient;
}
