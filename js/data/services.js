// =======================
// CONSTANTES
// =======================

export const SERVICE_TYPES = {
  REPOS: "REPOS",
  STANDARD: "STANDARD",
};

const SCORE_WEIGHTS = {
  EXACT_START: 100,
  CONTAINS: 50,
  NO_MATCH: 0,
};

const SUGGESTION_LIMIT = 8;

// =======================
// HELPERS INTERNES
// =======================

function normalize(str) {
  if (typeof str !== "string") return "";
  return str.trim().toUpperCase();
}

function serviceHasPeriode(service, periodeLibelle) {
  if (!Array.isArray(service.periodes)) return false;

  return service.periodes.some(
    (p) =>
      p.libelle === periodeLibelle &&
      Array.isArray(p.plages) &&
      p.plages.length > 0
  );
}

function calculateScore(code, query) {
  const normalizedCode = normalize(code);

  if (normalizedCode.startsWith(query)) return SCORE_WEIGHTS.EXACT_START;
  if (normalizedCode.includes(query)) return SCORE_WEIGHTS.CONTAINS;

  return SCORE_WEIGHTS.NO_MATCH;
}

function sortByScore(scoredServices) {
  return scoredServices.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.service.code.localeCompare(b.service.code);
  });
}

// =======================
// DONNÉES
// =======================

export const SERVICES_CATALOG = [
  // ⬇️ COPIE ICI TOUT LE TABLEAU TEL QUEL
];

// =======================
// API PUBLIQUE
// =======================

export async function suggestServices({
  input,
  dateISO,
  getAllServices,
  getPeriodeForDate,
  limit = SUGGESTION_LIMIT,
}) {
  const query = normalize(input);
  if (!query) return [];

  const services = await getAllServices();
  const periodeLibelle = await getPeriodeForDate(dateISO);

  const eligible = services.filter((service) => {
    if (service.code === SERVICE_TYPES.REPOS) {
      return query === "R";
    }
    return serviceHasPeriode(service, periodeLibelle);
  });

  const scored = eligible
    .map((service) => ({
      service,
      score: calculateScore(service.code, query),
    }))
    .filter((item) => item.score > SCORE_WEIGHTS.NO_MATCH);

  return sortByScore(scored)
    .slice(0, limit)
    .map((item) => ({
      code: item.service.code,
      type: item.service.type,
    }));
}
