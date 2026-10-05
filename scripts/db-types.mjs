// scripts/db-types.mjs — regenerate src/types/supabase.ts from the Neon database.
// Emits the same shape as `supabase gen types typescript` so the Neon Data API
// types stay compatible with existing createClient<Database> call sites.
// Requires DATABASE_URL_UNPOOLED (or DATABASE_URL) in env or .env.local.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL_UNPOOLED && !process.env.DATABASE_URL) {
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL_UNPOOLED is not set");
  process.exit(1);
}
const sql = neon(url);

const PG_TO_TS = {
  int2: "number", int4: "number", int8: "number", float4: "number",
  float8: "number", numeric: "number", money: "number", oid: "number",
  bool: "boolean",
  json: "Json", jsonb: "Json",
  date: "string", time: "string", timetz: "string", timestamp: "string",
  timestamptz: "string", interval: "string",
  bytea: "string",
};

const [tables, columns, fks, uniques, enums, functions] = await Promise.all([
  sql`select table_name from information_schema.tables
      where table_schema = 'public' and table_type = 'BASE TABLE' order by 1`,
  sql`select table_name, column_name, udt_name, is_nullable, column_default,
             is_identity, is_generated
      from information_schema.columns where table_schema = 'public'
      order by table_name, ordinal_position`,
  sql`select kcu.table_name, kcu.column_name, kcu.constraint_name,
             ccu.table_name as ref_table, ccu.column_name as ref_column
      from information_schema.key_column_usage kcu
      join information_schema.referential_constraints rc
        on rc.constraint_name = kcu.constraint_name and rc.constraint_schema = kcu.constraint_schema
      join information_schema.constraint_column_usage ccu
        on ccu.constraint_name = rc.unique_constraint_name and ccu.constraint_schema = rc.unique_constraint_schema
      where kcu.table_schema = 'public' order by kcu.table_name, kcu.constraint_name, kcu.ordinal_position`,
  sql`select kcu.table_name, array_agg(kcu.column_name order by kcu.ordinal_position) as cols
      from information_schema.table_constraints tc
      join information_schema.key_column_usage kcu
        on kcu.constraint_name = tc.constraint_name and kcu.constraint_schema = tc.constraint_schema
      where tc.table_schema = 'public' and tc.constraint_type in ('PRIMARY KEY', 'UNIQUE')
      group by kcu.table_name, tc.constraint_name`,
  sql`select t.typname, e.enumlabel
      from pg_type t join pg_enum e on e.enumtypid = t.oid
      join pg_namespace n on n.oid = t.typnamespace
      where n.nspname = 'public' order by t.typname, e.enumsortorder`,
  sql`select p.proname, pg_get_function_arguments(p.oid) as args,
             pg_get_function_result(p.oid) as result
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.prokind = 'f' order by p.proname`,
]);

const enumMap = {};
for (const e of enums) (enumMap[e.typname] ??= []).push(e.enumlabel);

function tsType(udt, dataType) {
  // Postgres array udts are `_type`; enum udts match their typname.
  if (udt?.startsWith("_")) {
    const inner = tsType(udt.slice(1), "ARRAY");
    return `${inner}[]`;
  }
  if (enumMap[udt]) return `Database["public"]["Enums"]["${udt}"]`;
  const base = dataType === "USER-DEFINED" ? udt : udt ?? dataType;
  return PG_TO_TS[base] ?? "string";
}

const uniqueSets = {};
for (const u of uniques) (uniqueSets[u.table_name] ??= []).push(u.cols);

const byTable = {};
for (const c of columns) (byTable[c.table_name] ??= []).push(c);

const fkByTable = {};
for (const f of fks) (fkByTable[f.table_name] ??= []).push(f);

function ident(k) { return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k) ? k : JSON.stringify(k); }

const parts = [];
parts.push(`export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {`);

for (const t of tables) {
  const name = t.table_name;
  const cols = byTable[name] ?? [];
  parts.push(`      ${ident(name)}: {
        Row: {`);
  for (const c of cols) {
    const ts = tsType(c.udt_name, c.data_type);
    parts.push(`          ${ident(c.column_name)}: ${ts}${c.is_nullable === "YES" ? " | null" : ""}`);
  }
  parts.push(`        }
        Insert: {`);
  for (const c of cols) {
    const ts = tsType(c.udt_name, c.data_type);
    const opt = c.is_nullable === "YES" || c.column_default != null ||
      c.is_identity === "YES" || c.is_generated === "ALWAYS";
    parts.push(`          ${ident(c.column_name)}${opt ? "?" : ""}: ${ts}${c.is_nullable === "YES" ? " | null" : ""}`);
  }
  parts.push(`        }
        Update: {`);
  for (const c of cols) {
    const ts = tsType(c.udt_name, c.data_type);
    parts.push(`          ${ident(c.column_name)}?: ${ts}${c.is_nullable === "YES" ? " | null" : ""}`);
  }
  // Group FK columns by constraint.
  const byConstraint = {};
  for (const f of fkByTable[name] ?? []) {
    (byConstraint[f.constraint_name] ??= { cols: [], refs: new Map() });
    byConstraint[f.constraint_name].cols.push(f.column_name);
    byConstraint[f.constraint_name].refs.set(f.ref_table, [
      ...(byConstraint[f.constraint_name].refs.get(f.ref_table) ?? []),
      f.ref_column,
    ]);
  }
  parts.push(`        }
        Relationships: [`);
  for (const [cname, rel] of Object.entries(byConstraint)) {
    for (const [refTable, refCols] of rel.refs) {
      const oneToOne = (uniqueSets[name] ?? []).some(
        (u) => u.length === rel.cols.length && u.every((c) => rel.cols.includes(c)),
      );
      parts.push(`          {
            foreignKeyName: "${cname}"
            columns: [${rel.cols.map((c) => `"${c}"`).join(", ")}]
            isOneToOne: ${oneToOne}
            referencedRelation: "${refTable}"
            referencedColumns: [${refCols.map((c) => `"${c}"`).join(", ")}]
          },`);
    }
  }
  parts.push(`        ]
      }`);
}

parts.push(`    }
    Views: {
      [_ in never]: never
    }
    Functions: {`);

function argTs(argType) {
  const t = argType.trim().toLowerCase().replace(/\[\]$/, "");
  const base = { integer: "int4", bigint: "int8", smallint: "int2",
    "double precision": "float8", real: "float4",
    "character varying": "text", character: "text",
    "timestamp with time zone": "timestamptz",
    "timestamp without time zone": "timestamp",
    "time with time zone": "timetz", "time without time zone": "time",
    boolean: "bool" }[t] ?? t;
  const ts = PG_TO_TS[base] ?? (enumMap[base] ? `Database["public"]["Enums"]["${base}"]` : "string");
  return argType.trim().endsWith("[]") ? `${ts}[]` : ts;
}

// Overloaded functions share a name — the type map can only hold one entry per
// name, so keep the first signature (matches supabase-gen behavior of emitting
// a single entry per callable name).
const seenFns = new Set();
for (const fn of functions) {
  if (seenFns.has(fn.proname)) continue;
  seenFns.add(fn.proname);
  // Parse "name type, name type" — defaults make args optional in the type.
  const args = fn.args.trim();
  const argParts = [];
  const seenArgs = new Set();
  if (args) {
    for (const a of args.split(/,\s*(?![^(]*\))/)) {
      const m = a.match(/^([\w"]+)\s+([\w\s.]+?)(\s+DEFAULT\s+.+)?$/i);
      if (!m) continue;
      const argName = m[1].replace(/"/g, "");
      if (seenArgs.has(argName)) continue;
      seenArgs.add(argName);
      const optional = !!m[3];
      argParts.push(`${ident(argName)}${optional ? "?" : ""}: ${argTs(m[2])}`);
    }
  }
  const res = fn.result.trim();
  let returns;
  const tableMatch = res.match(/^TABLE\((.+)\)$/i);
  const setofMatch = res.match(/^SETOF\s+([\w.]+)$/i);
  if (res.toLowerCase() === "void") returns = "undefined";
  else if (tableMatch) {
    const fields = tableMatch[1].split(/,\s*/).map((f) => {
      const [fname, ftype] = f.trim().split(/\s+(.+)/);
      return `${ident(fname)}: ${argTs(ftype ?? "text")}`;
    });
    returns = `{
          ${fields.join("\n          ")}
        }[]`;
  } else if (setofMatch) {
    const rt = setofMatch[1].replace(/^public\./, "");
    returns = tables.some((t) => t.table_name === rt)
      ? `Database["public"]["Tables"]["${rt}"]["Row"][]`
      : `${argTs(rt)}[]`;
  } else if (res === "record") returns = "Json";
  else returns = argTs(res);
  parts.push(`      ${ident(fn.proname)}: {
        Args: { ${argParts.join("; ")} }
        Returns: ${returns}
      }`);
}

parts.push(`    }
    Enums: {`);
for (const [name, labels] of Object.entries(enumMap)) {
  parts.push(`      ${ident(name)}: ${labels.map((l) => JSON.stringify(l)).join(" | ")}`);
}
parts.push(`    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
`);

// Helper-type tail is static boilerplate — reuse it from the existing file so
// this generator never has to keep a second (driftable) copy.
const MARKER = "type DatabaseWithoutInternals";
const CONST_MARKER = "export const Constants";
let tail;
try {
  const prev = readFileSync("src/types/supabase.ts", "utf8");
  tail = prev.slice(prev.indexOf(MARKER), prev.indexOf(CONST_MARKER));
} catch {
  console.error("Cannot read tail from existing src/types/supabase.ts — keep a copy on first generation.");
  process.exit(1);
}

parts.push(tail);
parts.push(`export const Constants = {
  public: {
    Enums: {
${Object.entries(enumMap).map(([n, ls]) => `      ${ident(n)}: [${ls.map((l) => JSON.stringify(l)).join(", ")}],`).join("\n")}
    },
  },
} as const
`);
writeFileSync("src/types/supabase.ts", parts.join("\n") + "\n");
// The emitted shape isn't the repo's prettier style — normalize in place so
// a regen only ever shows semantic drift in `git diff` (the verify-db
// workflow relies on that to flag a stale committed file).
try {
  execSync("npx --yes prettier --write src/types/supabase.ts", { stdio: "inherit" });
} catch {
  console.warn("prettier formatting failed — committed file may differ stylistically");
}
console.log(`Wrote src/types/supabase.ts: ${tables.length} tables, ${functions.length} functions, ${Object.keys(enumMap).length} enums`);
