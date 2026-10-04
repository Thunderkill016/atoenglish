/**
 * Canonical site origin for metadata, sitemap, robots and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL per environment (e.g. the Workers production
 * domain); falls back to localhost for dev/test builds.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");
