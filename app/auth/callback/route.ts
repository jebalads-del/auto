import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const errorParam = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = forwardedHost ?? request.headers.get('host') ?? new URL(origin).host
  const protocol = host.includes('localhost') ? 'http' : 'https'

  console.log('🔍 Auth Callback Triggered on Host:', host)

  if (errorParam) {
    console.error('❌ OAuth Provider Error:', errorParam, errorDescription)
    return NextResponse.redirect(`${protocol}://${host}/login?error=${encodeURIComponent(errorDescription || errorParam)}`)
  }

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
                secure: process.env.NODE_ENV === 'production',
              })
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log('✅ Session exchanged successfully for host:', host)
      return response
    } else {
      console.error('❌ Supabase Exchange Code Error:', error.message)
      return NextResponse.redirect(`${protocol}://${host}/login?error=${encodeURIComponent(error.message)}`)
    }
  }

  console.warn('⚠️ No code provided in callback parameters')
  return NextResponse.redirect(`${protocol}://${host}/login?error=no-code`)
}
