import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // BUG: Redirect Loop
    // Scenario:
    // 1. User visits /dashboard.
    // 2. Cookie 'auth_token' is missing. -> Redirect to /login.
    // 3. User visits /login.
    // 4. Logic checks if 'auth_token' is MISSING but maybe checks another 'guest_mode' cookie?
    //    Actually, let's make it loop based on a "broken" cookie state or conflicting rules.

    const token = request.cookies.get('auth_token');
    const path = request.nextUrl.pathname;

    // Rule 1: Dashboard requires token.
    if (path.startsWith('/dashboard')) {
        if (!token) {
            // Redirect to login if no token
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Rule 2: Login page should redirect to dashboard if already logged in... 
    // OR if we have a "glitchy" logic where we set a temporary token?

    if (path.startsWith('/login')) {
        // BUG: The loop condition.
        // If we DON'T have a token, but we have a text query param ?redirect=true (which might be default in some links),
        // maybe we mistakenly redirect back to dashboard?

        // Let's do a classic:
        // The 'dashboard' redirect logic above redirects to '/login'.
        // But '/login' has a check: "If you came from dashboard, maybe you just need to refresh token?" -> Redirect back to dashboard to try again?

        // Or simpler: improper check of token validity.
        // Let's say we have a token "invalid".
        // Dashboard sees "invalid" -> redirects to Login? No, it sees existence.

        // Let's go with:
        // We redirect to /login with a search param: ?from=/dashboard

        // And in Login middleware, we have a bug:
        // "If 'from' param exists, assume it was a mistake and send them back" (Logic verify fail).

        if (request.nextUrl.searchParams.get('from')?.includes('dashboard')) {
            // Infinite Loop: Dashboard -> Login?from=dashboard -> Dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }
}

export const config = {
    matcher: ['/dashboard/:path*', '/login'],
};
