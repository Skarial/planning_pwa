/*
  Application Planning PWA
*/
export const APP_VERSION = "1.0.96";

const UPDATE_REMIND_DELAY = 6 * 60 * 60 * 1000; // 6 heures
import { getConfig } from "./data/db.js";
import { showActivationScreen } from "./components/activationScreen.js";

import {
  registerServiceWorker,
  getServiceWorkerRegistration,
} from "./sw/sw-register.js";

import { initServicesIfNeeded } from "./data/services-init.js";
import { showHome } from "./router.js";
import { initMenu } from "./components/menu.js";

// =======================
// INIT
// =======================

window.addEventListener("DOMContentLoaded", initApp);
document.addEventListener("visibilitychange", onVisibilityReturn);
if ("requestIdleCallback" in window) {
  requestIdleCallback(() => {
    checkAndNotifyUpdate();
  });
} else {
  setTimeout(() => {
    checkAndNotifyUpdate();
  }, 1500);
}

async function initApp() {
  // 0️⃣ Vérification activation (BLOQUANTE)
  const activation = await getConfig("activation_ok");

  if (!activation || activation.value !== "true") {
    await showActivationScreen();
    return;
  }

  // 1️⃣ Affichage normal
  initMenu();
  showHome();

  // 2️⃣ Tâches non bloquantes
  initServicesIfNeeded(); // sans await
  registerServiceWorker(); // sans attendre
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("update-reload")
    ?.addEventListener("click", async () => {
      localStorage.setItem("lastSeenAppVersion", APP_VERSION);

      const reg = getServiceWorkerRegistration();

      if (reg?.waiting) {
        // 1️⃣ forcer l’activation du nouveau SW
        reg.waiting.postMessage("SKIP_WAITING");

        // 2️⃣ attendre qu’il prenne le contrôle
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          location.reload();
        });

        return;
      }

      // fallback sécurité
      location.reload();
    });

  document.getElementById("update-later")?.addEventListener("click", () => {
    localStorage.setItem("swLastUpdateDismissedAt", Date.now());
    hideUpdateBanner();
  });
});

// =======================
// UPDATE DETECTION (ROBUSTE)
// =======================

function checkAndNotifyUpdate() {
  const lastSeenVersion = localStorage.getItem("lastSeenAppVersion");
  const dismissedAt = Number(
    localStorage.getItem("swLastUpdateDismissedAt") || 0,
  );

  const now = Date.now();

  // 1️⃣ L’utilisateur a déjà validé cette version
  if (lastSeenVersion === APP_VERSION) {
    return;
  }

  // 2️⃣ Rappel différé (moins de 6h)
  if (now - dismissedAt < UPDATE_REMIND_DELAY) {
    return;
  }

  // 3️⃣ Sinon → afficher la bannière
  showUpdateBanner();
}

function onVisibilityReturn() {
  if (document.visibilityState === "visible") {
    checkAndNotifyUpdate();
  }
}

// =======================
// BANNIÈRE
// =======================

function showUpdateBanner() {
  const banner = document.getElementById("update-banner");
  if (!banner) return;

  banner.classList.remove("hidden");
}

function hideUpdateBanner() {
  const banner = document.getElementById("update-banner");
  if (!banner) return;

  banner.classList.add("hidden");
}
