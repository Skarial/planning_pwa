// js/sw/sw-register.js

export function registerServiceWorker(onUpdateAvailable) {
  if (!("serviceWorker" in navigator)) return;

  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    return;
  }

  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("./service-worker.js");

      console.log("[SW] enregistré");

      // Détection fiable d'une nouvelle version
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            // 👉 notifier l'application
            if (typeof onUpdateAvailable === "function") {
              onUpdateAvailable(reg);
            }
          }
        });
      });
    } catch (err) {
      console.error("[SW] échec enregistrement", err);
    }
  });
}
