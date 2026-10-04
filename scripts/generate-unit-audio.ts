/**
 * Generate MP3 assets for a unit folder under public/audio/.
 * Usage: npx tsx scripts/generate-unit-audio.ts unit-a0-1
 *        npx tsx scripts/generate-unit-audio.ts list   # dry-run: list all 50 unit folders
 *
 * Uses Node 24's built-in fetch through the local Translate TTS adapter.
 * Set AUDIO_TTS_LANGUAGE to override the default language code (en).
 */

import { mkdir } from "fs/promises";
import path from "path";

import { saveMp3 } from "./lib/translate-tts";
import { unitA01 } from "../src/lib/data/units/unitA01";
import { unitA02 } from "../src/lib/data/units/unitA02";
import { unitA03 } from "../src/lib/data/units/unitA03";
import { unitA04 } from "../src/lib/data/units/unitA04";
import { unitA05 } from "../src/lib/data/units/unitA05";
import { unitA06 } from "../src/lib/data/units/unitA06";
import { unitA07 } from "../src/lib/data/units/unitA07";
import { unitA08 } from "../src/lib/data/units/unitA08";
import { unit1 } from "../src/lib/data/units/unit1";
import { unit2 } from "../src/lib/data/units/unit2";
import { unit3 } from "../src/lib/data/units/unit3";
import { unit4 } from "../src/lib/data/units/unit4";
import { unit5 } from "../src/lib/data/units/unit5";
import { unit6 } from "../src/lib/data/units/unit6";
import { unit7 } from "../src/lib/data/units/unit7";
import { unit8 } from "../src/lib/data/units/unit8";
import { unit9 } from "../src/lib/data/units/unit9";
import { unit10 } from "../src/lib/data/units/unit10";
import { unit11 } from "../src/lib/data/units/unit11";
import { unit12 } from "../src/lib/data/units/unit12";
import { unit13 } from "../src/lib/data/units/unit13";
import { unit14 } from "../src/lib/data/units/unit14";
import { unit15 } from "../src/lib/data/units/unit15";
import { unit16 } from "../src/lib/data/units/unit16";
import { unit17 } from "../src/lib/data/units/unit17";
import { unit18 } from "../src/lib/data/units/unit18";
import { unit19 } from "../src/lib/data/units/unit19";
import { unit20 } from "../src/lib/data/units/unit20";
import { unit21 } from "../src/lib/data/units/unit21";
import { unit22 } from "../src/lib/data/units/unit22";
import { unit23 } from "../src/lib/data/units/unit23";
import { unit24 } from "../src/lib/data/units/unit24";
import { unit25 } from "../src/lib/data/units/unit25";
import { unit26 } from "../src/lib/data/units/unit26";
import { unit27 } from "../src/lib/data/units/unit27";
import { unit28 } from "../src/lib/data/units/unit28";
import { unit29 } from "../src/lib/data/units/unit29";
import { unit30 } from "../src/lib/data/units/unit30";
import { unit31 } from "../src/lib/data/units/unit31";
import { unit32 } from "../src/lib/data/units/unit32";
import { unit33 } from "../src/lib/data/units/unit33";
import { unit34 } from "../src/lib/data/units/unit34";
import { unit35 } from "../src/lib/data/units/unit35";
import { unit36 } from "../src/lib/data/units/unit36";
import { unit37 } from "../src/lib/data/units/unit37";
import { unit38 } from "../src/lib/data/units/unit38";
import { unit39 } from "../src/lib/data/units/unit39";
import { unit40 } from "../src/lib/data/units/unit40";
import { unit41 } from "../src/lib/data/units/unit41";
import { unit42 } from "../src/lib/data/units/unit42";
import type { UnitData } from "../src/lib/lessons/lesson-spec";

const UNITS: Record<string, UnitData> = {
  "unit-a0-1": unitA01,
  "unit-a0-2": unitA02,
  "unit-a0-3": unitA03,
  "unit-a0-4": unitA04,
  "unit-a0-5": unitA05,
  "unit-a0-6": unitA06,
  "unit-a0-7": unitA07,
  "unit-a0-8": unitA08,
  "unit-1": unit1,
  "unit-2": unit2,
  "unit-3": unit3,
  "unit-4": unit4,
  "unit-5": unit5,
  "unit-6": unit6,
  "unit-7": unit7,
  "unit-8": unit8,
  "unit-9": unit9,
  "unit-10": unit10,
  "unit-11": unit11,
  "unit-12": unit12,
  "unit-13": unit13,
  "unit-14": unit14,
  "unit-15": unit15,
  "unit-16": unit16,
  "unit-17": unit17,
  "unit-18": unit18,
  "unit-19": unit19,
  "unit-20": unit20,
  "unit-21": unit21,
  "unit-22": unit22,
  "unit-23": unit23,
  "unit-24": unit24,
  "unit-25": unit25,
  "unit-26": unit26,
  "unit-27": unit27,
  "unit-28": unit28,
  "unit-29": unit29,
  "unit-30": unit30,
  "unit-31": unit31,
  "unit-32": unit32,
  "unit-33": unit33,
  "unit-34": unit34,
  "unit-35": unit35,
  "unit-36": unit36,
  "unit-37": unit37,
  "unit-38": unit38,
  "unit-39": unit39,
  "unit-40": unit40,
  "unit-41": unit41,
  "unit-42": unit42,
};

function audioBasename(audioPath: string): string {
  return path.basename(audioPath);
}

async function generateUnit(unitId: string) {
  const unit = UNITS[unitId];
  if (!unit) {
    console.error(`Unknown unit: ${unitId}. Known: ${Object.keys(UNITS).join(", ")}`);
    process.exit(1);
  }

  const outDir = path.join(process.cwd(), "public", "audio", unitId);
  await mkdir(outDir, { recursive: true });

  const jobs: Array<{ file: string; text: string }> = [];

  for (const v of unit.vocab) {
    if (v.audio) {
      jobs.push({ file: audioBasename(v.audio), text: v.word });
    }
  }

  const dialogues =
    unit.dialogues_list ??
    (Array.isArray(unit.dialogues)
      ? unit.dialogues
      : unit.dialogues
        ? [unit.dialogues]
        : []);
  for (const d of dialogues) {
    if (d.audio && d.lines?.length) {
      const text = d.lines.map((line) => line.text).join(" ");
      jobs.push({ file: audioBasename(d.audio), text });
    }
  }

  console.log(`Generating ${jobs.length} clips → public/audio/${unitId}/`);

  const language = process.env.AUDIO_TTS_LANGUAGE?.trim() || "en";
  for (const job of jobs) {
    const dest = path.join(outDir, job.file);
    process.stdout.write(`  ${job.file} ... `);
    await saveMp3(job.text, dest, { language });
    console.log("ok");
  }

  console.log("Done.");
}

const arg = process.argv[2];
if (arg === "list" || arg === "--list") {
  const folders = Object.keys(UNITS);
  console.log(folders.join("\n"));
  console.log(`Total: ${folders.length} unit folders`);
  process.exit(0);
}
const unitId = arg ?? "unit-a0-1";
generateUnit(unitId).catch((err) => {
  console.error(err);
  process.exit(1);
});
