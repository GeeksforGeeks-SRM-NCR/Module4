"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
function LoginForm() {
    const searchParams = useSearchParams();
    const from = searchParams.get("from");
    const router = useRouter();
    const handleLogin = () => {
        document.cookie = "auth_token=valid; path=/";
        router.push("/dashboard");
    };
    return (
        <div className="w-full max-w-md p-8 bg-zinc-900 rounded-xl border border-zinc-800">
            <h1 className="text-2xl font-bold mb-6 text-center">Login to Extreme Mode</h1>
            {from && (
                <div className="bg-yellow-900/50 text-yellow-200 p-3 rounded mb-4 text-sm">
                    Redirected from: {from}
                </div>
            )}
            <button
                onClick={handleLogin}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded transition-colors"
            >
                Set Fake Auth Cookie
            </button>
            <div className="mt-4 text-center">
                <Link href="/" className="text-gray-400 hover:text-white text-sm">Back to Home</Link>
            </div>
        </div>
    );
}
export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <Suspense fallback={<div className="text-white">Loading Login...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
