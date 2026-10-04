// Replays supabase/migrations/*.sql (Neon-adapted) onto the linked Neon
// branch, in filename order, each file inside its own transaction.
// Tracks applied files in public._neon_migrations so re-runs are idempotent.
//
// Requires DATABASE_URL_UNPOOLED in the environment (direct connection —
// migrations must not go through the PgBouncer pooler).
//
// Usage:
//   set -a; . ./.env.local; set +a
//   node scripts/neon/replay-migrations.mjs [--bootstrap]
//     --bootstrap also applies scripts/neon/00-compat.sql first.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "@neondatabase/serverless";

const MIGRATIONS_DIR = new URL("../../supabase/migrations/", import.meta.url)
  .pathname;
const COMPAT_SQL = new URL("./00-compat.sql", import.meta.url).pathname;

const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) {
  console.error("DATABASE_URL_UNPOOLED is not set");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });
const client = await pool.connect();
try {
  await client.query(
    `create table if not exists public._neon_migrations (
       filename text primary key,
       applied_at timestamptz not null default now()
     )`,
  );

  const queue = [];
  if (process.argv.includes("--bootstrap")) {
    queue.push({ name: "__neon_compat__", path: COMPAT_SQL });
  }
  for (const file of readdirSync(MIGRATIONS_DIR).sort()) {
    if (file.endsWith(".sql")) {
      queue.push({ name: file, path: join(MIGRATIONS_DIR, file) });
    }
  }

  const { rows: applied } = await client.query(
    "select filename from public._neon_migrations",
  );
  const done = new Set(applied.map((r) => r.filename));

  let ok = 0;
  let skipped = 0;
  for (const { name, path } of queue) {
    if (done.has(name)) {
      skipped++;
      continue;
    }
    const sqlText = readFileSync(path, "utf8");
    try {
      await client.query("begin");
      await client.query(sqlText);
      await client.query(
        "insert into public._neon_migrations (filename) values ($1)",
        [name],
      );
      await client.query("commit");
      console.log(`APPLIED  ${name}`);
      ok++;
    } catch (err) {
      await client.query("rollback");
      console.error(`FAILED   ${name}\n         ${err.message}`);
      process.exitCode = 1;
      break; // stop: later migrations may depend on this one
    }
  }
  console.log(`\n${ok} applied, ${skipped} skipped (already applied)`);
} finally {
  client.release();
  await pool.end();
}
