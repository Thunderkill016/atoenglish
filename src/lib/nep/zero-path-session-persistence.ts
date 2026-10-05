/**
 * Capability-RPC implementation of ZeroPathSessionPersistence.
 *
 * Anonymous callers have no direct table access to zero_path_sessions /
 * zero_path_session_submissions — every operation goes through the
 * zero_path_* SECURITY DEFINER functions, which require either row ownership
 * (auth.uid()) or the session's access secret. `resolveSecret` supplies the
 * secret for a given session id (the actions layer reads it from the
 * caller's HttpOnly capability cookie).
 *
 * `types/supabase.ts` predates the zero_path_* functions, so the client is
 * narrowed through an explicit RPC interface — same pattern as the
 * mission-checkpoint action's RpcFn.
 */
import type {
  ZeroPathSessionRow,
  ZeroPathSessionSubmissionRow,
} from "@/types/learning-tables";
import type {
  ZeroPathSessionMode,
  ZeroPathSessionPersistence,
} from "@/lib/nep/zero-path-session-store.v1";

type RpcResult<Row> = PromiseLike<{
  data: Row | readonly Row[] | null;
  error: { message: string; code?: string } | null;
}>;

type ZeroPathRpcClient = {
  rpc(fn: string, args: Record<string, unknown>): RpcResult<unknown>;
};

export type ResolveSessionSecret = (
  sessionId: string,
) => string | null | Promise<string | null>;

export function createZeroPathSessionPersistence(
  client: unknown,
  resolveSecret: ResolveSessionSecret = () => null,
): ZeroPathSessionPersistence {
  const supabase = client as ZeroPathRpcClient;
  return {
    async openSession({ lessonId, lessonVersion, mode }) {
      const { data, error } = await supabase.rpc("zero_path_open_session", {
        p_lesson_id: lessonId,
        p_lesson_version: lessonVersion,
        p_mode: mode satisfies ZeroPathSessionMode,
      });
      const row = Array.isArray(data) ? data[0] : null;
      const sessionId =
        row && typeof (row as { session_id?: unknown }).session_id === "string"
          ? (row as { session_id: string }).session_id
          : null;
      const accessSecret =
        row &&
        typeof (row as { access_secret?: unknown }).access_secret === "string"
          ? (row as { access_secret: string }).access_secret
          : null;
      if (error || !sessionId || !accessSecret) return null;
      return { sessionId, accessSecret };
    },
    async getSession(sessionId) {
      const { data, error } = await supabase.rpc("zero_path_get_session", {
        p_session_id: sessionId,
        p_access_secret: await resolveSecret(sessionId),
      });
      const row = Array.isArray(data) ? data[0] : null;
      if (error || !row) return null;
      return row as ZeroPathSessionRow;
    },
    async listSubmissions(sessionId) {
      const { data, error } = await supabase.rpc("zero_path_list_submissions", {
        p_session_id: sessionId,
        p_access_secret: await resolveSecret(sessionId),
      });
      if (error || !data || !Array.isArray(data)) return [];
      return data as readonly ZeroPathSessionSubmissionRow[];
    },
    async insertSubmission(row) {
      const { data, error } = await supabase.rpc(
        "zero_path_append_submission",
        {
          p_session_id: row.session_id,
          p_access_secret: await resolveSecret(row.session_id),
          p_seq: row.seq,
          p_action_id: row.action_id,
          p_idempotency_key: row.idempotency_key,
          p_outcome_kind: row.outcome_kind,
          p_outcome: row.outcome,
        },
      );
      if (error) return false;
      return data === true;
    },
    async listOwnedOpenSessions() {
      const { data, error } = await supabase.rpc(
        "zero_path_list_own_open_sessions",
        {},
      );
      if (error || !data || !Array.isArray(data)) return [];
      return data as readonly ZeroPathSessionRow[];
    },
  };
}
