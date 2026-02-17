"use client";
const DB_NAME = "ExtremeDB";
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
            resolve(db);
        };
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains("logs")) {
                db.createObjectStore("logs", { keyPath: "id", autoIncrement: true });
            }
        };
    });
};
export const addLog = async (message: string) => {
    const db = await openDB();
    const tx = db.transaction("logs", "readwrite");
    const store = tx.objectStore("logs");
    store.add({ message, timestamp: Date.now() });
};
export const triggerConflict = () => {
    const request = indexedDB.open(DB_NAME, DB_VERSION + 1);
    request.onblocked = () => {
        alert("Database Upgrade Blocked! Close other tabs!");
    };
    request.onupgradeneeded = () => {
        alert("Upgrading DB... (This might hang if other connections are open)");
    };
};
