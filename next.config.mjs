/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "sonner"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Back-compat: old /audio/unit19/... links keep working — canonical data
  // paths are already hyphenated (/audio/unit-19/...). Kept for stale
  // bookmarks/cached pages; vinext serves the canonical paths directly.
  async rewrites() {
    return [
      {
        // [0-9] not \d: vinext serializes the source into a template literal,
        // which double-escapes backslashes and breaks \d at runtime.
        source: "/audio/unit([0-9]+)/(.*)",
        destination: "/audio/unit-$1/$2",
      },
    ];
  },
  async headers() {
    const isDev = process.env.NODE_ENV === "development";

    // In production: no unsafe-eval. In dev: Next.js HMR needs it.
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'; "
      : "script-src 'self' 'unsafe-inline'; ";

    const csp = [
      "default-src 'self'; ",
      scriptSrc,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ",
      "img-src 'self' blob: data: https://lh3.googleusercontent.com https://i.ytimg.com; ",
      "frame-src https://www.youtube-nocookie.com; ",
      "font-src 'self' data: https://fonts.gstatic.com; ",
      "connect-src 'self' https://*.neon.tech wss://*.neon.tech https://*.upstash.io; ",
      "media-src 'self' blob: data:; ",
      "object-src 'none'; ",
      "worker-src 'self' blob:; ",
      "form-action 'self'; ",
      "frame-ancestors 'none'; ",
      "base-uri 'self';",
    ].join("");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Content-Security-Policy",
            value: csp,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
