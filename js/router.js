import { renderHome } from "./components/home.js";
import { getConsultedDate } from "./state/consulted-date.js";
import { renderDay } from "./components/day.js";
import { renderMonth } from "./components/month.js";

function getView(name) {
  return document.getElementById(`view-${name}`);
}

function hideAllViews() {
  ["home", "day", "month"].forEach((name) => {
    const el = getView(name);
    if (el) el.style.display = "none";
  });
}

export function showHome() {
  const home = getView("home");
  if (!home) return;

  hideAllViews();
  home.style.display = "block";
  home.innerHTML = "";
  renderHome();
}

export function showDay() {
  const day = getView("day");
  if (!day) return;

  hideAllViews();
  day.style.display = "block";
  day.innerHTML = "";

  const date = getConsultedDate();
  if (!date) {
    showHome();
    return;
  }

  renderDay(date);
}

export function showMonth() {
  const month = getView("month");
  if (!month) return;

  hideAllViews();
  month.style.display = "block";
  month.innerHTML = "";
  renderMonth();
}
