import { getAllServices, getPlanningEntry } from "../data/storage.js";
import { getPeriodeForDate } from "../utils/periods.js";
import { toISODateLocal, formatDateFR, getDayNameFullFR } from "../utils.js";

// =======================
// RENDER VUE JOUR
// =======================

export async function renderDay(dateISO) {
  if (!dateISO) {
    showHome();
    return;
  }

  const el = document.getElementById("view-day");
  el.innerHTML = "";

  // =======================
  // DONNÉES
  // =======================

  const base = new Date(dateISO);
  const next = new Date(base);
  next.setDate(base.getDate() + 1);

  const services = await getAllServices();

  // =======================
  // RENDER JOURS
  // =======================

  for (const d of [base, next]) {
    const iso = toISODateLocal(d);

    const entry = await getPlanningEntry(iso);
    const serviceCode = entry?.serviceCode || "REPOS";
    const isExtra = entry?.extra === true;

    const card = document.createElement("div");
    card.className = "card";

    // --- 1. Nom du jour (FIX CERTAIN)
    const dayNameEl = document.createElement("div");
    dayNameEl.className = "day-name-full";
    dayNameEl.textContent = getDayNameFullFR(d);

    // --- 2. Date
    const dateEl = document.createElement("div");
    dateEl.className = "day-date";
    dateEl.textContent = formatDateFR(iso);

    // --- 3. Service
    const serviceEl = document.createElement("div");
    serviceEl.className = "card-service";
    serviceEl.textContent = serviceCode;
    if (serviceCode === "REPOS") serviceEl.classList.add("repos");

    // --- 4. Horaires (FIX CERTAIN)
    const timeEl = await buildHoraires(serviceCode, iso, services);

    // Injection
    card.append(dayNameEl, dateEl, serviceEl);
    if (timeEl) card.appendChild(timeEl);

    if (isExtra) {
      const extra = document.createElement("div");
      extra.className = "extra-label";
      extra.textContent = "Heure supplémentaire";
      card.appendChild(extra);
    }

    el.appendChild(card);
  }
}

// =======================
// HORAIRES (ISOLÉ)
// =======================

async function buildHoraires(serviceCode, iso, services) {
  if (serviceCode === "REPOS") return null;

  const service = services.find((s) => s.code === serviceCode);
  if (!service || !Array.isArray(service.periodes)) return null;

  const periodeActive = await getPeriodeForDate(iso);

  let periode;
  if (service.periodes.length === 1) {
    periode = service.periodes[0];
  } else {
    periode =
      periodeActive === "Période saisonnière"
        ? service.periodes[1]
        : service.periodes[0];
  }

  if (!periode?.plages?.length) return null;

  const el = document.createElement("div");
  el.className = "card-time";
  el.textContent = periode.plages
    .map((p) => `${p.debut} - ${p.fin}`)
    .join(" | ");

  return el;
}

// =======================
// DB LECTURE JOUR
// =======================
