// =======================
// CONFIGURATION DB
// =======================

const DB_NAME = "planningDB";
const DB_VERSION = 3;

// =======================
// OUVERTURE DB
// =======================

window.openDB = function () {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("services")) {
        db.createObjectStore("services", { keyPath: "code" });
      }

      if (!db.objectStoreNames.contains("planning")) {
        db.createObjectStore("planning", { keyPath: "date" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// =======================
// SERVICES
// =======================

window.getAllServices = async function () {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("services", "readonly");
    const store = tx.objectStore("services");

    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

window.addService = async function (service) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("services", "readwrite");
    tx.objectStore("services").put(service);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

// =======================
// PLANNING
// =======================

window.savePlanningEntry = async function (entry) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("planning", "readwrite");
    const store = tx.objectStore("planning");

    store.put({
      date: entry.date,
      serviceCode: entry.serviceCode,
      locked: entry.locked ?? false,
      extra: entry.extra ?? false,
    });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

window.getPlanningForMonth = async function (monthISO) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("planning", "readonly");
    const store = tx.objectStore("planning");
    const results = [];

    store.openCursor().onsuccess = (e) => {
      const cursor = e.target.result;
      if (!cursor) {
        results.sort((a, b) => a.date.localeCompare(b.date));
        resolve(results);
        return;
      }

      if (cursor.key.startsWith(monthISO)) {
        const v = cursor.value;
        results.push({
          date: v.date,
          serviceCode: v.serviceCode ?? "REPOS",
          locked: v.locked ?? false,
          extra: v.extra ?? false,
        });
      }

      cursor.continue();
    };

    tx.onerror = () => reject(tx.error);
  });
};

// =======================
// VERROUILLAGE MOIS PASSÉS
// =======================

window.lockPastMonths = async function () {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("planning", "readwrite");
    const store = tx.objectStore("planning");

    const now = new Date();
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthISO = prevMonthDate.toISOString().slice(0, 7);

    store.openCursor().onsuccess = (e) => {
      const cursor = e.target.result;
      if (!cursor) {
        resolve();
        return;
      }

      const entry = cursor.value;
      const entryMonth = entry.date.slice(0, 7);

      if (entryMonth < previousMonthISO && entry.locked === false) {
        entry.locked = true;
        cursor.update(entry);
      }

      cursor.continue();
    };

    tx.onerror = () => reject(tx.error);
  });
};
