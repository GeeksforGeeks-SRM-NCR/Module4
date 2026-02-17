"use client";
import { useState } from "react";
export default function AdminPanel() {
    const [status, setStatus] = useState("Idle");
    const handleSubmit = () => {
        setStatus("Submitted!");
        alert("You clicked the unclickable!");
    };
    return (
        <div className="p-10 bg-zinc-900 text-white rounded-lg relative overflow-hidden border border-red-900 border-dashed my-10 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4 text-red-500">DANGER ZONE: Admin Panel</h2>
            <p className="mb-4 text-sm text-gray-400">
                This section is protected by advanced CSS layering.
            </p>
            <div className="opacity-90 relative z-10">
                <button
                    onClick={handleSubmit}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded z-[9999] relative"
                >
                    NUKE DATABASE
                </button>
            </div>
            <div
                className="fixed inset-0 z-50 pointer-events-auto opacity-0 cursor-default"
                title="I am the invisible shield"
                onClick={(e) => {
                    console.log("Blocked by invisible overlay!");
                    e.stopPropagation();
                }}
            />
            <div className="mt-4 text-xs font-mono">
                Status: {status}
            </div>
        </div>
    );
}
