console.log("app.js – STABLE CLIC LONG");

// =======================
// ÉTAT GLOBAL
// =======================
function getAdjacentMonths(year, monthIndex) {
  const prevYear = monthIndex === 0 ? year - 1 : year;
  const prevMonth = monthIndex === 0 ? 12 : monthIndex;

  const nextYear = monthIndex === 11 ? year + 1 : year;
  const nextMonth = monthIndex === 11 ? 1 : monthIndex + 2;

  return [
    `${prevYear}-${String(prevMonth).padStart(2, "0")}`,
    `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
    `${nextYear}-${String(nextMonth).padStart(2, "0")}`,
  ];
}

let displayedYear = new Date().getFullYear();
let displayedMonthIndex = new Date().getMonth();
let consultedDate = null;
let monthState = {}; // { iso: { date, serviceCode, locked, extra } }

const EXTRA_FORBIDDEN_SERVICES = ["REPOS"];

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

function getDayNameFR(date) {
  return [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ][date.getDay()];
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

  monthState = {};

  const monthsToLoad = getAdjacentMonths(year, monthIndex);

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

  const days = getAllDaysOfMonth(year, monthIndex);

  let currentWeek = null;
  let weekDaysContainer = null;

  days.forEach((d, index) => {
    // nouvelle semaine le lundi ou au début du mois
    if (d.getDay() === 1 || index === 0) {
      const week = document.createElement("div");
      week.className = "week";

      const weekDays = document.createElement("div");
      weekDays.className = "week-days";

      // 👉 jours du mois précédent (début du mois)
      if (index === 0) {
        const firstDayIndex = (d.getDay() + 6) % 7; // lundi = 0

        for (let offset = firstDayIndex; offset > 0; offset--) {
          const fakeDate = new Date(d);
          fakeDate.setDate(d.getDate() - offset);

          const fakeDay = document.createElement("div");
          fakeDay.className = "day other-month";

          const dayName = document.createElement("div");
          dayName.className = "day-name";
          dayName.textContent = getDayNameFR(fakeDate);

          const num = document.createElement("div");
          num.className = "day-number";
          num.textContent = fakeDate.getDate();

          const fakeISO = toISODateLocal(fakeDate);
          const fakeEntry = monthState[fakeISO];

          const fakeInput = document.createElement("input");
          fakeInput.className = "service-input";
          fakeInput.disabled = true;
          fakeInput.value = fakeEntry?.serviceCode || "REPOS";

          if (fakeInput.value === "REPOS") {
            fakeInput.classList.add("repos");
          }

          const fakeExtraBtn = document.createElement("button");
          fakeExtraBtn.className = "extra-btn";
          fakeExtraBtn.disabled = true;
          fakeExtraBtn.type = "button";

          fakeExtraBtn.innerHTML = `
            <span class="icon-clock">⏱</span>
            <span class="icon-euro">€</span>
          `;

          // visibilité selon le service

          if (fakeEntry && fakeEntry.serviceCode !== "REPOS") {
            fakeExtraBtn.style.visibility = "visible";

            if (fakeEntry.extra === true) {
              fakeExtraBtn.classList.add("active");
            }
          } else {
            fakeExtraBtn.style.visibility = "hidden";
          }

          const fakeSuggest = document.createElement("div");
          fakeSuggest.className = "suggest-list";
          fakeSuggest.style.display = "none";

          fakeDay.append(dayName, num, fakeInput, fakeExtraBtn, fakeSuggest);
          weekDays.appendChild(fakeDay);
        }
      }

      week.appendChild(weekDays);
      grid.appendChild(week);

      currentWeek = week;
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

    const input = document.createElement("input");
    input.type = "text";
    input.className = "service-input";
    input.value = entry.serviceCode;
    if (entry.serviceCode === "REPOS") input.classList.add("repos");
    if (locked) input.disabled = true;

    const suggest = document.createElement("div");
    suggest.className = "suggest-list";
    suggest.style.display = "none";

    // =======================
    // BOUTON HEURE SUPPLÉMENTAIRE
    // =======================

    const extraBtn = document.createElement("button");
    extraBtn.className = "extra-btn";
    extraBtn.type = "button";
    extraBtn.innerHTML = `
  <span class="icon-clock">⏱</span>
  <span class="icon-euro">€</span>
`;

    function updateExtraButtonState(currentValue = null) {
      const service = currentValue ?? entry.serviceCode;
      const isRepos = service === "REPOS";
      const disabled = locked;

      // REPOS → bouton invisible
      if (isRepos) {
        if (entry.extra) {
          entry.extra = false;
          savePlanningEntry(entry);
        }

        extraBtn.style.visibility = "hidden";
        extraBtn.disabled = true;
        extraBtn.classList.remove("active");
        return;
      }

      // autres services
      extraBtn.style.visibility = "visible";
      extraBtn.disabled = disabled;

      if (disabled) {
        extraBtn.classList.remove("active");
        return;
      }

      extraBtn.classList.toggle("active", entry.extra === true);
    }

    extraBtn.onclick = () => {
      if (extraBtn.disabled) return;

      entry.extra = !entry.extra;
      savePlanningEntry(entry);

      updateExtraButtonState();
    };

    updateExtraButtonState();

    input.addEventListener("pointerdown", (e) => e.stopPropagation());

    input.onfocus = () => {
      input.value = "";
      input.classList.remove("repos");
      suggest.innerHTML = "";
      suggest.style.display = "none";
    };

    input.oninput = async () => {
      const q = input.value.trim().toUpperCase();

      // synchro immédiate état local + DB
      entry.serviceCode = q || "REPOS";
      savePlanningEntry(entry);

      // mise à jour immédiate du bouton (sans délai)
      updateExtraButtonState(q);

      // reset visuel
      input.classList.remove("repos");
      suggest.innerHTML = "";

      if (!q) {
        suggest.style.display = "none";
        return;
      }

      const results = await suggestServices(q, iso);

      if (results.length === 0) {
        suggest.style.display = "none";
        return;
      }

      results.forEach((r) => {
        const item = document.createElement("div");
        item.className = "suggest-item";
        item.textContent = r.code;

        item.addEventListener("pointerdown", (e) => e.stopPropagation());

        item.onclick = () => {
          input.value = r.code;
          entry.serviceCode = r.code;

          input.classList.toggle("repos", r.code === "REPOS");

          savePlanningEntry(entry);
          updateExtraButtonState();
          suggest.style.display = "none";
        };

        suggest.appendChild(item);
      });

      suggest.style.display = "block";
    };

    day.append(dayName, num, input, extraBtn, suggest);
    weekDaysContainer.appendChild(day);
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
