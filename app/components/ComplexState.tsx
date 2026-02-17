"use client";

import { useState, useEffect } from "react";

// The hook causing the issue
function useDataFetcher(config: { id: number; metadata: { timestamp: number } }) {
    const [data, setData] = useState<string | null>(null);

    useEffect(() => {
        console.log("Fetching data for config:", config);
        // Simulate fetch
        setData(`Data for ID ${config.id} at ${config.metadata.timestamp}`);

        // BUG: The dependency array includes 'config'.
        // If 'config' is a new object every render, this runs every render.
    }, [config]);

    return data;
}

export default function ComplexState() {
    const [count, setCount] = useState(0);

    // BUG: Reference Identity Instability
    // We create a NEW object for 'metadata' on every render.
    // We pass this to the hook.
    // The hook has it in dependency array.
    // The hook updates state (setData).
    // State update triggers re-render of Hook... wait, Hook state update triggers Component re-render?
    // No, Hook state update triggers Hook re-execution -> which returns new data -> which might trigger Parent re-render if used?

    // Actually, simpler loop:
    // 1. Parent Renders.
    // 2. Creates new `config` object.
    // 3. Calls `useDataFetcher(config)`.
    // 4. `useEffect` in hook runs (config changed).
    // 5. `useEffect` calls `setData`.
    // 6. Hook state change -> Hook re-runs? 
    //    React Rules: State update stops if value hasn't changed.
    // 7. But we are setting data to a string based on config.

    // If we want a TRUE loop (infinite):
    // The hook needs to trigger a PARENT update.

    // Let's try "Double Render / Flicker" bug instead of infinite loop (to save the browser).
    // Or: a "useEffect" that enables an interval that updates state, but gets cleared and restarted constantly.

    // Let's do the "Object Dependency" classic.
    // This causes the effect to run on EVERY render, even if `id` didn't change.
    // It's a performance bug, and if the effect does something visible (like a console log or a network request), it's bad.

    const timestamp = Date.now(); // This changes every Ms? No, only on render.

    // This object is recreated every render with a new reference.
    const config = {
        id: 1,
        metadata: { timestamp: 12345 }
    };

    const data = useDataFetcher(config);

    return (
        <div className="p-8 border-t border-gray-700 bg-zinc-900 text-white text-center">
            <h3 className="text-xl font-bold mb-4">The Flicker Widget</h3>
            <p className="mb-4 text-gray-400">
                Open console. If you see thousands of "Fetching data...",
                it means `config` allows referential instability.
            </p>

            <button
                onClick={() => setCount(c => c + 1)}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
            >
                Force Re-render (Count: {count})
            </button>

            <div className="mt-4 text-green-400 font-mono text-sm">
                {data}
            </div>
        </div>
    );
}
