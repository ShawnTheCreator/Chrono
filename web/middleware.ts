import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets and internal next paths bypass authentication
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/docs') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Public marketing & spec landing page is accessible to everyone
  if (pathname === '/home') {
    const response = NextResponse.next();
    applySecurityHeaders(response);
    return response;
  }

  const token = request.cookies.get('chrono_auth_token')?.value;

  // Unauthenticated user attempting to access protected dashboard routes
  if (!token && pathname !== '/login') {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    applySecurityHeaders(response);
    return response;
  }

  // Already authenticated user visiting login page
  if (token && pathname === '/login') {
    const homeUrl = new URL('/', request.url);
    const response = NextResponse.redirect(homeUrl);
    applySecurityHeaders(response);
    return response;
  }

  const response = NextResponse.next();
  applySecurityHeaders(response);
  return response;
}

function applySecurityHeaders(response: NextResponse) {
  // OWASP Secure Headers Configuration
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
