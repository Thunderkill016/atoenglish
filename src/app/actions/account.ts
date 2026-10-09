"use server";

import { createClient } from "@/lib/supabase/server";

// ─── /me danger zone — full account-data erasure (SPEC §14) ──────────────────
// The erase itself lives in delete_my_data(), a SECURITY DEFINER RPC bound to
// auth.uid() (migration 20261024000000_delete_my_data.sql). The caller's JWT
// is the entire scope — there is no target parameter to forge. One call, one
// transaction: either every user-keyed row is gone or nothing is.
// The neon_auth.user identity row is managed auth and intentionally left —
// the client signs out after a successful wipe.

export type DeleteDataResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "delete_failed" };

export async function deleteAllMyData(): Promise<DeleteDataResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const { error } = await supabase.rpc("delete_my_data");
  if (error) return { ok: false, error: "delete_failed" };
  return { ok: true };
}
