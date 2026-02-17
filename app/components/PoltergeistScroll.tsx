"use client";
import { useEffect, useRef, useState } from "react";
export default function PoltergeistScroll() {
    const [active, setActive] = useState(false);
    const direction = useRef(1);
    const speed = useRef(2);
    useEffect(() => {
        if (!active) return;
        let frameId: number;
        const animate = () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const current = window.scrollY;
            if (current >= maxScroll) direction.current = -1;
            if (current <= 0) direction.current = 1;
            window.scrollTo(0, current + (speed.current * direction.current));
            if (Math.random() > 0.99) speed.current += 0.1;
            frameId = requestAnimationFrame(animate);
        };
        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, [active]);
    return (
        <div className="fixed bottom-4 left-4 z-[9999] bg-red-900 border-2 border-red-500 p-2 rounded">
            <h3 className="text-red-500 font-bold text-xs uppercase mb-1">Poltergeist Mode</h3>
            <button
                onClick={() => setActive(!active)}
                className={`w-full px-2 py-1 text-xs font-bold rounded ${active ? 'bg-red-500 text-white animate-pulse' : 'bg-zinc-800 text-red-500'}`}
            >
                {active ? "EXORCISE" : "SUMMON"}
            </button>
        </div>
    );
}
