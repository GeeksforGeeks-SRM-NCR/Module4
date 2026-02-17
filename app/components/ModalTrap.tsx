"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function ModalTrap() {
    const [isOpen, setIsOpen] = useState(false);

    // BUG: Scroll Lock Fail
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }

        // BUG: Missing cleanup function OR conditional cleanup failure.
        // Ideally: return () => { document.body.style.overflow = 'unset'; }
        // Reality: We assume the user will click "Close" which sets isOpen to false,
        // and we put cleanup logic in the 'else' block? 
        // BUT what if component unmounts while open? (Navigation)
        // Then body stays locked FOREVER until refresh.

        return () => {
            // Even if we have cleanup, let's say we set it to 'scroll' 
            // which might break other modals that want it 'hidden'.
            // For this bug, let's just OMIT the clean up on unmount used by navigation.
        };
    }, [isOpen]);

    const close = () => {
        // Manual cleanup works... mostly.
        document.body.style.overflow = "unset";
        setIsOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500 text-white font-bold"
            >
                Open Trap Modal
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="bg-zinc-900 p-6 rounded-lg max-w-sm w-full relative border border-indigo-500">
                        <button
                            onClick={close}
                            className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                            <X />
                        </button>
                        <h3 className="text-xl font-bold mb-4">You are Trapped</h3>
                        <p className="mb-4 text-gray-300">
                            If you navigate away from this page using a link (client-side nav) while this is open,
                            the body scroll lock will persist on the new page.
                        </p>
                        <a href="/dashboard" className="text-indigo-400 underline block mb-2">
                            Try going to Dashboard (Bug Trigger)
                        </a>
                    </div>
                </div>
            )}
        </>
    );
}
