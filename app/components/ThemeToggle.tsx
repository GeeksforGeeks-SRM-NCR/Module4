"use client";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(true);
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
            console.log("System theme changed. Current state isDark:", isDark);
            setIsDark(e.matches);
        };
        mediaQuery.addEventListener("change", handleChange);
        const interval = setInterval(() => {
        }, 5000);
        return () => {
            mediaQuery.removeEventListener("change", handleChange);
            clearInterval(interval);
        };
    }, []);
    const toggleTheme = () => {
        setIsDark(!isDark);
        setTimeout(() => {
            document.documentElement.classList.toggle("dark", !isDark);
        }, 100);
    };
    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDark);
    }, []);
    return (
        <button
            onClick={toggleTheme}
            className="fixed bottom-6 right-6 p-4 bg-zinc-800 rounded-full shadow-lg border border-zinc-700 hover:bg-zinc-700 transition-all z-50 group"
        >
            {isDark ? (
                <Moon className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
            ) : (
                <Sun className="w-6 h-6 text-yellow-500 group-hover:scale-110 transition-transform" />
            )}
        </button>
    );
}
