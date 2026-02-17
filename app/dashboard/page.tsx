"use client";

import { Suspense, useTransition, useState } from "react";
import LiveTicker from "../components/LiveTicker";
import DatabaseChaos from "../components/DatabaseChaos";

// Simulated Slow Component
function SlowStats() {
    // BUG: Suspense Deadlock / Infinite Promise
    // If we throw a promise that never resolves, Suspense waits forever.
    // Or we use `use` hook with a promise that rejects without boundary?

    // Let's do a "Transition Blocking" bug.
    // We have a button that triggers a transition, but the calculation is synchronous and heavy.
    return (
        <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-slate-800 p-6 rounded">
                <h3 className="text-gray-400 text-sm">Active Users</h3>
                <p className="text-2xl font-bold">14,203</p>
            </div>
            <div className="bg-slate-800 p-6 rounded">
                <h3 className="text-gray-400 text-sm">Server Load</h3>
                <p className="text-2xl font-bold text-orange-400">92%</p>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const [isPending, startTransition] = useTransition();
    const [tab, setTab] = useState("overview");

    const handleTabChange = (nextTab: string) => {
        // BUG: Blocking UI with useTransition? 
        // No, useTransition exists to NOT block UI.
        // But if we do CPU heavy stuff inside the transition (or triggered by state update),
        // it can still freeze.

        startTransition(() => {
            // Simulate heavy sync work (Synchronous Blocking)
            // This defeats the purpose of startTransition for responsiveness if the work is on main thread.
            const start = Date.now();
            while (Date.now() - start < 2000) {
                // Freeze browser for 2 seconds
            }
            setTab(nextTab);
        });
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Dashboard</h2>

            <div className="mb-8 p-4 bg-red-900/30 border border-red-500/50 rounded text-sm text-red-200">
                <p>Welcome to the unstable zone.</p>
            </div>

            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => handleTabChange("overview")}
                    className={`px-4 py-2 rounded ${tab === 'overview' ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => handleTabChange("realtime")}
                    className={`px-4 py-2 rounded ${tab === 'realtime' ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                    Realtime (Heavy)
                </button>
            </div>

            {isPending && <div className="text-yellow-400 animate-pulse mb-4">Processing heavy transition... (UI Frozen?)</div>}

            {tab === "overview" && (
                <Suspense fallback={<div className="p-10 text-center animate-pulse">Loading Stats...</div>}>
                    <SlowStats />
                </Suspense>
            )}

            {tab === "realtime" && (
                <div className="space-y-6">
                    <LiveTicker />
                    <LiveTicker />
                    <p className="text-xs text-gray-500">Multiple sockets opened/leaked?</p>
                    <DatabaseChaos />
                </div>
            )}
        </div>
    );
}
