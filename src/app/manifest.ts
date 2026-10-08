import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AtoEnglish — Học tiếng Anh qua video",
    short_name: "AtoEnglish",
    description:
      "Học tiếng Anh qua video YouTube tự chọn: phụ đề song ngữ, tra từ ngữ cảnh, ôn tập FSRS.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#10b981",
    orientation: "portrait",
    lang: "vi",
    categories: ["education", "productivity"],
    // YouTube app → Share → AtoEnglish (installed PWA, Android/desktop).
    // /share canonicalizes the shared URL to /watch/[videoId].
    share_target: {
      action: "/share",
      method: "GET",
      params: { title: "title", text: "text", url: "url" },
    },
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
