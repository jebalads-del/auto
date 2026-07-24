import { NextResponse } from 'next/server';

export async function POST() {
  // ✅ مسح الجلسة من Cookies
  const response = NextResponse.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
  
  // حذف Cookies
  response.cookies.delete('isAdmin');
  response.cookies.delete('userId');
  response.cookies.delete('userEmail');
  response.cookies.delete('userRole');
  
  return response;
}
