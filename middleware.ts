import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  });

  // جلب بيانات الجلسة الحالية للمستخدم
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  const url = request.nextUrl.clone();

  // المجلدات المحمية للمستخدمين العاديين فقط (تم استثناء مجلد الأدمن تماماً من هنا)
  const isProtectedPath = url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/profile');

  if (isProtectedPath && !user) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return response;
}

// تكوين المسارات المستثناة للسماح لملفات جوجل بالمرور بنجاح
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
