// js/sw/sw-register.js
let swRegistration = null;

export function registerServiceWorker(onUpdateAvailable) {
  if (!("serviceWorker" in navigator)) return;

  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    return;
  }

  window.addEventListener("load", async () => {
    try {
      swRegistration = await navigator.serviceWorker.register(
        "./service-worker.js",
      );

      console.log("[SW] enregistré");

      // Détection fiable d'une nouvelle version
      swRegistration.addEventListener("updatefound", () => {
        const newWorker = swRegistration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            if (typeof onUpdateAvailable === "function") {
              onUpdateAvailable(swRegistration);
            }
          }
        });
      });
    } catch (err) {
      console.error("[SW] échec enregistrement", err);
    }
  });
}

export function getServiceWorkerRegistration() {
  return swRegistration;
}
