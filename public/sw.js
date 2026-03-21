const CACHE_NAME = "app-cache-v1";

// Install event
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  event.waitUntil(self.clients.claim());
});

// Let browser handle video caching natively - server sets Cache-Control headers
// Videos have: Cache-Control: public, max-age=31536000, immutable
