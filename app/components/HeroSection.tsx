"use client";
import { motion } from "framer-motion";
export default function HeroSection() {
    const renderTime = new Date().toLocaleTimeString();
    return (
        <section className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-900 to-black text-white">
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center" />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="z-10 text-center px-4"
            >
                <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                    Advanced Glitch
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
                    Experience the future of broken web development.
                </p>
                <div className="p-4 border border-white/10 rounded-lg bg-black/30 backdrop-blur-md">
                    <p className="text-sm font-mono text-gray-400">System Time Check:</p>
                    <p className="text-2xl font-mono text-green-400 font-bold">
                        {renderTime}
                    </p>
                </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
                <div className="animate-bounce">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </motion.div>
        </section>
    );
}
