import { suggestServices } from "../data/services.js";
import {
  getPlanningForMonth,
  savePlanningEntry,
  getAllServices,
} from "../data/storage.js";
import {
  getAllDaysOfMonth,
  getMonthLabelFR,
  getDayNameFR,
  formatDayNumber,
  isMonthLocked,
  getAdjacentMonths,
} from "../utils.js";
import { formatServiceLabel } from "../utils.js";
import { getPeriodeForDate } from "../utils/periods.js";
import { toISODateLocal } from "../utils.js";

// =======================
// ÉTAT LOCAL
// =======================

let displayedYear = new Date().getFullYear();
let displayedMonthIndex = new Date().getMonth();
let monthState = {};

// =======================
// RENDER
// =======================

export async function renderMonth() {
  const container = document.getElementById("view-month");
  container.innerHTML = "";

  // =======================
  // NAVIGATION MOIS
  // =======================

  const nav = document.createElement("div");
  nav.className = "month-nav";

  const prevBtn = document.createElement("button");
  prevBtn.className = "month-btn";
  prevBtn.textContent = "← Mois précédent";
  prevBtn.onclick = () => {
    displayedMonthIndex--;
    if (displayedMonthIndex < 0) {
      displayedMonthIndex = 11;
      displayedYear--;
    }
    renderMonth();
  };

  const title = document.createElement("div");
  title.className = "month-current";
  title.innerHTML = `
  <div>${getMonthLabelFR(displayedYear, displayedMonthIndex)}</div>
  <div>${displayedYear}</div>
`;

  const nextBtn = document.createElement("button");
  nextBtn.className = "month-btn";
  nextBtn.textContent = "Mois suivant →";
  nextBtn.onclick = () => {
    displayedMonthIndex++;
    if (displayedMonthIndex > 11) {
      displayedMonthIndex = 0;
      displayedYear++;
    }
    renderMonth();
  };

  nav.append(prevBtn, title, nextBtn);
  container.appendChild(nav);

  // =======================
  // DONNÉES
  // =======================

  const year = displayedYear;
  const monthIndex = displayedMonthIndex;
  const locked = isMonthLocked(year, monthIndex);

  monthState = {};
  const monthsToLoad = getAdjacentMonths(year, monthIndex);

  for (const m of monthsToLoad) {
    const entries = await getPlanningForMonth(m);
    entries.forEach((e) => {
      monthState[e.date] = e;
    });
  }

  // =======================
  // GRILLE CALENDAIRE 7×N
  // =======================

  const card = document.createElement("div");
  card.className = "card card-month";

  const grid = document.createElement("div");
  grid.className = "month-grid";

  card.appendChild(grid);
  container.appendChild(card);

  // En-têtes
  ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].forEach((d) => {
    const h = document.createElement("div");
    h.className = "day-header";
    h.textContent = d;
    grid.appendChild(h);
  });

  const days = getAllDaysOfMonth(year, monthIndex);
  const firstDayIndex = (days[0].getDay() + 6) % 7;

  // Cases vides avant début du mois
  for (let i = 0; i < firstDayIndex; i++) {
    const empty = document.createElement("div");
    empty.className = "day empty-day";
    grid.appendChild(empty);
  }

  // Jours du mois
  for (const date of days) {
    const iso = toISODateLocal(date);

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

    const num = document.createElement("div");
    num.className = "day-number";
    num.textContent = formatDayNumber(date);

    const label = document.createElement("div");
    label.className = "service-label";
    label.textContent = formatServiceLabel(entry.serviceCode);

    const input = document.createElement("input");
    input.type = "text";
    input.className = "service-input";
    input.value = entry.serviceCode;

    const suggest = document.createElement("div");
    suggest.className = "suggest-list";
    suggest.style.display = "none";

    input.onfocus = () => {
      input.value = "";
      input.classList.remove("repos");
      suggest.innerHTML = "";
      suggest.style.display = "none";
    };

    input.onblur = () => {
      setTimeout(() => {
        suggest.style.display = "none";
      }, 150);
    };

    const extraBtn = document.createElement("button");
    extraBtn.className = "extra-btn";
    extraBtn.innerHTML = `⏱ €`;

    function updateExtra() {
      if (entry.serviceCode === "REPOS") {
        extraBtn.style.display = "none";
        entry.extra = false;
        savePlanningEntry(entry);
        return;
      }

      extraBtn.style.display = "block";
      extraBtn.disabled = locked;
      extraBtn.classList.toggle("active", entry.extra === true);
    }

    updateExtra(); // ✅ APPLICATION INITIALE

    extraBtn.onclick = async () => {
      if (locked) return;
      entry.extra = !entry.extra;
      await savePlanningEntry(entry);
      updateExtra();
    };

    input.oninput = async () => {
      const q = input.value.trim().toUpperCase();

      entry.serviceCode = q || "REPOS";
      label.textContent = formatServiceLabel(entry.serviceCode);
      await savePlanningEntry(entry);
      updateExtra();

      suggest.innerHTML = "";

      if (!q) {
        suggest.style.display = "none";
        return;
      }

      const results = await suggestServices({
        input: q,
        dateISO: iso,
        getAllServices,
        getPeriodeForDate,
      });

      if (!Array.isArray(results) || results.length === 0) {
        suggest.style.display = "none";
        return;
      }

      results.forEach((service) => {
        const item = document.createElement("div");
        item.className = "suggest-item";
        item.textContent = service.code;

        item.onclick = async () => {
          input.value = service.code;
          entry.serviceCode = service.code;
          label.textContent = formatServiceLabel(service.code);
          await savePlanningEntry(entry);
          updateExtra();
          suggest.style.display = "none";
        };

        suggest.appendChild(item);
      });

      suggest.style.display = "block";
    };

    if (locked) input.disabled = true;
    if (entry.serviceCode === "REPOS") label.classList.add("repos");

    day.append(num, label, input, suggest, extraBtn);

    grid.appendChild(day);
  }
}
