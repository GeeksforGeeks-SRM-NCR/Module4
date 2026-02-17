"use client";
import { useState, useEffect } from "react";
function useDataFetcher(config: { id: number; metadata: { timestamp: number } }) {
    const [data, setData] = useState<string | null>(null);
    useEffect(() => {
        console.log("Fetching data for config:", config);
        setData(`Data for ID ${config.id} at ${config.metadata.timestamp}`);
    }, [config]);
    return data;
}
export default function ComplexState() {
    const [count, setCount] = useState(0);
    const timestamp = Date.now();
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
