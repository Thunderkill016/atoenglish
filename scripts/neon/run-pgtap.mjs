// Runs the Neon-adapted pgTAP suites (scripts/neon/adapted-tests/*.sql)
// against the linked Neon branch and reports TAP output.
//
// Each file is executed statement-by-statement inside a single connection so
// `begin`/`rollback`/`set local role` semantics are preserved — every test
// file already wraps itself in begin/rollback, so no state persists.
//
// Usage:
//   set -a; . ./.env.local; set +a
//   node scripts/neon/adapt-tests.mjs   # (re)generate adapted tests first
//   node scripts/neon/run-pgtap.mjs
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "@neondatabase/serverless";

const TEST_DIR = new URL("./adapted-tests/", import.meta.url).pathname;

const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) {
  console.error("DATABASE_URL_UNPOOLED is not set");
  process.exit(1);
}

// Same dollar-quote-aware splitter as repair-acls.mjs.
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

const pool = new Pool({ connectionString: url });
const client = await pool.connect();
let totalFail = 0;
try {
  for (const file of readdirSync(TEST_DIR).sort()) {
    if (!file.endsWith(".sql")) continue;
    console.log(`\n=== ${file} ===`);
    const stmts = splitStatements(readFileSync(join(TEST_DIR, file), "utf8"));
    let fileFail = 0;
    for (const stmt of stmts) {
      try {
        const res = await client.query(stmt);
        for (const row of res.rows ?? []) {
          for (const v of Object.values(row)) {
            const line = String(v);
            if (line.startsWith("ok ") || line.startsWith("not ok ")) {
              console.log(`  ${line}`);
              if (line.startsWith("not ok")) fileFail++;
            } else if (/^\d+\.\.\d+$/.test(line)) {
              console.log(`  ${line}`);
            }
          }
        }
      } catch (err) {
        console.log(`  not ok - QUERY ERROR: ${err.message}`);
        console.log(`        in: ${stmt.slice(0, 140).replaceAll("\n", " ")}`);
        fileFail++;
        break; // transaction is broken; the file's rollback cleans up
      }
    }
    totalFail += fileFail;
    console.log(fileFail ? `  → ${fileFail} failure(s)` : "  → all ok");
  }
  console.log(`\n${totalFail === 0 ? "PASS" : `FAIL (${totalFail})`}`);
  process.exitCode = totalFail === 0 ? 0 : 1;
} finally {
  client.release();
  await pool.end();
}
