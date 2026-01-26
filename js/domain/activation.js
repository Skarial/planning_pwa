// js/domain/activation.js

// =======================
// SECRET PARTAGÉ
// =======================
// ⚠️ À NE JAMAIS MODIFIER après diffusion publique
// Changer ce secret invalidera TOUS les codes existants

const SECRET = "PLANNING_PWA_SECRET_V1";

// =======================
// API PUBLIQUE
// =======================

export async function verifierCode(code, deviceId) {
  if (
    typeof code !== "string" ||
    typeof deviceId !== "string" ||
    !code ||
    !deviceId
  ) {
    return false;
  }

  const expected = await generateExpectedCode(deviceId);
  return normalize(code) === expected;
}

// =======================
// LOGIQUE PURE
// =======================

async function generateExpectedCode(deviceId) {
  const input = `${SECRET}:${deviceId}`;
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );

  const hashHex = bufferToHex(hashBuffer);
  return hashHex.slice(0, 12); // code utilisateur
}

// =======================
// UTILITAIRES
// =======================

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function normalize(value) {
  return value.trim().toLowerCase();
}
