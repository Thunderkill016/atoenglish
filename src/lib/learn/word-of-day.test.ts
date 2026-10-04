import { describe, expect, it } from "vitest";

import { alignWordOfDayTopic } from "@/lib/learn/word-of-day";
import type { VocabularyItem } from "@/lib/constants/vocabulary";

const legacyWord: VocabularyItem = {
  word: "name",
  phonetic: "/neɪm/",
  meaning_vn: "tên",
  example_en: "My name is Minh.",
  topic: "Bảng Chữ Cái & Âm Cơ Bản",
  level: "A0",
};

describe("alignWordOfDayTopic", () => {
  it("uses the canonical pilot mission title", () => {
    expect(alignWordOfDayTopic("unit-a0-1", legacyWord)).toMatchObject({
      word: "name",
      topic: "Gặp đồng nghiệp mới",
    });
  });

  it("preserves the original topic for an unknown unit", () => {
    expect(alignWordOfDayTopic("unit-missing", legacyWord)).toEqual(legacyWord);
  });

  it("returns null when no vocabulary item exists", () => {
    expect(alignWordOfDayTopic("unit-a0-1", null)).toBeNull();
  });
});
