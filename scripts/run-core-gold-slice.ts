#!/usr/bin/env tsx

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { runCoreGoldSliceReference } from "../src/lib/core/gold-slice";

async function main() {
  const outputPath = path.resolve(
    process.cwd(),
    process.argv[2] ?? "benchmarks/core/core-gold-slice-v1.json",
  );
  const artifact = runCoreGoldSliceReference();

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
  console.log(`Wrote ${artifact.artifactId} to ${outputPath}`);
}

void main();
