"use client";

// BUG: IndexedDB Sync Conflict & Versioning Logic Errors

const DB_NAME = "ExtremeDB";
// We hardcode version to 1. 
// But what if another tab tries to upgrade to 2?
// Or if we try to open with version 0?
const DB_VERSION = 1;

export const openDB = () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error("Database error:", request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            const db = request.result;
            // BUG: We don't handle 'onversionchange' here.
            // If another tab upgrades the DB, this tab will block the upgrade unless we close the connection.
            // This causes a "Deadlock" where the new tab hangs forever on "upgradeneeded".
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            // This runs if DB doesn't exist or version is higher.
            const db = (event.target as IDBOpenDBRequest).result;

            // Create an object store
            if (!db.objectStoreNames.contains("logs")) {
                db.createObjectStore("logs", { keyPath: "id", autoIncrement: true });
            }

            // BUG: We perform a long-running synchronous transaction here?
            // Or we throw an error inside upgrade? 
            // If we throw here, the upgrade fails and the db enters an inconsistent state potentially (or just closed).
        };
    });
};

export const addLog = async (message: string) => {
    // BUG: Opening a new connection for EVERY log entry without closing it.
    // Browsers have a limit on active connections.
    // If we call this 100 times, we might hit the limit or degrade performance.
    const db = await openDB();
    const tx = db.transaction("logs", "readwrite");
    const store = tx.objectStore("logs");
    store.add({ message, timestamp: Date.now() });

    // We never call db.close();
};

// Conflict Generator
export const triggerConflict = () => {
    // Attempt to open with a higher version
    const request = indexedDB.open(DB_NAME, DB_VERSION + 1);

    request.onblocked = () => {
        alert("Database Upgrade Blocked! Close other tabs!");
    };

    request.onupgradeneeded = () => {
        alert("Upgrading DB... (This might hang if other connections are open)");
    };
};
