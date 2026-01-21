console.log("MENU.JS VERSION RESET STATE ACTIVE");

import { showHome, showDay, showMonth, showGuidedMonth } from "../router.js";
import { clearAllPlanning, clearPlanningMonth } from "../data/storage.js";
import { setConsultedDate } from "../state/consulted-date.js";
import { getConfig, setConfig } from "../data/storage.js";
import { APP_VERSION } from "../app.js";

// =======================
// SAISON — RESTAURATION
// =======================

async function loadSeasonForm() {
  const entry = await getConfig("saison");
  const saison = entry?.value;

  if (!saison) return;

  const start = document.getElementById("season-start");
  const end = document.getElementById("season-end");

  if (!start || !end) return;

  start.value = saison.saisonDebut || "";
  end.value = saison.saisonFin || "";
}

// =======================
// MENU
// =======================

export function initMenu() {
  // =======================
  // DOM — RESET
  // =======================

  const resetBtn = document.getElementById("menu-reset");
  const resetPanel = document.getElementById("reset-panel");
  const resetAllBtn = document.getElementById("reset-all");
  // =======================
  // RESET TOTAL — APPUI LONG (CONFIRMATION)
  // =======================

  let resetAllTimer = null;
  let resetAllConfirmed = false;
  const RESET_ALL_DURATION = 2500; // 2,5 secondes (PLUS LONG que le mois)

  function startResetAllPress() {
    if (resetAllTimer) return;

    resetAllBtn.classList.add("pressing");

    resetAllTimer = setTimeout(async () => {
      resetAllConfirmed = true;

      await clearAllPlanning();

      showToast("Planning entièrement réinitialisé");

      resetState = "closed";
      renderResetPanel();
      closeMenu();
    }, RESET_ALL_DURATION);
  }

  function cancelResetAllPress() {
    resetAllBtn.classList.remove("pressing");

    if (resetAllTimer) {
      clearTimeout(resetAllTimer);
      resetAllTimer = null;
    }

    resetAllConfirmed = false;
  }

  // SOURIS
  resetAllBtn.addEventListener("mousedown", startResetAllPress);
  resetAllBtn.addEventListener("mouseup", cancelResetAllPress);
  resetAllBtn.addEventListener("mouseleave", cancelResetAllPress);

  // TACTILE
  resetAllBtn.addEventListener("touchstart", startResetAllPress);
  resetAllBtn.addEventListener("touchend", cancelResetAllPress);
  resetAllBtn.addEventListener("touchcancel", cancelResetAllPress);

  const resetMonthBtn = document.getElementById("reset-month");

  const resetMonthPicker = document.getElementById("reset-month-picker");
  const resetMonthLabel = document.getElementById("reset-month-label");
  const resetPrevMonth = document.getElementById("reset-prev-month");
  const resetNextMonth = document.getElementById("reset-next-month");
  const resetConfirmMonth = document.getElementById("reset-confirm-month");

  // =======================
  // ÉTATS
  // =======================

  let isOpen = false;

  let touchStartX = 0;
  let touchStartY = 0;
  let currentTranslateX = 0;
  let isSwiping = false;

  let resetState = "closed"; // "closed" | "choice" | "month"
  let resetDate = new Date();

  // =======================
  // DOM — MENU
  // =======================

  const menu = document.getElementById("side-menu");
  const overlay = document.getElementById("menu-overlay");
  const toggle = document.getElementById("menu-toggle");

  if (!menu || !overlay || !toggle) {
    console.error("Menu DOM manquant");
    return;
  }

  // =======================
  // NORMALISATION ÉTAT MENU
  // =======================

  toggle.classList.remove("hidden");
  overlay.classList.remove("hidden");
  menu.classList.remove("hidden");

  menu.classList.remove("open");
  overlay.classList.remove("open");
  menu.setAttribute("aria-hidden", "true");

  // =======================
  // SAISON
  // =======================

  const seasonBtn = document.getElementById("menu-season");
  const seasonForm = document.getElementById("season-form");
  const seasonStart = document.getElementById("season-start");
  const seasonEnd = document.getElementById("season-end");
  const seasonSubmit = document.getElementById("season-submit");
  const seasonReset = document.getElementById("season-reset");

  loadSeasonForm();

  seasonBtn?.addEventListener("click", () => {
    seasonForm.classList.toggle("hidden");
  });

  seasonSubmit?.addEventListener("click", async () => {
    const start = seasonStart.value.trim();
    const end = seasonEnd.value.trim();

    if (!start || !end) {
      await setConfig("saison", {});
    } else {
      await setConfig("saison", {
        saisonDebut: start,
        saisonFin: end,
      });
    }

    seasonForm.classList.add("hidden");
    closeMenu();
  });

  seasonReset?.addEventListener("click", async () => {
    await setConfig("saison", {});
    seasonStart.value = "";
    seasonEnd.value = "";
    seasonForm.classList.add("hidden");
    closeMenu();
    showHome();
  });

  // =======================
  // CONSULTATION DATE
  // =======================

  const consultBtn = document.getElementById("menu-consult-date");
  const consultForm = document.getElementById("consult-date-form");
  const consultInput = document.getElementById("consult-date-input");
  const consultSubmit = document.getElementById("consult-date-submit");

  consultBtn?.addEventListener("click", () => {
    consultForm.classList.toggle("hidden");
  });

  consultSubmit?.addEventListener("click", () => {
    if (!consultInput.value) return;
    setConsultedDate(consultInput.value);
    consultForm.classList.add("hidden");
    showDay();
    closeMenu();
  });

  // =======================
  // OUVERTURE / FERMETURE
  // =======================

  function openMenu() {
    menu.classList.add("open");
    overlay.classList.add("open");
    menu.setAttribute("aria-hidden", "false");
    menu.style.transition = "transform 0.25s ease";
    menu.style.transform = "translateX(0)";
    isOpen = true;
  }

  function closeMenu() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    menu.classList.remove("open");
    overlay.classList.remove("open");
    menu.setAttribute("aria-hidden", "true");

    isOpen = false;
    resetState = "closed";
    renderResetPanel();

    menu.style.transition = "";
    menu.style.transform = "";
    currentTranslateX = 0;
  }

  toggle.addEventListener("click", () => {
    isOpen ? closeMenu() : openMenu();
  });

  overlay.addEventListener("click", closeMenu);

  // =======================
  // SWIPE GAUCHE — MENU
  // =======================

  menu.addEventListener("touchstart", (e) => {
    if (!isOpen) return;
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    isSwiping = true;
    menu.style.transition = "none";
  });

  menu.addEventListener("touchmove", (e) => {
    if (!isOpen || !isSwiping) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;

    if (Math.abs(dy) > Math.abs(dx)) {
      isSwiping = false;
      menu.style.transition = "";
      return;
    }

    if (dx < 0) {
      currentTranslateX = dx;
      menu.style.transform = `translateX(${dx}px)`;
    }
  });

  menu.addEventListener("touchend", () => {
    if (!isOpen) return;
    menu.style.transition = "transform 0.25s ease";

    const threshold = -menu.offsetWidth * 0.3;
    if (currentTranslateX < threshold) {
      closeMenu();
    } else {
      menu.style.transform = "translateX(0)";
    }

    isSwiping = false;
    currentTranslateX = 0;
  });

  // =======================
  // RESET — LOGIQUE
  // =======================

  function updateResetMonthLabel() {
    resetMonthLabel.textContent = resetDate.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  }

  function renderResetPanel() {
    resetPanel.classList.add("hidden");
    resetMonthPicker.classList.add("hidden");
    resetConfirmMonth.classList.add("hidden");

    if (resetState === "choice") {
      resetPanel.classList.remove("hidden");
    }

    if (resetState === "month") {
      resetPanel.classList.remove("hidden");
      resetMonthPicker.classList.remove("hidden");
      resetConfirmMonth.classList.remove("hidden");
    }
  }

  resetBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    resetState = "choice";
    renderResetPanel();
  });

  resetAllBtn.addEventListener("click", async () => {
    const ok = await showConfirm({
      title: "Réinitialisation complète",
      message: "Cette action supprimera tout le planning. Action irréversible.",
      confirmText: "Tout supprimer",
    });

    if (!ok) return;

    await clearAllPlanning();
    showToast("Planning entièrement réinitialisé");
    closeMenu();
  });

  resetMonthBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    resetDate = new Date();
    resetState = "month";
    updateResetMonthLabel();
    renderResetPanel();
  });

  resetPrevMonth.addEventListener("click", (e) => {
    e.stopPropagation();
    resetDate.setMonth(resetDate.getMonth() - 1);
    updateResetMonthLabel();
  });

  resetNextMonth.addEventListener("click", (e) => {
    e.stopPropagation();
    resetDate.setMonth(resetDate.getMonth() + 1);
    updateResetMonthLabel();
  });

  let holdTimer = null;
  let holdDuration = 1200; // ms

  resetConfirmMonth.addEventListener("mousedown", startHold);
  resetConfirmMonth.addEventListener("touchstart", startHold);

  resetConfirmMonth.addEventListener("mouseup", cancelHold);
  resetConfirmMonth.addEventListener("mouseleave", cancelHold);
  resetConfirmMonth.addEventListener("touchend", cancelHold);
  resetConfirmMonth.addEventListener("touchcancel", cancelHold);

  function startHold(e) {
    e.preventDefault();
    if (holdTimer) return;

    resetConfirmMonth.classList.add("holding");

    holdTimer = setTimeout(async () => {
      holdTimer = null;
      resetConfirmMonth.classList.remove("holding");

      const monthISO = `${resetDate.getFullYear()}-${String(
        resetDate.getMonth() + 1,
      ).padStart(2, "0")}`;

      await clearPlanningMonth(monthISO);

      showToast("Planning du mois réinitialisé");

      resetState = "closed";
      renderResetPanel();
      closeMenu();
    }, holdDuration);
  }

  function cancelHold() {
    if (!holdTimer) return;

    clearTimeout(holdTimer);
    holdTimer = null;
    resetConfirmMonth.classList.remove("holding");
  }

  // =======================
  // NAVIGATION
  // =======================

  menu.addEventListener("click", (e) => {
    // 🔒 Tant qu'un reset est en cours, on bloque la navigation
    if (resetState !== "closed") {
      e.stopPropagation();
      return;
    }

    const action = e.target.dataset.action;
    if (!action) return;

    switch (action) {
      case "home":
        showHome();
        break;
      case "day":
        showDay();
        break;
      case "month":
        showMonth();
        break;
      case "guided-month":
        showGuidedMonth();
        break;
      case "tetribus":
        import("../router.js").then(({ showTetribusView }) => {
          showTetribusView();
        });
        break;
    }

    closeMenu();
  });

  // =======================
  // VERSION
  // =======================

  const versionEl = document.getElementById("app-version");
  if (versionEl) {
    versionEl.textContent = `Version ${APP_VERSION}`;
  }
}

// =======================
// TOAST
// =======================

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.textContent = message;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("visible");
  });

  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}

// =======================
// CONFIRM MODALE
// =======================

function showConfirm({ title, message, confirmText = "Confirmer" }) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";

    const modal = document.createElement("div");
    modal.className = "confirm-modal";

    modal.innerHTML = `
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="confirm-actions">
        <button class="confirm-cancel">Annuler</button>
        <button class="confirm-ok danger">${confirmText}</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const cleanup = (result) => {
      overlay.remove();
      resolve(result);
    };

    overlay.querySelector(".confirm-cancel").onclick = () => cleanup(false);
    overlay.querySelector(".confirm-ok").onclick = () => cleanup(true);
  });
}
