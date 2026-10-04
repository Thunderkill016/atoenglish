import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/privacy", "/terms"],
        disallow: [
          "/dashboard",
          "/learn",
          "/flashcards",
          "/speaking",
          "/progress",
          "/roadmap",
          "/quiz",
          "/writing",
          "/leaderboard",
          "/grammar",
          "/business",
          "/challenge",
          "/pronunciation",
          "/placement-test",
          "/invite",
          "/certificate",
          "/settings",
          "/checkpoint",
          "/auth/",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

