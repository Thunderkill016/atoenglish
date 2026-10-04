/**
 * Supabase-backed implementation of ZeroPathSessionPersistence.
 *
 * `types/supabase.ts` predates the zero_path_sessions migration, so the
 * client is narrowed through an explicit table interface — same pattern as
 * `AttemptsTableClient` in the zero-path action. RLS enforces the ownership
 * boundary declared in the migration; this layer never sees another owner's
 * rows.
 */
import type {
  ZeroPathSessionInsert,
  ZeroPathSessionRow,
  ZeroPathSessionSubmissionInsert,
  ZeroPathSessionSubmissionRow,
} from "@/types/learning-tables";
import type { ZeroPathSessionPersistence } from "@/lib/nep/zero-path-session-store.v1";

type QueryResult<Row> = PromiseLike<{
  data: Row | readonly Row[] | null;
  error: { message: string; code?: string } | null;
}>;

type SessionsTableClient = {
  from(table: "zero_path_sessions"): {
    insert(row: ZeroPathSessionInsert): QueryResult<never>;
    select(columns: string): {
      eq(
        column: string,
        value: unknown,
      ): {
        single(): QueryResult<ZeroPathSessionRow>;
      } & {
        eq(
          column: string,
          value: unknown,
        ): {
          order(
            column: string,
            options: { ascending: boolean },
          ): QueryResult<readonly ZeroPathSessionRow[]>;
        };
      };
    };
  };
  from(table: "zero_path_session_submissions"): {
    insert(row: ZeroPathSessionSubmissionInsert): QueryResult<never>;
    select(columns: string): {
      eq(
        column: string,
        value: unknown,
      ): {
        order(
          column: string,
          options: { ascending: boolean },
        ): QueryResult<readonly ZeroPathSessionSubmissionRow[]>;
      };
    };
  };
};

export function createZeroPathSessionPersistence(
  client: unknown,
): ZeroPathSessionPersistence {
  const supabase = client as SessionsTableClient;
  return {
    async insertSession(row) {
      const { error } = await supabase.from("zero_path_sessions").insert(row);
      return !error;
    },
    async getSession(sessionId) {
      const { data, error } = await supabase
        .from("zero_path_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
      if (error || !data || Array.isArray(data)) return null;
      return data as ZeroPathSessionRow;
    },
    async listSubmissions(sessionId) {
      const { data, error } = await supabase
        .from("zero_path_session_submissions")
        .select("seq, action_id, idempotency_key, outcome_kind, outcome")
        .eq("session_id", sessionId)
        .order("seq", { ascending: true });
      if (error || !data) return [];
      return data as readonly ZeroPathSessionSubmissionRow[];
    },
    async insertSubmission(row) {
      const { error } = await supabase
        .from("zero_path_session_submissions")
        .insert(row);
      if (!error) return true;
      // Unique-violation on (session_id, idempotency_key) means the write
      // already landed — a retry must not be treated as storage loss.
      return error.code === "23505";
    },
    async listOwnedOpenSessions(userId) {
      const { data, error } = await supabase
        .from("zero_path_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "open")
        .order("updated_at", { ascending: false });
      if (error || !data) return [];
      return data as readonly ZeroPathSessionRow[];
    },
  };
}
