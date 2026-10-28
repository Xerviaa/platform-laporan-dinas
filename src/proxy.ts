import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Ambil cookie sesi login
  const session = request.cookies.get('user_session');

  // Jika tidak ada sesi (belum login) DAN sedang mengakses halaman selain /login
  if (!session && request.nextUrl.pathname !== '/login') {
    // Tendang ke halaman login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika sudah login tapi mencoba buka /login, arahkan ke dashboard
  if (session && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url)); // <-- Diubah ke /dashboard
  }

  return NextResponse.next();
}

// Tentukan halaman mana saja yang dilindungi (wajib login)
export const config = {
  matcher: [
    /*
     * Match semua request paths kecuali:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};