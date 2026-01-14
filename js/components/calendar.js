import { openDB } from "../data/db.js";
import { showHome, showMonth } from "../router.js";
import {
  toISODateLocal,
  formatDateFR,
  formatDayNumber,
  getDayNameFR,
  getDayNameFullFR,
  getMonthLabelFR,
  getAllDaysOfMonth,
  getWeekNumberISO,
  isMonthLocked,
  getAdjacentMonths,
  formatServiceLabel,
} from "../utils.js";

import {
  getAllServices,
  getPlanningForMonth,
  savePlanningEntry,
} from "../data/storage.js";

import { suggestServices } from "../data/services.js";
import { getPeriodeForDate } from "../utils/periods.js";
import { getConsultedDate } from "./home.js";

// =======================
// ÉTAT LOCAL CALENDRIER
// =======================

let displayedYear = new Date().getFullYear();
let displayedMonthIndex = new Date().getMonth();
let monthState = {};

// =======================
// HELPERS DB
// =======================

// =======================
// VUE JOUR
// =======================

export async function renderDayView() {
  const consultedDate = getConsultedDate();
  if (!consultedDate) {
    showHome();
    return;
  }

  const el = document.getElementById("view-day");
  el.innerHTML = "";

  const nav = document.createElement("div");
  nav.className = "top-nav";

  const home = document.createElement("a");
  home.className = "nav-link";
  home.textContent = "Accueil";
  home.onclick = showHome;

  const month = document.createElement("a");
  month.className = "nav-link";
  month.textContent = "Planning mois";
  month.onclick = showMonth;

  nav.append(home, month);
  el.appendChild(nav);

  const base = new Date(consultedDate);
  const next = new Date(base);
  next.setDate(base.getDate() + 1);

  const allServices = await getAllServices();

  for (const d of [base, next]) {
    const iso = toISODateLocal(d);
    const entry = await getPlanningEntry(iso);

    const service = entry?.serviceCode || "REPOS";
    const isExtra = entry?.extra === true;

    const card = document.createElement("div");
    card.className = "card";

    const dayNameEl = document.createElement("div");
    dayNameEl.className = "day-name-full";
    dayNameEl.textContent = getDayNameFullFR(d);

    const dateEl = document.createElement("div");
    dateEl.className = "day-date";
    dateEl.textContent = formatDateFR(iso);

    const serviceEl = document.createElement("div");
    serviceEl.className = "today-card-service";
    serviceEl.textContent = service;
    if (service === "REPOS") serviceEl.classList.add("repos");

    card.append(dayNameEl, dateEl, serviceEl);

    if (service !== "REPOS") {
      const serviceData = allServices.find((s) => s.code === service);
      if (serviceData?.periodes) {
        const periodeActive = await getPeriodeForDate(iso);
        const periode =
          serviceData.periodes.length === 1
            ? serviceData.periodes[0]
            : periodeActive === "Période saisonnière"
            ? serviceData.periodes[1]
            : serviceData.periodes[0];

        if (periode?.plages?.length) {
          const timeEl = document.createElement("div");
          timeEl.className = "day-card-time";
          timeEl.textContent = periode.plages
            .map((p) => `${p.debut} - ${p.fin}`)
            .join(" | ");
          card.appendChild(timeEl);
        }
      }
    }

    if (isExtra) {
      const extraEl = document.createElement("div");
      extraEl.className = "extra-label";
      extraEl.textContent = "Heure supplémentaire";
      card.appendChild(extraEl);
    }

    el.appendChild(card);
  }
}

// =======================
// VUE MOIS
// =======================

export async function renderMonthlyPlanning() {
  const el = document.getElementById("planning");
  el.innerHTML = "";

  const navTop = document.createElement("div");
  navTop.className = "top-nav";

  const homeLink = document.createElement("a");
  homeLink.className = "nav-link";
  homeLink.textContent = "Accueil";
  homeLink.onclick = showHome;

  navTop.appendChild(homeLink);
  el.appendChild(navTop);

  const nav = document.createElement("div");
  nav.className = "month-nav";

  const prev = document.createElement("button");
  prev.className = "month-btn";
  prev.textContent = "← Mois précédent";
  prev.onclick = () => {
    displayedMonthIndex--;
    if (displayedMonthIndex < 0) {
      displayedMonthIndex = 11;
      displayedYear--;
    }
    renderMonthlyPlanning();
  };

  const title = document.createElement("div");
  title.className = "month-current";
  title.innerHTML = `
    <span>${getMonthLabelFR(displayedYear, displayedMonthIndex)}</span>
    <span>${displayedYear}</span>
  `;

  const next = document.createElement("button");
  next.className = "month-btn";
  next.textContent = "Mois suivant →";
  next.onclick = () => {
    displayedMonthIndex++;
    if (displayedMonthIndex > 11) {
      displayedMonthIndex = 0;
      displayedYear++;
    }
    renderMonthlyPlanning();
  };

  nav.append(prev, title, next);
  el.appendChild(nav);

  const locked = isMonthLocked(displayedYear, displayedMonthIndex);
  monthState = {};

  const monthsToLoad = getAdjacentMonths(displayedYear, displayedMonthIndex);

  for (const m of monthsToLoad) {
    const entries = await getPlanningForMonth(m);
    entries.forEach((e) => {
      monthState[e.date] = {
        date: e.date,
        serviceCode: e.serviceCode ?? "REPOS",
        locked: e.locked ?? false,
        extra: e.extra ?? false,
      };
    });
  }

  const card = document.createElement("div");
  card.className = "card";

  const grid = document.createElement("div");
  grid.className = "month-weeks";

  const days = getAllDaysOfMonth(displayedYear, displayedMonthIndex);

  let weekDaysContainer = null;

  days.forEach((d, index) => {
    if (d.getDay() === 1 || index === 0) {
      const week = document.createElement("div");
      week.className = "week";

      const weekDays = document.createElement("div");
      weekDays.className = "week-days";

      const weekLabel = document.createElement("div");
      weekLabel.className = "week-label";
      weekLabel.textContent = "S" + getWeekNumberISO(d);

      week.appendChild(weekLabel);
      week.appendChild(weekDays);
      grid.appendChild(week);

      weekDaysContainer = weekDays;
    }

    const iso = toISODateLocal(d);

    if (!monthState[iso]) {
      monthState[iso] = {
        date: iso,
        serviceCode: "REPOS",
        locked: false,
        extra: false,
      };
    }

    const entry = monthState[iso];

    const day = document.createElement("div");
    day.className = "day";

    const dayName = document.createElement("div");
    dayName.className = "day-name";
    dayName.textContent = getDayNameFR(d);

    const num = document.createElement("div");
    num.className = "day-number";
    num.textContent = formatDayNumber(d);

    const serviceLabel = document.createElement("div");
    serviceLabel.className = "service-label";
    serviceLabel.textContent = formatServiceLabel(entry.serviceCode);
    if (entry.serviceCode === "REPOS") serviceLabel.classList.add("repos");

    day.append(dayName, num, serviceLabel);
    weekDaysContainer.appendChild(day);
  });

  card.appendChild(grid);
  el.appendChild(card);
}
