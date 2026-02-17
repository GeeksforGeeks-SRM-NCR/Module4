import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token');
    const path = request.nextUrl.pathname;
    if (path.startsWith('/dashboard')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }
    if (path.startsWith('/login')) {
        if (request.nextUrl.searchParams.get('from')?.includes('dashboard')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }
}
export const config = {
    matcher: ['/dashboard/:path*', '/login'],
};
