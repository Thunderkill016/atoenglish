#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredPaths = [
  "AGENTS.md",
  "README.md",
  "SECURITY.md",
  ".agent-autopilot-disabled",
  ".specify/integration.json",
  "docs/README.md",
  "docs/project/PROJECT_STATE.md",
  "docs/project/SOURCE_OF_TRUTH.md",
  "specs/001-spec-kit-brownfield-adoption/spec.md",
  "specs/001-spec-kit-brownfield-adoption/plan.md",
  "specs/001-spec-kit-brownfield-adoption/tasks.md",
  "specs/001-spec-kit-brownfield-adoption/document-inventory.md",
];

const retiredAuthorityPaths = [
  "AGENT_AUTOPILOT.md",
  "AGENT_BACKLOG.md",
  "AGENT_PLAN.md",
  "AGENT_REPORT.md",
  "AGENT_ROADMAP.md",
  "docs/product",
  "docs/history",
  "docs/nep",
  "docs/reference",
  "docs/learning-system",
  "docs/curriculum",
  "docs/cyclewarden",
];

const retiredAutomationPaths = [
  "scripts/agent-pick-task.sh",
  "scripts/agent-run-headless.sh",
  "scripts/agent-refill-backlog.sh",
  "scripts/agent-watchdog.sh",
  "scripts/agent-report.sh",
];

export function detectRetiredAuthority(relativePaths) {
  return relativePaths
    .filter((relativePath) => retiredAuthorityPaths.includes(relativePath))
    .map((relativePath) => `retired-authority-present:${relativePath}`);
}

function collectMarkdownFiles(directory, relativeDirectory = "") {
  const absoluteDirectory = path.join(directory, relativeDirectory);
  if (!existsSync(absoluteDirectory)) return [];
  return statSync(absoluteDirectory).isDirectory()
    ? readFileNames(absoluteDirectory).flatMap((name) =>
        collectMarkdownFiles(directory, path.join(relativeDirectory, name)),
      )
    : relativeDirectory.endsWith(".md")
      ? [relativeDirectory]
      : [];
}

function readFileNames(directory) {
  return readdirSync(directory);
}

export function inspectSourceOfTruth(baseDir = root) {
  const problems = [];
  for (const relativePath of requiredPaths) {
    if (!existsSync(path.join(baseDir, relativePath)))
      problems.push(`missing-required:${relativePath}`);
  }
  problems.push(
    ...detectRetiredAuthority(
      retiredAuthorityPaths.filter((relativePath) =>
        existsSync(path.join(baseDir, relativePath)),
      ),
    ),
  );

  for (const relativePath of retiredAutomationPaths) {
    if (existsSync(path.join(baseDir, relativePath))) {
      problems.push(`retired-automation-present:${relativePath}`);
    }
  }

  const constitutionPath = path.join(
    baseDir,
    ".specify/memory/constitution.md",
  );
  if (existsSync(constitutionPath)) {
    problems.push("unauthorized-constitution:.specify/memory/constitution.md");
  }

  const linkedDocuments = [
    "AGENTS.md",
    "README.md",
    "SECURITY.md",
    ...collectMarkdownFiles(baseDir, "docs"),
    ...collectMarkdownFiles(baseDir, "specs/001-spec-kit-brownfield-adoption"),
  ].filter((relativePath) => existsSync(path.join(baseDir, relativePath)));
  for (const relativePath of linkedDocuments) {
    const absolutePath = path.join(baseDir, relativePath);
    const document = readFileSync(absolutePath, "utf8");
    for (const match of document.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1].split("#", 1)[0];
      if (!target || /^(?:https?:|mailto:)/.test(target)) continue;
      const resolved = path.resolve(
        path.dirname(absolutePath),
        decodeURIComponent(target),
      );
      if (!existsSync(resolved))
        problems.push(`broken-markdown-link:${relativePath}->${target}`);
    }
  }
  return problems;
}

export function runSelfTest() {
  const missing = inspectSourceOfTruth(
    path.join(root, "scripts", "fixtures", "missing-governance"),
  );
  if (!missing.some((problem) => problem.startsWith("missing-required:"))) {
    throw new Error("self-test did not detect missing governance");
  }
  const stale = detectRetiredAuthority(["AGENT_PLAN.md"]);
  if (!stale.includes("retired-authority-present:AGENT_PLAN.md")) {
    throw new Error("self-test did not detect stale authority");
  }
  return true;
}

if (process.argv.includes("--self-test")) {
  runSelfTest();
  console.log("source-of-truth self-test: PASS");
} else {
  const problems = inspectSourceOfTruth();
  if (problems.length > 0) {
    console.error(problems.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("source-of-truth check: PASS");
  }
}
