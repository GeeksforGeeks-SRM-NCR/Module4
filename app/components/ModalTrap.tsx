"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
export default function ModalTrap() {
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
        };
    }, [isOpen]);
    const close = () => {
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
