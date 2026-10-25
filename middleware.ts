import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ⚠️ مهم جداً: استدعاء getUser يقيم الجلسة ويحدث التوكن بشكل موثوق في الكوكيز
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  console.log(`🔍 Middleware: ${path} | User: ${user ? user.email : 'غير موجود'}`)

  // ✅ حماية لوحة الأدمن
  if (path.startsWith('/dashboard/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // ✅ حماية /dashboard و /profile
  if ((path.startsWith('/dashboard') || path.startsWith('/profile')) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * تطبيق الـ Middleware على كل المسارات باستثناء:
     * - _next/static (الملفات الثابتة)
     * - _next/image (الصور المعتمدة من Next)
     * - favicon.ico (أيقونة الموقع)
     * - الصور وملفات SVG/PNG الخ
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
