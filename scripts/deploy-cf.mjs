#!/usr/bin/env node
// scripts/deploy-cf.mjs — build + deploy the vinext app to Cloudflare Workers.
//
// `vinext-cloudflare deploy` currently emits a complete module manifest that
// omits bundle files written outside the Rollup chunk graph
// (__vite_rsc_assets_manifest.js, __vinext_action_owner_manifest.js,
// vinext-client-assets.js), so Workers validation fails with
// "No such module". This script rebuilds, patches the manifest by scanning
// the bundle directory — the same inference `cf deploy` applies to partial
// manifests — then deploys the Build Output via `cf deploy --prebuilt`.
//
// Usage: node scripts/deploy-cf.mjs [--mode <name>]

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const workerDir = join(root, ".cloudflare/output/v0/workers/default");
const configPath = join(workerDir, "worker.config.json");
const bundleDir = join(workerDir, "bundle");

const MODULE_TYPES = new Map([
  [".js", "esm"],
  [".mjs", "esm"],
  [".cjs", "commonjs"],
  [".wasm", "wasm"],
  [".json", "json"],
]);

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: "inherit", cwd: root });
  if (res.status !== 0) {
    console.error(`${cmd} ${args.join(" ")} failed (${res.status})`);
    process.exit(res.status ?? 1);
  }
}

// 1. Build — emits .cloudflare/output/v0 Build Output.
run("npx", ["vite", "build"]);

// 2. Patch manifest.modules with any bundle files the emitter missed.
if (!existsSync(configPath)) {
  console.error(`Build Output missing: ${configPath}`);
  process.exit(1);
}
const config = JSON.parse(readFileSync(configPath, "utf8"));
const modules = config.manifest?.modules;
if (!modules) {
  console.error("worker.config.json has no manifest.modules to patch");
  process.exit(1);
}

const added = [];
(function scan(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(full);
      continue;
    }
    if (entry.name.endsWith(".map")) continue;
    const rel = relative(bundleDir, full).split(sep).join("/");
    if (rel in modules) continue;
    const ext = entry.name.slice(entry.name.lastIndexOf("."));
    const type = MODULE_TYPES.get(ext);
    if (type) {
      modules[rel] = { type };
      added.push(rel);
    }
  }
})(bundleDir);

if (added.length) {
  writeFileSync(configPath, JSON.stringify(config));
  console.log(`[deploy-cf] patched manifest: +${added.length} module(s)`);
  for (const m of added) console.log(`  + ${m}`);
}

// 3. Deploy prebuilt Build Output — production deploy by default, a Workers
// Preview (branch/PR environment) when --preview is passed.
const modeIdx = process.argv.indexOf("--mode");
const previewIdx = process.argv.indexOf("--preview");
const deployArgs =
  previewIdx !== -1
    ? ["previews", "deploy", "--prebuilt"]
    : ["deploy", "--prebuilt"];
if (previewIdx !== -1 && process.argv[previewIdx + 1]) {
  deployArgs.push(process.argv[previewIdx + 1]);
}
if (modeIdx !== -1 && process.argv[modeIdx + 1]) {
  deployArgs.push("--mode", process.argv[modeIdx + 1]);
}
run("npx", ["cf", ...deployArgs]);
