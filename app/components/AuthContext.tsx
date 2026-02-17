"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
interface AuthContextType {
    user: { name: string } | null;
    login: (name: string) => void;
    logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<{ name: string } | null>(null);
    const login = (name: string) => {
        const newUser = { name };
        setUser(newUser);
        localStorage.setItem("my_app_user", JSON.stringify(newUser));
    };
    const logout = () => {
        setUser(null);
    };
    useEffect(() => {
        const stored = localStorage.getItem("my_app_user");
        if (stored) {
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
