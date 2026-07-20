import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // تمرير كافة الطلبات لضمان نجاح بناء النسخة المستقرة الأصلية
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
