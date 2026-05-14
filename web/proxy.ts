import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('snappay_token')?.value;
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicPath = publicPaths.includes(path);

  // Define auth paths (login/register/forgot/reset)
  const isAuthPath = ['/login', '/register', '/forgot-password', '/reset-password'].includes(path);

  // 1. If the user is NOT authenticated and tries to access a protected path,
  // redirect them to the login page.
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If the user IS authenticated and tries to access an auth path,
  // redirect them to the dashboard.
  if (token && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
