/**
 * Minimal `cloudflare:workers` module declaration for tsc — the generated
 * .cloudflare/types/index.d.ts declares the full module but also pollutes
 * globals with workerd runtime types that conflict with DOM/Next types, so
 * it stays out of tsconfig include and we declare only what we use.
 */
declare module "cloudflare:workers" {
  export const env: Record<string, unknown>;
}
