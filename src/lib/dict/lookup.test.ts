import { describe, expect, it } from "vitest";
import { lookupDictionary, type DictionaryStore } from "./lookup";

/** Chainable .in() fake: rows are filtered by membership in the values list. */
function fakeStore(rows: Record<string, unknown>[]): DictionaryStore {
  return {
    from(table: string) {
      expect(table).toBe("dictionary_entries");
      return {
        select(_columns: string) {
          return {
            async in(column: string, values: string[]) {
              return {
                data: rows.filter((r) =>
                  values.includes((r as Record<string, string>)[column]),
                ),
              };
            },
          };
        },
      };
    },
  } as unknown as DictionaryStore;
}

const CHILD = {
  word: "child",
  pos: "noun",
  senses: [{ glosses: ["Đứa trẻ, đứa con."] }],
  ipa: "tʃaɪld",
  audio_url: "https://upload.wikimedia.org/x.mp3",
};

const CHILDREN = {
  word: "children",
  pos: "noun",
  senses: [{ glosses: ["Số nhiều của child"], form_of: ["child"] }],
  ipa: null,
  audio_url: null,
};

const WATCHES = {
  word: "watch",
  pos: "verb",
  senses: [{ glosses: ["Nhìn, xem, theo dõi."] }],
  ipa: null,
  audio_url: null,
};

describe("lookupDictionary", () => {
  it("returns null on honest miss", async () => {
    expect(await lookupDictionary("zzzzq", fakeStore([]))).toBeNull();
  });

  it("hits exact words across part-of-speech rows", async () => {
    const noun = {
      word: "cat",
      pos: "noun",
      senses: [{ glosses: ["Con mèo."] }],
      ipa: "kăt",
      audio_url: null,
    };
    const verb = {
      word: "cat",
      pos: "verb",
      senses: [{ glosses: ["Nôn mửa."] }],
      ipa: null,
      audio_url: null,
    };
    const entry = await lookupDictionary("cat", fakeStore([noun, verb]));
    expect(entry!.word).toBe("cat");
    expect(entry!.part_of_speech).toBe("noun, verb");
    expect(entry!.meaning_vn).toContain("Con mèo");
    expect(entry!.senses).toHaveLength(2);
  });

  it("resolves regular inflections via rule candidates (watches -> watch)", async () => {
    const entry = await lookupDictionary("watches", fakeStore([WATCHES]));
    expect(entry).not.toBeNull();
    expect(entry!.lemma).toBe("watch");
    expect(entry!.meaning_vn).toContain("Nhìn");
  });

  it("follows form_of to the parent when the hit has no own glosses beyond the link", async () => {
    const noGlossChildren = {
      ...CHILDREN,
      senses: [{ form_of: ["child"], glosses: [] }],
    };
    const entry = await lookupDictionary(
      "children",
      fakeStore([noGlossChildren, CHILD]),
    );
    expect(entry!.lemma).toBe("child");
    expect(entry!.meaning_vn).toContain("Đứa trẻ");
  });

  it("merges parent senses with the hit's own glosses", async () => {
    const entry = await lookupDictionary(
      "children",
      fakeStore([CHILDREN, CHILD]),
    );
    expect(entry!.lemma).toBe("child");
    expect(entry!.meaning_vn).toContain("Số nhiều");
    expect(entry!.meaning_vn).toContain("Đứa trẻ");
  });

  it("exposes the first translated example and audio url", async () => {
    const cache = {
      word: "cache",
      pos: "noun",
      senses: [
        {
          glosses: ["Nơi giấu, nơi trữ."],
          examples: [{ text: "to make a cache", translation: "xây dựng nơi trữ" }],
        },
      ],
      ipa: "ˈkæʃ",
      audio_url: "https://upload.wikimedia.org/cache.mp3",
    };
    const entry = await lookupDictionary("cache", fakeStore([cache]));
    expect(entry!.example_en).toBe("to make a cache");
    expect(entry!.example_vn).toBe("xây dựng nơi trữ");
    expect(entry!.audio_url).toContain("cache.mp3");
  });
});
