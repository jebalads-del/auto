import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // فحص الكوكيز بأمان فقط عند محاولة الدخول للوحة التحكم
  if (path.startsWith('/admin') || path.startsWith('/dashboard')) {
    const isLoggedIn = request.cookies.get('isAdmin')?.value === 'true';
    
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// تحديد المسارات المستهدفة بدقة متناهية لمنع انهيار البناء أو تداخل الـ API
export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
