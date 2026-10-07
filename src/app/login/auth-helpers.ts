export const DEFAULT_POST_AUTH_PATH = "/discover";

/**
 * `next` is an internal path supplied by our own login flow — reject absolute
 * and scheme-relative URLs so the post-auth redirect cannot leave the app.
 */
export function resolveAuthNext(next: string | null | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : DEFAULT_POST_AUTH_PATH;
}

/**
 * Maps auth-server error strings (English, from better-auth/Neon) to
 * Vietnamese copy shown in the inline form error. Credential errors stay
 * deliberately generic — we never reveal which field failed.
 */
export function localizeAuthError(message: string): string {
  const m = message.toLowerCase();
  if (/invalid[ _](email|login|credential)|invalid email or password/.test(m)) {
    return "Email hoặc mật khẩu không đúng.";
  }
  if (
    /already (registered|exists|in use)|email.*(in use|registered|taken)/.test(
      m,
    )
  ) {
    return "Email này đã được đăng ký. Hãy đăng nhập.";
  }
  if (/too many|rate limit/.test(m)) {
    return "Bạn đã thử quá nhiều lần. Vui lòng đợi một lát rồi thử lại.";
  }
  if (/not found|no user/.test(m)) {
    return "Không tìm thấy tài khoản với email này.";
  }
  return "";
}
