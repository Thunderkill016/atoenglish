import { neon } from "@neondatabase/serverless";

/**
 * Service-side RPC path for functions the hardened schema grants to
 * `service_role` only (e.g. complete_unit_transaction) or to internal
 * private.* helpers reachable only from an owner context
 * (apply_fsrs_card_review's invoker wrapper).
 *
 * Connects as `neondb_owner` — the Neon equivalent of Supabase's service
 * role (BYPASSRLS, inside every function's service guard list). It must
 * only be invoked from server code after the caller's identity has been
 * verified through the normal user-scoped client; never send it to the
 * browser.
 */
const databaseUrl =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL (or DATABASE_URL_UNPOOLED) is required for service RPC calls",
  );
}

const sql = neon(databaseUrl);

const FN_NAME_RE = /^[a-z][a-z0-9_]*$/;
const ARG_NAME_RE = /^p_[a-z0-9_]+$/;

export type ServiceRpcResult<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string } };

/**
 * Calls a public.* RPC with named-notation parameters, mirroring the
 * PostgREST `.rpc(name, args)` shape so call sites read the same way.
 * Function and argument names are whitelisted — values are always bound
 * parameters, never interpolated.
 */
export async function rpcService<T = unknown>(
  fn: string,
  args: Record<string, unknown> = {},
): Promise<ServiceRpcResult<T>> {
  if (!FN_NAME_RE.test(fn)) {
    return { data: null, error: { message: `invalid rpc name: ${fn}` } };
  }
  const keys = Object.keys(args);
  for (const k of keys) {
    if (!ARG_NAME_RE.test(k)) {
      return { data: null, error: { message: `invalid rpc arg: ${k}` } };
    }
  }
  const signature = keys
    .map((k, i) => `${k} => $${i + 1}`)
    .join(", ");
  try {
    const rows = await sql.query(
      `select public.${fn}(${signature}) as result`,
      keys.map((k) => args[k]),
    );
    return { data: (rows[0]?.result ?? null) as T, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : String(err) },
    };
  }
}
