"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(true);

    // BUG: Dependency Array logic / Stale Closure
    // We want to sync with system changes. 
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = (e: MediaQueryListEvent) => {
            // Logic: If system changes to dark, we want to set dark.
            // BUT, what if the user has manually overridden it?
            // Let's say we want to respect the system change regardless of manual override for this feature.

            // The bug: This closure captures the initial state of 'isDark' (true) or just doesn't react well?
            // Actually, a classic bug is relying on `isDark` inside this listener 
            // but NOT adding `isDark` to the dependency array.

            console.log("System theme changed. Current state isDark:", isDark);

            // If we used `isDark` in logic here, it would be stale.
            // Example: trying to only flip if it matches the current state? No that's weird.

            // Let's implement a listener that toggles based on system, 
            // but forgets to clean up properly OR fires in a loop if we add it to deps incorrectly.

            // Implementation choice: 
            // We set the state based on event.matches.
            setIsDark(e.matches);
        };

        mediaQuery.addEventListener("change", handleChange);

        // Bug: Missing cleanup? Or Dependency array issue?
        // Let's go with: We verify 'isDark' state inside an interval to "force" theme, 
        // but the interval captures stale state.

        const interval = setInterval(() => {
            // "Auto-correct" to system theme every 5 seconds
            // This captures the INITIAL 'isDark' value if we don't use functional update or deps.
            // Although here we are reading mediaQuery.matches which is live.

            // Let's try the "Stale State" bug more directly.
            // We toggle logic based on *previous* state but using the closure variable.
        }, 5000);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
            clearInterval(interval);
        };

        // If we leave deps empty [], and we used `isDark` inside `handleChange`, 
        // `isDark` would be the initial value forever. 
        // BUT we are using `e.matches` which is from the event, so that's actually fine.

        // ALTERNATIVE BUG: Infinite Loop.
        // useEffect(() => { setIsDark(!isDark); }, [isDark]); // This is too obvious.

        // Let's go with:
        // We try to save to localStorage here, but implementation is buggy.
        // Or simpler: The button uses `setIsDark(!isDark)` but the icon doesn't update 
        // because we are forcing it back in rendering or effects.

    }, []); // isDark is missing from deps if we used it.

    // Let's do a logic bug in the toggle handler.
    const toggleTheme = () => {
        // Logic: If dark, go light. If light, go dark.
        setIsDark(!isDark);

        // Side effect: We try to update document class.
        // BUT we do it "later" via setTimeout and referencing 'isDark' variable directly (stale).

        setTimeout(() => {
            // BUG: 'isDark' here refers to the value *when toggleTheme was called* (closure).
            // So if isDark was True, we set it to False (state).
            // Here 'isDark' is True. 
            // So we might set class based on old value?
            // Actually, if we use !isDark it works.

            document.documentElement.classList.toggle("dark", !isDark);
        }, 100);
    };

    // Real Bug Implementation:
    // The 'useEffect' below wants to sync class with state.
    // But it has `isDark` in dependency array? No, let's omit it.

    useEffect(() => {
        // This effect responsible for applying the class.
        // If we make the dependency array empty [], it only runs once.
        // So toggling the button updates 'isDark' state (icon changes), 
        // BUT the actual CSS class (handled here) NEVER changes after mount.
        document.documentElement.classList.toggle("dark", isDark);
    }, []); // BUG: Missing [isDark] dependency!

    return (
        <button
            onClick={toggleTheme}
            className="fixed bottom-6 right-6 p-4 bg-zinc-800 rounded-full shadow-lg border border-zinc-700 hover:bg-zinc-700 transition-all z-50 group"
        >
            {/* Visual Feedback is correct (React State), but Effect (CSS) is broken */}
            {isDark ? (
                <Moon className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
            ) : (
                <Sun className="w-6 h-6 text-yellow-500 group-hover:scale-110 transition-transform" />
            )}
        </button>
    );
}
