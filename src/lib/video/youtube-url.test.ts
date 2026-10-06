import { describe, expect, it } from "vitest";
import { parseYoutubeUrl, YOUTUBE_VIDEO_ID_RE } from "./youtube-url";

const ID = "dQw4w9WgXcQ";

describe("parseYoutubeUrl", () => {
  it("accepts all supported URL shapes", () => {
    const shapes = [
      `https://www.youtube.com/watch?v=${ID}`,
      `https://youtube.com/watch?v=${ID}`,
      `https://m.youtube.com/watch?v=${ID}`,
      `https://music.youtube.com/watch?v=${ID}`,
      `https://www.youtube.com/watch?v=${ID}&list=PLabc&index=3`,
      `https://youtu.be/${ID}`,
      `https://youtu.be/${ID}?t=42`,
      `https://www.youtube.com/shorts/${ID}`,
      `https://www.youtube.com/live/${ID}`,
      `https://www.youtube.com/embed/${ID}`,
      `https://www.youtube.com/v/${ID}`,
      `youtube.com/watch?v=${ID}`, // scheme-less
      `youtu.be/${ID}`,
      ID, // bare id
    ];
    for (const url of shapes) {
      expect(parseYoutubeUrl(url), url).toBe(ID);
    }
  });

  it("rejects lookalike hosts and invalid input", () => {
    const bad = [
      "https://youtube.com.evil.tld/watch?v=dQw4w9WgXcQ",
      "https://notyoutube.com/watch?v=dQw4w9WgXcQ",
      "https://youtubecom.evil.tld/watch?v=dQw4w9WgXcQ",
      "https://evil-youtube.com/watch?v=dQw4w9WgXcQ",
      "https://youtu.be.evil.tld/dQw4w9WgXcQ",
      "https://www.youtube.com/watch?v=short",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQextra",
      "https://www.youtube.com/shorts/abc",
      "https://www.youtube.com/",
      "ftp://youtube.com/watch?v=dQw4w9WgXcQ",
      "javascript:alert(1)",
      "",
      "   ",
      "not a url at all",
      `https://youtu.be/${ID}/evil`,
    ];
    for (const url of bad) {
      expect(parseYoutubeUrl(url), url).toBeNull();
    }
  });

  it("enforces the 11-char id charset", () => {
    expect(YOUTUBE_VIDEO_ID_RE.test("dQw4w9WgXcQ")).toBe(true);
    expect(YOUTUBE_VIDEO_ID_RE.test("dQw4w9WgXc")).toBe(false);
    expect(YOUTUBE_VIDEO_ID_RE.test("dQw4w9WgXcQQ")).toBe(false);
    expect(YOUTUBE_VIDEO_ID_RE.test("dQw4w9WgXc!")).toBe(false);
    expect(YOUTUBE_VIDEO_ID_RE.test("abc-def_123")).toBe(true);
  });
});
