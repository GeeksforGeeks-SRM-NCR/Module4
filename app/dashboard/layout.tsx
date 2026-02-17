import Link from "next/link";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-900 text-white flex">
            {/* Sidebar with "Layout Shift" Issue */}
            {/* BUG: Dynamic width loading? Or a conditional render that pops in late? */}
            {/* Let's make it a client component that resizes on mount without reserving space */}
            <aside className="w-64 bg-slate-800 border-r border-slate-700 flex-shrink-0">
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-xl font-bold">Extreme Dash</h1>
                </div>
                <nav className="p-4 space-y-2">
                    <Link href="/dashboard" className="block p-3 rounded hover:bg-slate-700">Overview</Link>
                    <Link href="/dashboard/settings" className="block p-3 rounded hover:bg-slate-700">Settings</Link>
                    <Link href="/" className="block p-3 rounded text-red-400 hover:bg-red-900/20">Exit to Safety</Link>
                </nav>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                {/* BUG: Boundary Violation */}
                {/* We might stick a component here that tries to access window/document 
            but is rendered in a way that causes hydration errors or issues. 
        */}
                {children}
            </main>
        </div>
    );
}
