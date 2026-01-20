/* =====================================================
   SERVICE WORKER — PWA PLANNING
   Objectif :
   - cache versionné
   - activation volontaire
   - aucun reload forcé
   ===================================================== */

/* ⚠️ Ce placeholder est remplacé temporairement
   par le script de bump avant le commit */
const APP_VERSION = "__APP_VERSION__";

const CACHE_PREFIX = "planning-pwa-cache-";
const CACHE_NAME = CACHE_PREFIX + APP_VERSION;

/* Noyau minimal — le reste passe par fetch */
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./manifest.webmanifest",
];

/* =====================================================
   INSTALL — PRÉPARATION UNIQUEMENT
   ===================================================== */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)),
  );
  /* ❌ PAS de skipWaiting */
});

/* =====================================================
   ACTIVATE — NETTOYAGE + NOTIFICATION
   ===================================================== */
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
      .then(async () => {
        /* Notification contrôlée : le SW est prêt,
           mais ne prend PAS le contrôle */
        const clients = await self.clients.matchAll({ type: "window" });
        for (const client of clients) {
          client.postMessage({
            type: "SW_READY",
            version: APP_VERSION,
          });
        }
      }),
  );
});

/* =====================================================
   FETCH — STRATÉGIE
   ===================================================== */
self.addEventListener("fetch", (event) => {
  const request = event.request;

  /* Navigation : réseau en priorité */
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("./index.html")));
    return;
  }

  /* Assets : cache → réseau */
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request)),
  );
});

/* =====================================================
   MESSAGES — ACTIVATION VOLONTAIRE
   ===================================================== */
self.addEventListener("message", (event) => {
  if (event.data === "ACTIVATE_NEW_SW") {
    /* Activation uniquement sur demande explicite */
    self.skipWaiting();
  }
});
