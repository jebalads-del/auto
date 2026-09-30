import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // يمكنك إضافة منطق هنا إذا احتجت مستقبلاً
  // مثال: التحقق من المصادقة لبعض المسارات
  
  return NextResponse.next();
}

// تكوين المسارات التي سيتم تجاهلها لضمان عمل ملفات أرشفة جوجل وسرعة الموقع
export const config = {
  matcher: [
    /*
     * تجاهل المسارات التالية:
     * - api (طلبات API)
     * - _next/static (ملفات static)
     * - _next/image (صور Next.js)
     * - favicon.ico (أيقونة الموقع)
     * - sitemap.xml (خريطة الموقع المضافة حديثاً)
     * - robots.txt (ملف الروبوتات)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt).*)',
  ],
};
