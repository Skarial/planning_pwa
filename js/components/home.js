import { getPlanningEntry, getAllServices } from "../data/storage.js";
import { toISODateLocal } from "../utils.js";
import { getPeriodeForDate } from "../utils/periods.js";

export async function renderHome() {
  const container = document.getElementById("view-home");
  container.innerHTML = "";

  const allServices = await getAllServices();

  // Sécurité absolue
  if (!Array.isArray(allServices)) {
    console.error("allServices invalide", allServices);
    return;
  }

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
