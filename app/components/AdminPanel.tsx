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

            {/* 
         BUG: CSS Stacking Context Trap
         We want to make the button unclickable but in a subtle way.
      */}

            {/* 1. This container has opacity < 1, which creates a new Stacking Context. */}
            {/* 2. The children inside are z-indexed. */}
            <div className="opacity-90 relative z-10">
                <button
                    onClick={handleSubmit}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded z-[9999] relative"
                >
                    NUKE DATABASE
                </button>
            </div>

            {/* 
         The Trap:
         This overlay has z-index: 50.
         Wait, 50 < 9999 right? So the button should be on top?
         
         WRONG.
         The button is inside a container with `opacity: 0.9` and `z-index: 10`.
         That container forms a generic atomic stacking context. 
         The button's z-index: 9999 is relative ONLY to that container.
         
         The overlay below is `z-index: 50` relative to the ROOT (or the parent div context).
         Since the button's parent (z-index: 10) is lower than the overlay (z-index: 50),
         the overlay sits ON TOP of the parent, and thus ON TOP OF THE BUTTON.
         
         Even though Button has z-index 9999, it effectively has "Parent(10) -> Button(9999)".
         Overlay has "Overlay(50)".
         50 > 10. Overlay wins.
         
         We add `pointer-events-auto` to ensure it blocks clicks.
         We add `opacity-0` so it's invisible.
      */}
            <div
                className="fixed inset-0 z-50 pointer-events-auto opacity-0 cursor-default"
                title="I am the invisible shield"
                onClick={(e) => {
                    // Swallow clicks
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
