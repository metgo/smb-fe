const CACHE_NAME = "intro-video-cache-v1";
const VIDEO_URLS = [
  "/video/intro-video.mp4", // desktop fallback video
  "/video/intro-video-mobile.mkv", // mobile fallback video
];

// Install event - cache video files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(VIDEO_URLS)),
  );
});

// Fetch event - serve cached video first
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (VIDEO_URLS.some((v) => url.pathname.endsWith(v))) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((response) => {
          const responseClone = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseClone));
          return response;
        });
      }),
    );
  }
});
