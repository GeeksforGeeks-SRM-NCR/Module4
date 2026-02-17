"use client";
import { Suspense, useTransition, useState } from "react";
import LiveTicker from "../components/LiveTicker";
import DatabaseChaos from "../components/DatabaseChaos";
function SlowStats() {
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
        startTransition(() => {
            const start = Date.now();
            while (Date.now() - start < 2000) {
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
