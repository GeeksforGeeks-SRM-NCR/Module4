"use client";
import { useState } from "react";
export default function RunawayButton() {
    const [position, setPosition] = useState({ top: "50%", left: "50%" });
    const [hoverCount, setHoverCount] = useState(0);
    const handleHover = () => {
        const randomTop = Math.floor(Math.random() * 80) + 10;
        const randomLeft = Math.floor(Math.random() * 80) + 10;
        setPosition({ top: `${randomTop}%`, left: `${randomLeft}%` });
        setHoverCount(c => c + 1);
    };
    return (
        <div className="relative h-64 w-full border border-dashed border-gray-600 rounded-lg overflow-hidden bg-gray-900/50 mt-8">
            <div className="absolute top-2 left-2 text-xs text-gray-400">
                Attempts: {hoverCount}
            </div>
            <button
                onMouseEnter={handleHover}
                style={{ top: position.top, left: position.left, position: 'absolute', transition: 'all 0.1s ease' }}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded shadow-lg transform -translate-x-1/2 -translate-y-1/2"
            >
                Claim Reward
            </button>
        </div>
    );
}
