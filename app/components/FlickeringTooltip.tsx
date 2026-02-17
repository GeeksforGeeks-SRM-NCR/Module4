"use client";
import { useState } from "react";
export default function FlickeringTooltip() {
    const [show, setShow] = useState(false);
    return (
        <div className="relative inline-block mt-4">
            <button
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                className="px-4 py-2 bg-gray-700 rounded text-gray-200 hover:bg-gray-600"
            >
                Hover Me (If You Can)
            </button>
            {show && (
                <div
                    className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 px-3 py-1 bg-white text-black text-sm rounded whitespace-nowrap"
                >
                    Start flickering...
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
                </div>
            )}
        </div>
    );
}
