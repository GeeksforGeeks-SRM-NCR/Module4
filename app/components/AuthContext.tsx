"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
    user: { name: string } | null;
    login: (name: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // BUG 1: Improper Storage Access (during render/initialization)
    // Accessing localStorage here will crash during SSR because window is undefined.
    // Next.js App Router components (even client ones) are pre-rendered on the server.
    // Fix Hint: Initialize state with null or check typeof window !== 'undefined'.

    // NOTE: For the sake of the exercise, I'll use a try-catch or a check that *sometimes* fails 
    // or a pattern that is common: initializing state from localStorage directly.

    // To make it "runnable" but buggy (crash on server), strictly speaking we'd just do:
    // const initialUser = localStorage.getItem("user"); 

    // However, Next.js might be too smart and catch it during build time or dev. 
    // Let's make it a subtle logic bug + a hydration warning one or a runtime error on first client load.
    // Let's actually force the error:

    // Uncommenting this line would crash the build/server. 
    // const savedUser = localStorage.getItem("user"); 

    // Instead, let's do the "State Desync" bug mainly, and a strict mode side-effect bug.

    const [user, setUser] = useState<{ name: string } | null>(null);

    // Simulate complex auth logic
    const login = (name: string) => {
        const newUser = { name };
        setUser(newUser);
        // BUG 2: State Desync.
        // We update state, but we manually manipulate localStorage in a way that can get out of sync.
        // For example, if we have multiple tabs, or if we refresh.
        localStorage.setItem("my_app_user", JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        // BUG: We forgot to remove it from localStorage here!
        // So on refresh, it might come back if we have an effect that reads it (ghost login),
        // OR if we don't have an effect, it stays in storage but user is logged out (zombie data).
    };

    // BUG 3: Race Condition / Infinite Loop / Stale Closure potential
    useEffect(() => {
        // This effect tries to restore session. 
        // If we modify 'user' state inside here without proper dependency management, we could loop.
        const stored = localStorage.getItem("my_app_user");
        if (stored) {
            // If we just set it here:
            // setUser(JSON.parse(stored));
            // It triggers re-render -> effect runs again? No, dependency array is [].

            // BUT, what if the JSON is invalid? Crash.
            setUser(JSON.parse(stored));
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
