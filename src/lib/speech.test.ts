import { describe, expect, it } from "vitest";

import { looksEnglish } from "./speech";

describe("looksEnglish", () => {
  it("accepts plain English lines", () => {
    expect(looksEnglish("Hi, I'm Maya. What's your name?")).toBe(true);
    expect(looksEnglish("Could you say that again?")).toBe(true);
  });

  it("rejects Vietnamese cues so they are not voiced as English", () => {
    expect(looksEnglish("Chào. Tôi tên là Hoàng.")).toBe(false);
    expect(looksEnglish("Nhiệm vụ: yêu cầu lặp lại.")).toBe(false);
  });

  it("rejects strings without Latin letters", () => {
    expect(looksEnglish("123")).toBe(false);
    expect(looksEnglish("")).toBe(false);
  });
});
