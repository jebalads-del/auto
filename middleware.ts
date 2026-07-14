import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // حماية مجلد لوحة التحكم والنشر بالكامل
  const isDashboard = path.startsWith('/dashboard')

  // التحقق البرمجي من جلسة المستخدم الحالي
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // 1. إذا كان زائر عادٍ غير مسجل دخول يحاول فتح لوحة التحكم
  if (isDashboard && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. إذا سجل دخول ولكن بريده ليس بريد الأدمن الخاص بك
  if (isDashboard && token?.email !== 'admin@sayarty.store') {
    // يتم حظره وتحويله فوراً لصفحة تسجيل الدخول لحماية الموقع
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// تطبيق هذا الفحص الصارم على كل مسارات الـ dashboard
export const config = {
  matcher: ['/dashboard/:path*'],
}
