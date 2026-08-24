import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // يمكنك إضافة منطق هنا إذا احتجت مستقبلاً
  // مثال: التحقق من المصادقة لبعض المسارات
  
  return NextResponse.next();
}

// تكوين المسارات التي سيتم تجاهلها
export const config = {
  matcher: [
    /*
     * تجاهل المسارات التالية:
     * - api (طلبات API)
     * - _next/static (ملفات static)
     * - _next/image (صور Next.js)
     * - favicon.ico (أيقونة الموقع)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
