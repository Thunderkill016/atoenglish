// Adapts the Supabase-flavoured pgTAP tests in supabase/tests/database/
// for Neon, writing them to scripts/neon/adapted-tests/*.sql.
// Idempotent — re-run after editing the source tests.
//
// Transforms:
//   1. `create extension pgtap with schema extensions` -> no schema clause
//      (Neon installs extensions into public; `extensions` schema is the
//      Supabase convention).
//   2. `search_path = public, extensions` -> `public`.
//   3. `insert into auth.users (id, aud, role, email, created_at, updated_at)`
//      -> `insert into neon_auth."user" (id, name, email, "emailVerified")`,
//      with matching VALUES tuples rewritten positionally:
//      ('<uuid>', 'authenticated', 'authenticated', '<email>', now(), now())
//      -> ('<uuid>', 'pgtap', '<email>', true).
//   4. `request.jwt.claim.sub` / `request.jwt.claim.role` set_config lines
//      are Supabase-only GUCs — pg_session_jwt only reads the
//      `request.jwt.claims` JSON document, which the tests already set.
//      They are dropped as no-ops.
//
// Usage: node scripts/neon/adapt-tests.mjs
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SRC_DIR = new URL("../../supabase/tests/database/", import.meta.url)
  .pathname;
const OUT_DIR = new URL("./adapted-tests/", import.meta.url).pathname;

const USERS_INSERT_RE =
  /insert into auth\.users \(id, aud, role, email, created_at, updated_at\)/g;
const TUPLE_RE =
  /\(\s*'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})',\s*'authenticated',\s*'authenticated',\s*'([^']+)',\s*now\(\),\s*now\(\)\s*\)/g;
const CLAIM_LINE_RE =
  /^\s*select set_config\('request\.jwt\.claim\.(sub|role)',[^\n]*\);\s*\n/gm;
const EXT_RE = /create extension if not exists pgtap with schema extensions;/g;
const SEARCH_RE = /set local search_path = public, extensions;/g;

mkdirSync(OUT_DIR, { recursive: true });
let count = 0;
for (const file of readdirSync(SRC_DIR).sort()) {
  if (!file.endsWith(".sql")) continue;
  let next = readFileSync(join(SRC_DIR, file), "utf8")
    .replace(EXT_RE, "create extension if not exists pgtap;")
    .replace(SEARCH_RE, "set local search_path = public;")
    .replace(
      USERS_INSERT_RE,
      'insert into neon_auth."user" (id, name, email, "emailVerified")',
    )
    .replace(TUPLE_RE, "('$1', 'pgtap', '$2', true)")
    .replace(CLAIM_LINE_RE, "");

  // Supabase's on_auth_user_created trigger auto-created a user_progress row
  // per auth.users insert; neon_auth.user cannot carry triggers, so seed the
  // rows the tests implicitly rely on (streak_freeze_count, XP assertions).
  const usersInsert = next.match(
    /insert into neon_auth\."user"[\s\S]*?;/i,
  );
  if (usersInsert) {
    const uuids = [...usersInsert[0].matchAll(/'([0-9a-f-]{36})'/g)].map(
      (m) => `'${m[1]}'`,
    );
    if (uuids.length) {
      const seed = `\n-- Neon: no on_auth_user_created trigger — seed user_progress\ninsert into public.user_progress (user_id)\nvalues ${uuids.map((u) => `(${u})`).join(", ")}\non conflict (user_id) do nothing;\n`;
      next = next.replace(usersInsert[0], usersInsert[0] + seed);
    }
  }

  writeFileSync(join(OUT_DIR, file), next);
  count++;
}
console.log(`${count} pgTAP file(s) adapted -> scripts/neon/adapted-tests/`);
