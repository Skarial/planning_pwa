// =======================
// UTILITAIRES TEXTE
// =======================

function normalize(str) {
  return str.trim().toUpperCase();
}

// =======================
// CATALOGUE DES SERVICES
// =======================

const SERVICES_CATALOG = [
  {
    code: "REPOS",
    type: "REPOS",
    plages: [],
    validite: "ALL_YEAR",
  },
  {
    code: "DM",
    type: "STANDARD",
    plages: [{ debut: "05:45", fin: "13:00" }],
    validite: "ALL_YEAR",
  },
  {
    code: "DAM",
    type: "STANDARD",
    plages: [{ debut: "12:30", fin: "20:00" }],
    validite: "ALL_YEAR",
  },
  {
    code: "TAD 1",
    type: "STANDARD",
    plages: [{ debut: "06:45", fin: "13:15" }],
    validite: "ALL_YEAR",
  },
  {
    code: "TAD 2",
    type: "STANDARD",
    plages: [{ debut: "13:00", fin: "20:15" }],
    validite: "ALL_YEAR",
  },
  {
    code: "TAD 3",
    type: "STANDARD",
    plages: [{ debut: "06:45", fin: "13:15" }],
    validite: "ALL_YEAR",
  },
  {
    code: "TAD 4",
    type: "STANDARD",
    plages: [{ debut: "13:00", fin: "20:15" }],
    validite: "ALL_YEAR",
  },
  {
    code: "TAD 5",
    type: "STANDARD",
    plages: [{ debut: "06:45", fin: "13:15" }],
    validite: "ALL_YEAR",
  },
  {
    code: "TAD 6",
    type: "STANDARD",
    plages: [{ debut: "13:00", fin: "20:15" }],
    validite: "ALL_YEAR",
  },
];

// =======================
// INITIALISATION DB
// =======================

window.initServicesIfNeeded = async function () {
  const existing = await getAllServices();
  if (existing.length > 0) return;

  for (const service of SERVICES_CATALOG) {
    await addService(service);
  }
};

// =======================
// SUGGESTION SERVICES (UI)
// =======================

window.suggestServices = async function (input, dateISO, limit = 8) {
  const q = normalize(input);
  if (!q) return [];

  const services = await getAllServices();

  // 1️⃣ Filtrage métier
  const eligible = services.filter((s) => {
    // REPOS uniquement si l'utilisateur tape "R"
    if (s.code === "REPOS") {
      return q === "R";
    }

    return true; // tous les autres services
  });

  // 2️⃣ Scoring
  const scored = eligible
    .map((s) => {
      const code = normalize(s.code);

      let score = 0;
      if (code.startsWith(q)) score = 100;
      else if (code.includes(q)) score = 50;

      return { service: s, score };
    })
    .filter((x) => x.score > 0);

  // 3️⃣ Tri
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.service.code.localeCompare(b.service.code);
  });

  // 4️⃣ Projection UI minimale
  return scored.slice(0, limit).map((x) => ({
    code: x.service.code,
    plages: x.service.plages,
    type: x.service.type,
  }));
};
