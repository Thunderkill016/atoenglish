// Normalizes table/sequence/function ACLs on a Neon branch to the exact
// state the Supabase-era migrations define. Use when blanket grants were
// applied AFTER migrations (re-running 00-compat.sql or manual grants),
// which re-opens privileges the migrations deliberately revoked.
//
// How it replicates Supabase semantics:
//   1. WIPE    — revoke everything from the PostgREST-facing roles on all
//                objects in public+private (PUBLIC included: functions get
//                PUBLIC EXECUTE by default in Postgres).
//   2. IMPLICIT — re-apply Supabase's ALTER DEFAULT PRIVILEGES behavior as
//                explicit grants on existing objects (public tables,
//                sequences, functions -> anon/authenticated/service_role;
//                `anonymous` inherits via `grant anon to anonymous`).
//   3. REPLAY  — re-run every static GRANT/REVOKE statement from the
//                adapted migrations, in filename order. Interleaved
//                revokes land last-word-correctly, exactly as they did
//                during migration replay.
//
// Safe: idempotent, order-preserving, and does not touch owner or
// neondb_owner privileges. Requires DATABASE_URL_UNPOOLED.
//
// Usage:
//   set -a; . ./.env.local; set +a
//   node scripts/neon/repair-acls.mjs
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "@neondatabase/serverless";

const MIGRATIONS_DIR = new URL("../../supabase/migrations/", import.meta.url)
  .pathname;
const ROLE_LIST = "public, anon, authenticated, service_role, anonymous";
const IMPLICIT_ROLES = "anon, authenticated, service_role";

const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) {
  console.error("DATABASE_URL_UNPOOLED is not set");
  process.exit(1);
}

// Split a SQL file into top-level statements, honoring $tag$ dollar quoting
// (function bodies, throws_ok payloads) so internal semicolons don't cut.
function splitStatements(sql) {
  const out = [];
  let buf = "";
  let i = 0;
  const n = sql.length;
  while (i < n) {
    if (sql[i] === "$") {
      const m = sql.slice(i).match(/^\$[a-zA-Z_0-9]*\$/);
      if (m) {
        const tag = m[0];
        const end = sql.indexOf(tag, i + tag.length);
        if (end === -1) {
          buf += sql.slice(i);
          i = n;
          break;
        }
        buf += sql.slice(i, end + tag.length);
        i = end + tag.length;
        continue;
      }
    }
    if (sql[i] === ";") {
      out.push(buf);
      buf = "";
      i++;
      continue;
    }
    buf += sql[i];
    i++;
  }
  if (buf.trim()) out.push(buf);
  return out.map((s) => s.trim()).filter(Boolean);
}

// Statements may carry leading -- comment lines (file headers etc.), so test
// after stripping them. A statement that is only comments yields "" and is
// filtered out upstream already.
const stripLeadingComments = (s) =>
  s.replace(/^(\s*--[^\n]*(\n|$))+/, "");
const PRIVILEGE_RE = /^\s*(grant|revoke)\b/i;

const pool = new Pool({ connectionString: url });
const client = await pool.connect();
try {
  console.log("— wipe —");
  await client.query(
    `revoke all on all tables in schema public from ${ROLE_LIST}`,
  );
  await client.query(
    `revoke all on all sequences in schema public from ${ROLE_LIST}`,
  );
  await client.query(
    `revoke all on all functions in schema public from ${ROLE_LIST}`,
  );
  await client.query(
    `revoke all on all functions in schema private from ${ROLE_LIST}`,
  );
  console.log("  done");

  console.log("— implicit Supabase-style default privileges —");
  await client.query(
    `grant select, insert, update, delete on all tables in schema public to ${IMPLICIT_ROLES}`,
  );
  await client.query(
    `grant usage, select on all sequences in schema public to ${IMPLICIT_ROLES}`,
  );
  await client.query(
    `grant execute on all functions in schema public to ${IMPLICIT_ROLES}`,
  );
  console.log("  done");

  console.log("— replay GRANT/REVOKE statements in migration order —");
  let applied = 0;
  const failures = [];
  for (const file of readdirSync(MIGRATIONS_DIR).sort()) {
    if (!file.endsWith(".sql")) continue;
    const stmts = splitStatements(
      readFileSync(join(MIGRATIONS_DIR, file), "utf8"),
    ).filter((s) => PRIVILEGE_RE.test(stripLeadingComments(s)));
    for (const stmt of stmts) {
      try {
        await client.query(stmt);
        applied++;
      } catch (err) {
        // Grants referencing objects dropped/renamed by later migrations are
        // expected no-ops (e.g. learning_attempts_id_seq was replaced when the
        // table was rebuilt as uuid-keyed). Anything else is a real failure.
        if (/does not exist/.test(err.message)) {
          console.log(`   ~ skipped (gone): ${file}: ${stmt.slice(0, 90)}`);
        } else {
          failures.push(`${file}: ${err.message}\n  ${stmt.slice(0, 120)}`);
        }
      }
    }
  }
  console.log(`  ${applied} statements applied`);
  if (failures.length) {
    console.log(`  ${failures.length} failures:`);
    for (const f of failures) console.log(`   ! ${f}`);
    process.exitCode = 1;
  }

  console.log("— fixups for privilege effects inside migration DO blocks —");
  // (a) 20260907071500 DO-loop: REVOKE ALL on every private-schema function
  //     from PUBLIC/anon/authenticated. Re-run the equivalent wipe — the
  //     hardened boundary wants authenticated at zero private EXECUTE.
  await client.query(`do $$
    declare f regprocedure;
    begin
      for f in
        select p.oid::regprocedure
        from pg_catalog.pg_proc p
        join pg_catalog.pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'private'
      loop
        execute format('revoke all on function %s from public, anon, authenticated', f);
      end loop;
    end $$;`);
  console.log("  private-schema wipe done");
  // (b) 20260902133000 conditional archive block: the legacy table must stay
  //     locked to service_role (static extractor can't see inside the IF).
  await client.query(
    "revoke all on table public.learning_attempts_legacy_202607 from anon, authenticated",
  );
  await client.query(
    "grant select, insert, update, delete on table public.learning_attempts_legacy_202607 to service_role",
  );
  console.log("  legacy archive grants done");
} finally {
  client.release();
  await pool.end();
}
