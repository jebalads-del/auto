import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // ✅ استثناء جميع مسارات API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // ✅ التحقق من تسجيل الدخول
  const isLoggedIn = request.cookies.get('isAdmin')?.value === 'true';
  const path = request.nextUrl.pathname;

  if (path.startsWith('/dashboard') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (path === '/profile' && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
