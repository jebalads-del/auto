import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // ✅ تجاهل جميع مسارات API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // ✅ حماية الصفحات العادية فقط
  const isLoggedIn = request.cookies.get('isAdmin')?.value === 'true';
  const path = request.nextUrl.pathname;

  const protectedPaths = ['/dashboard', '/profile'];
  
  if (protectedPaths.some(p => path.startsWith(p)) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)'],
};
