/**
 * Minimal `cloudflare:workers` module declaration for tsc — the generated
 * .cloudflare/types/index.d.ts declares the full module but also pollutes
 * globals with workerd runtime types that conflict with DOM/Next types, so
 * it stays out of tsconfig include and we declare only what we use.
 */
declare module "cloudflare:workers" {
  export const env: Record<string, unknown>;

  // Minimal sql.exec surface used by worker/index.ts (AuthRateLimiterDO).
  export type SqlStorageValue = number | string | null;
  export interface SqlStorageCursor {
    toArray(): Record<string, SqlStorageValue>[];
    one(): Record<string, SqlStorageValue>;
  }
  export interface SqlStorage {
    exec(query: string, ...bindings: SqlStorageValue[]): SqlStorageCursor;
  }
  export interface DurableObjectState {
    storage: { sql: SqlStorage };
  }
  export class DurableObject<Env = unknown> {
    constructor(ctx: DurableObjectState, env: Env);
    protected ctx: DurableObjectState;
    protected env: Env;
  }
}
