// Service Worker Ibra Global English Bobong (PWA Support)
const CACHE_NAME = "ibra-cache-v3";
const ASSETS_TO_CACHE = [
  "/",
  "/manifest.json",
  "/assets/logo.png",
  "/assets/favicon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  
  let url: URL;
  try {
    url = new URL(event.request.url);
  } catch (_) {
    return;
  }
  
  // Strictly handle same-origin requests only.
  // Never intercept third-party cross-origin requests (Cloudflare, Google Analytics, AdBlock targets, etc.)
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api") || !url.protocol.startsWith("http")) return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      const match = await caches.match(event.request);
      if (match) return match;
      return new Response("", { status: 404, statusText: "Not Found" });
    })
  );
});
