import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('isAdmin')?.value === 'true';
  const path = request.nextUrl.pathname;
  
  // المسارات المحمية
  const protectedPaths = [
    '/dashboard',
    '/dashboard/cars',
    '/dashboard/cars/new',
    '/dashboard/users',
    '/dashboard/settings',
  ];

  const isProtected = protectedPaths.some(p => path.startsWith(p));

  // ✅ إذا كان المسار محمياً والمستخدم غير مسجل
  if (isProtected && !isLoggedIn) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
