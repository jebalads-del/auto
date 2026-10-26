import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/profile'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // التقاط الدومين الحالي بدقة (سواء sayarty.store أو vercel.app) لتثبيت الكوكيز عليه
      const forwardedHost = request.headers.get('x-forwarded-host')
      const host = forwardedHost ?? request.headers.get('host') ?? new URL(origin).host
      const protocol = host.includes('localhost') ? 'http' : 'https'

      return NextResponse.redirect(`${protocol}://${host}${next}`)
    } else {
      console.error('❌ Error exchanging code for session:', error.message)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-failed`)
}
