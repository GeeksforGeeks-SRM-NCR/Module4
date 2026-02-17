"use client";

import { useState, useEffect } from "react";

export default function TheBlob() {
    const [active, setActive] = useState(false);
    const [size, setSize] = useState(100);
    const [children, setChildren] = useState<number[]>([]);

    // BUG: Infinite Growth
    useEffect(() => {
        if (!active) return;

        const interval = setInterval(() => {
            // Grow dimensions
            setSize(s => s + 2);

            // Grow DOM count
            setChildren(c => [...c, Date.now()]);

            // If it gets too big, it might crash the browser render process
            // or at least cause massive reflows.
        }, 100); // 100ms interval for visible growth

        return () => clearInterval(interval);
    }, [active]);

    return (
        <div className="my-10 border-t border-purple-900 pt-10 text-center">
            <button
                onClick={() => setActive(!active)}
                className="px-6 py-2 bg-purple-900 hover:bg-purple-700 text-white rounded font-bold mb-4"
            >
                {active ? "STOP THE BLOB" : "RELEASE THE BLOB"}
            </button>

            {/* THE BLOB CONTAINER */}
            <div
                className="mx-auto bg-purple-600 rounded-full transition-all duration-75 flex flex-wrap items-center justify-center overflow-hidden"
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    maxWidth: '90vw', // constrained slightly so we see the DOM count explosion
                    maxHeight: '80vh'
                }}
            >
                {children.map((id, idx) => (
                    <div key={id} className="w-2 h-2 bg-white/20 m-0.5 rounded-full" />
                ))}
                {active && <span className="text-white font-bold mix-blend-overlay">FEED ME</span>}
            </div>

            <p className="text-xs text-gray-500 mt-2">Blob Size: {size}px | Cells: {children.length}</p>
        </div>
    );
}
