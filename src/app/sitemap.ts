import type { MetadataRoute } from "next";
import { UNITS } from "@/lib/constants/units";
import { SITE_URL } from "@/lib/site";

// P3-1 Fix: Include all 50 dynamic unit routes in sitemap
// Previously only static pages were indexed — units missed SEO entirely.
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dynamic unit routes — all 50 learn pages
  const unitRoutes: MetadataRoute.Sitemap = UNITS.map((unit) => ({
    url: `${baseUrl}${unit.route}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...unitRoutes];
}
