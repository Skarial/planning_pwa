console.log("app.js – STABLE CLIC LONG");

// =======================
// ÉTAT GLOBAL
// =======================

let displayedYear = new Date().getFullYear();
let displayedMonthIndex = new Date().getMonth();
let consultedDate = null;
let monthState = {}; // { iso: { date, serviceCode, locked, extra } }

const EXTRA_FORBIDDEN_SERVICES = ["REPOS", "DM", "DAM"];

// =======================
// UTILITAIRES
// =======================

function toISODateLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateFR(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatDayNumber(d) {
  return String(d.getDate()).padStart(2, "0");
}

function getMonthLabelFR(year, monthIndex) {
  return [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ][monthIndex];
}

function getAllDaysOfMonth(year, monthIndex) {
  const days = [];
  const d = new Date(year, monthIndex, 1);
  while (d.getMonth() === monthIndex) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function isMonthLocked(year, monthIndex) {
  const today = new Date();
  return (
    year < today.getFullYear() ||
    (year === today.getFullYear() && monthIndex < today.getMonth())
  );
}

// =======================
// NAVIGATION
// =======================

function showView(name) {
  ["home", "day", "month"].forEach((v) => {
    document.getElementById(`view-${v}`).style.display =
      v === name ? "block" : "none";
  });
}

function showHome() {
  showView("home");
  renderHome();
}

function showDayView() {
  showView("day");
  renderDayView();
}

function showMonth() {
  showView("month");
  renderMonthlyPlanning();
}

// =======================
// ACCUEIL
// =======================

async function renderHome() {
  const el = document.getElementById("view-home");
  el.innerHTML = "";

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
  el.appendChild(nav);

  // =======================
  // CONSULTATION DATE
  // =======================

  const cardSearch = document.createElement("div");
  cardSearch.className = "card";

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
    showDayView();
  };

  row.append(inputDate, btn);
  cardSearch.appendChild(row);
  el.appendChild(cardSearch);

  // =======================
  // AUJOURD’HUI / DEMAIN
  // =======================

  async function getEntry(iso) {
    return openDB().then(
      (db) =>
        new Promise((res) => {
          db
            .transaction("planning", "readonly")
            .objectStore("planning")
            .get(iso).onsuccess = (e) => res(e.target.result || null);
        })
    );
  }

  for (const [label, offset] of [
    ["Aujourd’hui", 0],
    ["Demain", 1],
  ]) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const iso = toISODateLocal(d);
    const entry = await getEntry(iso);

    const service = entry?.serviceCode || "REPOS";
    const isExtra = entry?.extra === true;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="today-card-title">${label}</div>
      <div class="today-card-service ${service === "REPOS" ? "repos" : ""}">
        ${service}
      </div>
      ${isExtra ? `<div class="extra-label">Heure supplémentaire</div>` : ""}
    `;

    el.appendChild(card);
  }
}

// =======================
// VUE JOUR
// =======================

async function renderDayView() {
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

  async function getEntry(iso) {
    return openDB().then(
      (db) =>
        new Promise((res) => {
          db
            .transaction("planning", "readonly")
            .objectStore("planning")
            .get(iso).onsuccess = (e) => res(e.target.result || null);
        })
    );
  }

  const base = new Date(consultedDate);
  const next = new Date(base);
  next.setDate(base.getDate() + 1);

  for (const d of [base, next]) {
    const iso = toISODateLocal(d);
    const entry = await getEntry(iso);

    const service = entry?.serviceCode || "REPOS";
    const isExtra = entry?.extra === true;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h2>${formatDateFR(iso)}</h2>
      <div class="today-card-service ${
        service === "REPOS" ? "repos" : ""
      }">${service}</div>
      ${isExtra ? `<div class="extra-label">Heure supplémentaire</div>` : ""}
    `;
    el.appendChild(card);
  }
}

// =======================
// PLANNING MENSUEL
// =======================

async function renderMonthlyPlanning() {
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

  const year = displayedYear;
  const monthIndex = displayedMonthIndex;
  const monthISO = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const locked = isMonthLocked(year, monthIndex);

  const planningDB = await getPlanningForMonth(monthISO);
  monthState = {};
  planningDB.forEach((e) => {
    monthState[e.date] = {
      date: e.date,
      serviceCode: e.serviceCode ?? "REPOS",
      locked: e.locked ?? false,
      extra: e.extra ?? false,
    };
  });

  const card = document.createElement("div");
  card.className = "card";

  const grid = document.createElement("div");
  grid.className = "month-grid";

  const firstDay = new Date(year, monthIndex, 1);
  const offset = (firstDay.getDay() + 6) % 7;
  for (let i = 0; i < offset; i++) {
    grid.appendChild(document.createElement("div")).className = "day empty";
  }

  getAllDaysOfMonth(year, monthIndex).forEach((d) => {
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
    if (entry.extra) day.classList.add("extra");

    const num = document.createElement("div");
    num.className = "day-number";
    num.textContent = formatDayNumber(d);

    const input = document.createElement("input");
    input.type = "text";
    input.className = "service-input";
    input.value = entry.serviceCode;
    if (entry.serviceCode === "REPOS") input.classList.add("repos");
    if (locked) input.disabled = true;

    const suggest = document.createElement("div");
    suggest.className = "suggest-list";
    suggest.style.display = "none";

    input.addEventListener("pointerdown", (e) => e.stopPropagation());

    input.onfocus = () => {
      input.value = "";
      input.classList.remove("repos");
      suggest.innerHTML = "";
      suggest.style.display = "none";
    };

    input.oninput = async () => {
      const q = input.value.trim().toUpperCase();
      const value = q || "REPOS";

      input.value = value;
      entry.serviceCode = value;

      // règle métier : services interdits → pas d'heure supp
      if (EXTRA_FORBIDDEN_SERVICES.includes(value)) {
        entry.extra = false;
        day.classList.remove("extra");
      }

      savePlanningEntry(entry);

      if (value === "REPOS") input.classList.add("repos");
      else input.classList.remove("repos");

      suggest.innerHTML = "";
      if (!q) return;

      const results = await suggestServices(q, iso);
      results.forEach((r) => {
        const item = document.createElement("div");
        item.className = "suggest-item";
        item.textContent = r.code;
        item.addEventListener("pointerdown", (e) => e.stopPropagation());
        item.onclick = () => {
          input.value = r.code;
          entry.serviceCode = r.code;

          // règle métier
          if (EXTRA_FORBIDDEN_SERVICES.includes(r.code)) {
            entry.extra = false;
            day.classList.remove("extra");
          }

          savePlanningEntry(entry);

          suggest.style.display = "none";
        };
        suggest.appendChild(item);
      });

      suggest.style.display = "block";
    };

    day.append(num, input, suggest);
    grid.appendChild(day);
  });

  card.appendChild(grid);
  el.appendChild(card);
}

// =======================
// INIT
// =======================

window.addEventListener("DOMContentLoaded", async () => {
  await initServicesIfNeeded();
  showHome();
});
