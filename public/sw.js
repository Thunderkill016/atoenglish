// AtoEnglish Service Worker — Web Push + offline caching
// v4: network-first for API/auth, stale-while-revalidate for app shell + assets
const CACHE_NAME = "atoenglish-v5";
const APP_SHELL = [
  "/",
  "/learn",
  "/review",
  "/me",
  "/roadmap",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

// ── Install — pre-cache app shell ───────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // addAll with individual error handling to avoid blocking on missing assets
      Promise.allSettled(APP_SHELL.map((url) => cache.add(url))),
    ),
  );
  self.skipWaiting();
});

// ── Activate — purge old caches ─────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

// ── Fetch — caching strategies ──────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // 1. Network-only: Data API, auth routes, server actions
  if (
    url.pathname.startsWith("/auth") ||
    url.pathname.startsWith("/api/") ||
    url.searchParams.has("_rsc") ||
    request.headers.get("next-router-state-tree")
  ) {
    return; // let browser handle
  }

  // 2. Stale-while-revalidate: Next.js static assets (_next/static)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const networkFetch = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached ?? networkFetch;
      }),
    );
    return;
  }

  // 3. Network-first with cache fallback: app pages (HTML)
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Cache successful page responses
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return res;
        })
        .catch(() =>
          caches
            .match(request)
            .then(
              (cached) =>
                cached ??
                caches
                  .match("/")
                  .then(
                    (shell) =>
                      shell ?? new Response("Offline", { status: 503 }),
                  ),
            ),
        ),
    );
    return;
  }

  // 4. Cache-first: static media (images, fonts, audio)
  if (url.pathname.match(/\.(png|jpg|jpeg|webp|svg|ico|woff2?|mp3|mp4)$/)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const res = await fetch(request).catch(() => null);
        if (res?.ok) cache.put(request, res.clone());
        return res ?? new Response("", { status: 404 });
      }),
    );
  }
});

