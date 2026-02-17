"use client";
import { useState, useEffect, useRef } from "react";
export default function HeavyScrollComponent() {
    const [width, setWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleScroll = () => {
            const data = Array(5000).fill(0).map((_, i) => Math.sqrt(i * Math.random()));
            const sum = data.reduce((acc, curr) => acc + curr, 0);
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setWidth(Math.min(100, (window.scrollY / 20) + (sum % 10)));
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    return (
        <div className="py-20 px-4 bg-zinc-800" ref={containerRef}>
            <h2 className="text-2xl font-bold text-white mb-4">Lag Master 9000</h2>
            <p className="text-gray-400 mb-6">Scroll down and feel the frame drops.</p>
            <div className="w-full h-12 bg-zinc-700 rounded-full overflow-hidden border border-zinc-600">
                <div
                    className="h-full bg-red-600 transition-none"
                    style={{ width: `${width}%` }}
                />
            </div>
            <p className="text-xs text-gray-500 mt-2">
                Calculation result: {width.toFixed(2)}%
            </p>
        </div>
    );
}
