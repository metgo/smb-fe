const CACHE_NAME = "intro-video-cache-v2";

// Install event - skip waiting to activate immediately
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate event - clean up old caches
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
});

// Fetch event - cache external video resources from storage.googleapis.com
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only cache video files from Google Cloud Storage
  if (
    url.hostname === "storage.googleapis.com" &&
    (url.pathname.includes("/video/") ||
      url.pathname.endsWith(".mp4") ||
      url.pathname.endsWith(".mkv"))
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request)
          .then((response) => {
            // Only cache successful responses
            if (
              !response ||
              response.status !== 200 ||
              response.type === "error"
            ) {
              return response;
            }

            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });

            return response;
          })
          .catch(() => {
            // Return a fallback or empty response if fetch fails
            return new Response("Video unavailable", { status: 404 });
          });
      }),
    );
  }
});
