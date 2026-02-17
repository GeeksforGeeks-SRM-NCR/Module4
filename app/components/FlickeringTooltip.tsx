"use client";

import { useState } from "react";

export default function FlickeringTooltip() {
    const [show, setShow] = useState(false);

    return (
        <div className="relative inline-block mt-4">
            {/* Trigger */}
            <button
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                className="px-4 py-2 bg-gray-700 rounded text-gray-200 hover:bg-gray-600"
            >
                Hover Me (If You Can)
            </button>

            {/* Tooltip Content */}
            {show && (
                <div
                    className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 px-3 py-1 bg-white text-black text-sm rounded whitespace-nowrap"
                // BUG: The 'mb-4' creates a 1rem (16px) gap.
                // When mouse leaves the button to go to the tooltip, it hits the gap.
                // 'onMouseLeave' fires on button. Tooltip hides.
                // Mouse never reaches tooltip. User thinks it's broken or glitchy.
                // To fix: Wrap both in a container or use a safe "bridge" div.
                >
                    Start flickering...
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
                </div>
            )}
        </div>
    );
}
