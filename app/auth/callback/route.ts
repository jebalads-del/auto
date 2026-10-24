import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = cookies()
    
    // مصفوفة لتجميع ملفات تعريف الارتباط التي سيتم إنشاؤها
    const pendingCookies: { name: string; value: string; options: CookieOptions }[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // نقوم بتخزينها في المصفوفة بدلاً من تعيينها مباشرة
            pendingCookies.push({ name, value, options })
          },
          remove(name: string, options: CookieOptions) {
            pendingCookies.push({ name, value: '', options })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // إنشاء استجابة إعادة التوجيه
      const redirectUrl = `${origin}${next}`
      const redirectResponse = NextResponse.redirect(redirectUrl)
      
      // تطبيق جميع ملفات تعريف الارتباط المخزنة على الاستجابة الجديدة
      pendingCookies.forEach(({ name, value, options }) => {
        redirectResponse.cookies.set(name, value, options)
      })
      
      return redirectResponse
    }
  }

  // إذا حدث خطأ، أعد التوجيه إلى صفحة تسجيل الدخول
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
