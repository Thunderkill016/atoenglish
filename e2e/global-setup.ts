import { readFileSync } from "fs";
import { resolve } from "path";
import {
  ensureE2ETestUser,
  hasE2EAdminCredentials,
  resetE2EPlacementState,
} from "./helpers/auth";

try {
  const envPath = resolve(process.cwd(), ".env.local");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch {
  /* CI provides env vars directly */
}

export default async function globalSetup(): Promise<void> {
  if (!hasE2EAdminCredentials()) {
    console.warn(
      "[e2e] Skipping global setup — NEON_AUTH_BASE_URL or DATABASE_URL missing",
    );
    return;
  }

  const userId = await ensureE2ETestUser();
  await resetE2EPlacementState(userId);
  console.log("[e2e] Test user ready:", userId);
}