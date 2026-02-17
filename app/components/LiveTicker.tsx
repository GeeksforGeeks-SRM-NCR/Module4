"use client";

import { useState, useEffect } from "react";

export default function LiveTicker() {
    const [price, setPrice] = useState(100);

    // BUG: WebSocket Memory Leak
    // We simulate a socket connection.
    useEffect(() => {
        console.log("Connecting to crypto socket...");

        // Simulate an event listener
        const interval = setInterval(() => {
            const change = (Math.random() - 0.5) * 5;
            setPrice(p => p + change);
            console.log("Tick:", price);
        }, 100);

        // BUG: Missing cleanup!
        // clearInterval(interval); 

        // If this component re-renders or unmounts (e.g. user navigates tabs in dashboard),
        // the intervals pile up. 10 navigation changes = 10 active intervals fighting to set state.
    }, []); // Empty dependency array means it only runs on mount.
    // BUT what if we had a dependency? 
    // Let's assume we pass a 'symbol' prop and put it in dependency.
    // Then every time prop changes, we leak another interval.

    return (
        <div className="p-4 bg-black border border-green-500 rounded font-mono text-green-400">
            <div className="text-xs text-gray-500 uppercase">BTC-USD Live</div>
            <div className="text-3xl font-bold">${price.toFixed(2)}</div>
            <div className="text-xs text-red-500 mt-2">
                Warning: Connection leaks on navigation.
            </div>
        </div>
    );
}
