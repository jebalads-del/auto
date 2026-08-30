import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // إنشاء استجابة
  const res = NextResponse.next();
  
  // إنشاء عميل Supabase للـ middleware
  const supabase = createMiddlewareClient({ req: request, res });

  // تحديث الجلسة
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ✅ استثناء جميع مسارات API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return res;
  }

  // استثناء صفحات auth (تسجيل الدخول والتسجيل)
  if (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/auth/') ||
    request.nextUrl.pathname === '/'
  ) {
    return res;
  }

  const path = request.nextUrl.pathname;

  // ✅ التحقق من تسجيل الدخول باستخدام Supabase session
  if (path.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (path === '/profile' && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // إذا كان المستخدم مسجل دخول ويحاول الوصول إلى login، إعادة توجيه إلى dashboard
  if (path === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return res;
}

// تحديد المسارات التي سيتم تطبيق middleware عليها
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile',
    '/login',
    '/auth/:path*',
    '/api/:path*',
  ],
};
