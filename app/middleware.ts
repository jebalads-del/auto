import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // ✅ استثناء كل مسارات API أولاً
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // ✅ التحقق من الجلسة للصفحات العادية
  const isLoggedIn = request.cookies.get('isAdmin')?.value === 'true';
  const path = request.nextUrl.pathname;

  const protectedPaths = [
    '/dashboard',
    '/profile',
    '/dashboard/cars/new',
    '/dashboard/cars',
    '/dashboard/users',
    '/dashboard/settings',
  ];

  if (protectedPaths.some(p => path.startsWith(p)) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// ✅ تجاهل مسارات API والملفات الثابتة
export const config = {
  matcher: ['/((?!api|_next|favicon.ico|.*\\.png|.*\\.jpg).*)'],
};
