// Service Worker Ibra Global English Bobong (PWA Support)
const CACHE_NAME = "ibra-cache-v2";
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
  const url = new URL(event.request.url);
  
  // Skip caching for API, chrome extensions, or non-http requests
  if (url.pathname.startsWith("/api") || !url.protocol.startsWith("http")) return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      const match = await caches.match(event.request);
      return match || new Response(null, { status: 404, statusText: "Not Found" });
    })
  );
});
