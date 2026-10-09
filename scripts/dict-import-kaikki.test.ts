import { describe, expect, it } from "vitest";
import { cleanGloss, dedupeEntries, transformKaikkiEntry } from "./dict-import-kaikki";

describe("cleanGloss", () => {
  it("strips nested wikitext templates", () => {
    expect(cleanGloss("Một {{a|b}} loại {{c|{{d}}}} hay")).toBe("Một loại hay");
  });

  it("unwraps links to their label", () => {
    expect(cleanGloss("[[mèo|con mèo]] và [[chó]]")).toBe("con mèo và chó");
  });

  it("removes html tags and entities", () => {
    expect(cleanGloss("<span class='x'>từ</span>&nbsp;đẹp &amp; hay")).toBe("từ đẹp & hay");
  });

  it("collapses wikitext emphasis marks", () => {
    expect(cleanGloss("''động từ'' '''mạnh'''")).toBe("'động từ' 'mạnh'");
  });
});

describe("transformKaikkiEntry", () => {
  const base = {
    word: "Cache",
    pos: "Noun",
    lang_code: "en",
    senses: [{ glosses: ["Nơi giấu, nơi trữ."] }],
  };

  it("keeps multi-sense entries with Vietnamese glosses and examples", () => {
    const entry = transformKaikkiEntry({
      ...base,
      senses: [
        {
          glosses: ["Nơi giấu, nơi trữ."],
          examples: [{ text: "to make a cache", translation: "xây dựng nơi trữ" }],
        },
        { glosses: ["Lương thực, vật dụng giấu kín."] },
      ],
    });
    expect(entry).not.toBeNull();
    expect(entry!.word).toBe("cache");
    expect(entry!.pos).toBe("noun");
    expect(entry!.senses).toHaveLength(2);
    expect(entry!.senses[0].examples?.[0].translation).toBe("xây dựng nơi trữ");
  });

  it("preserves form_of links for inflections like children -> child", () => {
    const entry = transformKaikkiEntry({
      word: "children",
      pos: "noun",
      lang_code: "en",
      senses: [{ glosses: ["Số nhiều của child"], form_of: [{ word: "Child" }] }],
    });
    expect(entry!.senses[0].form_of).toEqual(["child"]);
  });

  it("prefers tagged US/UK IPA and extracts the mp3 url", () => {
    const entry = transformKaikkiEntry({
      ...base,
      sounds: [
        { ipa: "x1", tags: ["Canada"] },
        { ipa: "ˈkæʃ", tags: ["US"], mp3_url: "https://upload.wikimedia.org/x.mp3" },
      ],
    });
    expect(entry!.ipa).toBe("ˈkæʃ");
    expect(entry!.audio_url).toBe("https://upload.wikimedia.org/x.mp3");
  });

  it("drops non-English, missing fields, and gloss-less entries", () => {
    expect(transformKaikkiEntry({ ...base, lang_code: "vi" })).toBeNull();
    expect(transformKaikkiEntry({ ...base, word: undefined })).toBeNull();
    expect(transformKaikkiEntry({ ...base, senses: [{ glosses: [] }] })).toBeNull();
    expect(
      transformKaikkiEntry({ ...base, senses: [{ glosses: ["{{only dirty}}"] }] }),
    ).toBeNull();
  });

  it("keeps senses that only carry a form_of link even without a gloss", () => {
    const entry = transformKaikkiEntry({
      word: "mice",
      pos: "noun",
      lang_code: "en",
      senses: [{ form_of: [{ word: "mouse" }] }],
    });
    expect(entry).not.toBeNull();
    expect(entry!.senses[0].form_of).toEqual(["mouse"]);
  });
});

describe("dedupeEntries", () => {
  const entry = (senses: object[], extra = {}) => ({
    word: "record",
    pos: "noun",
    senses,
    source: "viwiktionary" as const,
    ...extra,
  });

  it("merges duplicate (word,pos) senses and prefers first ipa/audio", () => {
    const a = entry([{ glosses: ["bản ghi"] }], { ipa: "ˈrɛkɔːd" });
    const b = entry(
      [
        { glosses: ["bản ghi", "kỷ lục"] }, // duplicate gloss dropped
        { glosses: ["hồ sơ"], form_of: ["x"] },
      ],
      { audio_url: "https://x.mp3" },
    );
    const out = dedupeEntries([a, b]);
    expect(out).toHaveLength(1);
    expect(out[0].senses.map((s) => s.glosses)).toEqual([
      ["bản ghi"],
      ["kỷ lục"],
      ["hồ sơ"],
    ]);
    expect(out[0].ipa).toBe("ˈrɛkɔːd");
    expect(out[0].audio_url).toBe("https://x.mp3");
  });

  it("keeps distinct (word,pos) rows apart", () => {
    const noun = entry([{ glosses: ["kỷ lục"] }]);
    const verb = { ...entry([{ glosses: ["ghi lại"] }]), pos: "verb" };
    expect(dedupeEntries([noun, verb])).toHaveLength(2);
  });
});

describe("constraint guards", () => {
  it("drops ipa longer than the 100-char column bound", () => {
    const entry = transformKaikkiEntry({
      word: "longword",
      pos: "noun",
      lang_code: "en",
      senses: [{ glosses: ["một nghĩa"] }],
      sounds: [{ ipa: "/" + "x".repeat(120) + "/" }],
    });
    expect(entry!.ipa).toBeUndefined();
  });

  it("drops pos labels over the 30-char bound", () => {
    expect(
      transformKaikkiEntry({
        word: "x",
        pos: "p".repeat(31),
        lang_code: "en",
        senses: [{ glosses: ["nghĩa"] }],
      }),
    ).toBeNull();
  });
});
