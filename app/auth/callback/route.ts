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
    const redirectUrl = `${protocol}://${host}/profile`
    const response = NextResponse.redirect(redirectUrl)

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

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return response
    }
  }

  // في حال حدث أي خطأ، يعود للوجين بأمان
  return NextResponse.redirect(`${protocol}://${host}/login`)
}
