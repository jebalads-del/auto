import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // ✅ استثناء جميع مسارات API
  if (path.startsWith('/api/')) {
    return NextResponse.next();
  }

  // ✅ التحقق من تسجيل الدخول للمسارات المحمية
  const isLoggedIn = request.cookies.get('isAdmin')?.value === 'true';
  
  const protectedPaths = [
    '/dashboard',
    '/dashboard/cars',
    '/dashboard/cars/new',
    '/dashboard/users',
    '/dashboard/settings',
  ];

  const isProtected = protectedPaths.some(p => path.startsWith(p));

  if (isProtected && !isLoggedIn) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

// ✅ تطبيق الميدلوير على كل شيء ما عدا API والملفات الثابتة
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$).*)'],
};
