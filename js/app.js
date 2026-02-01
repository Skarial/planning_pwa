/*
  Application Planning PWA
*/
export const APP_VERSION = "1.0.126";
const MIGRATION_BANNER_KEY = "migration_banner_v2_dismissed";

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

async function initApp() {
  // 0️⃣ Vérification activation (BLOQUANTE)
  const activation = await getConfig("activation_ok");

  const isActivated = activation?.value === "true";

  if (!isActivated) {
    await showActivationScreen();
    return;
  }

  // 1️⃣ Affichage normal
  initMenu();
  showHome();
  showMigrationBanner();

  // 2️⃣ Tâches non bloquantes
  initServicesIfNeeded(); // sans await
  await registerServiceWorker(showUpdateBanner);
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("update-reload")
    ?.addEventListener("click", async () => {
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

  const dismissButton = document.getElementById("migration-dismiss");
  dismissButton?.addEventListener("click", () => {
    localStorage.setItem(MIGRATION_BANNER_KEY, "true");
    document.getElementById("migration-banner")?.classList.add("hidden");
  });

  const stepsButton = document.getElementById("migration-steps");
  const modal = document.getElementById("migration-modal");
  const closeButton = document.getElementById("migration-close");

  const closeModal = () => {
    modal?.classList.add("hidden");
  };

  stepsButton?.addEventListener("click", () => {
    modal?.classList.remove("hidden");
  });

  closeButton?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (event) => {
    const target = event.target;
    if (target && target.dataset?.close === "true") {
      closeModal();
    }
  });
});

// =======================
// BANNIÈRE
// =======================

function showMigrationBanner() {
  const dismissed = localStorage.getItem(MIGRATION_BANNER_KEY) === "true";
  const banner = document.getElementById("migration-banner");
  if (!banner || dismissed) return;

  banner.classList.remove("hidden");
}

function showUpdateBanner() {
  const banner = document.getElementById("update-banner");
  if (!banner) return;

  banner.classList.remove("hidden");
}






