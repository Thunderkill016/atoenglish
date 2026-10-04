/**
 * Checks client-side if a Neon Auth session exists.
 * The session cookies are HttpOnly (__Secure-neon-auth.*) so they are not
 * readable via document.cookie — ask the Better Auth session endpoint
 * instead, avoiding the need to load the auth client SDK on static routes.
 */
export async function checkHasSession(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    const res = await fetch("/api/auth/get-session", {
      credentials: "include",
    });
    if (!res.ok) return false;
    const data: unknown = await res.json();
    if (data === null || typeof data !== "object") return false;
    const { session, user } = data as { session?: unknown; user?: unknown };
    return Boolean(session ?? user);
  } catch {
    return false;
  }
}
