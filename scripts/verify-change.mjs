#!/usr/bin/env node

import { spawn } from "node:child_process";
import { performance } from "node:perf_hooks";

import { buildVerificationPlan } from "./verification-plan.mjs";

function parseArguments(argv) {
  const args = new Set(argv);
  const scopeIndex = argv.indexOf("--scope");
  const scope = scopeIndex >= 0 ? argv[scopeIndex + 1] : "feature";

  if (scopeIndex >= 0 && !scope) {
    throw new Error("--scope requires a value");
  }

  return {
    scope,
    fast: args.has("--fast"),
    planOnly: args.has("--plan"),
  };
}

function platformCommand(command) {
  return process.platform === "win32" ? `${command}.cmd` : command;
}

function formatCommand(check) {
  return [check.command, ...check.args].join(" ");
}

function runCheck(check) {
  return new Promise((resolve) => {
    const startedAt = performance.now();
    const child = spawn(platformCommand(check.command), check.args, {
      cwd: process.cwd(),
      env: process.env,
      shell: false,
      stdio: "inherit",
    });

    child.on("error", (error) => {
      resolve({
        ...check,
        status: error.code === "ENOENT" ? "unavailable" : "failed",
        durationMs: Math.round(performance.now() - startedAt),
        detail: error.message,
      });
    });

    child.on("exit", (code, signal) => {
      resolve({
        ...check,
        status: code === 0 ? "passed" : "failed",
        durationMs: Math.round(performance.now() - startedAt),
        detail: signal
          ? `terminated by ${signal}`
          : `exit code ${code ?? "unknown"}`,
      });
    });
  });
}

function printPlan(plan) {
  console.log(`AtoEnglish verification scope: ${plan.scope} (${plan.mode})`);
  console.log("\nTechnical checks:");
  for (const check of plan.technicalChecks) {
    console.log(`- ${check.label}: ${formatCommand(check)}`);
  }
  console.log("\nManual product review (not automated):");
  for (const item of plan.manualReview) {
    console.log(`- ${item}`);
  }
}

function printSummary(plan, results) {
  console.log("\nVerification summary");
  console.log("====================");
  for (const result of results) {
    const durationSeconds = (result.durationMs / 1000).toFixed(1);
    console.log(
      `${result.status.toUpperCase().padEnd(11)} ${result.label} (${durationSeconds}s)`,
    );
  }

  console.log("\nManual product review still required:");
  for (const item of plan.manualReview) {
    console.log(`- ${item}`);
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const plan = buildVerificationPlan(options);

  printPlan(plan);
  if (options.planOnly) return;

  const results = [];
  for (const check of plan.technicalChecks) {
    console.log(`\n▶ ${check.label}`);
    results.push(await runCheck(check));
  }

  printSummary(plan, results);

  if (results.some((result) => result.status !== "passed")) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(
    `AtoEnglish verification failed to start: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
});
