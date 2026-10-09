import { describe, expect, it } from "vitest";
import { cleanGloss, transformKaikkiEntry } from "./dict-import-kaikki";

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
