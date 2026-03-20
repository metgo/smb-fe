const CACHE_NAME = "intro-video-cache-v4";

// Video file extensions to cache
const VIDEO_EXTENSIONS = [".mp4", ".mkv", ".webm", ".mov", ".avi"];

// Track in-flight requests to prevent duplicates
const pendingRequests = new Map();

// Check if URL is a video file
function isVideoFile(url) {
  const pathname = url.pathname.toLowerCase();
  return (
    VIDEO_EXTENSIONS.some((ext) => pathname.endsWith(ext)) ||
    pathname.includes("/video/")
  );
}

// Install event
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate event
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

// Fetch event - cache video files, prevent duplicate requests
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only handle video files
  if (!isVideoFile(url)) return;

  // Skip range requests (let browser handle video streaming)
  if (event.request.headers.get("range")) {
    return;
  }

  event.respondWith(
    (async () => {
      const cacheKey = url.href;

      // Check cache first
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      // If already fetching this URL, wait for that request
      if (pendingRequests.has(cacheKey)) {
        return pendingRequests.get(cacheKey);
      }

      // Start new fetch and track it
      const fetchPromise = fetch(event.request)
        .then((response) => {
          // Only cache successful full responses (not 206 partial)
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .finally(() => {
          pendingRequests.delete(cacheKey);
        });

      pendingRequests.set(cacheKey, fetchPromise);
      return fetchPromise;
    })(),
  );
});
