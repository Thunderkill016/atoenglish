import {
  createClient as createDataClient,
  SupabaseAuthAdapter,
} from "@neondatabase/neon-js";

import type { Database } from "@/types/supabase";

// Browser client. Auth calls go to the same-origin /api/auth proxy so
// session cookies land on this domain; data calls go straight to the Neon
// Data API with the session JWT attached (RLS still enforces per-user).
export function createClient() {
  // This factory runs during SSR too (client components render on the server
  // for the initial HTML), where `window` doesn't exist. The origin only
  // matters in the browser, so fall back to a placeholder on the server —
  // no auth request is ever issued during SSR.
  const origin =
    typeof window === "undefined" ? "http://localhost" : window.location.origin;
  return createDataClient<Database>({
    auth: {
      url: `${origin}/api/auth`,
      adapter: SupabaseAuthAdapter(),
    },
    dataApi: {
      url: process.env.NEXT_PUBLIC_NEON_DATA_API_URL!,
    },
  });
}
