/* =====================================================
   SERVICE WORKER — PWA PLANNING
   - cache versionné
   - activation volontaire
   - compatible bump-version.ps1
   ===================================================== */

const CACHE_PREFIX = "planning-pwa-cache-";
const CACHE_VERSION = "__APP_VERSION__";
const CACHE_NAME = CACHE_PREFIX + CACHE_VERSION;

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./css/tetribus.css",
  "./js/app.js",
  "./manifest.webmanifest",
];

// =======================
// INSTALL — téléchargement silencieux
// =======================

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)),
  );
  // ❌ pas de skipWaiting ici
});

// =======================
// ACTIVATE — nettoyage + prise de contrôle
// =======================

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((n) => n.startsWith(CACHE_PREFIX) && n !== CACHE_NAME)
            .map((n) => caches.delete(n)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// =======================
// FETCH — stratégie simple et robuste
// =======================

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Navigation : réseau prioritaire
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match("./index.html")));
    return;
  }

  // JS & CSS : réseau prioritaire + fallback cache
  if (req.destination === "script" || req.destination === "style") {
    event.respondWith(networkFirst(req));
    return;
  }

  // Images & fonts : cache-first
  if (req.destination === "image" || req.destination === "font") {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Autres assets : cache-first
  event.respondWith(cacheFirst(req));
});

// =======================
// MESSAGE — activation volontaire
// =======================

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// =======================
// HELPERS — CACHE
// =======================

function cacheFirst(req) {
  return caches.match(req).then((cached) => cached || fetchAndCache(req));
}

function networkFirst(req) {
  return fetchAndCache(req).catch(() => caches.match(req));
}

function fetchAndCache(req) {
  return fetch(req).then((res) => {
    if (res && res.ok) {
      caches.open(CACHE_NAME).then((cache) => cache.put(req, res.clone()));
    }
    return res;
  });
}


















