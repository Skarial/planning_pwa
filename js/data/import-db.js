// js/data/import-db.js

import { openDB } from "./db.js";

// =======================
// STORES CONNUS
// =======================

const STORES = ["services", "planning", "config"];

// =======================
// IMPORT PRINCIPAL
// =======================

export async function importDatabase(exportData) {
  validateExportFormat(exportData);

  const db = await openDB();

  // 1. Vidage complet
  for (const storeName of STORES) {
    await clearStore(db, storeName);
  }

  // 2. Restauration dans l’ordre
  for (const storeName of STORES) {
    const records = exportData.stores[storeName] || [];
    await restoreStore(db, storeName, records);
  }

  db.close();

  // 3. Redémarrage obligatoire
  location.reload();
}
// =======================
// VALIDATION FORMAT
// =======================

function validateExportFormat(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Export invalide : objet attendu");
  }

  if (data.signature !== "PLANNING_PWA_EXPORT_V1") {
    throw new Error("Export invalide : signature inconnue");
  }

  if (!data.meta || data.meta.exportVersion !== 1) {
    throw new Error("Export invalide : version non supportée");
  }

  if (!data.stores || typeof data.stores !== "object") {
    throw new Error("Export invalide : stores manquants");
  }
}

// =======================
// UTILITAIRES
// =======================

function clearStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).clear();
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

function restoreStore(db, storeName, records) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(records)) {
      resolve();
      return;
    }

    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    for (const record of records) {
      store.put(record);
    }

    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

// =======================
// IMPORT UI (UTILISATEUR)
// =======================

export async function importAllData() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        await importDatabase(data);
        resolve();
      } catch (err) {
        alert("Fichier de sauvegarde invalide");
        reject(err);
      }
    };

    input.click();
  });
}
