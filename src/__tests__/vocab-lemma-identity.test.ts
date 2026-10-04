import { describe, expect, it } from "vitest";

import { PILOT_LESSON_SPECS } from "@/lib/lessons/pilot-lessons";
import { lemmaKey } from "@/lib/vocab/lemma";

/**
 * Vocabulary SRS targets are lemma-level: "unit-a0-2:vocab:food-3" used to make
 * the same word a different identity in every unit. Targets are now
 * `vocab:<lemma>` so coverage and review span units.
 */

describe("lesson srsTargets lemma identity", () => {
  it("keys every vocab-section target by the item's lemma, not its unit-local id", () => {
    for (const [lessonId, spec] of Object.entries(PILOT_LESSON_SPECS)) {
      const vocabActivities = spec.activities.filter(
        (activity) => activity.srsTargets.length > 0,
      );
      expect(vocabActivities.length, lessonId).toBeGreaterThan(0);

      for (const activity of vocabActivities) {
        for (const target of activity.srsTargets) {
          expect(target, `${lessonId}:${activity.id}`).toMatch(/^vocab:/);
        }
      }

      const sectionTargets = vocabActivities
        .filter((activity) => activity.id.endsWith(":section:2"))
        .flatMap((activity) => activity.srsTargets);
      expect(sectionTargets, lessonId).toEqual(
        spec.vocab.map(
          (item) => `vocab:${lemmaKey(item.word) ?? `${lessonId}:${item.id}`}`,
        ),
      );
    }
  });

  it("gives identical lemmas the same target across units", () => {
    const targetsByLemma = new Map<string, Set<string>>();
    for (const spec of Object.values(PILOT_LESSON_SPECS)) {
      for (const item of spec.vocab) {
        const lemma = lemmaKey(item.word);
        if (!lemma) continue;
        const set = targetsByLemma.get(lemma) ?? new Set<string>();
        set.add(`vocab:${lemma}`);
        targetsByLemma.set(lemma, set);
      }
    }
    for (const [lemma, targets] of targetsByLemma) {
      expect(targets.size, lemma).toBe(1);
    }
  });
});
