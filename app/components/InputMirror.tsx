"use client";

import { useState } from "react";

export default function InputMirror() {
    // BUG: Shared State / Input Mirroring
    // Both inputs share the same state variable 'value'.
    // User thinks they are separate because they are labeled differently.
    const [value, setValue] = useState("");

    return (
        <div className="p-6 bg-zinc-800 rounded-lg border border-zinc-700 mt-8">
            <h3 className="text-xl font-bold mb-4 text-purple-400">Secure Search</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Search Keywords</label>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full px-3 py-2 bg-black border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
                        placeholder="Search..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password (for verification)</label>
                    <input
                        type="password"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full px-3 py-2 bg-black border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
                        placeholder="********"
                    />
                    <p className="text-xs text-red-400 mt-1">
                        Wait, why is my search query appearing in the password field?
                    </p>
                </div>
            </div>
        </div>
    );
}
