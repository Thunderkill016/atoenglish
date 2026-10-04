// Rewrites Supabase-flavoured migrations in place so they apply on Neon.
// Idempotent — safe to re-run; each transform is a no-op when already applied.
//
// Transforms:
//   1. `auth.users`            -> `neon_auth.user`   (FK refs, comments)
//   2. trigger on_auth_user_created on auth.users -> removed entirely.
//      neon_auth.user is owned by the managed `neon_auth` role; we cannot
//      create triggers on it. Profile bootstrap moves to the app layer
//      (see src/lib/supabase/session helpers / ensure-profile path).
//   3. `current_user in ('postgres','service_role')` guard lists gain
//      `'neondb_owner'` — the Neon direct-connection service role.
//   4. `auth.role()` -> `public.auth_role()` — the extension-owned `auth`
//      schema does not accept user objects, so the compat function lives in
//      public (defined by scripts/neon/00-compat.sql). Must stay
//      schema-qualified because callers run with `search_path = ''`.
//
// Usage: node scripts/neon/adapt-migrations.mjs [--check]
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = new URL("../../supabase/migrations/", import.meta.url)
  .pathname;
const checkOnly = process.argv.includes("--check");

const TRIGGER_RE =
  /create trigger on_auth_user_created\s+after insert on (?:auth\.users|neon_auth\.user)\s+for each row execute function public\.handle_new_user\(\);?\s*/i;
const GUARD_RE =
  /current_user not in \('postgres', 'service_role'(?!, 'neondb_owner')\)/gi;
const USERS_RE = /\bauth\.users\b/g;
const AUTH_ROLE_RE = /\bauth\.role\(\)/g;
// pgvector installs into public on Neon (extension schema is owned by
// cloud_admin and cannot be relocated); Supabase convention was `extensions`.
const EXTENSIONS_RE = /\bextensions\./g;

// `auth.uid()` only works when evaluated as the table owner (RLS) or the
// function owner (SECURITY DEFINER). SECURITY INVOKER function bodies run as
// `authenticated`, which lacks USAGE on the cloud_admin-owned `auth` schema.
// Rewrite auth.uid() → public.auth_uid() (a definer wrapper from 00-compat.sql)
// inside dollar-quoted function bodies only; RLS policies keep `auth.uid()`.
const DOLLAR_QUOTED = /(\$[a-zA-Z_]*\$[\s\S]*?\$[a-zA-Z_]*\$)/g;
const AUTH_UID_RE = /\bauth\.uid\(\)/g;

let changedFiles = 0;
for (const file of readdirSync(MIGRATIONS_DIR).sort()) {
  if (!file.endsWith(".sql")) continue;
  const path = join(MIGRATIONS_DIR, file);
  const original = readFileSync(path, "utf8");
  let next = original
    .replace(TRIGGER_RE, "")
    .replace(
      GUARD_RE,
      "current_user not in ('postgres', 'service_role', 'neondb_owner')",
    )
    .replace(USERS_RE, "neon_auth.user")
    .replace(AUTH_ROLE_RE, "public.auth_role()")
    .replace(EXTENSIONS_RE, "public.");

  next = next
    .split(DOLLAR_QUOTED)
    .map((segment, i) =>
      i % 2 === 1 ? segment.replace(AUTH_UID_RE, "public.auth_uid()") : segment,
    )
    .join("");

  if (next !== original) {
    changedFiles++;
    console.log(`${checkOnly ? "WOULD UPDATE" : "UPDATED"} ${file}`);
    if (!checkOnly) writeFileSync(path, next);
  }
}
console.log(
  checkOnly
    ? `${changedFiles} file(s) need adaptation`
    : `${changedFiles} file(s) adapted`,
);
