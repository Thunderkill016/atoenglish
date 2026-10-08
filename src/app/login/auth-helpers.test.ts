import { describe, expect, it } from "vitest";

import {
  DEFAULT_POST_AUTH_PATH,
  localizeAuthError,
  resolveAuthNext,
} from "./auth-helpers";

describe("resolveAuthNext", () => {
  it("returns the default path when next is missing or empty", () => {
    expect(resolveAuthNext(null)).toBe(DEFAULT_POST_AUTH_PATH);
    expect(resolveAuthNext(undefined)).toBe(DEFAULT_POST_AUTH_PATH);
    expect(resolveAuthNext("")).toBe(DEFAULT_POST_AUTH_PATH);
  });

  it("keeps internal paths", () => {
    expect(resolveAuthNext("/watch/abc123")).toBe("/watch/abc123");
    expect(resolveAuthNext("/me")).toBe("/me");
  });

  it("rejects absolute and scheme-relative URLs to block open redirects", () => {
    expect(resolveAuthNext("https://evil.example")).toBe(
      DEFAULT_POST_AUTH_PATH,
    );
    expect(resolveAuthNext("//evil.example")).toBe(DEFAULT_POST_AUTH_PATH);
    expect(resolveAuthNext("javascript:alert(1)")).toBe(DEFAULT_POST_AUTH_PATH);
  });
});

describe("localizeAuthError", () => {
  it("maps credential errors to a generic Vietnamese message", () => {
    expect(localizeAuthError("Invalid email or password")).toBe(
      "Email hoặc mật khẩu không đúng.",
    );
    expect(localizeAuthError("INVALID_CREDENTIALS")).toBe(
      "Email hoặc mật khẩu không đúng.",
    );
  });

  it("maps duplicate-account errors", () => {
    expect(localizeAuthError("Email already in use")).toBe(
      "Email này đã được đăng ký. Hãy đăng nhập.",
    );
  });

  it("maps rate-limit errors", () => {
    expect(localizeAuthError("Too many requests")).toContain("quá nhiều lần");
  });

  it("returns an empty string for unmapped errors so callers can show the raw message", () => {
    expect(localizeAuthError("unexpected upstream failure")).toBe("");
  });
});
