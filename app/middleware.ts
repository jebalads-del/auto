import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // التحقق من وجود جلسة نشطة
  const isLoggedIn = request.cookies.get('isAdmin')?.value === 'true';
  const path = request.nextUrl.pathname;
  
  // المسارات المحمية (تتطلب تسجيل الدخول)
  const protectedPaths = [
    '/dashboard',
    '/dashboard/cars',
    '/dashboard/cars/new',
    '/dashboard/users',
    '/dashboard/settings',
  ];

  // التحقق مما إذا كان المسار محمياً
  const isProtected = protectedPaths.some(p => path.startsWith(p));

  // إذا كان المسار محمياً والمستخدم غير مسجل الدخول
  if (isProtected && !isLoggedIn) {
    // حفظ المسار الذي حاول الوصول إليه للرجوع إليه بعد تسجيل الدخول
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
