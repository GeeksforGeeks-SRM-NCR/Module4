# Module 4 - Bug Documentation

## Project Overview
This is a Next.js 16.1.6 application with React 19.2.3 that contains intentional bugs for debugging practice. The application includes various components demonstrating common web development issues including security vulnerabilities, performance problems, memory leaks, and React-specific bugs.

---

## Table of Contents
1. [Security Bugs](#security-bugs)
2. [Performance Bugs](#performance-bugs)
3. [Memory Leak Bugs](#memory-leak-bugs)
4. [React/Next.js Specific Bugs](#reactnextjs-specific-bugs)
5. [CSS/UI Bugs](#cssui-bugs)
6. [State Management Bugs](#state-management-bugs)
7. [Database/Storage Bugs](#databasestorage-bugs)

---

## Security Bugs

### Bug 1: XSS (Cross-Site Scripting) Vulnerability
**File:** `app/components/CommentsSection.tsx`  
**Lines:** 47-50

**Problem:**
```tsx
<div
    className="text-gray-300"
    dangerouslySetInnerHTML={{ __html: comment.text }}
/>
```
The component uses `dangerouslySetInnerHTML` without sanitizing user input, allowing script injection attacks. Users can inject malicious HTML/JavaScript code through comments.

**Test Case:**
```html
<img src=x onerror=alert('XSS')>
<script>alert('Hacked!')</script>
```

**Solution:**
```tsx
// Option 1: Remove dangerouslySetInnerHTML and render as text
<div className="text-gray-300">{comment.text}</div>

// Option 2: Use a sanitization library
import DOMPurify from 'dompurify';

<div
    className="text-gray-300"
    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.text) }}
/>
```

---

## Performance Bugs

### Bug 2: Unthrottled Scroll Event Handler with Heavy Computation
**File:** `app/components/HeavyScrollComponent.tsx`  
**Lines:** 13-28

**Problem:**
```tsx
useEffect(() => {
    const handleScroll = () => {
        // Heavy calculation on EVERY scroll event
        const data = Array(5000).fill(0).map((_, i) => Math.sqrt(i * Math.random()));
        const sum = data.reduce((acc, curr) => acc + curr, 0);
        
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setWidth(Math.min(100, (window.scrollY / 20) + (sum % 10)));
        }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
}, []);
```
The scroll event fires very frequently (can be 100+ times per second), and running heavy calculations on each event causes severe performance degradation and frame drops.

**Solution:**
```tsx
import { useState, useEffect, useRef, useCallback } from "react";

// Throttle utility
function throttle(func: Function, wait: number) {
    let timeout: NodeJS.Timeout | null = null;
    let lastRan = 0;
    
    return function executedFunction(...args: any[]) {
        const now = Date.now();
        
        if (now - lastRan >= wait) {
            func(...args);
            lastRan = now;
        }
    };
}

export default function HeavyScrollComponent() {
    const [width, setWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = throttle(() => {
            // Heavy calculation now throttled to run max once per 100ms
            const data = Array(5000).fill(0).map((_, i) => Math.sqrt(i * Math.random()));
            const sum = data.reduce((acc, curr) => acc + curr, 0);
            
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setWidth(Math.min(100, (window.scrollY / 20) + (sum % 10)));
            }
        }, 100);

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (/* ... */);
}
```

### Bug 3: Synchronous Heavy Computation Inside useTransition
**File:** `app/dashboard/page.tsx`  
**Lines:** 39-47

**Problem:**
```tsx
startTransition(() => {
    // Synchronous blocking operation defeats the purpose of startTransition
    const start = Date.now();
    while (Date.now() - start < 2000) {
        // Freeze browser for 2 seconds
    }
    setTab(nextTab);
});
```
`useTransition` is designed to keep the UI responsive during state updates, but synchronous blocking operations on the main thread still freeze the browser.

**Solution:**
```tsx
const handleTabChange = async (nextTab: string) => {
    startTransition(async () => {
        // Move heavy work to a Web Worker or break it into chunks
        await new Promise(resolve => setTimeout(resolve, 0)); // Yield to browser
        setTab(nextTab);
    });
};

// Or better: Move heavy computation to Web Worker
// Or remove the artificial delay entirely
const handleTabChange = (nextTab: string) => {
    startTransition(() => {
        setTab(nextTab);
    });
};
```

---

## Memory Leak Bugs

### Bug 4: Event Listener Not Cleaned Up
**File:** `app/components/GallerySection.tsx`  
**Lines:** 53-78

**Problem:**
```tsx
useEffect(() => {
    const handleScroll = () => {
        if (
            window.innerHeight + document.documentElement.scrollTop
            >= document.documentElement.offsetHeight - 100
            && !loading
        ) {
            setPage(prev => {
                const nextPage = prev + 1;
                fetchImages(filter, nextPage, false);
                return nextPage;
            });
        }
    };

    window.addEventListener("scroll", handleScroll);

    // CRITICAL BUG: No cleanup function!
    // return () => window.removeEventListener("scroll", handleScroll);
}, []);
```
The scroll event listener is added but never removed, causing memory leaks on component unmount.

**Solution:**
```tsx
useEffect(() => {
    const handleScroll = () => {
        if (
            window.innerHeight + document.documentElement.scrollTop
            >= document.documentElement.offsetHeight - 100
            && !loading
        ) {
            setPage(prev => {
                const nextPage = prev + 1;
                fetchImages(filter, nextPage, false);
                return nextPage;
            });
        }
    };

    window.addEventListener("scroll", handleScroll);

    // Add cleanup function
    return () => window.removeEventListener("scroll", handleScroll);
}, [loading, filter]); // Also add proper dependencies
```

### Bug 5: Interval Memory Leak in LiveTicker
**File:** `app/components/LiveTicker.tsx`  
**Lines:** 10-28

**Problem:**
```tsx
useEffect(() => {
    console.log("Connecting to crypto socket...");

    const interval = setInterval(() => {
        const change = (Math.random() - 0.5) * 5;
        setPrice(p => p + change);
        console.log("Tick:", price);
    }, 100);

    // BUG: Missing cleanup!
    // clearInterval(interval);
}, []);
```
The interval is never cleared, causing it to continue running even after component unmount, leading to memory leaks and potential errors when trying to update state on unmounted components.

**Solution:**
```tsx
useEffect(() => {
    console.log("Connecting to crypto socket...");

    const interval = setInterval(() => {
        const change = (Math.random() - 0.5) * 5;
        setPrice(p => p + change);
        console.log("Tick:", price);
    }, 100);

    // Add cleanup function
    return () => {
        console.log("Disconnecting from crypto socket...");
        clearInterval(interval);
    };
}, []);
```

### Bug 6: Infinite Growth - The Blob
**File:** `app/components/TheBlob.tsx`  
**Lines:** 11-25

**Problem:**
```tsx
useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
        setSize(s => s + 2);
        setChildren(c => [...c, Date.now()]);
        // Infinite growth without limits
    }, 100);

    return () => clearInterval(interval);
}, [active]);
```
The blob continuously grows in size and DOM elements without any upper limit, eventually causing browser performance degradation or crashes.

**Solution:**
```tsx
useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
        setSize(s => {
            const newSize = s + 2;
            // Stop growing at reasonable limit
            if (newSize > 1000) {
                setActive(false);
                return s;
            }
            return newSize;
        });

        setChildren(c => {
            // Limit number of child elements
            if (c.length > 500) {
                setActive(false);
                return c;
            }
            return [...c, Date.now()];
        });
    }, 100);

    return () => clearInterval(interval);
}, [active]);
```

---

## React/Next.js Specific Bugs

### Bug 7: Hydration Mismatch
**File:** `app/components/HeroSection.tsx`  
**Lines:** 6-10, 32-35

**Problem:**
```tsx
const renderTime = new Date().toLocaleTimeString();

return (
    // ...
    <p className="text-2xl font-mono text-green-400 font-bold">
        {renderTime}
    </p>
);
```
The time is calculated during render, resulting in different values on server and client, causing hydration mismatch warnings.

**Solution:**
```tsx
import { useState, useEffect } from "react";

export default function HeroSection() {
    const [renderTime, setRenderTime] = useState<string>("");

    useEffect(() => {
        // Set time only on client side
        setRenderTime(new Date().toLocaleTimeString());
    }, []);

    return (
        <section>
            {/* ... */}
            <p className="text-2xl font-mono text-green-400 font-bold">
                {renderTime || "Loading..."}
            </p>
        </section>
    );
}
```

### Bug 8: Race Condition in Gallery Image Fetching
**File:** `app/components/GallerySection.tsx`  
**Lines:** 26-50

**Problem:**
```tsx
const fetchImages = async (selectedCategory: string, selectedPage: number, reset = false) => {
    setLoading(true);
    const delay = Math.floor(Math.random() * 2000) + 500;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const newImages = generateImages(selectedCategory, selectedPage);
    
    if (reset) {
        setImages(newImages);
    } else {
        setImages(prev => [...prev, ...newImages]);
    }
    setLoading(false);
};

useEffect(() => {
    setPage(1);
    fetchImages(filter, 1, true);
    // Missing Cleanup/Cancellation logic!
}, [filter]);
```
When users click filters rapidly, older requests might resolve after newer ones, displaying wrong results. No request cancellation mechanism exists.

**Solution:**
```tsx
import { useState, useEffect, useRef } from "react";

export default function GallerySection() {
    const [filter, setFilter] = useState("All");
    const [images, setImages] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchImages = async (
        selectedCategory: string, 
        selectedPage: number, 
        reset = false,
        signal?: AbortSignal
    ) => {
        setLoading(true);
        const delay = Math.floor(Math.random() * 2000) + 500;
        
        try {
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(resolve, delay);
                signal?.addEventListener('abort', () => {
                    clearTimeout(timeout);
                    reject(new DOMException('Aborted', 'AbortError'));
                });
            });

            const newImages = generateImages(selectedCategory, selectedPage);
            
            if (reset) {
                setImages(newImages);
            } else {
                setImages(prev => [...prev, ...newImages]);
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                console.log('Fetch aborted');
                return;
            }
            throw error;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Abort previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new abort controller
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setPage(1);
        fetchImages(filter, 1, true, abortController.signal);

        // Cleanup
        return () => {
            abortController.abort();
        };
    }, [filter]);

    return (/* ... */);
}
```

### Bug 9: Redirect Loop in Middleware
**File:** `middleware.ts`  
**Lines:** 5-51

**Problem:**
```tsx
if (path.startsWith('/dashboard')) {
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

if (path.startsWith('/login')) {
    if (request.nextUrl.searchParams.get('from')?.includes('dashboard')) {
        // Infinite Loop: Dashboard -> Login?from=dashboard -> Dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
}
```
Creates an infinite redirect loop: Dashboard (no token) → Login with ?from=dashboard → Dashboard → repeat.

**Solution:**
```tsx
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token');
    const path = request.nextUrl.pathname;

    // Dashboard requires authentication
    if (path.startsWith('/dashboard')) {
        if (!token) {
            // Redirect to login without problematic query param
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Login page: redirect to dashboard if already authenticated
    if (path.startsWith('/login')) {
        if (token) {
            // If user is already authenticated, send them to dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        // If not authenticated, let them access the login page
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login'],
};
```

### Bug 10: Missing Dependency in useEffect
**File:** `app/components/ThemeToggle.tsx`  
**Lines:** 93-99

**Problem:**
```tsx
useEffect(() => {
    // This effect responsible for applying the class.
    document.documentElement.classList.toggle("dark", isDark);
}, []); // BUG: Missing [isDark] dependency!
```
The effect only runs once on mount, so toggling `isDark` state updates the icon but doesn't actually change the dark mode CSS class.

**Solution:**
```tsx
useEffect(() => {
    // This effect syncs the CSS class with state
    document.documentElement.classList.toggle("dark", isDark);
}, [isDark]); // Add isDark to dependency array
```

### Bug 11: Stale Closure in Theme Toggle
**File:** `app/components/ThemeToggle.tsx`  
**Lines:** 71-87

**Problem:**
```tsx
const toggleTheme = () => {
    setIsDark(!isDark);

    setTimeout(() => {
        // BUG: 'isDark' here refers to old value (closure)
        document.documentElement.classList.toggle("dark", !isDark);
    }, 100);
};
```
The setTimeout captures the old value of `isDark`, causing inconsistent behavior.

**Solution:**
```tsx
const toggleTheme = () => {
    setIsDark(prev => {
        const newValue = !prev;
        // Use the new value directly
        setTimeout(() => {
            document.documentElement.classList.toggle("dark", newValue);
        }, 100);
        return newValue;
    });
};

// Or better: Remove setTimeout entirely and let useEffect handle it
const toggleTheme = () => {
    setIsDark(!isDark);
};
```

### Bug 12: Reference Instability Causing Infinite Re-renders
**File:** `app/components/ComplexState.tsx`  
**Lines:** 6-59

**Problem:**
```tsx
const config = {
    id: 1,
    metadata: { timestamp: 12345 }
};

const data = useDataFetcher(config);

// In the hook:
useEffect(() => {
    console.log("Fetching data for config:", config);
    setData(`Data for ID ${config.id} at ${config.metadata.timestamp}`);
}, [config]); // config is recreated every render
```
The `config` object is recreated on every render with a new reference, causing the useEffect to run continuously.

**Solution:**
```tsx
import { useMemo } from "react";

export default function ComplexState() {
    const [count, setCount] = useState(0);

    // Option 1: Use useMemo to maintain reference
    const config = useMemo(() => ({
        id: 1,
        metadata: { timestamp: 12345 }
    }), []); // Empty deps = only created once

    const data = useDataFetcher(config);

    // Option 2: Pass primitive values instead
    // const data = useDataFetcher(1, 12345);
    
    return (/* ... */);
}

// Modify hook to accept primitives:
function useDataFetcher(id: number, timestamp: number) {
    const [data, setData] = useState<string | null>(null);

    useEffect(() => {
        console.log("Fetching data for id:", id, "timestamp:", timestamp);
        setData(`Data for ID ${id} at ${timestamp}`);
    }, [id, timestamp]); // Primitives are compared by value

    return data;
}
```

### Bug 13: Scroll Lock Not Released on Modal Unmount
**File:** `app/components/ModalTrap.tsx`  
**Lines:** 10-27

**Problem:**
```tsx
useEffect(() => {
    if (isOpen) {
        document.body.style.overflow = "hidden";
    }

    return () => {
        // Cleanup missing proper logic
    };
}, [isOpen]);
```
If the component unmounts while the modal is open (e.g., navigation), the body scroll lock persists.

**Solution:**
```tsx
useEffect(() => {
    if (isOpen) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
        document.body.style.overflow = "unset";
    };
}, [isOpen]);
```

### Bug 14: LocalStorage Access Without Proper Check
**File:** `app/components/AuthContext.tsx`  
**Lines:** 14-66

**Problem:**
```tsx
const logout = () => {
    setUser(null);
    // BUG: Forgot to remove from localStorage!
};

useEffect(() => {
    const stored = localStorage.getItem("my_app_user");
    if (stored) {
        setUser(JSON.parse(stored)); // No error handling for invalid JSON
    }
}, []);
```
Multiple issues: localStorage not cleared on logout, no error handling for invalid JSON, potential SSR issues.

**Solution:**
```tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<{ name: string } | null>(null);

    const login = (name: string) => {
        const newUser = { name };
        setUser(newUser);
        if (typeof window !== 'undefined') {
            localStorage.setItem("my_app_user", JSON.stringify(newUser));
        }
    };

    const logout = () => {
        setUser(null);
        // Clear localStorage on logout
        if (typeof window !== 'undefined') {
            localStorage.removeItem("my_app_user");
        }
    };

    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem("my_app_user");
            if (stored) {
                const parsed = JSON.parse(stored);
                setUser(parsed);
            }
        } catch (error) {
            console.error("Failed to parse user data from localStorage:", error);
            // Clear corrupted data
            localStorage.removeItem("my_app_user");
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
```

---

## CSS/UI Bugs

### Bug 15: CSS Stacking Context Trap
**File:** `app/components/AdminPanel.tsx`  
**Lines:** 14-65

**Problem:**
```tsx
<div className="opacity-90 relative z-10">
    <button className="... z-[9999] relative">
        NUKE DATABASE
    </button>
</div>

<div className="fixed inset-0 z-50 pointer-events-auto opacity-0 ..." />
```
The button is inside a container with `opacity: 0.9` which creates a stacking context. The button's `z-index: 9999` is relative only to its parent (z-index: 10), while the overlay has `z-index: 50` relative to the root, making the overlay sit on top and block clicks.

**Solution:**
```tsx
export default function AdminPanel() {
    const [status, setStatus] = useState("Idle");

    const handleSubmit = () => {
        setStatus("Submitted!");
        alert("You clicked the button!");
    };

    return (
        <div className="p-10 bg-zinc-900 text-white rounded-lg relative overflow-hidden border border-red-900 border-dashed my-10 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4 text-red-500">Admin Panel</h2>
            
            {/* Remove opacity and adjust z-index properly */}
            <div className="relative">
                <button
                    onClick={handleSubmit}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded relative z-10"
                >
                    EXECUTE ACTION
                </button>
            </div>

            <div className="mt-4 text-xs font-mono">
                Status: {status}
            </div>
        </div>
    );
}
```

### Bug 16: Flickering Tooltip Due to Gap
**File:** `app/components/FlickeringTooltip.tsx`  
**Lines:** 5-35

**Problem:**
```tsx
<button
    onMouseEnter={() => setShow(true)}
    onMouseLeave={() => setShow(false)}
    className="..."
>
    Hover Me
</button>

{show && (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 ...">
        {/* mb-4 creates a gap */}
    </div>
)}
```
The `mb-4` class creates a gap between button and tooltip. When the mouse moves toward the tooltip, it crosses the gap, triggering `onMouseLeave`, causing flickering.

**Solution:**
```tsx
export default function FlickeringTooltip() {
    const [show, setShow] = useState(false);

    return (
        <div 
            className="relative inline-block mt-4"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {/* Wrap both in a container with shared mouse events */}
            <button className="px-4 py-2 bg-gray-700 rounded text-gray-200 hover:bg-gray-600">
                Hover Me
            </button>

            {show && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 bg-white text-black text-sm rounded whitespace-nowrap">
                    Tooltip Content
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
                </div>
            )}
        </div>
    );
}
```

### Bug 17: Invisible Ghost Overlay Blocking Clicks
**File:** `app/components/GhostOverlay.tsx`  
**Lines:** 3-19

**Problem:**
```tsx
<div className="fixed inset-0 pointer-events-none z-[100] ...">
    <div
        className="w-64 h-64 bg-red-500/0 pointer-events-auto cursor-help"
        onClick={() => console.log("Ghost clicked!")}
    />
</div>
```
An invisible div with `pointer-events-auto` sits in the center of the screen, blocking clicks on elements beneath it.

**Solution:**
```tsx
// Simply remove the component or make it properly visible:
export default function GhostOverlay() {
    return null; // Remove the ghost overlay
}

// Or make it visible if it serves a purpose:
export default function GhostOverlay() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
            <div
                className="w-64 h-64 bg-red-500/10 border-2 border-red-500 pointer-events-auto cursor-pointer"
                onClick={() => alert("Debug overlay clicked")}
            >
                <span className="text-red-500">Debug Overlay</span>
            </div>
        </div>
    );
}
```

---

## State Management Bugs

### Bug 18: Shared State Between Unrelated Inputs
**File:** `app/components/InputMirror.tsx`  
**Lines:** 6-41

**Problem:**
```tsx
const [value, setValue] = useState("");

return (
    <div>
        <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search..."
        />
        
        <input
            type="password"
            value={value}  // Same state!
            onChange={(e) => setValue(e.target.value)}
            placeholder="********"
        />
    </div>
);
```
Both inputs share the same state variable, causing them to mirror each other's values.

**Solution:**
```tsx
export default function InputMirror() {
    const [searchValue, setSearchValue] = useState("");
    const [passwordValue, setPasswordValue] = useState("");

    return (
        <div className="p-6 bg-zinc-800 rounded-lg border border-zinc-700 mt-8">
            <h3 className="text-xl font-bold mb-4 text-purple-400">Secure Search</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        Search Keywords
                    </label>
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="w-full px-3 py-2 bg-black border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
                        placeholder="Search..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        Password Verification
                    </label>
                    <input
                        type="password"
                        value={passwordValue}
                        onChange={(e) => setPasswordValue(e.target.value)}
                        className="w-full px-3 py-2 bg-black border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
                        placeholder="********"
                    />
                </div>
            </div>
        </div>
    );
}
```

---

## Database/Storage Bugs

### Bug 19: IndexedDB Connection Leak
**File:** `app/utils/db.ts`  
**Lines:** 44-54

**Problem:**
```tsx
export const addLog = async (message: string) => {
    const db = await openDB();
    const tx = db.transaction("logs", "readwrite");
    const store = tx.objectStore("logs");
    store.add({ message, timestamp: Date.now() });

    // BUG: Never calls db.close()
};
```
Opens a new database connection for every log entry without closing it, leading to connection leaks and hitting browser limits.

**Solution:**
```tsx
export const addLog = async (message: string) => {
    const db = await openDB();
    
    try {
        const tx = db.transaction("logs", "readwrite");
        const store = tx.objectStore("logs");
        store.add({ message, timestamp: Date.now() });
        
        // Wait for transaction to complete
        await new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = reject;
        });
    } finally {
        // Always close the connection
        db.close();
    }
};

// Better approach: Use a singleton connection
let dbInstance: IDBDatabase | null = null;

export const getDB = async (): Promise<IDBDatabase> => {
    if (dbInstance) return dbInstance;
    
    dbInstance = await openDB();
    
    // Handle version change events
    dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
    };
    
    return dbInstance;
};

export const addLog = async (message: string) => {
    const db = await getDB();
    const tx = db.transaction("logs", "readwrite");
    const store = tx.objectStore("logs");
    store.add({ message, timestamp: Date.now() });
};
```

### Bug 20: IndexedDB Version Upgrade Deadlock
**File:** `app/utils/db.ts`  
**Lines:** 11-26, 57-68

**Problem:**
```tsx
request.onsuccess = () => {
    const db = request.result;
    // BUG: No onversionchange handler
    resolve(db);
};

// In triggerConflict:
const request = indexedDB.open(DB_NAME, DB_VERSION + 1);
```
When one tab tries to upgrade the database version, other tabs with open connections block the upgrade, causing a deadlock.

**Solution:**
```tsx
export const openDB = () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error("Database error:", request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            const db = request.result;
            
            // Handle version change events
            db.onversionchange = () => {
                console.log("Database version changing, closing connection...");
                db.close();
                alert("Database is being upgraded. Please reload the page.");
            };
            
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            if (!db.objectStoreNames.contains("logs")) {
                db.createObjectStore("logs", { keyPath: "id", autoIncrement: true });
            }
        };

        request.onblocked = () => {
            console.warn("Database upgrade blocked by other tabs");
            alert("Please close other tabs to upgrade the database");
        };
    });
};
```

### Bug 21: Global Singleton State Pollution
**File:** `app/utils/singleton-store.ts`  
**Lines:** 1-11

**Problem:**
```tsx
export const globalCache: { user: string | null } = {
    user: null,
};
```
In a server environment, module-level state is shared across all requests. If one request sets `globalCache.user = "Bob"`, another concurrent request might read "Bob" instead of their actual user data.

**Solution:**
```tsx
// NEVER use global state on the server
// Use React Context, cookies, or request-specific storage

// For client-only state management:
// Option 1: Use React Context
import { createContext, useContext, useState } from 'react';

const CacheContext = createContext<{
    user: string | null;
    setUser: (user: string | null) => void;
} | null>(null);

export function CacheProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<string | null>(null);
    
    return (
        <CacheContext.Provider value={{ user, setUser }}>
            {children}
        </CacheContext.Provider>
    );
}

export const useCache = () => {
    const context = useContext(CacheContext);
    if (!context) throw new Error("useCache must be used within CacheProvider");
    return context;
};

// Option 2: Use browser-only storage
export const getClientCache = () => {
    if (typeof window === 'undefined') return null;
    
    return {
        getUser: () => sessionStorage.getItem('user'),
        setUser: (user: string | null) => {
            if (user) {
                sessionStorage.setItem('user', user);
            } else {
                sessionStorage.removeItem('user');
            }
        }
    };
};
```

---

## UI/UX Bugs

### Bug 22: Runaway Button (Intentional but Annoying)
**File:** `app/components/RunawayButton.tsx`  
**Lines:** 9-15

**Problem:**
```tsx
const handleHover = () => {
    const randomTop = Math.floor(Math.random() * 80) + 10;
    const randomLeft = Math.floor(Math.random() * 80) + 10;
    setPosition({ top: `${randomTop}%`, left: `${randomLeft}%` });
    setHoverCount(c => c + 1);
};

<button onMouseEnter={handleHover} style={{ position: 'absolute', ... }}>
    Claim Reward
</button>
```
The button moves away when you try to hover over it, making it impossible to click. This is an intentional "troll" feature but demonstrates poor UX.

**Solution:**
```tsx
// Remove the onMouseEnter event to make button clickable
export default function RunawayButton() {
    const [clicked, setClicked] = useState(false);

    return (
        <div className="relative h-64 w-full border border-dashed border-gray-600 rounded-lg overflow-hidden bg-gray-900/50 mt-8">
            <button
                onClick={() => setClicked(true)}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded shadow-lg"
            >
                {clicked ? "Claimed!" : "Claim Reward"}
            </button>
        </div>
    );
}
```

### Bug 23: Aggressive Scroll Hijacking
**File:** `app/components/PoltergeistScroll.tsx`  
**Lines:** 11-36

**Problem:**
```tsx
const animate = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const current = window.scrollY;

    if (current >= maxScroll) direction.current = -1;
    if (current <= 0) direction.current = 1;

    // Force Scroll - takes control away from user
    window.scrollTo(0, current + (speed.current * direction.current));

    if (Math.random() > 0.99) speed.current += 0.1;

    frameId = requestAnimationFrame(animate);
};
```
Forces automatic scrolling, removing user control. This is extremely annoying and creates a terrible user experience.

**Solution:**
```tsx
// Either remove this feature entirely or make it optional with clear warning
export default function PoltergeistScroll() {
    const [active, setActive] = useState(false);
    const [userConsent, setUserConsent] = useState(false);

    if (!userConsent) {
        return (
            <div className="fixed bottom-4 left-4 z-[9999] bg-yellow-900 border-2 border-yellow-500 p-4 rounded max-w-xs">
                <h3 className="text-yellow-500 font-bold text-sm mb-2">
                    Auto-Scroll Demo
                </h3>
                <p className="text-xs text-gray-300 mb-3">
                    This feature will take control of scrolling for demonstration purposes.
                </p>
                <button
                    onClick={() => setUserConsent(true)}
                    className="w-full px-2 py-1 text-xs font-bold rounded bg-yellow-500 text-black"
                >
                    I Understand
                </button>
            </div>
        );
    }

    // Rest of component with proper controls...
}
```

### Bug 24: Broken Dynamic Import
**File:** `app/components/FeatureModal.tsx`  
**Lines:** 23-38

**Problem:**
```tsx
const loadFeature = async () => {
    try {
        setIsOpen(true);
        setContent("Loading...");

        // Attempting to import non-existent module
        await new Promise((_, reject) => setTimeout(() => {
            reject(new Error("Module './SuperSecretFeature' not found."));
        }, 1000));

        setContent("Feature Loaded!"); // Never reached
    } catch (e) {
        setContent(`Error loading feature: ${(e as Error).message}`);
    }
};
```
Attempts to dynamically import a module that doesn't exist, always resulting in an error.

**Solution:**
```tsx
// Create the actual feature component
// app/components/SuperSecretFeature.tsx
export default function SuperSecretFeature() {
    return (
        <div className="p-4">
            <h3 className="text-xl font-bold mb-2">Secret Feature Unlocked!</h3>
            <p>This is the special feature content.</p>
        </div>
    );
}

// Fix the modal:
import { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SuperSecretFeature = lazy(() => import('./SuperSecretFeature'));

export default function FeatureModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [showFeature, setShowFeature] = useState(false);

    const loadFeature = async () => {
        setIsOpen(true);
        setTimeout(() => {
            setShowFeature(true);
        }, 500);
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
                        onClick={() => {
                            setIsOpen(false);
                            setShowFeature(false);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="bg-zinc-900 p-8 rounded-xl border border-green-500 max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Suspense fallback={<div>Loading feature...</div>}>
                                {showFeature ? (
                                    <SuperSecretFeature />
                                ) : (
                                    <div>Loading...</div>
                                )}
                            </Suspense>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setShowFeature(false);
                                }}
                                className="mt-4 px-4 py-2 bg-zinc-700 rounded hover:bg-zinc-600 transition-colors"
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
```

---

## Summary

This application contains **24 intentional bugs** across the following categories:

- **Security**: 1 bug (XSS vulnerability)
- **Performance**: 2 bugs (unthrottled scroll, blocking transitions)
- **Memory Leaks**: 4 bugs (event listeners, intervals, infinite growth)
- **React/Next.js**: 9 bugs (hydration, race conditions, redirect loops, stale closures, etc.)
- **CSS/UI**: 3 bugs (z-index issues, flickering tooltips, ghost overlays)
- **State Management**: 1 bug (shared state)
- **Database/Storage**: 3 bugs (connection leaks, deadlocks, singleton pollution)
- **UX**: 3 bugs (runaway button, scroll hijacking, broken imports)

## Testing Recommendations

1. **Security Testing**: Try injecting HTML/JavaScript in the comments section
2. **Performance Testing**: Open DevTools Performance tab and scroll through the page
3. **Memory Testing**: Use Chrome DevTools Memory Profiler to detect leaks
4. **Navigation Testing**: Navigate between pages with modals open
5. **Multi-tab Testing**: Open the app in multiple tabs to trigger IndexedDB conflicts
6. **Mobile Testing**: Test on mobile devices for touch event issues

## Best Practices to Prevent These Bugs

1. **Always sanitize user input** before rendering as HTML
2. **Throttle/debounce** high-frequency event handlers
3. **Clean up effects**: Always return cleanup functions in useEffect
4. **Manage dependencies**: Include all used variables in dependency arrays
5. **Handle race conditions**: Use AbortController for async operations
6. **Proper z-index management**: Understand stacking contexts
7. **Test accessibility**: Ensure all interactive elements are actually clickable
8. **Avoid global state** in server components
9. **Handle errors**: Add try-catch blocks for JSON parsing, network requests, etc.
10. **Use TypeScript**: Leverage type safety to catch bugs early

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Lint code
npm run lint
```

---

## Additional Resources

- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Web.dev Performance](https://web.dev/performance/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

---

**Created for Module 4 - Advanced Web Development Debugging Practice**
