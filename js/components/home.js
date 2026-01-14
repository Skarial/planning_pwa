import {
  getPlanningEntry,
  getAllServices,
  getConfig,
  setConfig,
} from "../data/storage.js";

import { showMonth, showDay } from "../router.js";
import { toISODateLocal, formatDateFR } from "../utils.js";
import { getPeriodeForDate } from "../utils/periods.js";

// =======================
// ÉTAT LOCAL
// =======================

let consultedDate = null;

// =======================
// RENDER
// =======================

export async function renderHome() {
  const container = document.getElementById("view-home");
  container.innerHTML = "";

  // =======================
  // NAVIGATION
  // =======================

  const nav = document.createElement("div");
  nav.className = "top-nav";

  const monthLink = document.createElement("a");
  monthLink.className = "nav-link";
  monthLink.textContent = "Planning mois";
  monthLink.onclick = showMonth;

  nav.appendChild(monthLink);
  container.appendChild(nav); // directement dans container, pas dans mainCard

  // =======================
  // CONFIG SAISONNIÈRE
  // =======================

  const saisonCard = document.createElement("div");
  saisonCard.className = "card";

  const title = document.createElement("div");
  title.className = "date-label";
  title.textContent = "Période saisonnière";

  const rowSaison = document.createElement("div");
  rowSaison.className = "consult-row";

  const inputDebut = document.createElement("input");
  inputDebut.type = "date";

  const inputFin = document.createElement("input");
  inputFin.type = "date";

  rowSaison.append(inputDebut, inputFin);
  saisonCard.append(title, rowSaison);
  container.appendChild(saisonCard);

  // =======================
  // CONSULTATION DATE
  // =======================

  const cardSearch = document.createElement("div");
  cardSearch.className = "card";

  const dateLabel = document.createElement("div");
  dateLabel.className = "date-label";
  dateLabel.textContent = "Date à consulter";

  const row = document.createElement("div");
  row.className = "consult-row";

  const inputDate = document.createElement("input");
  inputDate.type = "date";

  const btn = document.createElement("button");
  btn.className = "primary-btn";
  btn.textContent = "Consulter";

  btn.onclick = () => {
    if (!inputDate.value) return;
    consultedDate = inputDate.value;
    showDay();
  };

  row.append(inputDate, btn);
  cardSearch.append(dateLabel, row);
  container.appendChild(cardSearch);

  // =======================
  // AUJOURD'HUI / DEMAIN
  // =======================

  const allServices = await getAllServices();

  for (const [label, offset] of [
    ["Aujourd'hui", 0],
    ["Demain", 1],
  ]) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const iso = toISODateLocal(d);
    const entry = await getPlanningEntry(iso);

    const serviceCode = entry?.serviceCode || "REPOS";
    const isExtra = entry?.extra === true;

    let horaireHTML = "";

    if (serviceCode !== "REPOS") {
      const serviceData = allServices.find((s) => s.code === serviceCode);
      if (serviceData?.periodes) {
        const periodeActive = await getPeriodeForDate(iso);
        const periode =
          serviceData.periodes.length === 1
            ? serviceData.periodes[0]
            : periodeActive === "Période saisonnière"
            ? serviceData.periodes[1]
            : serviceData.periodes[0];

        if (periode?.plages?.length) {
          horaireHTML = `
            <div class="card-time">
              ${periode.plages.map((p) => `${p.debut} - ${p.fin}`).join(" | ")}
            </div>
          `;
        }
      }
    }

    const dayCard = document.createElement("div");
    dayCard.className = "card";
    dayCard.innerHTML = `
      <div class="card-title">${label}</div>
      <div class="card-service ${
        serviceCode === "REPOS" ? "repos" : ""
      }">${serviceCode}</div>
      ${horaireHTML}
      ${isExtra ? `<div class="extra-label">Heure supplémentaire</div>` : ""}
    `;

    container.appendChild(dayCard);
  }
}

// =======================
// API
// =======================

export function getConsultedDate() {
  return consultedDate;
}
