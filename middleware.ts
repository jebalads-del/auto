import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 1. تهيئة عميل Supabase داخل الـ Middleware لتأمين الجلسات
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set({ name, value, ...options })
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set({ name, value, ...options })
          );
        },
      },
    }
  );

  // 2. جلب بيانات المستخدم الحالي الفورية من التحقق الأمني لـ Supabase
  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  // 3. مسار لوحة تحكم الآدمن الحساسة والمجلدات الحساسة الأخرى (مثل dashboard و profile)
  const isProtectedPath = 
    url.pathname.startsWith('/admin') || 
    url.pathname.startsWith('/dashboard') || 
    url.pathname.startsWith('/profile');

  if (isProtectedPath) {
    // أ: إذا كان المستخدم غير مسجل دخول نهائياً، يتم طرده فوراً إلى صفحة الدخول
    if (!user) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // ب: حماية خاصة بمجلد الإدارة (admin): فحص هل المستخدم يملك إيميل الإدارة الفعلي؟
    if (url.pathname.startsWith('/admin')) {
      if (user.email !== 'admin@sayarty.store') {
        // إذا حاول مستخدم عادي الدخول للآدمن يتم طرده للصفحة الرئيسية
        url.pathname = '/';
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

// 4. تكوين المسارات المستثناة المصحح بالكامل لتمرير ملفات أرشفة جوجل دون اعتراض
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
