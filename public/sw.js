const CACHE_VERSION = "classify-cache-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const OFFLINE_PAGE = "/offline";
const STATIC_ASSETS = ["/", "/offline", "/manifest.webmanifest", "/icons/icon-192.svg", "/icons/icon-512.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (!key.startsWith(CACHE_VERSION)) {
            return caches.delete(key);
          }
          return Promise.resolve();
        }),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET") {
    return;
  }

  const isStaticAsset =
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static") ||
      url.pathname.startsWith("/icons/") ||
      url.pathname.endsWith(".css") ||
      url.pathname.endsWith(".js"));

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request).then((response) => {
          const cloned = response.clone();
          void caches.open(STATIC_CACHE).then((cache) => cache.put(request, cloned));
          return response;
        });
      }),
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const cloned = response.clone();
        void caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, cloned));
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) {
          return cached;
        }
        if (request.mode === "navigate") {
          const offline = await caches.match(OFFLINE_PAGE);
          if (offline) {
            return offline;
          }
        }
        return new Response("Offline", { status: 503, statusText: "Offline" });
      }),
  );
});

