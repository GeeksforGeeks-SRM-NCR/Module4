"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
export default function FeatureModal({
}: {}) {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState<string | null>(null);
    const loadFeature = async () => {
        try {
            setIsOpen(true);
            setContent("Loading...");
            await new Promise((_, reject) => setTimeout(() => {
                reject(new Error("Module './SuperSecretFeature' not found."));
            }, 1000));
            setContent("Feature Loaded!");
        } catch (e) {
            setContent(`Error loading feature: ${(e as Error).message}`);
        }
    };
    return (
        <>
            <button
                onClick={loadFeature}
                className="mt-8 px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-400 rounded text-white font-bold hover:opacity-90 transition-opacity"
            >
                Unlock Special Feature
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="bg-zinc-900 p-8 rounded-xl border border-red-500 max-w-md text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-2xl font-bold mb-4 text-red-400">System Error</h3>
                            <p className="text-gray-300 mb-6 font-mono text-sm bg-black p-2 rounded">
                                {content}
                            </p>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 bg-zinc-700 rounded hover:bg-zinc-600 transition-colors"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
