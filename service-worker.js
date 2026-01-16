const CACHE_NAME = "planning-pwa-cache";

const ASSETS_TO_CACHE = [
  "./css/style.css",
  "./js/app.js",
  "./manifest.webmanifest",
];

// =======================
// INSTALL — INSTALLATION IMMÉDIATE
// =======================

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all([
        cache.addAll(ASSETS_TO_CACHE),
        cache.add("./index.html"),
      ]);
    }),
  );
});

// =======================
// ACTIVATE — NETTOYAGE + CONTRÔLE
// =======================

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// =======================
// FETCH — STRATÉGIE
// =======================

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // HTML : réseau en priorité
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("./index.html")));
    return;
  }

  // Assets : cache-first
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    }),
  );
});
