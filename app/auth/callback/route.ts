import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // الحصول على الدومين الحقيقي الحالي (سواء Vercel أو sayarty.store)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = forwardedHost ?? request.headers.get('host') ?? new URL(origin).host
  const protocol = host.includes('localhost') ? 'http' : 'https'

  if (code) {
    const cookieStore = await cookies()
    
    let redirectPath = '/profile'
    const response = NextResponse.redirect(`${protocol}://${host}${redirectPath}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              response.cookies.set(name, value, {
                ...options,
                path: '/',
                sameSite: 'lax',
                secure: true,
              })
            })
          },
        },
      }
    )

    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && authData?.user) {
      const userId = authData.user.id

      // 🔍 الفحص الذكي: فحص جدول profiles وعمود account_type و role
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_type, role')
        .eq('id', userId)
        .single()

      // إذا لم يكن لديه سجل أو لم يحدد نوع حسابه بعد (account_type فارغ)
      if (!profile || !profile.account_type) {
        redirectPath = '/select-role'
      } else if (profile.role === 'admin') {
        redirectPath = '/dashboard/admin'
      } else if (profile.account_type === 'dealer') {
        redirectPath = '/dashboard/dealer'
      } else {
        redirectPath = '/profile'
      }

      // إعادة توجيه الاستجابة بناءً على المسار المحدّث
      const finalResponse = NextResponse.redirect(`${protocol}://${host}${redirectPath}`)
      
      // نسخ الكوكيز الجديدة لضمان استمرار الجلسة
      response.cookies.getAll().forEach((cookie) => {
        finalResponse.cookies.set(cookie.name, cookie.value, cookie)
      })

      return finalResponse
    }
  }

  // في حال حدث أي خطأ، يعود للوجين بأمان
  return NextResponse.redirect(`${protocol}://${host}/login`)
}
