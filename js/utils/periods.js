import { getConfig } from "../data/db.js";

export async function getPeriodeForDate(dateISO) {
  const config = await getConfig("periodeSaisonniere");
  const saison = config?.value;

  if (!saison || !saison.debut || !saison.fin) {
    return "Période principale";
  }

  if (dateISO >= saison.debut && dateISO <= saison.fin) {
    return "Période saisonnière";
  }

  return "Période principale";
}
