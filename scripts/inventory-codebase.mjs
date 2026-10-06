#!/usr/bin/env node

/**
 * Conservative codebase inventory for cleanup work.
 *
 * Reports review candidates only. It never deletes or changes source files.
 * Static analysis cannot prove that a candidate is safe to remove.
 *
 * Usage:
 *   npm run inventory
 *   npm run inventory -- --write
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const OUTPUT_PATH = path.join(
  ROOT,
  "reports",
  "codebase-inventory.generated.md",
);
const WRITE_REPORT = process.argv.includes("--write");

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
const RESOLUTION_EXTENSIONS = ["", ...SOURCE_EXTENSIONS, ".json"];
const TEXT_EXTENSIONS = new Set([
  ...SOURCE_EXTENSIONS,
  ".json",
  ".yml",
  ".yaml",
  ".sh",
  ".css",
]);
const IGNORED_DIRS = new Set([
  ".git",
  ".next",
  ".next-dev",
  "node_modules",
  "coverage",
  "dist",
  "build",
  "out",
  "test-results",
]);

const NEXT_ENTRY_NAMES = new Set([
  "page",
  "layout",
  "route",
  "loading",
  "error",
  "global-error",
  "not-found",
  "default",
  "template",
  "manifest",
  "sitemap",
  "robots",
  "opengraph-image",
  "twitter-image",
  "icon",
  "apple-icon",
]);

const COMMAND_PACKAGE_MAP = new Map([
  ["next", "next"],
  ["eslint", "eslint"],
  ["vitest", "vitest"],
  ["playwright", "@playwright/test"],
  ["tsx", "tsx"],
  ["tsc", "typescript"],
  ["husky", "husky"],
  ["dotenv", "dotenv-cli"],
  ["gitlab-ci-local", "gitlab-ci-local"],
  ["wait-on", "wait-on"],
  ["tailwindcss", "tailwindcss"],
]);

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function relative(filePath) {
  return toPosix(path.relative(ROOT, filePath));
}

function walk(dir, predicate = () => true, result = []) {
  if (!fs.existsSync(dir)) return result;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, predicate, result);
    } else if (entry.isFile() && predicate(fullPath)) {
      result.push(path.resolve(fullPath));
    }
  }

  return result;
}

function isSourceFile(filePath) {
  return SOURCE_EXTENSIONS.includes(path.extname(filePath));
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function extractModuleSpecifiers(content) {
  const specifiers = new Set();
  const patterns = [
    /\b(?:import|export)\s+(?:type\s+)?[^;"']*?\sfrom\s*["']([^"']+)["']/g,
    /\bimport\s*["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
    /@import\s+(?:url\()?\s*["']([^"']+)["']/g,
  ];

  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      specifiers.add(match[1]);
    }
  }

  return [...specifiers];
}

function tryResolve(candidate) {
  for (const extension of RESOLUTION_EXTENSIONS) {
    const direct = `${candidate}${extension}`;
    if (fs.existsSync(direct) && fs.statSync(direct).isFile()) {
      return path.resolve(direct);
    }
  }

  for (const extension of SOURCE_EXTENSIONS) {
    const indexFile = path.join(candidate, `index${extension}`);
    if (fs.existsSync(indexFile) && fs.statSync(indexFile).isFile()) {
      return path.resolve(indexFile);
    }
  }

  return null;
}

function resolveInternalImport(fromFile, specifier) {
  if (specifier.startsWith("@/")) {
    return tryResolve(path.join(SRC_DIR, specifier.slice(2)));
  }
  if (specifier.startsWith(".")) {
    return tryResolve(path.resolve(path.dirname(fromFile), specifier));
  }
  return null;
}

function isTestFile(filePath) {
  const name = path.basename(filePath);
  return (
    /\.(test|spec)\.[^.]+$/.test(name) ||
    relative(filePath).includes("/__tests__/")
  );
}

function isNextEntry(filePath) {
  const rel = relative(filePath);
  if (!rel.startsWith("src/app/")) return false;
  const base = path.basename(filePath, path.extname(filePath));
  return NEXT_ENTRY_NAMES.has(base);
}

function isFrameworkRoot(filePath) {
  return [
    "src/proxy.ts",
    "src/proxy.tsx",
    "src/middleware.ts",
    "src/middleware.tsx",
    "src/instrumentation.ts",
    "src/instrumentation-client.ts",
  ].includes(relative(filePath));
}

function packageNameFromSpecifier(specifier) {
  if (
    specifier.startsWith(".") ||
    specifier.startsWith("@/") ||
    specifier.startsWith("node:") ||
    specifier.startsWith("#") ||
    specifier.includes("://")
  ) {
    return null;
  }

  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

function markdownList(items, emptyText) {
  if (items.length === 0) return `- ${emptyText}`;
  return items.map((item) => `- \`${item}\``).join("\n");
}

function parseJsonFile(filePath) {
  return JSON.parse(readText(filePath));
}

if (!fs.existsSync(SRC_DIR)) {
  console.error(
    "Missing src/ directory. Run this command from the repository root.",
  );
  process.exit(1);
}

const sourceFiles = walk(SRC_DIR, isSourceFile);
const sourceSet = new Set(sourceFiles);
const graph = new Map(sourceFiles.map((file) => [file, new Set()]));

for (const file of sourceFiles) {
  for (const specifier of extractModuleSpecifiers(readText(file))) {
    const resolved = resolveInternalImport(file, specifier);
    if (resolved && sourceSet.has(resolved)) graph.get(file).add(resolved);
  }
}

const roots = sourceFiles.filter(
  (file) => isNextEntry(file) || isFrameworkRoot(file) || isTestFile(file),
);
const reachable = new Set();
const stack = [...roots];

while (stack.length > 0) {
  const current = stack.pop();
  if (!current || reachable.has(current)) continue;
  reachable.add(current);
  for (const dependency of graph.get(current) ?? []) {
    if (!reachable.has(dependency)) stack.push(dependency);
  }
}

const unreachableCandidates = sourceFiles
  .filter((file) => !reachable.has(file))
  .filter((file) => !file.endsWith(".d.ts"))
  .filter((file) => relative(file) !== "src/types/supabase.ts")
  .map(relative)
  .sort();

const largeFiles = sourceFiles
  .map((file) => ({
    file: relative(file),
    lines: readText(file).split("\n").length,
  }))
  .filter(({ lines }) => lines >= 500)
  .sort((a, b) => b.lines - a.lines);

const packageJson = parseJsonFile(path.join(ROOT, "package.json"));
const declaredDependencies = {
  ...(packageJson.dependencies ?? {}),
  ...(packageJson.devDependencies ?? {}),
};
const usedPackages = new Set();

const repositoryTextFiles = walk(ROOT, (file) => {
  const base = path.basename(file);
  return (
    TEXT_EXTENSIONS.has(path.extname(file)) ||
    base === "Dockerfile" ||
    base === "Makefile"
  );
});

for (const file of repositoryTextFiles) {
  let content;
  try {
    content = readText(file);
  } catch {
    continue;
  }

  for (const specifier of extractModuleSpecifiers(content)) {
    const packageName = packageNameFromSpecifier(specifier);
    if (packageName) usedPackages.add(packageName);
  }
}

for (const script of Object.values(packageJson.scripts ?? {})) {
  for (const rawToken of String(script).split(/\s+/)) {
    const token = rawToken.replace(/^npx$/, "").replace(/^\.\//, "");
    const mappedPackage = COMMAND_PACKAGE_MAP.get(token);
    if (mappedPackage) usedPackages.add(mappedPackage);
  }
}

const tsconfigPath = path.join(ROOT, "tsconfig.json");
if (fs.existsSync(tsconfigPath)) {
  const tsconfig = parseJsonFile(tsconfigPath);
  for (const typeName of tsconfig.compilerOptions?.types ?? []) {
    if (typeName.startsWith("vitest/")) usedPackages.add("vitest");
    else if (typeName === "node") usedPackages.add("@types/node");
    else usedPackages.add(`@types/${typeName}`);
  }
}

if (packageJson.scripts?.["test:coverage"])
  usedPackages.add("@vitest/coverage-v8");
if (
  readText(path.join(ROOT, "vitest.config.ts")).includes('environment: "jsdom"')
) {
  usedPackages.add("jsdom");
}

// Unscoped runtime packages commonly use matching DefinitelyTyped packages.
for (const packageName of [...usedPackages]) {
  if (packageName.startsWith("@")) continue;
  const typePackage = `@types/${packageName}`;
  if (declaredDependencies[typePackage]) usedPackages.add(typePackage);
}

const possibleUnusedDependencies = Object.keys(declaredDependencies)
  .filter((packageName) => !usedPackages.has(packageName))
  .sort();
const possibleUnusedRuntimeDependencies = possibleUnusedDependencies.filter(
  (packageName) => !packageName.startsWith("@types/"),
);
const possibleUnusedTypePackages = possibleUnusedDependencies.filter(
  (packageName) => packageName.startsWith("@types/"),
);

const generatedAt = new Date().toISOString();
const report =
  `# Generated codebase inventory\n\n` +
  `Generated: ${generatedAt}\n\n` +
  `> Conservative static analysis only. Every item requires manual verification. Framework conventions, runtime strings, generated code, package CLIs, CSS plugins, and external tooling can create false positives.\n\n` +
  `## Summary\n\n` +
  `- Source files scanned: ${sourceFiles.length}\n` +
  `- Known entry points: ${roots.length}\n` +
  `- Unreachable candidates: ${unreachableCandidates.length}\n` +
  `- Files with at least 500 lines: ${largeFiles.length}\n` +
  `- Possible unused runtime/tooling dependencies: ${possibleUnusedRuntimeDependencies.length}\n` +
  `- Possible unused type packages: ${possibleUnusedTypePackages.length}\n\n` +
  `## Unreachable source candidates\n\n` +
  `${markdownList(unreachableCandidates, "No candidates found.")}\n\n` +
  `## Large files\n\n` +
  `${largeFiles.length === 0 ? "- No files exceed the threshold." : largeFiles.map(({ file, lines }) => `- \`${file}\` — ${lines} lines`).join("\n")}\n\n` +
  `## Possible unused runtime or tooling dependencies\n\n` +
  `${markdownList(possibleUnusedRuntimeDependencies, "No candidates found.")}\n\n` +
  `## Possible unused type packages\n\n` +
  `${markdownList(possibleUnusedTypePackages, "No candidates found.")}\n\n` +
  `## Required verification before deletion\n\n` +
  `1. Search static imports, dynamic imports, framework conventions, scripts, config, migrations, and runtime string references.\n` +
  `2. Remove one candidate or one tightly related group per commit.\n` +
  `3. Run typecheck, lint, unit tests, and the relevant integration/E2E test.\n` +
  `4. Revert immediately if behavior changes unexpectedly.\n`;

if (WRITE_REPORT) {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, report, "utf8");
  console.log(`Wrote ${relative(OUTPUT_PATH)}`);
} else {
  process.stdout.write(report);
}
