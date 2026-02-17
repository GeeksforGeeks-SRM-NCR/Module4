"use client";

import { addLog, triggerConflict } from "../utils/db";

export default function DatabaseChaos() {

    const spamLogs = () => {
        for (let i = 0; i < 100; i++) {
            addLog(`Log entry ${i} - Leaking connection`);
        }
        alert("Opened 100 connections. Check DevTools -> Application -> IndexedDB.");
    };

    return (
        <div className="p-4 border border-yellow-600 bg-yellow-900/20 rounded mt-4">
            <h3 className="tex-lg font-bold text-yellow-500 mb-2">IndexedDB Manager</h3>
            <div className="flex gap-4">
                <button
                    onClick={spamLogs}
                    className="bg-zinc-700 hover:bg-zinc-600 px-3 py-1 rounded text-sm"
                >
                    Spam Logs (Leak Connections)
                </button>
                <button
                    onClick={triggerConflict}
                    className="bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-sm"
                >
                    Trigger Version Upgrade (Deadlock)
                </button>
            </div>
        </div>
    );
}
