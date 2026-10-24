import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = cookies()
    
    // 1. إنشاء كائن استجابة مبدئي
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // 2. تعيين الـ Cookies على كل من الـ cookieStore و response
            cookieStore.set({ name, value, ...options })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // 3. إعادة التوجيه مع الاستجابة التي تحتوي على الـ Cookies
      const redirectUrl = `${origin}${next}`
      const redirectResponse = NextResponse.redirect(redirectUrl)
      
      // نسخ الـ Cookies من الاستجابة المؤقتة إلى استجابة إعادة التوجيه
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie)
      })
      
      return redirectResponse
    }
  }

  // إذا حدث خطأ، أعد التوجيه إلى صفحة تسجيل الدخول
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
