"use client";
import { useState, useEffect } from "react";
export default function LiveTicker() {
    const [price, setPrice] = useState(100);
    useEffect(() => {
        console.log("Connecting to crypto socket...");
        const interval = setInterval(() => {
            const change = (Math.random() - 0.5) * 5;
            setPrice(p => p + change);
            console.log("Tick:", price);
        }, 100);
    }, []);
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
