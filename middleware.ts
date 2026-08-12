import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // يمكنك هنا إضافة أي كود للتحقق من توكن تسجيل الدخول (إذا كنت تستخدم NextAuth مثلاً)
  return NextResponse.next();
}

// الـ Matcher الموزون والمحمي بالكامل لمنع حظر لوحة الإدارة أو الصور
export const config = {
  matcher: [
    /*
     * استثناء كافة المسارات الحيوية لتفادي الطرد أو تعطل الأزرار:
     * - api (طلبات السيرفر وقاعدة البيانات)
     * - _next (ملفات النظام وبناء الصفحات)
     * - favicon.ico (أيقونة الموقع)
     * - كافة امتدادات الصور والـ Blob الخارجية
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
