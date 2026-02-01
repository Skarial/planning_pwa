// js/data/export-db.js

import { openDB } from "./db.js";

// =======================
// CONSTANTES
// =======================

const DB_NAME = "planningDB";
const DB_VERSION = 5;

const STORES = ["services", "planning", "config"];

// =======================
// EXPORT PRINCIPAL
// =======================

export async function exportDatabase() {
  const db = await openDB();

  const exportData = {
    signature: "PLANNING_PWA_EXPORT_V1",
    meta: {
      app: "planning-pwa",
      exportVersion: 1,
      dbName: DB_NAME,
      dbVersion: DB_VERSION,
      exportedAt: new Date().toISOString(),
    },
    stores: {},
  };

  for (const storeName of STORES) {
    exportData.stores[storeName] = await readStore(db, storeName);
  }

  db.close();

  return exportData;
}

// =======================
// LECTURE D’UN STORE
// =======================

function readStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// =======================
// EXPORT UI (UTILISATEUR)
// =======================

export async function exportAllData() {
  const data = await exportDatabase();

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "planning-export.json";
  a.click();

  URL.revokeObjectURL(url);
}
